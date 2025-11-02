import { getStack } from './contentstackClient'
import Contentstack from 'contentstack'

// Fetches the first published homepage entry marked as default
// @param {string} forcedEntryUid - Optional entry UID to fetch (overrides detection)
export async function fetchHomepage(forcedEntryUid = null) {
  // Always get a fresh stack instance to ensure Live Preview detection is current
  const stack = getStack()
  if (!stack) return null
  
  // Debug: Check if we're in Live Preview and if stack has live_preview config
  let inIframeCheck = false
  try {
    inIframeCheck = window.self !== window.top
  } catch {}
  
  const hasLivePreview = stack?.live_preview?.enable || false
  if (inIframeCheck || hasLivePreview) {
    console.debug('[HOME] fetchHomepage - Live Preview mode:', {
      inIframe: inIframeCheck,
      hasLivePreviewConfig: hasLivePreview,
      previewToken: !!stack?.live_preview?.preview_token,
      forcedEntryUid: forcedEntryUid || 'none'
    })
  }

  const locale = import.meta.env.VITE_CONTENTSTACK_LOCALE || 'en-us'
  let contentType = import.meta.env.VITE_CONTENTSTACK_CONTENT_TYPE_UID || 'homepage'
  let entryUid = forcedEntryUid || import.meta.env.VITE_CONTENTSTACK_ENTRY_UID || ''

  // During live preview, Contentstack app adds query params or passes via postMessage
  // Also check localStorage/sessionStorage as Contentstack SDK might store it there
  try {
    const params = new URLSearchParams(window.location.search)
    const ctFromUrl = params.get('content_type_uid') || params.get('contentTypeUid')
    const entryFromUrl = params.get('entry_uid') || params.get('entryUid')
    if (ctFromUrl) contentType = ctFromUrl
    if (entryFromUrl) {
      entryUid = entryFromUrl
      console.log('📌 Found entry UID in URL params:', entryUid)
    }
    
    // Also check hash (Contentstack sometimes uses hash-based routing)
    const hashMatch = window.location.hash.match(/entry[\/=]([^\/&\?]+)/i)
    if (hashMatch && !entryUid) {
      entryUid = hashMatch[1]
      console.log('📌 Found entry UID in hash:', entryUid)
    }
    
    // Check localStorage/sessionStorage for entry UID (Live Preview SDK might store it)
    if (!entryUid && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('contentstack_entry_uid') || 
                      sessionStorage.getItem('contentstack_entry_uid')
        if (stored) {
          entryUid = stored
        }
      } catch {}
    }
  } catch {}
  
  // Check if in iframe (Live Preview indicator)
  let inIframe = false
  try {
    inIframe = window.self !== window.top
  } catch {}

  async function run(q) {
    const result = await q.find()
    const entries = result?.[0] || []
    return entries?.[0] || null
  }

  // When in Live Preview (iframe detected), the SDK should automatically
  // use Preview API and fetch the entry being edited. We still need entry UID
  // to fetch the specific entry, but if not available, let the SDK handle it.
  
  const base = stack
    .ContentType(contentType)
    .Query()
    .language(locale)
    .includeReference([
      // Support both nested and top-level reference UIDs
      'features',
      'features.items',
      'benefits',
      'benefits.cards',
      'testimonials',
      'testimonials.items',
      'footer',
      'footer.link_groups',
    ])
    .toJSON()

  let entry = null

  // If an explicit entry UID is provided, load that first (most specific)
  if (entryUid) {
    try {
      const entryQuery = stack
        .ContentType(contentType)
        .Entry(entryUid)
        .includeReference([
          'features',
          'features.items',
          'benefits',
          'benefits.cards',
          'testimonials',
          'testimonials.items',
          'footer',
          'footer.link_groups',
        ])
        .language(locale)
        .toJSON()
      
      // CRITICAL: In Live Preview, add aggressive cache-busting to get latest draft
      // When typing in fields, we need the absolute latest draft data IMMEDIATELY
      if (inIframe) {
        try {
          if (typeof entryQuery.addParam === 'function') {
            // Use timestamp for cache-busting to ensure fresh draft data
            const timestamp = Date.now()
            entryQuery.addParam('_cb', timestamp)
            entryQuery.addParam('_t', timestamp)
            entryQuery.addParam('_timestamp', timestamp)
            entryQuery.addParam('_nocache', timestamp) // Force no cache
            console.debug('[HOME] Added cache-busting params for Live Preview:', timestamp)
          }
        } catch {}
      }
      
      // Debug: Log fetch attempt
      if (inIframe) {
        console.debug('[HOME] Fetching entry in Live Preview mode (should use Preview API):', {
          entryUid,
          contentType,
          locale,
          hasLivePreviewConfig: !!stack?.live_preview?.enable
        })
      }
      
      let e = null
      try {
        e = await entryQuery.fetch()
        
        // Debug: Check what we got back
        if (inIframe && e) {
          console.debug('[HOME] Entry fetched in Live Preview:', {
            uid: e?.uid,
            title: e?.title,
            hasFields: !!e?.fields,
            hasHero: !!e?.hero || !!e?.fields?.hero,
            heroEyebrow: e?.fields?.hero?.eyebrow || e?.hero?.eyebrow,
            rawKeys: Object.keys(e || {}).slice(0, 10)
          })
        }
      } catch (fetchError) {
        // Handle network errors gracefully
        if (fetchError?.message?.includes('ERR_NAME_NOT_RESOLVED') || fetchError?.message?.includes('Failed to fetch')) {
          console.error('❌ Contentstack: Network error - cannot resolve host. Check:')
          console.error('   1. Internet connection is active')
          console.error('   2. DNS is working (try: ping cdn.contentstack.io)')
          console.error('   3. Firewall/VPN is not blocking contentstack.io domains')
          console.error('   4. Region configuration is correct:', region)
        } else {
          console.error('❌ Contentstack: Fetch error:', fetchError)
        }
        // Don't set entry - will fall through to next query attempt
      }
      entry = e || null
      if (entry) {
        // CRITICAL: Normalize structure IMMEDIATELY - Preview API returns data at root level
        // Contentstack Preview API returns entry.hero instead of entry.fields.hero
        if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits)) {
          entry.fields = {}
          // Copy all content fields to entry.fields (preserve the actual data)
          Object.keys(entry).forEach(key => {
            if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
                typeof entry[key] === 'object' && entry[key] !== null) {
              // Deep copy to preserve nested structures
              entry.fields[key] = JSON.parse(JSON.stringify(entry[key]))
            }
          })
        }
      }
    } catch (e) {
      // Silent fallback to query
    }
  }

  // If in Live Preview (iframe) but no entry UID yet, try to query all entries
  // The SDK with live_preview config should automatically use Preview API
  if (!entry && inIframe) {
    
    // Try to get latest entry - in Live Preview, SDK should return the entry being edited
    try {
      // If we have entryUid in state but it wasn't detected, try fetching by UID first
      // This happens when entry UID is stored in React state but not in URL
      if (entryUid) {
        try {
          const entryQuery = stack
            .ContentType(contentType)
            .Entry(entryUid)
            .includeReference([
              'features',
              'features.items',
              'benefits',
              'benefits.cards',
              'testimonials',
              'testimonials.items',
              'footer',
              'footer.link_groups',
            ])
            .language(locale)
            .toJSON()
          
          // CRITICAL: Aggressive cache-busting for Live Preview to get latest draft
          // When typing in fields, we MUST get the absolute latest draft immediately
          try {
            if (typeof entryQuery.addParam === 'function') {
              const timestamp = Date.now()
              entryQuery.addParam('_cb', timestamp)
              entryQuery.addParam('_t', timestamp)
              entryQuery.addParam('_timestamp', timestamp) // Additional cache-busting
            }
          } catch {}
          
          try {
            entry = await entryQuery.fetch()
          } catch (fetchError) {
            if (fetchError?.message?.includes('ERR_NAME_NOT_RESOLVED') || fetchError?.message?.includes('Failed to fetch')) {
              console.error('❌ Contentstack: Network error fetching entry by UID:', entryUid)
            }
            // Silent fallback to query below
          }
        } catch (e) {
          // Silent fallback
        }
      }
      
      // Fallback: query that includes all fields structure
      // We need entry.fields to exist for creating field-level edit tags
      if (!entry) {
        const simpleQuery = base
          .limit(1)
        
        // Add cache-busting for Live Preview
        if (inIframe && typeof simpleQuery.addParam === 'function') {
          try {
            const timestamp = Date.now()
            simpleQuery.addParam('_cb', timestamp)
            simpleQuery.addParam('_t', timestamp)
          } catch {}
        }
        
        try {
          entry = await run(simpleQuery)
        } catch (queryError) {
          if (queryError?.message?.includes('ERR_NAME_NOT_RESOLVED') || queryError?.message?.includes('Failed to fetch')) {
            console.error('❌ Contentstack: Network error in fallback query')
          }
          // Continue to next fallback
        }
      }
      if (!entry) {
        // Try with descending order
        try {
          entry = await run(base.only(['*']).descending('updated_at').limit(1))
        } catch (e) {
          // Network error - try final fallback
        }
        if (!entry) {
          // If still no entries, try without any filters
          try {
            entry = await run(base.limit(1))
          } catch (e) {
            // Network error - give up on this path
          }
        }
      }
    } catch (e) {
      // Silent error handling
    }
  }

  // Fallback: try default entry (works for published content)
  if (!entry && !inIframe) {
    try {
      entry = await run(base.where('is_default', true).limit(1))
    } catch (e) {
      // Network error - continue to next fallback
    }
  }

  // Final fallback: latest updated homepage entry (only if not in Live Preview)
  if (!entry && !inIframe) {
    try {
      entry = await run(base.only(['*']).descending('updated_at').limit(1))
    } catch (e) {
      // Network error - give up
    }
  }

  // If still no entry in Live Preview, try one more time with minimal query
  if (!entry && inIframe) {
    try {
      const minimalQuery = stack
        .ContentType(contentType)
        .Query()
        .language(locale)
        .toJSON()
      entry = await run(minimalQuery.limit(1))
    } catch (e) {
      // Network error - silent fallback
    }
  }

  if (entry) {
    // CRITICAL: Normalize entry structure BEFORE adding edit tags
    // Preview API returns entry.hero, but we need entry.fields.hero for consistency
    // This must happen BEFORE addEditableTags so it can access entry.fields
    if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits || entry.features || entry.testimonials || entry.footer)) {
      entry.fields = {}
      Object.keys(entry).forEach(key => {
        if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
            typeof entry[key] === 'object' && entry[key] !== null) {
          // Deep copy to preserve nested structures and avoid reference issues
          entry.fields[key] = JSON.parse(JSON.stringify(entry[key]))
        }
      })
    }
    
    // CRITICAL: Only add Live Edit tags when in Live Preview mode
    // Edit tags should NOT be added to the actual website (only in preview pane)
    let inIframe = false
    try {
      inIframe = window.self !== window.top
    } catch {}
    
    const hasLivePreviewParams = window.location.search.includes('entry_uid') || 
                                  window.location.search.includes('entryUid') ||
                                  window.location.hash.includes('entry/')
    
    // Only add edit tags if we're in Live Preview (iframe or has preview params)
    if (inIframe || hasLivePreviewParams) {
      // Add Live Edit tags using Contentstack's addEditableTags method
      // This automatically generates data-cslp attributes in the correct format
      // Format: { 'data-cslp': 'content_type_uid.entry_uid.locale.field_path' }
      try {
        const addEditableTags = Contentstack.Utils?.addEditableTags
        if (typeof addEditableTags === 'function') {
        // tagsAsObject: true returns object format for React (can be spread in JSX)
        // The tags are added to entry.$ object at each level
        // For nested fields, tags are added to entry.fields.group.$.field
        // Per Contentstack docs: addEditableTags(entry, content_type_uid, tagsAsObject, locale)
        // Reference: https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-edit-tags-for-entries-with-rest
        addEditableTags(entry, contentType, true, locale)
        
        // Try to find $ object - it might be at entry.$ or entry.fields.$
        const editTags = entry.$ || entry.fields?.$ || null
        const currentEntryUid = entry.uid || ''
        
        if (editTags) {
          // CRITICAL: Manually create field-level edit tags for ALL groups and fields
          // Per Contentstack docs, addEditableTags creates tags at entry.$ and entry.fields.group.$
          // We need to ensure field-level tags exist for individual fields
          
          // CRITICAL: Normalize entry structure - ensure entry.fields exists with all groups
          // Contentstack entries can have fields at entry.fields.group OR entry.group
          // We need entry.fields.group to exist for field-level edit tags
          
          // Ensure entry.fields exists
          if (!entry.fields) {
            entry.fields = {}
          }
          
          // Check for fields at root level and normalize them to entry.fields
          const groupNames = ['hero', 'navigation', 'cta', 'benefits', 'features', 'testimonials', 'footer']
          groupNames.forEach(groupName => {
            // If group exists at root but not in entry.fields, copy it
            if (entry[groupName] && !entry.fields[groupName]) {
              entry.fields[groupName] = typeof entry[groupName] === 'object' && entry[groupName] !== null
                ? { ...entry[groupName] }
                : entry[groupName]
            }
            // If group doesn't exist at all, create empty object so we can add edit tags
            if (!entry.fields[groupName]) {
              entry.fields[groupName] = {}
            }
          })
          
          const entryData = entry.fields
          
          // Define all groups and their fields based on the content model
          // These fields MUST match what's used in the components with getEditTag()
          const groupFields = {
            hero: ['eyebrow', 'heading', 'subheading', 'primary_cta', 'secondary_cta', 'stats'],
            navigation: ['brand_name', 'nav_items'],
            cta: ['title', 'subtitle', 'primary_text', 'secondary_cta'],
            benefits: ['title', 'subtitle', 'cards', 'stats'],
            features: ['items'],
            testimonials: ['items'],
            footer: ['link_groups'],
          }
          
          // Create field-level tags for each group that has a group-level tag
          Object.keys(groupFields).forEach(groupName => {
            // Check if this group exists in the edit tags (group-level tag exists)
            if (editTags[groupName]) {
              // Ensure entry.fields.group.$ exists
              if (!entryData[groupName].$) {
                entryData[groupName].$ = {}
              }
              
              // Create field-level tags for each field in the group
              // Format per docs: {content_type_uid}.{entry_uid}.{locale}.{group_uid}.{field_uid}
              // CRITICAL: This format is required for Live Edit to work
              const fields = groupFields[groupName]
              fields.forEach(fieldName => {
                // Create field-level tag (overwrite if exists to ensure it's correct)
                // The data-cslp format MUST be: contentType.entryUid.locale.groupField.fieldName
                const editTagValue = `${contentType}.${currentEntryUid}.${locale}.${groupName}.${fieldName}`
                entryData[groupName].$[fieldName] = {
                  'data-cslp': editTagValue
                }
              })
              
              // ALSO create tags in entry.$ for compatibility (some SDK versions use this)
              if (!entry.$) {
                entry.$ = {}
              }
              if (!entry.$[groupName]) {
                entry.$[groupName] = {}
              }
              fields.forEach(fieldName => {
                const editTagValue = `${contentType}.${currentEntryUid}.${locale}.${groupName}.${fieldName}`
                entry.$[groupName][fieldName] = {
                  'data-cslp': editTagValue
                }
              })
            }
          })
        } // Close if (editTags) block
        }
      } catch (e) {
        // Silent error handling for edit tags
      }
    }
  }

  return entry || null
}

