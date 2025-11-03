import Contentstack from 'contentstack'

const apiKey = (import.meta.env.VITE_CONTENTSTACK_API_KEY || '').trim()
const deliveryToken = (import.meta.env.VITE_CONTENTSTACK_DELIVERY_TOKEN || '').trim()
const previewToken = (import.meta.env.VITE_CONTENTSTACK_PREVIEW_TOKEN || '').trim()
const environment = (import.meta.env.VITE_CONTENTSTACK_ENVIRONMENT || '').trim()
const region = ((import.meta.env.VITE_CONTENTSTACK_REGION || 'US').trim()).toUpperCase()

function parseBool(v) {
  let s = (v || '').toString().trim()
  // strip wrapping quotes if present
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1)
  }
  s = s.toLowerCase()
  return s === 'true' || s === '1' || s === 'yes'
}

const requestedPreview = parseBool(import.meta.env.VITE_CONTENTSTACK_USE_PREVIEW)
const livePreviewEnabled = parseBool(import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW)


// Check if we're currently in a Live Preview session
function isInLivePreviewSession() {
  try {
    // Check if we're in an iframe (Live Preview opens in iframe)
    const inIframe = window.self !== window.top
    
    // Check for Live Preview indicators in current window
    const hasLivePreviewParams = window.location.search.includes('entry_uid') || 
                                  window.location.search.includes('entryUid') ||
                                  window.location.hash.includes('entry/')
    
    // If in iframe, assume we're in Live Preview (even if we can't access parent URL due to CORS)
    // The SDK's live_preview config will handle the actual Preview API usage
    if (inIframe) {
      console.log('🔍 Detected iframe - assuming Live Preview session')
      return true
    }
    
    return hasLivePreviewParams
  } catch (e) {
    // If we can't check (CORS), but Live Preview is enabled, assume we might be in Live Preview
    if (livePreviewEnabled) {
      console.log('🔍 CORS error checking iframe, but Live Preview enabled - assuming session active')
      return true
    }
    return false
  }
}

export function getStack() {
  // Always use delivery token for Stack SDK
  // Preview token is only used in live_preview config
  // Only switch to preview host if explicitly requested (not auto-detected)
  const usePreview = requestedPreview && !!previewToken

  if (!apiKey || !deliveryToken || !environment) {
    console.warn('Contentstack env vars missing. Using fallback content.')
    return null
  }

  const hostMap = {
    US: {
      delivery: 'cdn.contentstack.io',
      preview: 'preview.contentstack.io',
      restPreview: 'rest-preview.contentstack.com',
    },
    EU: {
      delivery: 'eu-cdn.contentstack.com',
      preview: 'eu-preview.contentstack.com',
      restPreview: 'eu-rest-preview.contentstack.com',
    },
    AZURE_NA: {
      delivery: 'azure-na-cdn.contentstack.com',
      preview: 'azure-na-preview.contentstack.com',
      restPreview: 'azure-na-rest-preview.contentstack.com',
    },
  }

  // Validate region is one of the supported values
  const validRegions = ['US', 'EU', 'AZURE_NA']
  const normalizedRegion = validRegions.includes(region) ? region : 'US'
  
  // Always use delivery host by default - Preview API is only used via live_preview config
  const selectedHost = hostMap[normalizedRegion]?.delivery || hostMap.US.delivery

  const stackConfig = {
    api_key: apiKey,
    delivery_token: deliveryToken, // Always use delivery token for Stack SDK
    environment,
    host: selectedHost,
    region:
      normalizedRegion === 'EU'
        ? Contentstack.Region.EU
        : normalizedRegion === 'AZURE_NA'
        ? Contentstack.Region.AZURE_NA
        : Contentstack.Region.US,
  }

  // Add Live Preview config when Live Preview is enabled
  if (livePreviewEnabled && previewToken) {
    stackConfig.live_preview = {
      enable: true,
      host: hostMap[normalizedRegion]?.restPreview || hostMap.US.restPreview,
      preview_token: String(previewToken).trim(),
    }
  }
  
  console.debug('CMS: init stack', {
    livePreviewEnabled,
    requestedPreview,
    usePreviewHost: usePreview,
    hasDeliveryToken: !!deliveryToken,
    hasPreviewToken: !!previewToken,
    region: normalizedRegion,
    environment,
    host: selectedHost,
    hasLivePreviewConfig: !!stackConfig.live_preview,
  })
  
  // Log network diagnostics if host is invalid
  if (!selectedHost || !selectedHost.includes('contentstack')) {
    console.error('❌ Contentstack: Invalid host detected:', selectedHost)
    console.error('   Region:', normalizedRegion, '(from env:', region, ')')
  }

  // Validate host before creating stack
  if (!selectedHost || !selectedHost.includes('contentstack')) {
    console.error('❌ Contentstack: Invalid host configuration:', selectedHost)
    return null
  }

  let stack = null
  try {
    stack = Contentstack.Stack(stackConfig)
  } catch (stackError) {
    console.error('❌ Contentstack: Failed to create Stack instance:', stackError)
    console.error('   Config:', { apiKey: !!apiKey, deliveryToken: !!deliveryToken, environment, host: selectedHost, region: normalizedRegion })
    return null
  }
  
  if (!stack) {
    console.error('❌ Contentstack: Stack instance is null after creation')
    return null
  }

  // CRITICAL: Disable ALL caching to see latest published/draft changes immediately
  // This is essential for:
  // - Live Preview: To show draft changes as you type
  // - Production: To see published updates immediately (Contentstack CDN may cache responses)
  try {
    if (stack.setCachePolicy) {
      stack.setCachePolicy(Contentstack.CachePolicy.IGNORE_CACHE)
    }
  } catch {}
  
  // When Live Preview is enabled, ensure we bypass ALL caching for drafts
  // For production, this also ensures published updates appear immediately
  if (livePreviewEnabled && previewToken) {
    try {
      // Force NO caching - must see latest content immediately
      if (stack.setCachePolicy) {
        stack.setCachePolicy(Contentstack.CachePolicy.IGNORE_CACHE)
      }
    } catch {}
  }

  return stack
}



