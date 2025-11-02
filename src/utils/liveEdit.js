/**
 * Helper functions for Live Edit Tags
 * Adds data attributes required for Contentstack Live Edit functionality
 */

/**
 * Get Live Edit attributes for an element
 * @param {string} entryUid - The entry UID from Contentstack
 * @param {string} fieldPath - The field path (e.g., 'hero.heading', 'features.items[0].title')
 * @returns {object} Object with data-cslp attributes
 * 
 * Note: Field paths should match the field structure in Contentstack.
 * For example, if your content model has a 'hero' group field with a 'heading' field inside,
 * the path should be 'hero.heading' (using field UIDs, not display names).
 */
export function getLiveEditAttributes(entryUid, fieldPath) {
  if (!entryUid || !fieldPath) {
    if (typeof window !== 'undefined' && window.location.search.includes('entry_uid')) {
      console.warn('⚠️ Live Edit: Missing entryUid or fieldPath', { entryUid, fieldPath })
    }
    return {}
  }
  
  // Contentstack Live Edit uses these specific attribute names
  // Format: data-cslp-entry-uid and data-cslp-field-path
  const attributes = {
    'data-cslp-entry-uid': entryUid,
    'data-cslp-field-path': fieldPath,
  }
  
  // Debug logging in Live Preview mode
  if (typeof window !== 'undefined' && window.self !== window.top) {
    console.debug('🏷️ Live Edit attributes:', { entryUid, fieldPath, attributes })
  }
  
  return attributes
}

/**
 * Combine Live Edit attributes with existing props
 * @param {object} props - Existing props/attributes
 * @param {string} entryUid - Entry UID
 * @param {string} fieldPath - Field path
 * @returns {object} Combined props with Live Edit attributes
 */
export function withLiveEdit(props, entryUid, fieldPath) {
  return {
    ...props,
    ...getLiveEditAttributes(entryUid, fieldPath),
  }
}
