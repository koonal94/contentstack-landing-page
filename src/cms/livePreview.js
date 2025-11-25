import LivePreview from '@contentstack/live-preview-utils'
import { getStack } from './contentstackClient'

export function initLivePreview() {
  const enable = (import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW || 'false') === 'true'
  if (!enable) return

  const apiKey = import.meta.env.VITE_CONTENTSTACK_API_KEY
  const environment = import.meta.env.VITE_CONTENTSTACK_ENVIRONMENT
  const previewToken = (import.meta.env.VITE_CONTENTSTACK_PREVIEW_TOKEN || '').trim()
  const region = (import.meta.env.VITE_CONTENTSTACK_REGION || 'US').toUpperCase()

  if (!apiKey || !environment) return

  // Preview token is required for Live Preview
  if (!previewToken) {
    return
  }

  const stack = getStack()
  if (!stack) {
    return
  }

  const hostMap = {
    US: 'app.contentstack.com',
    EU: 'eu-app.contentstack.com',
    AZURE_NA: 'azure-na-app.contentstack.com',
  }

  try {
    // Per Contentstack V3 SDK: preview_token should NOT be in stackDetails
    // It should ONLY be in stackSdk.live_preview.preview_token (configured in contentstackClient.js)
    const config = {
      stackSdk: stack, // Stack has live_preview.preview_token configured
      enable: true,
      mode: 'builder', // Required for Visual Experience Builder (VEB)
      ssr: false,
      stackDetails: {
        apiKey,
        environment,
      },
      clientUrlParams: {
        protocol: 'https',
        host: hostMap[region] || hostMap.US,
        port: 443,
      },
      editButton: {
        enable: true,
        exclude: ['outsideLivePreviewPortal'],
        includeByQueryParameter: false,
        position: 'top-right',
      },
    }

    LivePreview.init(config)
    
    // Set up Visual Experience Builder (VEB) support after SDK initialization
    setupVisualExperienceBuilder()
  } catch (error) {
    console.error('Live Preview initialization error:', error)
  }
}

// Set up Visual Experience Builder (VEB) support
function setupVisualExperienceBuilder() {
  if (typeof window === 'undefined') return
  
  // Listen for VEB postMessage requests
  window.addEventListener('message', (event) => {
    // Only accept messages from Contentstack
    const allowedOrigins = [
      'https://app.contentstack.com',
      'https://app.contentstack.io',
      'https://eu-app.contentstack.com',
      'https://azure-na-app.contentstack.com',
    ]
    
    if (!allowedOrigins.some(origin => event.origin.includes(origin.replace('https://', '')))) {
      return
    }
    
    // Handle VEB postMessage requests
    if (event.data && event.data.type === 'contentstack-adv-post-message') {
      const eventType = event.data.event
      
      if (eventType === 'get-entries-in-current-page') {
        handleGetEntriesOnPage(event)
      } else if (eventType === 'get-sdk-version' || eventType === 'validate-sdk-version') {
        handleGetSDKVersion(event)
      } else if (eventType === 'history') {
        // Handle history event for VEB
        handleHistoryEvent(event)
      } else if (eventType === 'scroll') {
        // Handle scroll event for VEB
        handleScrollEvent(event)
      } else if (eventType === 'sdk-ready' || eventType === 'sdk-initialized') {
        // Acknowledge SDK is ready
        if (event.source && typeof event.source.postMessage === 'function') {
          event.source.postMessage({
            type: 'contentstack-adv-post-message',
            event: 'sdk-ready',
            data: { status: 'ready' },
            requestId: event.data?.requestId,
          }, event.origin)
        }
      }
    }
  })
  
  // Expose SDK version on window for VEB to access
  if (typeof window !== 'undefined' && LivePreview) {
    try {
      window.__CONTENTSTACK_LIVE_PREVIEW_SDK__ = {
        version: '4.1.1', // Match package.json version
        initialized: true,
        utils: LivePreview,
      }
    } catch (e) {
      // Silent fail
    }
  }
}

