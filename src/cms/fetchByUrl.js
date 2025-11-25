import { getStack } from './contentstackClient'
import { fetchHomepage } from './homepage'
import { fetchLogin } from './login'
import { fetchGetStarted } from './getStarted'

/**
 * Fetches an entry by its URL field
 * @param {string} urlPath - The URL path to search for (e.g., '/contentstack-testing')
 * @returns {Promise<{entry: Object, contentType: string, component: string}>}
 */
export async function fetchEntryByUrl(urlPath) {
  const stack = getStack()
  if (!stack) {
    console.error('[FETCH_BY_URL] Stack is null')
    return null
  }

  // Normalize the URL path - ensure it starts with / and remove trailing slash
  let normalizedPath = urlPath
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath
  }
  normalizedPath = normalizedPath.replace(/\/+$/, '') || '/' // Remove trailing slashes, but keep / for root
  
  const locale = import.meta.env.VITE_CONTENTSTACK_LOCALE || 'en-us'
  
  // List of content types to check (including all content types with URL fields)
  const contentTypes = [
    'homepage',
    'login',
    'get_started',
    'benefit_card',
    'feature',
    'footer_group',
    'pricing_plan',
    'testimonial',
  ]
  
  // Try each content type
  for (const contentType of contentTypes) {
    try {
      // Query by URL field - try both with and without leading slash
      // Contentstack might store it as "/contentstack-testing" or "contentstack-testing"
      const query = stack
        .ContentType(contentType)
        .Query()
        .language(locale)
        .toJSON()
      
      // Try to find entry where URL matches
      // We'll need to fetch and filter since Contentstack's where() might not work with URL field
      const allQuery = query.limit(100) // Get more entries to search through
      
      // Add cache-busting
      if (typeof allQuery.addParam === 'function') {
        const timestamp = Date.now()
        allQuery.addParam('_cb', timestamp)
        allQuery.addParam('_t', timestamp)
      }
      
      const result = await allQuery.find()
      const entries = result?.[0] || []
      
      // Find entry where URL field matches
      const matchingEntry = entries.find(entry => {
        // Try multiple possible locations for the URL field
        let entryUrl = entry?.url || 
                      entry?.fields?.url || 
                      entry?.url_field ||
                      entry?.fields?.url_field
        
        // If URL is an object (might be a reference field), try to get the actual value
        if (entryUrl && typeof entryUrl === 'object') {
          entryUrl = entryUrl.url || entryUrl.uid || entryUrl.title || null
        }
        
        if (!entryUrl || typeof entryUrl !== 'string') return false
        
        // Extract path from full URL if it's a full URL (e.g., "http://localhost:5173/contentstack-testing")
        let urlPath = entryUrl
        try {
          // If it's a full URL, extract just the path
          if (urlPath.includes('://')) {
            const urlObj = new URL(urlPath)
            urlPath = urlObj.pathname
          }
        } catch (e) {
          // If URL parsing fails, use the original value
        }
        
        // Normalize entry URL for comparison
        let entryUrlNormalized = urlPath
        entryUrlNormalized = entryUrlNormalized.replace(/\/+$/, '') || '/'
        if (!entryUrlNormalized.startsWith('/')) {
          entryUrlNormalized = '/' + entryUrlNormalized
        }
        
        return entryUrlNormalized === normalizedPath
      })
      
      if (matchingEntry) {
        // Determine which component to use
        // Main page components
        let component = 'homepage'
        if (contentType === 'login') {
          component = 'login'
        } else if (contentType === 'get_started') {
          component = 'get_started'
        } else if (['benefit_card', 'feature', 'footer_group', 'pricing_plan', 'testimonial'].includes(contentType)) {
          // Reference content types - display as standalone pages
          component = 'reference'
        }
        
        return {
          entry: matchingEntry,
          contentType,
          component,
        }
      }
    } catch (error) {
      // Continue to next content type if this one fails
      console.debug(`[FETCH_BY_URL] Error querying ${contentType}:`, error)
      continue
    }
  }
  
  // If no entry found by URL, return null
  return null
}

/**
 * Fetches entry data using the appropriate fetch function based on content type
 * @param {string} contentType - The content type
 * @param {string} entryUid - Optional entry UID to fetch
 * @returns {Promise<Object>}
 */
export async function fetchEntryData(contentType, entryUid = null) {
  const stack = getStack()
  if (!stack) return null
  
  const locale = import.meta.env.VITE_CONTENTSTACK_LOCALE || 'en-us'
  
  switch (contentType) {
    case 'homepage':
      return await fetchHomepage(entryUid, true)
    case 'login':
      return await fetchLogin(entryUid, true)
    case 'get_started':
      return await fetchGetStarted(entryUid, true)
    case 'benefit_card':
    case 'feature':
    case 'footer_group':
    case 'pricing_plan':
    case 'testimonial':
      // For reference content types, fetch directly by UID
      if (entryUid) {
        try {
          const entryQuery = stack
            .ContentType(contentType)
            .Entry(entryUid)
            .language(locale)
            .toJSON()
          
          // Add cache-busting
          if (typeof entryQuery.addParam === 'function') {
            const timestamp = Date.now()
            entryQuery.addParam('_cb', timestamp)
            entryQuery.addParam('_t', timestamp)
          }
          
          const entry = await entryQuery.fetch()
          return entry
        } catch (error) {
          console.warn(`[FETCH_BY_URL] Error fetching ${contentType} entry:`, error)
          return null
        }
      }
      return null
    default:
      return null
  }
}

