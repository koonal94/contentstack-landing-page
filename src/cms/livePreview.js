import LivePreview from '@contentstack/live-preview-utils'
import { getStack, getLastStackConfig } from './contentstackClient'

export function initLivePreview() {
  const enable = (import.meta.env.VITE_CONTENTSTACK_LIVE_PREVIEW || 'false') === 'true'
  if (!enable) return

  const apiKey = import.meta.env.VITE_CONTENTSTACK_API_KEY
  const environment = import.meta.env.VITE_CONTENTSTACK_ENVIRONMENT
  const region = (import.meta.env.VITE_CONTENTSTACK_REGION || 'US').toUpperCase()

  if (!apiKey || !environment) return

  // Get the stack instance (which includes Live Preview config)
  const stack = getStack()
  if (!stack) {
    return
  }

  const hostMap = {
    US: 'app.contentstack.com',
    EU: 'eu-app.contentstack.com',
    AZURE_NA: 'azure-na-app.contentstack.com',
  }

  const previewTokenEnv = (import.meta.env.VITE_CONTENTSTACK_PREVIEW_TOKEN || '').trim()
  
  // CRITICAL FIX: Don't rely on stack?.live_preview?.preview_token
  // The Stack instance may not expose that property even if it was set in config
  // Instead, check the stack config directly (which we now export from contentstackClient.js)
  const stackConfig = getLastStackConfig && getLastStackConfig()
  
  // Prefer preview token from stackConfig (if exposed), otherwise fallback to env
  const stackConfigToken = stackConfig?.live_preview?.preview_token
  const previewToken = stackConfigToken || previewTokenEnv
  
  if (!previewToken) {
    console.warn('⚠️ Live Preview init skipped: no preview token (env or stack config)')
    console.warn('   Check: .env has VITE_CONTENTSTACK_PREVIEW_TOKEN set and matches Contentstack Settings')
    return
  }
  
  // If we have both config token and env token, verify they match
  if (stackConfigToken && previewTokenEnv && stackConfigToken !== previewTokenEnv) {
    console.warn('⚠️ Live Preview: Preview token mismatch between stack config and env')
  }
  
  try {
    // Verify stack has live_preview config accessible
    const stackHasPreviewToken = stackConfig?.live_preview?.preview_token || previewToken
    
    // Per official Contentstack V3 documentation:
    // https://www.contentstack.com/docs/developers/set-up-live-preview/get-started-with-live-preview-utils-sdk-v3
    // - stackDetails should ONLY have apiKey, environment (and optionally branch)
    // - stackSdk should have live_preview.preview_token configured (done in contentstackClient.js)
    // - Do NOT pass preview_token in stackDetails or top-level - SDK reads it from stackSdk
    // - For CSR: ssr must be false, stackSdk is required
    const config = {
      stackSdk: stack, // Stack SDK with live_preview.preview_token configured
      enable: true,
      ssr: false, // CRITICAL: Must be false for CSR (Client-Side Rendering)
      stackDetails: {
        apiKey,
        environment,
        // Do NOT pass preview_token here - SDK reads it from stackSdk.live_preview.preview_token
      },
      clientUrlParams: {
        protocol: 'https',
        host: hostMap[region] || hostMap.US,
        port: 443,
      },
      editButton: {
        enable: true,
        exclude: ['outsideLivePreviewPortal'], // Only show edit button in Live Preview pane
        includeByQueryParameter: false,
        position: 'top-right',
      },
      // Do NOT pass preview_token as top-level - SDK reads it from stackSdk
    }
    
    // CRITICAL: We already validated previewToken exists above (from stackConfig or env)
    // The stackSdk has live_preview.preview_token configured in contentstackClient.js
    // The Utils SDK will read it from stackSdk.live_preview.preview_token for socket-auth
    // No need to check stack instance property - it may not be exposed even though it's in config
    
    // Initialize Live Preview SDK
    try {
      LivePreview.init(config)
      
      // Log minimal initialization info (only if debug mode)
      if (import.meta.env.DEV) {
        console.debug('✅ Live Preview initialized')
      }
      
      // Per V3 docs: Use onLiveEdit (NOT onLiveEditChange) for field-level updates in CSR
      // onLiveEdit is exclusively for CSR and sends a single API request for draft content
      // Reference: https://www.contentstack.com/docs/developers/set-up-live-preview/get-started-with-live-preview-utils-sdk-v3
      const setupLiveEdit = () => {
        // V3 SDK uses onLiveEdit (not onLiveEditChange)
        const onLiveEditMethod = LivePreview.onLiveEdit || LivePreview.onLiveEditChange
        if (typeof onLiveEditMethod === 'function') {
          onLiveEditMethod(() => {
            try {
              if (typeof window !== 'undefined') {
                // Dispatch custom event for App.jsx to handle
                window.dispatchEvent(new CustomEvent('contentstack-live-edit-change', {
                  detail: {}
                }))
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({
                    type: 'contentstack-live-edit-change',
                    data: {}
                  }, '*')
                }
              }
            } catch {}
          })
          return true
        }
        return false
      }
      
      // Try immediately, then retry once (SDK may initialize async)
      if (!setupLiveEdit()) {
        setTimeout(() => setupLiveEdit(), 1000)
      }
    } catch (initError) {
      // Log initialization errors for debugging
      console.error('❌ Live Preview Utils SDK initialization failed:', initError)
    }
    
  } catch (error) {
    // Silent error handling - Live Preview is optional
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


