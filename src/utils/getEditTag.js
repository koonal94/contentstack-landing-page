/**
 * Check if we're currently in Live Preview (iframe mode)
 * Edit tags should ONLY be applied in Live Preview, not on the actual website
 */
function isInLivePreview() {
  if (typeof window === 'undefined') return false
  
  try {
    // Check if we're in an iframe (Live Preview opens in iframe)
    // This works for localhost but might fail on Launch due to CORS
    try {
      const inIframe = window.self !== window.top
      if (inIframe) {
        console.debug('[LivePreview] Detected iframe - Live Preview active')
        return true
      }
    } catch (e) {
      // CORS error - can't check iframe, continue with other checks
      // On Launch, CORS might block iframe check, so we rely on other methods
      console.debug('[LivePreview] CORS error checking iframe, trying other methods')
    }
    
    // Check for Live Preview URL parameters (most reliable for Launch)
    // Contentstack adds these when opening Live Preview
    const urlParams = new URLSearchParams(window.location.search)
    const hasEntryUid = urlParams.has('entry_uid') || urlParams.has('entryUid')
    const hasContentType = urlParams.has('content_type_uid') || urlParams.has('contentTypeUid')
    const hasHashEntry = window.location.hash.includes('entry/')
    
    if (hasEntryUid || hasContentType || hasHashEntry) {
      console.debug('[LivePreview] Detected Live Preview URL parameters')
      return true
    }
    
    // Check for Contentstack-specific query parameters
    const hasContentstackParams = window.location.search.includes('contentstack') ||
                                  window.location.search.includes('live_preview') ||
                                  window.location.search.includes('preview') ||
                                  window.location.search.includes('cs_')
    if (hasContentstackParams) {
      console.debug('[LivePreview] Detected Contentstack query parameters')
      return true
    }
    
    // Check referrer - if coming from Contentstack app, we're in Live Preview
    // This is very reliable for Launch-hosted sites
    try {
      const referrer = document.referrer || ''
      if (referrer.includes('contentstack.com') || 
          referrer.includes('contentstack.io') ||
          referrer.includes('app.contentstack')) {
        console.debug('[LivePreview] Detected Contentstack referrer:', referrer)
        return true
      }
    } catch {}
    
    // Check sessionStorage/localStorage marker set by App when it loads an entry
    // This helps when preview is opened in new tab or iframe check fails
    try {
      const stored = sessionStorage.getItem('contentstack_entry_uid') ||
                     localStorage.getItem('contentstack_entry_uid')
      if (stored) {
        // Also check if we have Live Preview enabled in env
        const livePreviewEnabled = (import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW || 'false') === 'true'
        if (livePreviewEnabled) {
          console.debug('[LivePreview] Detected stored entry UID with Live Preview enabled')
          return true
        }
      }
    } catch {}
    
    // CRITICAL: For Launch-hosted sites, check if Live Preview is enabled in environment
    // This should be set to 'true' in Launch environment variables
    const livePreviewEnabled = (import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW || 'false') === 'true'
    if (livePreviewEnabled) {
      // Additional check: if we're on a Launch domain and Live Preview is enabled,
      // assume we're in Live Preview when accessed from Contentstack
      const isLaunchDomain = window.location.hostname.includes('contentstackapps.com') ||
                            window.location.hostname.includes('contentstack.io')
      if (isLaunchDomain) {
        console.debug('[LivePreview] Launch domain detected with Live Preview enabled')
        return true
      }
    }
    
    return false
  } catch (e) {
    // If we can't check (CORS), fallback to env flag
    console.warn('[LivePreview] Error in detection, using env flag fallback:', e)
    try {
      const livePreviewEnabled = (import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW || 'false') === 'true'
      return livePreviewEnabled
    } catch {
      return false
    }
  }
}

/**
 * Helper to get edit tags from Contentstack entry for Live Edit functionality
 * @param {object} entry - The raw Contentstack entry object
 * @param {string} fieldPath - The field path (e.g., 'hero.heading', 'navigation.brand_name')
 * @returns {object} Object with data-cslp attribute for Live Edit
 * 
 * IMPORTANT: Edit tags are ONLY returned when in Live Preview mode
 * This ensures edit buttons don't appear on the actual website
 */