// Maps raw CMS homepage entry to UI-friendly shape
export function mapHomepage(entry) {
  if (!entry) return null
  
  // CRITICAL: Handle both entry.fields.group and entry.group structures
  // Preview API returns data at entry.hero, Delivery API returns entry.fields.hero
  let fields = entry.fields
  
  // If entry.fields doesn't exist but data is at root level, use root directly
  if (!fields && (entry.hero || entry.navigation || entry.cta || entry.benefits)) {
    fields = entry
  } else if (!fields) {
    return null
  }
  
  // Ensure fields is an object
  if (!fields || typeof fields !== 'object') {
    return null
  }

  return {
    navigation: {
      brandName: fields?.navigation?.brand_name,
      items: fields?.navigation?.nav_items?.map((i) => ({
        label: i?.label,
        href: i?.href || '#',
      })) || [],
    },
    hero: {
      eyebrow: fields?.hero?.eyebrow,
      heading: fields?.hero?.heading,
      subheading: fields?.hero?.subheading,
      primaryCta: fields?.hero?.primary_cta,
      secondaryCta: fields?.hero?.secondary_cta,
      stats: fields?.hero?.stats || [],
    },
    // features may come as a group with .items or a top-level reference array
    features: ((fields?.features?.items) || fields?.features || []).map((f) => ({
      title: f?.title,
      description: f?.description,
      color: f?.color || 'from-blue-400 to-cyan-500',
      icon: f?.icon || 'Zap',
    })),
    // benefits may be a group with title/subtitle and .cards, or a direct array of cards
    benefits: {
      title: fields?.benefits?.title,
      subtitle: fields?.benefits?.subtitle,
      cards: ((fields?.benefits?.cards) || fields?.benefits || []).map((c) => ({
        title: c?.title,
        description: c?.description,
        bullets: c?.bullets || [],
      })),
      stats: fields?.benefits?.stats || fields?.stats || [],
    },
    // testimonials may be nested .items or be a direct reference array
    testimonials: ((fields?.testimonials?.items) || fields?.testimonials || []).map((t) => ({
      name: t?.name,
      role: t?.role,
      avatar: t?.avatar_emoji || '😀',
      content: t?.content,
      rating: t?.rating || 5,
    })),
    cta: {
      title: fields?.cta?.title,
      subtitle: fields?.cta?.subtitle,
      primaryText: fields?.cta?.primary_text,
      secondaryText: fields?.cta?.secondary_text,
    },
    // footer may be a group with .link_groups or a direct array of groups
    footer: {
      linkGroups: ((fields?.footer?.link_groups) || fields?.footer || []).map((g) => ({
        title: g?.title,
        links: (g?.links || []).map((l) => ({ label: l?.label, href: l?.href || '#' })),
      })),
    },
  }
}