// Handle VEB request for SDK version
function handleGetSDKVersion(event) {
  try {
    const sdkVersion = '4.1.1' // Match @contentstack/live-preview-utils version
    
    if (event.source && typeof event.source.postMessage === 'function') {
      event.source.postMessage({
        type: 'contentstack-adv-post-message',
        event: event.data.event,
        data: {
          version: sdkVersion,
          initialized: true,
        },
        requestId: event.data?.requestId,
      }, event.origin)
    }
  } catch (error) {
    console.warn('[VEB] Error handling SDK version request:', error)
  }
}

// Handle VEB request to get all entries on the current page
function handleGetEntriesOnPage(event) {
  try {
    const entries = []
    
    // Get entry UID, content type, and locale from sessionStorage
    const entryUid = sessionStorage.getItem('contentstack_entry_uid')
    const contentType = sessionStorage.getItem('contentstack_content_type') || 'homepage'
    const locale = sessionStorage.getItem('contentstack_locale') || import.meta.env.VITE_CONTENTSTACK_LOCALE || 'en-us'
    
    if (entryUid && contentType) {
      // Construct preview URL based on content type and current location
      let previewUrl = window.location.origin + window.location.pathname
      
      // Add query parameters for live preview
      const urlParams = new URLSearchParams()
      urlParams.set('content_type_uid', contentType)
      urlParams.set('entry_uid', entryUid)
      if (locale) {
        urlParams.set('locale', locale)
      }
      
      previewUrl += '?' + urlParams.toString()
      
      entries.push({
        uid: entryUid,
        content_type_uid: contentType,
        locale: locale,
        url: previewUrl, // Include preview URL for VEB
      })
    }
    
    // Send response back to VEB
    if (event.source && typeof event.source.postMessage === 'function') {
      event.source.postMessage({
        type: 'contentstack-adv-post-message',
        event: 'get-entries-in-current-page',
        data: entries,
        requestId: event.data?.requestId,
      }, event.origin)
    }
  } catch (error) {
    console.warn('[VEB] Error handling get-entries-in-current-page:', error)
  }
}

// Handle VEB history event
function handleHistoryEvent(event) {
  try {
    // Acknowledge history event
    if (event.source && typeof event.source.postMessage === 'function') {
      event.source.postMessage({
        type: 'contentstack-adv-post-message',
        event: 'history',
        data: { status: 'acknowledged' },
        requestId: event.data?.requestId,
      }, event.origin)
    }
  } catch (error) {
    console.warn('[VEB] Error handling history event:', error)
  }
}

// Handle VEB scroll event
function handleScrollEvent(event) {
  try {
    // Acknowledge scroll event
    if (event.source && typeof event.source.postMessage === 'function') {
      event.source.postMessage({
        type: 'contentstack-adv-post-message',
        event: 'scroll',
        data: { status: 'acknowledged' },
        requestId: event.data?.requestId,
      }, event.origin)
    }
  } catch (error) {
    console.warn('[VEB] Error handling scroll event:', error)
  }
}

export function onLivePreviewChange(callback) {
  const enable = (import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW || 'false') === 'true'
  if (!enable) {
    return () => {}
  }
  
  try {
    // Check if onEntryChange is available
    if (typeof LivePreview.onEntryChange !== 'function') {
      return () => {}
    }
    
    // Minimal debounce for faster updates
    let callbackTimeout = null
    
    const unsubscribe = LivePreview.onEntryChange((data) => {
      // Clear any pending callback
      if (callbackTimeout) {
        clearTimeout(callbackTimeout)
      }
      
      // Debounce to prevent rapid-fire updates that cause refreshes (300ms)
      callbackTimeout = setTimeout(() => {
        callback(data)
      }, 300) // 300ms debounce to prevent constant refreshes
    })
    
    
    return unsubscribe
  } catch (error) {
    // Silent error handling
    return () => {}
  }
}