export function getEditTag(entry, fieldPath) {
  // CRITICAL: Only return edit tags when in Live Preview mode
  // This prevents edit buttons from appearing on the actual website
  if (!isInLivePreview()) {
    return {}
  }
  
  if (!entry || !fieldPath) {
    return {}
  }
  
  const parts = fieldPath.split('.')
  if (parts.length < 1) {
    return {}
  }
  
  const groupField = parts[0] // e.g., 'hero', 'navigation', 'benefits'
  
  // Handle single-part paths (for array fields like 'steps' or 'benefits')
  if (parts.length === 1) {
    // Check for group-level tag (used for array fields)
    // Approach 1: entry.fields.group.$ (group-level tag)
    if (entry?.fields?.[groupField]?.$ && typeof entry.fields[groupField].$ === 'object' && entry.fields[groupField].$['data-cslp']) {
      return entry.fields[groupField].$
    }
    
    // Approach 2: entry.$.group (flat structure)
    if (entry?.$?.[groupField] && typeof entry.$[groupField] === 'object' && entry.$[groupField]['data-cslp']) {
      return entry.$[groupField]
    }
    
    // Return empty if no group-level tag found
    return {}
  }
  
  // Handle nested paths like 'benefits.cards.0.title' or 'benefits.cards'
  if (parts.length === 2) {
    // Simple case: group.field (e.g., 'hero.heading')
    const fieldName = parts[1]
    
    // Approach 1: entry.fields.group.$.field (most common - where we manually create them)
    if (entry?.fields?.[groupField]?.$?.[fieldName]) {
      const tag = entry.fields[groupField].$[fieldName]
      if (tag && tag['data-cslp']) {
        return tag
      }
    }
    
    // Approach 2: entry.$.group.field (flat structure)
    if (entry?.$?.[groupField]?.[fieldName]) {
      const tag = entry.$[groupField][fieldName]
      if (tag && tag['data-cslp']) {
        return tag
      }
    }
    
    // Approach 3: entry.fields.group.field.$ (alternative nested)
    if (entry?.fields?.[groupField]?.[fieldName]?.$) {
      const tag = entry.fields[groupField][fieldName].$
      if (tag && tag['data-cslp']) {
        return tag
      }
    }
  } else if (parts.length === 3 && parts[1] === 'cards') {
    // Handle 'benefits.cards.0' or 'benefits.cards.index' - use the cards field tag
    // For reference fields, Contentstack creates edit tags at the reference field level
    // So we use 'benefits.cards' edit tag for individual cards
    const fieldName = 'cards'
    
    if (entry?.fields?.[groupField]?.$?.[fieldName]) {
      const tag = entry.fields[groupField].$[fieldName]
      if (tag && tag['data-cslp']) {
        return tag
      }
    }
    
    if (entry?.$?.[groupField]?.[fieldName]) {
      const tag = entry.$[groupField][fieldName]
      if (tag && tag['data-cslp']) {
        return tag
      }
    }
  } else if (parts.length >= 3) {
    // Handle deeply nested paths like 'benefits.cards.0.title'
    // For reference field items, use the parent reference field tag
    const fieldName = parts[1] // 'cards' in 'benefits.cards.0.title'
    
    if (entry?.fields?.[groupField]?.$?.[fieldName]) {
      const tag = entry.fields[groupField].$[fieldName]
      if (tag && tag['data-cslp']) {
        return tag
      }
    }
    
    if (entry?.$?.[groupField]?.[fieldName]) {
      const tag = entry.$[groupField][fieldName]
      if (tag && tag['data-cslp']) {
        return tag
      }
    }
  }
  
  // Approach 4: Check if addEditableTags created it at entry.$.group.field directly
  if (entry?.$ && entry.$[groupField]) {
    const groupTag = entry.$[groupField]
    // If group tag exists, use it as fallback (shows edit button on entire group)
    if (groupTag && typeof groupTag === 'object' && groupTag['data-cslp']) {
      return groupTag
    }
  }
  
  // Last resort: Return empty object (no edit tag available)
  return {}
}

