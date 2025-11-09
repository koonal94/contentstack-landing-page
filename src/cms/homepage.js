import { getStack } from './contentstackClient'
import Contentstack from 'contentstack'

// Fetches the first published homepage entry marked as default
// @param {string} forcedEntryUid - Optional entry UID to fetch (overrides detection)
export async function fetchHomepage(forcedEntryUid = null, ignoreStoredUid = false) {
  // Always get a fresh stack instance to ensure Live Preview detection is current
  const stack = getStack()
  if (!stack) {
    console.error('[HOME] Stack is null - check environment variables:', {
      hasApiKey: !!import.meta.env.VITE_CONTENTSTACK_API_KEY,
      hasDeliveryToken: !!import.meta.env.VITE_CONTENTSTACK_DELIVERY_TOKEN,
      environment: import.meta.env.VITE_CONTENTSTACK_ENVIRONMENT
    })
    return null
  }
  
  const environment = import.meta.env.VITE_CONTENTSTACK_ENVIRONMENT || ''
  if (!environment) {
    console.error('[HOME] VITE_CONTENTSTACK_ENVIRONMENT is not set!')
  }
  
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

  // Check if in iframe (Live Preview indicator) FIRST
  let inIframe = false
  try {
    inIframe = window.self !== window.top
  } catch {}
  
  const locale = import.meta.env.VITE_CONTENTSTACK_LOCALE || 'en-us'
  let contentType = import.meta.env.VITE_CONTENTSTACK_CONTENT_TYPE_UID || 'homepage'
  
  // Logging removed to prevent console spam
  
  // CRITICAL: When NOT in live preview, ignore environment variable UIDs to fetch published entries
  // Only use forcedEntryUid (for live preview callbacks) or UIDs from URL (for live preview)
  let entryUid = forcedEntryUid || ''

  // During live preview, Contentstack app adds query params or passes via postMessage
  // Only use URL params if in live preview OR if forcedEntryUid was provided
  // Skip URL params/hash if ignoreStoredUid is true (for fetching published entries)
  if (!ignoreStoredUid) {
    try {
      const params = new URLSearchParams(window.location.search)
      const ctFromUrl = params.get('content_type_uid') || params.get('contentTypeUid')
      const entryFromUrl = params.get('entry_uid') || params.get('entryUid')
      if (ctFromUrl) contentType = ctFromUrl
      
      // Only use URL params if in live preview OR if forcedEntryUid was provided
      if (entryFromUrl && (inIframe || forcedEntryUid)) {
        entryUid = entryFromUrl
        console.log('📌 Found entry UID in URL params:', entryUid)
      }
      
      // Also check hash (Contentstack sometimes uses hash-based routing)
      const hashMatch = window.location.hash.match(/entry[\/=]([^\/&\?]+)/i)
      if (hashMatch && !entryUid && (inIframe || forcedEntryUid)) {
        entryUid = hashMatch[1]
        console.log('📌 Found entry UID in hash:', entryUid)
      }
      
    } catch {}
  }
  
  // CRITICAL: Only check localStorage/sessionStorage for entry UID if in Live Preview (iframe)
  // When NOT in live preview (production/Launch), NEVER use stored UIDs - always query published entries
  // This ensures Launch website always fetches the latest published entry, not a stale draft UID
  // Also skip if ignoreStoredUid is true (for fetching homepage data for logo)
  if (!entryUid && inIframe && !ignoreStoredUid && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('contentstack_entry_uid') || 
                    sessionStorage.getItem('contentstack_entry_uid')
      if (stored) {
        entryUid = stored
      }
    } catch {}
  }
  
  // CRITICAL FIX: When NOT in Live Preview (production/Launch), clear any stored UIDs
  // to ensure we always query for published entries, not draft/unpublished entries
  if (!inIframe && !forcedEntryUid && typeof window !== 'undefined') {
    try {
      // Clear stored UIDs that might point to draft/unpublished entries
      // This ensures production always queries for published entries
      const storedContentType = sessionStorage.getItem('contentstack_content_type')
      if (storedContentType === contentType) {
        sessionStorage.removeItem('contentstack_entry_uid')
        sessionStorage.removeItem('contentstack_homepage_last_version')
        sessionStorage.removeItem('contentstack_homepage_last_updated')
      }
      const localContentType = localStorage.getItem('contentstack_content_type')
      if (localContentType === contentType) {
        localStorage.removeItem('contentstack_entry_uid')
      }
      // Clear entryUid to force query for published entries
      entryUid = ''
    } catch {}
  }

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
      'pricing',
      'pricing.plans',
      'footer',
      'footer.link_groups',
    ])
    .toJSON()

  let entry = null

  // If an explicit entry UID is provided, load that first (most specific)
  // BUT: If ignoreStoredUid is true, skip UID-based fetching and query published entries directly
  if (entryUid && !ignoreStoredUid) {
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
          'pricing',
          'pricing.plans',
          'footer',
          'footer.link_groups',
        ])
        .language(locale)
        .toJSON()
      
      // CRITICAL: Add cache-busting to get latest published content
      // For Live Preview (iframe): Aggressive cache-busting for draft changes
      // For Production: Cache-busting to see published updates immediately
      // Contentstack CDN may cache responses, so we add timestamp to force fresh data
      try {
        if (typeof entryQuery.addParam === 'function') {
          const timestamp = Date.now()
          entryQuery.addParam('_cb', timestamp)
          entryQuery.addParam('_t', timestamp)
          entryQuery.addParam('_timestamp', timestamp)
          
          // In Live Preview, add additional no-cache params for drafts
          if (inIframe) {
            entryQuery.addParam('_nocache', timestamp)
            console.debug('[HOME] Added cache-busting params for Live Preview:', timestamp)
          } else {
            // For production, use shorter cache-busting to see published updates
            console.debug('[HOME] Added cache-busting params for production:', timestamp)
          }
        }
      } catch {}
      
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
        // Handle 422 errors (entry doesn't exist) - clear invalid entry UID from storage
        // Check multiple possible error formats from Contentstack SDK
        const is422Error = fetchError?.status === 422 || 
                          fetchError?.error_code === 141 ||
                          (typeof fetchError === 'object' && fetchError !== null && 'status' in fetchError && fetchError.status === 422) ||
                          (fetchError?.error_message && fetchError.error_message.includes("doesn't exist")) ||
                          (typeof fetchError === 'object' && fetchError !== null && 'error_message' in fetchError && fetchError.error_message && fetchError.error_message.includes("doesn't exist"))
        
        if (is422Error) {
          // Entry doesn't exist - clear invalid UID from storage immediately
          if (typeof window !== 'undefined' && entryUid) {
            try {
              sessionStorage.removeItem('contentstack_entry_uid')
              sessionStorage.removeItem('contentstack_last_version')
              sessionStorage.removeItem('contentstack_last_updated')
              sessionStorage.removeItem('contentstack_content_type')
              sessionStorage.removeItem('contentstack_homepage_last_version')
              sessionStorage.removeItem('contentstack_homepage_last_updated')
              // Also clear from localStorage
              localStorage.removeItem('contentstack_entry_uid')
              localStorage.removeItem('contentstack_last_version')
              localStorage.removeItem('contentstack_last_updated')
              localStorage.removeItem('contentstack_content_type')
            } catch {}
          }
          // Clear entryUid so we fall through to query published entries
          entryUid = ''
          console.warn('[HOME] Entry UID invalid (422), falling back to query published entries')
          // Don't return - let it fall through to query logic below
        }
        // Handle network errors gracefully
        else if (fetchError?.message?.includes('ERR_NAME_NOT_RESOLVED') || fetchError?.message?.includes('Failed to fetch')) {
          console.error('❌ Contentstack: Network error - cannot resolve host. Check:')
          console.error('   1. Internet connection is active')
          console.error('   2. DNS is working (try: ping cdn.contentstack.io)')
          console.error('   3. Firewall/VPN is not blocking contentstack.io domains')
          console.error('   4. Region configuration is correct:', region)
        }
        // Don't set entry - will fall through to next query attempt
      }
      entry = e || null
      if (entry) {
        // CRITICAL: Normalize structure IMMEDIATELY - Preview API returns data at root level
        // Contentstack Preview API returns entry.hero instead of entry.fields.hero
        if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits || entry.features || entry.testimonials || entry.pricing || entry.footer)) {
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
              'pricing',
              'pricing.plans',
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
              entryQuery.addParam('_nocache', timestamp) // Force no cache
              entryQuery.addParam('_live', 'true') // Live preview flag
              entryQuery.addParam('_preview', 'true') // Preview flag
            }
          } catch {}
          
          try {
            entry = await entryQuery.fetch()
          } catch (fetchError) {
            // Handle 422 errors (entry doesn't exist) - clear invalid entry UID
            if (fetchError?.status === 422 || fetchError?.error_code === 141 || 
                (fetchError?.error_message && fetchError.error_message.includes("doesn't exist"))) {
              if (typeof window !== 'undefined' && entryUid) {
                try {
                  const storedContentType = sessionStorage.getItem('contentstack_content_type')
                  if (storedContentType === contentType) {
                    sessionStorage.removeItem('contentstack_entry_uid')
                    sessionStorage.removeItem('contentstack_last_version')
                    sessionStorage.removeItem('contentstack_last_updated')
                  }
                } catch {}
              }
            }
            else if (fetchError?.message?.includes('ERR_NAME_NOT_RESOLVED') || fetchError?.message?.includes('Failed to fetch')) {
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
  // CRITICAL: When NOT in Live Preview, always query for published entries
  // This is the PRIMARY path for production/Launch websites
  if (!entry && !inIframe) {
    console.log('[HOME] Not in Live Preview - querying for published entries...', {
      environment,
      contentType,
      locale
    })
    
    try {
      // Try querying for entry with is_default = true first
      const defaultQuery = base.where('is_default', true).limit(1)
      // Add cache-busting for published entries
      try {
        if (typeof defaultQuery.addParam === 'function') {
          const timestamp = Date.now()
          defaultQuery.addParam('_cb', timestamp)
          defaultQuery.addParam('_t', timestamp)
          defaultQuery.addParam('_fresh', timestamp)
        }
      } catch {}
      
      entry = await run(defaultQuery)
      if (entry) {
        console.log('[HOME] Found entry with is_default=true:', entry.uid)
      }
    } catch (e) {
      console.warn('[HOME] Query for default entry failed:', e)
      // Network error - continue to next fallback
    }
  }

  // Final fallback: latest updated homepage entry (only if not in Live Preview)
  // This ensures we get the most recently published entry if no default is set
  if (!entry && !inIframe) {
    try {
      const publishedQuery = base.only(['*']).descending('updated_at').limit(1)
      // Add cache-busting for published entries to ensure we get latest
      try {
        if (typeof publishedQuery.addParam === 'function') {
          const timestamp = Date.now()
          publishedQuery.addParam('_cb', timestamp)
          publishedQuery.addParam('_t', timestamp)
          publishedQuery.addParam('_fresh', timestamp)
        }
      } catch {}
      
      entry = await run(publishedQuery)
      if (entry) {
        console.log('[HOME] Found latest published entry:', entry.uid)
      } else {
        // Only log warning if no entry found (not spam)
        console.warn('[HOME] No published entries found. Check:')
        console.warn('  1. Environment variable VITE_CONTENTSTACK_ENVIRONMENT matches where you published')
        console.warn('  2. Entry is actually published (not just saved)')
        console.warn('  3. Content type UID is correct:', contentType)
        console.warn('  4. API credentials are correct')
      }
    } catch (e) {
      console.error('[HOME] Query for published entries failed:', e)
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
    if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits || entry.features || entry.testimonials || entry.pricing || entry.footer)) {
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
          const groupNames = ['hero', 'navigation', 'cta', 'benefits', 'features', 'testimonials', 'pricing', 'footer']
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
            pricing: ['eyebrow', 'heading', 'subheading', 'plans', 'note'],
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

  // CRITICAL: If pricing.plans only have UIDs (no fields), fetch them separately
  // This is a workaround for includeReference not working for nested references in groups
  // Check both entry.fields.pricing.plans and entry.pricing.plans (Preview API vs Delivery API)
  const pricingPlans = entry?.fields?.pricing?.plans || entry?.pricing?.plans
  if (entry && pricingPlans && Array.isArray(pricingPlans)) {
    if (pricingPlans.length > 0 && pricingPlans[0]) {
      const firstPlan = pricingPlans[0]
      const firstPlanKeys = Object.keys(firstPlan)
      const hasOnlyMetadata = firstPlanKeys.every(key => ['uid', '_content_type_uid', '$'].includes(key))
      
      if (!firstPlan.fields && hasOnlyMetadata && firstPlan._content_type_uid) {
        // Fetch plans and populate fields (logging removed to prevent spam)
        await populatePlanFields(entry, pricingPlans, firstPlan._content_type_uid)
      }
    }
  }
  
  return entry || null
}

// Helper function to fetch pricing plan entries and populate their fields
async function populatePlanFields(entry, planRefs, contentTypeUid) {
  if (!planRefs || planRefs.length === 0 || !contentTypeUid) {
    return
  }
  
  try {
    const stack = getStack()
    const locale = import.meta.env.VITE_CONTENTSTACK_LOCALE || 'en-us'
    const planUids = planRefs.map(p => p.uid).filter(Boolean)
    
    if (planUids.length === 0) {
      return
    }
    
    // Logging removed to prevent console spam
    
    // Fetch all plan entries by UID
    const planEntries = await Promise.all(
      planUids.map(async (uid) => {
        try {
          const entryQuery = stack
            .ContentType(contentTypeUid)
            .Entry(uid)
            .language(locale)
            .toJSON()
          
          const planEntry = await entryQuery.fetch()
          return planEntry
        } catch (error) {
          console.warn(`[fetchHomepage] Failed to fetch plan ${uid}:`, error)
          return null
        }
      })
    )
    
    // Populate the fields in the original entry structure
    const validPlans = planEntries.filter(Boolean)
    if (validPlans.length > 0) {
      // Logging removed to prevent console spam
      
      // Update entry.fields.pricing.plans with fetched data
      if (entry.fields && entry.fields.pricing && entry.fields.pricing.plans) {
        entry.fields.pricing.plans = validPlans.map((planEntry, index) => {
          // Merge the fetched entry with the original ref (preserve UID structure)
          return {
            ...planRefs[index],
            fields: planEntry.fields || planEntry
          }
        })
      }
      
      // Also update at root level if it exists
      if (entry.pricing && entry.pricing.plans) {
        entry.pricing.plans = validPlans.map((planEntry, index) => {
          return {
            ...planRefs[index],
            fields: planEntry.fields || planEntry
          }
        })
      }
    }
  } catch (error) {
    console.error('[fetchHomepage] Error fetching plans separately:', error)
  }
}

// Maps raw CMS homepage entry to UI-friendly shape
export function mapHomepage(entry) {
  if (!entry) return null
  
  // CRITICAL: Handle both entry.fields.group and entry.group structures
  // Preview API returns data at entry.hero, Delivery API returns entry.fields.hero
  let fields = entry.fields
  
  // If entry.fields doesn't exist but data is at root level, use root directly
  if (!fields && (entry.hero || entry.navigation || entry.cta || entry.benefits || entry.features || entry.testimonials || entry.pricing || entry.footer)) {
    fields = entry
  } else if (!fields) {
    return null
  }
  
  // Ensure fields is an object
  if (!fields || typeof fields !== 'object') {
    return null
  }
  
  // Handle pricing group - it might be an array (if repeatable) or an object
  let pricingData = fields?.pricing
  if (Array.isArray(pricingData) && pricingData.length > 0) {
    // If pricing is an array, use the first element
    pricingData = pricingData[0]
  } else if (!pricingData || (typeof pricingData !== 'object')) {
    pricingData = null
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
    features: (() => {
      // Handle different structures: reference field (.items), direct array
      let featuresData = null
      
      // Check if it's a reference field structure
      if (fields?.features?.items && Array.isArray(fields.features.items)) {
        featuresData = fields.features.items
      }
      // Check if features is directly an array
      else if (Array.isArray(fields?.features)) {
        featuresData = fields.features
      }
      // If features doesn't exist or is empty, return empty array
      else {
        featuresData = []
      }
      
      // Map features to consistent structure
      return featuresData.map((f) => ({
        title: f?.title || f?.name || '',
        description: f?.description || f?.desc || '',
        color: f?.color || 'from-blue-400 to-cyan-500',
        icon: f?.icon || 'Zap',
      }))
    })(),
    // benefits may be a group with title/subtitle and .cards, or a direct array of cards
    // Handle reference fields (.items) and direct arrays
    benefits: {
      title: fields?.benefits?.title,
      subtitle: fields?.benefits?.subtitle,
      cards: (() => {
        // Handle different structures: reference field (.items), direct array, or nested .cards
        let cardsData = null
        
        // Check if it's a reference field structure
        if (fields?.benefits?.cards?.items && Array.isArray(fields.benefits.cards.items)) {
          cardsData = fields.benefits.cards.items
        }
        // Check if cards is directly an array
        else if (Array.isArray(fields?.benefits?.cards)) {
          cardsData = fields.benefits.cards
        }
        // Check if benefits is directly an array (fallback)
        else if (Array.isArray(fields?.benefits)) {
          cardsData = fields.benefits
        }
        // If cards doesn't exist or is empty, return empty array
        else {
          cardsData = []
        }
        
        // Map cards to consistent structure
        return cardsData.map((c) => ({
          title: c?.title || c?.name || '',
          description: c?.description || c?.desc || '',
          bullets: Array.isArray(c?.bullets) ? c.bullets : 
                  Array.isArray(c?.features) ? c.features :
                  Array.isArray(c?.items) ? c.items.map(item => typeof item === 'string' ? item : item?.text || item?.name || '') : [],
        }))
      })(),
      stats: fields?.benefits?.stats || fields?.stats || [],
    },
    // testimonials may be nested .items or be a direct reference array
    testimonials: (() => {
      // Handle different structures: reference field (.items), direct array
      let testimonialsData = null
      
      // Check if it's a reference field structure
      if (fields?.testimonials?.items && Array.isArray(fields.testimonials.items)) {
        testimonialsData = fields.testimonials.items
      }
      // Check if testimonials is directly an array
      else if (Array.isArray(fields?.testimonials)) {
        testimonialsData = fields.testimonials
      }
      // If testimonials doesn't exist or is empty, return empty array
      else {
        testimonialsData = []
      }
      
      // Map testimonials to consistent structure
      return testimonialsData.map((t) => ({
        name: t?.name || '',
        role: t?.role || '',
        avatar: t?.avatar || t?.avatar_emoji || '😀',
        content: t?.content || t?.text || '',
        rating: t?.rating || 5,
      }))
    })(),
    cta: {
      title: fields?.cta?.title,
      subtitle: fields?.cta?.subtitle,
      primaryText: fields?.cta?.primary_text,
      secondaryText: fields?.cta?.secondary_text,
    },
    // pricing plans - handle Group field structure (JSON/RTE/Modular Blocks) or Reference field
    pricing: {
      eyebrow: (() => {
        const value = pricingData?.eyebrow
        if (value !== undefined && value !== null && value !== '') return value
        return null
      })(),
      heading: (() => {
        const value = pricingData?.heading
        if (value !== undefined && value !== null && value !== '') return value
        return null
      })(),
      subheading: (() => {
        const value = pricingData?.subheading
        if (value !== undefined && value !== null && value !== '') return value
        return null
      })(),
      plans: (() => {
        // Handle Reference field structure (same as benefits.cards, features.items, testimonials.items)
        let plansData = null
        
        // Debug logging removed to prevent console spam
        
        // Check if it's a reference field structure with .items (like benefits.cards)
        // Try both pricingData and fields directly
        if (pricingData?.plans?.items && Array.isArray(pricingData.plans.items)) {
          plansData = pricingData.plans.items
        }
        else if (fields?.pricing?.plans?.items && Array.isArray(fields.pricing.plans.items)) {
          plansData = fields.pricing.plans.items
        }
        // Check if plans is directly an array (like features.items or testimonials.items)
        // This is the most common case for reference fields
        else if (Array.isArray(pricingData?.plans)) {
          plansData = pricingData.plans
        }
        else if (Array.isArray(fields?.pricing?.plans)) {
          plansData = fields.pricing.plans
        }
        // Additional fallback: Check if pricing group itself is an array and plans might be in first element
        else if (Array.isArray(fields?.pricing) && fields.pricing.length > 0) {
          const firstPricing = fields.pricing[0]
          if (Array.isArray(firstPricing?.plans)) {
            plansData = firstPricing.plans
          }
        }
        // If plans doesn't exist or is empty, return empty array
        else {
          plansData = []
        }
        
        // CRITICAL: If plan objects only have uid/_content_type_uid/$ (no fields), 
        // the references weren't included. We need to fetch them separately.
        // This happens when includeReference doesn't work properly for nested references.
        if (plansData.length > 0 && plansData[0]) {
          const firstPlan = plansData[0]
          const firstPlanKeys = Object.keys(firstPlan)
          const hasOnlyMetadata = firstPlanKeys.every(key => ['uid', '_content_type_uid', '$'].includes(key))
          
          if (!firstPlan.fields && hasOnlyMetadata) {
            // Note: Plans should have been fetched in fetchHomepage before mapHomepage is called
            // If we still only have UIDs here, return empty array to use defaults
            return []
          }
        }
        
        // Map plans to consistent structure (same pattern as benefits.cards)
        // Contentstack reference field entries typically have data in p.fields
        const mappedPlans = plansData.map((p, index) => {
          // Contentstack reference entries have structure: { uid, _content_type_uid, fields: {...} }
          // But sometimes the data is directly on p if it's already been processed
          // Check if p has fields property (reference entry) or if data is directly on p
          let planFields = p
          
          // If p has a fields property and it's an object with actual data (not just metadata)
          if (p?.fields && typeof p.fields === 'object' && Object.keys(p.fields).length > 0) {
            // Check if fields has actual field data (not just metadata keys)
            const fieldKeys = Object.keys(p.fields)
            const hasActualFields = fieldKeys.some(key => !['uid', '_content_type_uid', '$'].includes(key))
            if (hasActualFields) {
              planFields = p.fields
            } else {
              // If fields only has metadata, try using p directly
              planFields = p
            }
          } else {
            // No fields property or it's empty, use p directly
            planFields = p
          }
          
          // Get all possible field name variations
          const name = planFields?.name || 
                      planFields?.plan_name || 
                      planFields?.title || 
                      planFields?.heading ||
                      planFields?.label ||
                      ''
          
          const price = planFields?.price || 
                       planFields?.price_amount || 
                       planFields?.amount || 
                       planFields?.cost ||
                       ''
          
          const period = planFields?.period || 
                        planFields?.price_period || 
                        planFields?.billing_period || 
                        planFields?.interval ||
                        ''
          
          const description = planFields?.description || 
                            planFields?.desc || 
                            planFields?.subtitle ||
                            planFields?.subheading ||
                            ''
          
          // Features can be an array or a field name like 'features', 'feature_list', 'bullets', 'items'
          let features = []
          if (Array.isArray(planFields?.features)) {
            features = planFields.features
          } else if (Array.isArray(planFields?.feature_list)) {
            features = planFields.feature_list
          } else if (Array.isArray(planFields?.bullets)) {
            features = planFields.bullets
          } else if (Array.isArray(planFields?.items)) {
            features = planFields.items.map(item => typeof item === 'string' ? item : item?.text || item?.name || '')
          } else if (Array.isArray(planFields?.feature_items)) {
            features = planFields.feature_items
          }
          
          const popular = planFields?.popular || 
                        planFields?.is_popular || 
                        planFields?.is_popular_plan ||
                        planFields?.most_popular ||
                        false
          
          return {
            name,
            price,
            period,
            description,
            features,
            popular,
          }
        })
        
        return mappedPlans
      })(),
      note: (() => {
        const value = pricingData?.note
        if (value !== undefined && value !== null && value !== '') return value
        return null
      })(),
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


