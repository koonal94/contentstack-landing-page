import { getStack } from './contentstackClient'
import Contentstack from 'contentstack'

// Fetches the first published login entry
export async function fetchLogin(forcedEntryUid = null) {
  const stack = getStack()
  if (!stack) return null
  
  let contentType = 'login'
  const locale = 'en-us'
  
  let entryUid = forcedEntryUid || import.meta.env.VITE_CONTENTSTACK_LOGIN_ENTRY_UID || ''
  
  try {
    const params = new URLSearchParams(window.location.search)
    const ctFromUrl = params.get('content_type_uid') || params.get('contentTypeUid')
    const entryFromUrl = params.get('entry_uid') || params.get('entryUid')
    
    // CRITICAL: Only use content type from URL if it matches 'login'
    if (ctFromUrl && ctFromUrl === 'login') {
      contentType = ctFromUrl
    }
    
    if (entryFromUrl) {
      entryUid = entryFromUrl
      console.log('[LOGIN] Found entry UID in URL params:', entryUid)
    }
    
    const hashMatch = window.location.hash.match(/entry[\/=]([^\/&\?]+)/i)
    if (hashMatch && !entryUid) {
      entryUid = hashMatch[1]
    }
    
    // CRITICAL: Only use stored entry UID if content type matches
    if (!entryUid && typeof window !== 'undefined') {
      try {
        const storedContentType = sessionStorage.getItem('contentstack_content_type') || 
                                  localStorage.getItem('contentstack_content_type')
        
        if (storedContentType === 'login') {
          const stored = localStorage.getItem('contentstack_entry_uid') || 
                        sessionStorage.getItem('contentstack_entry_uid')
          if (stored) {
            entryUid = stored
          }
        }
      } catch {}
    }
  } catch {}
  
  let inIframe = false
  try {
    inIframe = window.self !== window.top
  } catch {}
  
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
  if (entryUid) {
    try {
      const entryQuery = stack
        .ContentType(contentType)
        .Entry(entryUid)
        .language(locale)
        .toJSON()
      
      // Add cache-busting
      try {
        if (typeof entryQuery.addParam === 'function') {
          const timestamp = Date.now()
          entryQuery.addParam('_cb', timestamp)
          entryQuery.addParam('_t', timestamp)
          entryQuery.addParam('_timestamp', timestamp)
          
          if (inIframe) {
            entryQuery.addParam('_nocache', timestamp)
          }
        }
      } catch {}
      
      let e = null
      try {
        e = await entryQuery.fetch()
      } catch (fetchError) {
        console.warn('[LOGIN] Failed to fetch entry by UID:', fetchError)
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
            // Silent fallback
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
  
  // Fallback: try latest entry (works for published content)
  if (!entry && !inIframe) {
    try {
      entry = await run(base.only(['*']).descending('updated_at').limit(1))
    } catch (e) {
      // Silent fallback
    }
  }
  
  // Final fallback: latest updated entry (only if not in Live Preview)
  if (!entry && !inIframe) {
    try {
      entry = await run(base.limit(1))
    } catch (e) {
      // Silent fallback
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
  
  // Store content type and entry UID when entry is found
  if (entry?.uid && typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('contentstack_content_type', contentType)
      sessionStorage.setItem('contentstack_entry_uid', entry.uid)
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
