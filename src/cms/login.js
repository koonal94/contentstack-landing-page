import { getStack } from './contentstackClient'
import Contentstack from 'contentstack'

// Fetches the first published login entry
// @param {string} forcedEntryUid - Optional entry UID to fetch (overrides detection)
// @param {boolean} ignoreStoredUid - If true, skip stored UIDs and fetch published entries
export async function fetchLogin(forcedEntryUid = null, ignoreStoredUid = false) {
  const stack = getStack()
  if (!stack) return null
  
  // Check if in iframe (Live Preview indicator) FIRST
  let inIframe = false
  try {
    inIframe = window.self !== window.top
  } catch {}
  
  let contentType = 'login'
  const locale = 'en-us'
  
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
      
      // CRITICAL: Only use content type from URL if it matches 'login'
      if (ctFromUrl && ctFromUrl === 'login') {
        contentType = ctFromUrl
      }
      
      // Only use URL params if in live preview OR if forcedEntryUid was provided
      if (entryFromUrl && (inIframe || forcedEntryUid)) {
        entryUid = entryFromUrl
        console.log('[LOGIN] Found entry UID in URL params:', entryUid)
      }
      
      // Also check hash (Contentstack sometimes uses hash-based routing)
      const hashMatch = window.location.hash.match(/entry[\/=]([^\/&\?]+)/i)
      if (hashMatch && !entryUid && (inIframe || forcedEntryUid)) {
        entryUid = hashMatch[1]
        console.log('[LOGIN] Found entry UID in hash:', entryUid)
      }
    } catch {}
  }
  
  // Only check localStorage/sessionStorage for entry UID if in Live Preview (iframe)
  // OR if we're using URL-based routing (stored by DynamicPage)
  // When NOT in live preview, skip stored UIDs to fetch published entries
  // Also skip if ignoreStoredUid is true
  if (!entryUid && !ignoreStoredUid && typeof window !== 'undefined') {
    try {
      const storedContentType = sessionStorage.getItem('contentstack_content_type') || 
                                localStorage.getItem('contentstack_content_type')
      
      // Use stored UID if in iframe (Live Preview) OR if URL-based routing is active
      const isUrlBased = sessionStorage.getItem('contentstack_url_based') === 'true'
      
      if (storedContentType === 'login' && (inIframe || isUrlBased)) {
        const stored = localStorage.getItem('contentstack_entry_uid') || 
                      sessionStorage.getItem('contentstack_entry_uid')
        if (stored) {
          entryUid = stored
        }
      }
    } catch {}
  }
  
  async function run(q) {
    const result = await q.find()
    const entries = result?.[0] || []
    return entries?.[0] || null
  }
  
  const base = stack
    .ContentType(contentType)
    .Query()
    .language(locale)
    .toJSON()
  
  let entry = null
  
  // If an explicit entry UID is provided, load that first (most specific)
  // BUT: If ignoreStoredUid is true, skip UID-based fetching and query published entries directly
  if (entryUid && !ignoreStoredUid) {
    try {
      const entryQuery = stack
        .ContentType(contentType)
        .Entry(entryUid)
        .language(locale)
        .toJSON()
      
      // Add cache-busting - always use cache-busting for fresh data
      try {
        if (typeof entryQuery.addParam === 'function') {
          const timestamp = Date.now()
          entryQuery.addParam('_cb', timestamp)
          entryQuery.addParam('_t', timestamp)
          entryQuery.addParam('_timestamp', timestamp)
          
          // In Live Preview, add additional no-cache params for drafts
          if (inIframe) {
            entryQuery.addParam('_nocache', timestamp)
          } else {
            // For direct website access, also add cache-busting to ensure fresh published content
            entryQuery.addParam('_fresh', timestamp)
          }
        }
      } catch {}
      
      let e = null
      try {
        e = await entryQuery.fetch()
      } catch (fetchError) {
        // Handle 422 errors (entry doesn't exist) - clear invalid entry UID from storage
        const is422Error = fetchError?.status === 422 || 
                          fetchError?.error_code === 141 ||
                          (typeof fetchError === 'object' && fetchError !== null && 'status' in fetchError && fetchError.status === 422) ||
                          (fetchError?.error_message && fetchError.error_message.includes("doesn't exist"))
        
        if (is422Error && entryUid && typeof window !== 'undefined') {
          // Entry doesn't exist - clear invalid UID from storage immediately
          try {
            const storedContentType = sessionStorage.getItem('contentstack_content_type')
            if (storedContentType === 'login') {
              sessionStorage.removeItem('contentstack_entry_uid')
            }
            // Also clear from localStorage
            const localContentType = localStorage.getItem('contentstack_content_type')
            if (localContentType === 'login') {
              localStorage.removeItem('contentstack_entry_uid')
            }
          } catch {}
          // Clear entryUid so we fall through to query published entries
          entryUid = ''
          console.warn('[LOGIN] Entry UID invalid (422), falling back to query published entries')
        } else {
          console.warn('[LOGIN] Failed to fetch entry by UID:', fetchError)
        }
      }
      entry = e || null
      
      if (entry) {
        // CRITICAL: Normalize structure IMMEDIATELY
        if (!entry.fields && (entry.hero || entry.form || entry.features || entry.footer)) {
          entry.fields = {}
          Object.keys(entry).forEach(key => {
            if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
                typeof entry[key] === 'object' && entry[key] !== null) {
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
  if (!entry && inIframe) {
    try {
      // Try to get latest entry
      if (entryUid) {
        try {
          const entryQuery = stack
            .ContentType(contentType)
            .Entry(entryUid)
            .language(locale)
            .toJSON()
          
          try {
            if (typeof entryQuery.addParam === 'function') {
              const timestamp = Date.now()
              entryQuery.addParam('_cb', timestamp)
              entryQuery.addParam('_t', timestamp)
              entryQuery.addParam('_timestamp', timestamp)
            }
          } catch {}
          
          try {
            entry = await entryQuery.fetch()
          } catch (fetchError) {
            // Handle 422 errors - clear invalid UID
            const is422Error = fetchError?.status === 422 || 
                              fetchError?.error_code === 141 ||
                              (fetchError?.error_message && fetchError.error_message.includes("doesn't exist"))
            if (is422Error && typeof window !== 'undefined') {
              try {
                const storedContentType = sessionStorage.getItem('contentstack_content_type')
                if (storedContentType === 'login') {
                  sessionStorage.removeItem('contentstack_entry_uid')
                }
              } catch {}
            }
          }
        } catch (e) {
          // Silent fallback
        }
      }
      
      // Fallback: query that includes all fields structure
      if (!entry) {
        const simpleQuery = base
          .limit(1)
        
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
          // Silent fallback
        }
      }
      
      if (!entry) {
        try {
          entry = await run(base.only(['*']).descending('updated_at').limit(1))
        } catch (e) {
          // Silent fallback
        }
        if (!entry) {
          try {
            entry = await run(base.limit(1))
          } catch (e) {
            // Silent fallback
          }
        }
      }
    } catch (e) {
      // Silent error handling
    }
  }
  
  // Fallback: query for published entries (only if not in Live Preview)
  // CRITICAL: When NOT in Live Preview, always query for published entries
  if (!entry && !inIframe) {
    try {
      // First try: query for any published entry (most recent first)
      // This is the most reliable query that works for all content types
      const publishedQuery = base.descending('updated_at').limit(1)
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
      
      // If still no entry, try with .only(['*']) as fallback
      if (!entry) {
        try {
          const onlyQuery = base.only(['*']).descending('updated_at').limit(1)
          if (typeof onlyQuery.addParam === 'function') {
            const timestamp = Date.now()
            onlyQuery.addParam('_cb', timestamp)
            onlyQuery.addParam('_t', timestamp)
          }
          entry = await run(onlyQuery)
        } catch (e) {
          // Silent fallback
        }
      }
      
      // Last resort: try with is_default = true (if field exists)
      if (!entry) {
        try {
          const defaultQuery = base.where('is_default', true).limit(1)
          if (typeof defaultQuery.addParam === 'function') {
            const timestamp = Date.now()
            defaultQuery.addParam('_cb', timestamp)
            defaultQuery.addParam('_t', timestamp)
          }
          entry = await run(defaultQuery)
        } catch (e) {
          // Silent fallback - is_default field might not exist
        }
      }
      
      if (!entry) {
        // Only log warning if no entry found after all attempts
        console.warn('[LOGIN] No published entries found. Check environment variable matches published environment.')
      }
    } catch (e) {
      console.error('[LOGIN] Query for published entries failed:', e)
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
      // Silent fallback
    }
  }
  
  if (entry) {
    // CRITICAL: Normalize entry structure BEFORE adding edit tags
    if (!entry.fields && (entry.hero || entry.form || entry.features || entry.footer)) {
      entry.fields = {}
      Object.keys(entry).forEach(key => {
        if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
            typeof entry[key] === 'object' && entry[key] !== null) {
          entry.fields[key] = JSON.parse(JSON.stringify(entry[key]))
        }
      })
    }
    
    // CRITICAL: Only add Live Edit tags when in Live Preview mode
    let inIframe = false
    try {
      inIframe = window.self !== window.top
    } catch {}
    
    const hasLivePreviewParams = window.location.search.includes('entry_uid') || 
                                  window.location.search.includes('entryUid') ||
                                  window.location.hash.includes('entry/')
    
    // Only add edit tags if we're in Live Preview (iframe or has preview params)
    if (inIframe || hasLivePreviewParams) {
      try {
        const addEditableTags = Contentstack.Utils?.addEditableTags
        if (typeof addEditableTags === 'function') {
          addEditableTags(entry, contentType, true, locale)
          
          const editTags = entry.$ || entry.fields?.$ || null
          const currentEntryUid = entry.uid || ''
          
          if (editTags) {
            // Ensure entry.fields exists
            if (!entry.fields) {
              entry.fields = {}
            }
            
            // Check for fields at root level and normalize them to entry.fields
            const groupNames = ['hero', 'form', 'features', 'footer']
            groupNames.forEach(groupName => {
              if (entry[groupName] && !entry.fields[groupName]) {
                entry.fields[groupName] = typeof entry[groupName] === 'object' && entry[groupName] !== null
                  ? { ...entry[groupName] }
                  : entry[groupName]
              }
              if (!entry.fields[groupName]) {
                entry.fields[groupName] = {}
              }
            })
            
            const entryData = entry.fields
            
            // Define all groups and their fields based on the content model
            const groupFields = {
              hero: ['eyebrow', 'heading', 'subheading'],
              form: ['title', 'subtitle', 'email_label', 'password_label', 'remember_me_text', 'forgot_password_text', 'submit_text', 'or_text', 'social_login_text'],
              features: [],
              footer: ['link_groups'],
            }
            
            // Create field-level tags for each group that has a group-level tag
            Object.keys(groupFields).forEach(groupName => {
              if (editTags[groupName]) {
                if (!entryData[groupName].$) {
                  entryData[groupName].$ = {}
                }
                
                const fields = groupFields[groupName]
                fields.forEach(fieldName => {
                  const editTagValue = `${contentType}.${currentEntryUid}.${locale}.${groupName}.${fieldName}`
                  entryData[groupName].$[fieldName] = {
                    'data-cslp': editTagValue
                  }
                })
                
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
          }
        }
      } catch (e) {
        // Silent error handling for edit tags
      }
    }
  }
  
  // Store content type and entry UID when entry is found (only if content type matches)
  if (entry?.uid && typeof window !== 'undefined') {
    try {
      // Only store if we're in Live Preview or if content type matches
      const storedContentType = sessionStorage.getItem('contentstack_content_type')
      if (inIframe || storedContentType === contentType || !storedContentType) {
        sessionStorage.setItem('contentstack_content_type', contentType)
        sessionStorage.setItem('contentstack_entry_uid', entry.uid)
      }
    } catch {}
  }
  
  return entry || null
}

export function mapLogin(entry) {
  if (!entry) return null
  
  let fields = entry.fields
  
  if (!fields && (entry.hero || entry.form || entry.features)) {
    fields = entry
  } else if (!fields) {
    return null
  }
  
  if (!fields || typeof fields !== 'object') {
    return null
  }
  
  return {
    title: fields?.entry_title || fields?.title || entry?.title,
    navigation: fields?.navigation ? {
      brandName: fields.navigation.brand_name || fields.navigation.brandName,
      items: (fields.navigation.nav_items || fields.navigation.items || []).map((item) => ({
        name: item.name || item.label,
        href: item.href || item.link || '#',
      })),
    } : null,
    hero: {
      heading: fields?.hero?.heading,
      subheading: fields?.hero?.subheading,
      eyebrow: fields?.hero?.eyebrow,
    },
    form: {
      title: fields?.form?.title,
      subtitle: fields?.form?.subtitle,
      emailLabel: fields?.form?.email_label,
      passwordLabel: fields?.form?.password_label,
      rememberMe: fields?.form?.remember_me_text,
      forgotPassword: fields?.form?.forgot_password_text,
      submitText: fields?.form?.submit_text,
      orText: fields?.form?.or_text,
      socialLoginText: fields?.form?.social_login_text,
    },
    features: (fields?.features || []).map((f) => ({
      title: f?.title,
      description: f?.description,
      icon: f?.icon || 'Check',
    })),
    footer: {
      linkGroups: ((fields?.footer?.link_groups) || fields?.footer || []).map((g) => ({
        title: g?.title,
        links: (g?.links || []).map((l) => ({ label: l?.label, href: l?.href || '#' })),
      })),
    },
  }
}
