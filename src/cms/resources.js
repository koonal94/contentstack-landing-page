import { getStack } from './contentstackClient'
import Contentstack from 'contentstack'

export async function fetchResources(forcedEntryUid = null, ignoreStoredUid = false) {
  const stack = getStack()
  if (!stack) return null
  
  let contentType = 'resources'
  const locale = 'en-us'
  let entryUid = forcedEntryUid || ''
  
  if (!ignoreStoredUid && typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search)
      const ctFromUrl = params.get('content_type_uid') || params.get('contentTypeUid')
      const entryFromUrl = params.get('entry_uid') || params.get('entryUid')
      
      if (ctFromUrl && ctFromUrl === 'resources') {
        contentType = ctFromUrl
      }
      
      if (entryFromUrl) {
        entryUid = entryFromUrl
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
  
  if (entryUid && !ignoreStoredUid) {
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
        }
      } catch {}
      
      entry = await entryQuery.fetch()
    } catch (e) {
      // Silent fallback
    }
  }
  
  if (!entry) {
    try {
      const publishedQuery = base.descending('updated_at').limit(1)
      try {
        if (typeof publishedQuery.addParam === 'function') {
          const timestamp = Date.now()
          publishedQuery.addParam('_cb', timestamp)
          publishedQuery.addParam('_t', timestamp)
        }
      } catch {}
      
      entry = await run(publishedQuery)
    } catch (e) {
      // Silent fallback
    }
  }
  
  // Add Live Edit tags if in Live Preview mode
  if (entry && typeof window !== 'undefined') {
    // CRITICAL: Only add Live Edit tags when in Live Preview mode
    let inIframe = false
    try {
      inIframe = window.self !== window.top
    } catch {}
    
    const hasLivePreviewParams = window.location.search.includes('entry_uid') || 
                                  window.location.search.includes('entryUid') ||
                                  window.location.hash.includes('entry/')
    
    // Check referrer for Launch-hosted sites (more reliable than iframe check)
    let hasContentstackReferrer = false
    try {
      const referrer = document.referrer || ''
      hasContentstackReferrer = referrer.includes('contentstack.com') || 
                                referrer.includes('contentstack.io') ||
                                referrer.includes('app.contentstack')
    } catch {}
    
    // Check if Live Preview is enabled in environment (for Launch)
    const livePreviewEnabled = (import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW || 'false') === 'true'
    const isLaunchDomain = typeof window !== 'undefined' && (
      window.location.hostname.includes('contentstackapps.com') ||
      window.location.hostname.includes('contentstack.io')
    )
    
    // Only add edit tags if we're in Live Preview
    // For Launch: check referrer, env flag, or URL params (iframe check may fail due to CORS)
    if (inIframe || hasLivePreviewParams || (livePreviewEnabled && (hasContentstackReferrer || isLaunchDomain))) {
      try {
        // Normalize entry structure BEFORE calling addEditableTags
        if (!entry.fields && (entry.hero || entry.resources || entry.footer)) {
          entry.fields = {}
          const groupNames = ['hero', 'resources', 'footer']
          groupNames.forEach(key => {
            if (entry[key]) {
              entry.fields[key] = JSON.parse(JSON.stringify(entry[key]))
            }
          })
        }
        
        // Ensure entry.fields exists
        if (!entry.fields) {
          entry.fields = {}
        }
        
        // Check for fields at root level and normalize them to entry.fields
        const groupNames = ['hero', 'resources', 'footer']
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
        
        const addEditableTags = Contentstack.Utils?.addEditableTags
        if (typeof addEditableTags === 'function') {
          addEditableTags(entry, contentType, true, locale)
          
          const editTags = entry.$ || entry.fields?.$ || null
          const currentEntryUid = entry.uid || ''
          
          if (editTags && currentEntryUid) {
            const entryData = entry.fields
            
            // Define all groups and their fields based on the content model
            const groupFields = {
              hero: ['heading', 'subheading'],
              resources: [], // Array field - handled at group level
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
                
                // For array fields like resources, create group-level tag
                if (groupName === 'resources' && !entryData[groupName].$['data-cslp']) {
                  entryData[groupName].$['data-cslp'] = `${contentType}.${currentEntryUid}.${locale}.${groupName}`
                }
                
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
                
                // For array fields, also add to entry.$
                if (groupName === 'resources' && !entry.$[groupName]['data-cslp']) {
                  entry.$[groupName]['data-cslp'] = `${contentType}.${currentEntryUid}.${locale}.${groupName}`
                }
              }
            })
          }
        }
      } catch (e) {
        // Silent error handling for edit tags
      }
    }
    
    // Store content type and entry UID when entry is found
    if (entry?.uid) {
      try {
        const storedContentType = sessionStorage.getItem('contentstack_content_type')
        if (inIframe || storedContentType === contentType || !storedContentType) {
          sessionStorage.setItem('contentstack_content_type', contentType)
          sessionStorage.setItem('contentstack_entry_uid', entry.uid)
        }
      } catch {}
    }
  }
  
  return entry || null
}

export function mapResources(entry) {
  if (!entry) return null
  
  let fields = entry.fields
  
  if (!fields && (entry.hero || entry.resources || entry.footer)) {
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
    },
    resources: (fields?.resources || []).map((r) => ({
      title: r?.title,
      description: r?.description,
      icon: r?.icon || 'Book',
      color: r?.color || 'from-blue-500 to-blue-600',
      link: r?.link?.href || r?.link || '#',
    })),
    footer: {
      linkGroups: ((fields?.footer?.link_groups) || fields?.footer || []).map((g) => ({
        title: g?.title,
        links: (g?.links || []).map((l) => ({ label: l?.label, href: l?.href || '#' })),
      })),
    },
  }
}

