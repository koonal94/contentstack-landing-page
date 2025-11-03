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
  } catch (error) {
    console.error('Live Preview initialization error:', error)
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


