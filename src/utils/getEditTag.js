/**
 * Check if we're currently in Live Preview (iframe mode)
 * Edit tags should ONLY be applied in Live Preview, not on the actual website
 */
function isInLivePreview() {
  if (typeof window === 'undefined') return false
  
  try {
    // Check if we're in an iframe (Live Preview opens in iframe)
    const inIframe = window.self !== window.top
    if (inIframe) return true
    
    // Check for Live Preview URL parameters
    const hasLivePreviewParams = window.location.search.includes('entry_uid') || 
                                  window.location.search.includes('entryUid') ||
                                  window.location.hash.includes('entry/')
    if (hasLivePreviewParams) return true
    
    // NEW: Check sessionStorage/localStorage marker set by App when it loads an entry
    // This helps when preview is opened in new tab or iframe check fails
    try {
      const stored = sessionStorage.getItem('contentstack_entry_uid') ||
                     localStorage.getItem('contentstack_entry_uid')
      if (stored) return true
    } catch {}
    
    // NEW: Fallback to env flag (useful for local dev or preview-as-new-tab)
    const livePreviewEnabled = (import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW || 'false') === 'true'
    if (livePreviewEnabled) {
      return true
    }
    
    return false
  } catch {
    // If we can't check (CORS), fallback to env flag
    try {
      return (import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW || 'false') === 'true'
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
  if (parts.length < 2) {
    return {}
  }
  
  const groupField = parts[0] // e.g., 'hero', 'navigation'
  const fieldName = parts[1]  // e.g., 'heading', 'brand_name'
  
  // CRITICAL: Try multiple locations where Contentstack might store edit tags
  // The addEditableTags function can place tags in different locations depending on SDK version
  
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

