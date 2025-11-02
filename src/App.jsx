import { useState, useEffect, useRef } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Features from './components/Features'
import Benefits from './components/Benefits'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'
import { fetchHomepage, mapHomepage } from './cms/homepage'
import { initLivePreview, onLivePreviewChange } from './cms/livePreview'

// Helper to get edit tags from entry data
function getEditTags(entry, fieldPath) {
  if (!entry?.$ || !fieldPath) return {}
  // Navigate through the $ object using the field path
  // e.g., 'hero.heading' -> entry.$.hero?.heading
  const parts = fieldPath.split('.')
  let tag = entry.$
  for (const part of parts) {
    tag = tag?.[part]
    if (!tag) break
  }
  return tag || {}
}

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [cmsData, setCmsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [entryUid, setEntryUid] = useState(null)
  const [entry, setEntry] = useState(null) // Store raw entry for Live Edit tags
  const [updateKey, setUpdateKey] = useState(0) // Force re-render key

  // Shared refs for live-preview callback tracking (used across multiple effects)
  // These need to be shared because handleLiveEditChange (first effect) and 
  // onLivePreviewChange/polling (second effect) both need to coordinate
  const callbackWorkingRef = useRef(false)
  const callbackUpdateTimeRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Listen for ALL postMessage events from Contentstack Live Preview SDK
    // Contentstack editor sends various message types when fields are edited
    const handleMessage = (event) => {
      // Debug: log incoming postMessage events to verify the editor is communicating
      try {
        // Narrow logs to avoid noise
        if (event?.data && typeof event.data === 'object') {
          console.debug('[LP MSG] postMessage received:', event.data)
        }
      } catch (e) {}
      
      // Only process messages that might be from Contentstack
      // Skip same-origin messages that aren't relevant
      if (!event.data || typeof event.data !== 'object') return
      
      const data = event.data
      
      // Pattern 1: Contentstack Live Preview initialization messages
      if (data.type === 'contentstack-live-preview' || 
          data.entry_uid || 
          data.entryUid ||
          (data.content_type_uid && data.entry_uid)) {
        const uid = data.entry_uid || data.entryUid
        const ctUid = data.content_type_uid || data.contentTypeUid
        if (uid && uid !== entryUid) {
          console.debug('[LP MSG] init entry uid detected:', uid)
          setEntryUid(uid)
          // Trigger immediate refetch
          fetchHomepage(uid).then(entry => {
            if (entry) {
              const mapped = mapHomepage(entry)
              setCmsData(mapped)
              if (entry?.uid) {
                setEntryUid(entry.uid)
                // Ensure sessionStorage always has current entry UID for preview callbacks
                try {
                  sessionStorage.setItem('contentstack_entry_uid', entry.uid)
                  console.debug('[LP MSG] sessionStorage contentstack_entry_uid set:', entry.uid)
                } catch (e) {}
              }
            }
          }).catch((err) => {
            console.warn('[LP MSG] fetchHomepage error on init:', err)
          })
        }
      }
      
      // Pattern 2 & 3: Handle Live Edit and Entry changes with debouncing
      // These events can fire rapidly - debounce to prevent constant refreshes
      if (data.type === 'contentstack-live-edit-change' ||
          data.type === 'live-edit-change' ||
          data.eventType === 'field-change' ||
          data.type === 'entry-change' || 
          data.type === 'contentstack-entry-change' ||
          data.event === 'entry-updated') {
        
        // Use the same debounced update mechanism
        // The handleLiveEditChange function will handle this via custom event
        // Just trigger the custom event which is already debounced
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('contentstack-live-edit-change', {
            detail: data
          }))
        }
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Listen for custom events from Live Edit changes (field-level typing)
    // Share the same debounce mechanism as onEntryChange
    let liveEditTimer = null
    
    const handleLiveEditChange = (event) => {
      // Debug: live edit custom event triggered
      console.debug('[LP LIVEEDIT] custom event detail:', event?.detail || event)
      
      // Use shared refs instead of undeclared variables
      // These refs are also used by the polling logic in the other useEffect
      callbackWorkingRef.current = true
      callbackUpdateTimeRef.current = Date.now()
      
      // Clear any existing timer
      if (liveEditTimer) {
        clearTimeout(liveEditTimer)
      }
      
      // Wait 400ms for field-level updates - balances instant feel with preventing refreshes
      // onLiveEditChange fires immediately when you type - debounce to batch rapid changes
      liveEditTimer = setTimeout(async () => {
        const stored = sessionStorage.getItem('contentstack_entry_uid')
        console.debug('[LP LIVEEDIT] debounced update, stored uid:', stored)
        if (!stored) return
        
        try {
          // Fetch with forced entry UID to ensure we get the exact entry being edited
          // The SDK's live_preview config automatically uses Preview API in iframe
          // This gets the latest draft data immediately
          console.debug('[LP LIVEEDIT] Fetching entry for live edit update:', stored)
          const entry = await fetchHomepage(stored)
          if (!entry) {
            console.warn('[LP LIVEEDIT] No entry returned from fetchHomepage')
            return
          }
          console.debug('[LP LIVEEDIT] Entry fetched successfully:', {
            uid: entry?.uid,
            hasFields: !!entry?.fields,
            heroEyebrow: entry?.fields?.hero?.eyebrow || entry?.hero?.eyebrow,
            rawKeys: Object.keys(entry || {})
          })
          
          // Normalize structure immediately
          if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits)) {
            entry.fields = {}
            Object.keys(entry).forEach(key => {
              if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
                  typeof entry[key] === 'object' && entry[key] !== null) {
                entry.fields[key] = JSON.parse(JSON.stringify(entry[key]))
              }
            })
          }
          
          const mapped = mapHomepage(entry)
          const entryClone = JSON.parse(JSON.stringify(entry))
          
          // Only update if data actually changed - React handles re-rendering efficiently
          setCmsData(prev => {
            const newStr = JSON.stringify(mapped)
            const prevStr = JSON.stringify(prev)
            // Only update if data actually changed - prevents unnecessary re-renders
            return newStr !== prevStr ? mapped : prev
          })
          
          setEntry(prev => {
            const newStr = JSON.stringify(entryClone)
            const prevStr = JSON.stringify(prev)
            return newStr !== prevStr ? entryClone : prev
          })
          
          // Note: updateKey is only used if React's natural re-rendering doesn't work
          // We rely on React's state comparison - it will re-render when cmsData/entry changes
        } catch (e) {
          // Silent error handling
        }
      }, 400) // Wait 400ms to batch rapid changes and prevent constant refreshes
    }
    
    window.addEventListener('contentstack-live-edit-change', handleLiveEditChange)
    
    async function load() {
      try {
        const fetchedEntry = await fetchHomepage()
        const mapped = mapHomepage(fetchedEntry)
        setCmsData(mapped)
        
        // CRITICAL: Store raw entry with edit tags preserved
        // The entry object MUST have the $ structure with data-cslp attributes for Live Edit
        // Deep clone to ensure React detects changes but preserve edit tags
        const entryWithTags = fetchedEntry ? JSON.parse(JSON.stringify(fetchedEntry)) : null
        
        setEntry(entryWithTags)
        
        // CRITICAL: Store entry UID for Live Edit Tags - this is critical for Live Edit to work
        // Also store in sessionStorage as backup for Live Preview callbacks
        if (fetchedEntry?.uid) {
          setEntryUid(fetchedEntry.uid)
          // Store in sessionStorage as backup for Live Preview callbacks
          try {
            sessionStorage.setItem('contentstack_entry_uid', fetchedEntry.uid)
            console.debug('[LP LOAD] initial entry uid stored:', fetchedEntry.uid)
            // Store initial timestamps also for polling comparison
            if (fetchedEntry._version) {
              sessionStorage.setItem('contentstack_last_version', String(fetchedEntry._version))
            }
            if (fetchedEntry.updated_at) {
              sessionStorage.setItem('contentstack_last_updated', String(fetchedEntry.updated_at))
            }
          } catch (e) {}
        }
      } catch (e) {
        console.warn('[LP LOAD] fetchHomepage failed:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    
    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('contentstack-live-edit-change', handleLiveEditChange)
    }
  }, [])

  useEffect(() => {
    // Live Preview: initialize first
    initLivePreview()
    
    // CRITICAL: Set up polling as fallback if onEntryChange doesn't fire
    // Check if we're in Live Preview (iframe) and poll for updates
    let pollInterval = null
    const isInLivePreview = () => {
      try {
        return window.self !== window.top
      } catch {
        return true // Assume true if can't check (CORS)
      }
    }
    
    // Polling fallback - ONLY runs if callback isn't working
    // Check if callback is working by monitoring if updates come through
    // Use shared refs (callbackWorkingRef, callbackUpdateTimeRef) instead of local variables
    // so other effects (like handleLiveEditChange) can also set them
    
    const startPolling = () => {
      if (!isInLivePreview()) {
        return
      }
      
      let lastVersion = sessionStorage.getItem('contentstack_last_version')
      let lastUpdated = sessionStorage.getItem('contentstack_last_updated')
      let isInitialized = false
      let isUpdating = false
      
      pollInterval = setInterval(async () => {
        // Don't poll if callback updated recently (within last 5 seconds)
        // Polling is only a fallback - callbacks should handle most updates
        // Use shared refs so handleLiveEditChange can also update these flags
        const timeSinceCallback = Date.now() - callbackUpdateTimeRef.current
        if (callbackWorkingRef.current && timeSinceCallback < 5000) {
          return // Callback is working, skip polling
        }
        
        if (isUpdating) return
        
        try {
          const storedUid = sessionStorage.getItem('contentstack_entry_uid')
          if (!storedUid) return
          
          isUpdating = true
          const freshEntry = await fetchHomepage(storedUid)
          isUpdating = false
          
          if (!freshEntry) return
          
          if (!freshEntry.fields && (freshEntry.hero || freshEntry.navigation || freshEntry.cta || freshEntry.benefits)) {
            freshEntry.fields = {}
            Object.keys(freshEntry).forEach(key => {
              if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
                  typeof freshEntry[key] === 'object' && freshEntry[key] !== null) {
                freshEntry.fields[key] = JSON.parse(JSON.stringify(freshEntry[key]))
              }
            })
          }
          
          // Only update if data actually changed - use functional updates
          const mapped = mapHomepage(freshEntry)
          const entryClone = JSON.parse(JSON.stringify(freshEntry))
          
          // Use functional updates to compare and only update if changed
          setCmsData(prev => {
            const newStr = JSON.stringify(mapped)
            const prevStr = JSON.stringify(prev)
            // Only update if data actually changed - React handles re-rendering efficiently
            return newStr !== prevStr ? mapped : prev
          })
          
          setEntry(prev => {
            const newStr = JSON.stringify(entryClone)
            const prevStr = JSON.stringify(prev)
            return newStr !== prevStr ? entryClone : prev
          })
          
          // Note: updateKey is only used if React's natural re-rendering doesn't work
          // We rely on React's state comparison - it will re-render when cmsData/entry changes
          
          // Update tracking
          const currentVersion = String(freshEntry._version || '')
          const currentUpdated = String(freshEntry.updated_at || '')
          
          if (freshEntry?.uid) {
            setEntryUid(freshEntry.uid)
            sessionStorage.setItem('contentstack_entry_uid', freshEntry.uid)
          }
          
          lastVersion = currentVersion
          lastUpdated = currentUpdated
          sessionStorage.setItem('contentstack_last_version', currentVersion)
          sessionStorage.setItem('contentstack_last_updated', currentUpdated)
          isInitialized = true
        } catch (e) {
          isUpdating = false
        }
      }, 5000) // Poll every 5 seconds (minimal, only as last resort fallback)
    }
    
    // Subscribe to Live Preview changes IMMEDIATELY
    let unsubscribeFn = null
    // Start listening as soon as possible
    const timeoutId = setTimeout(() => {
      // Debounce to prevent rapid-fire updates that cause page refreshes
      let updateTimeout = null
      let lastUpdateTime = 0
      
      // Simple debounce: batch updates that happen within 500ms
      let updatePending = false
      let updateTimer = null
      
      unsubscribeFn = onLivePreviewChange(async (entryData) => {
        // Mark that we have a pending update
        updatePending = true
        // Use shared refs instead of local variables so handleLiveEditChange can also see these
        callbackWorkingRef.current = true
        callbackUpdateTimeRef.current = Date.now()
        
        // Clear any existing timer
        if (updateTimer) {
          clearTimeout(updateTimer)
        }
        
        // Wait 600ms to batch rapid changes and prevent page refreshes
        updateTimer = setTimeout(async () => {
          if (!updatePending) return // Already processed
          updatePending = false
          
          try {
            const stored = sessionStorage.getItem('contentstack_entry_uid')
            if (!stored) return
            
            // Fetch fresh entry data
            const entry = await fetchHomepage(stored)
            
            if (!entry) return
            
            // Normalize entry structure
            if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits)) {
              entry.fields = {}
              Object.keys(entry).forEach(key => {
                if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
                    typeof entry[key] === 'object' && entry[key] !== null) {
                  entry.fields[key] = JSON.parse(JSON.stringify(entry[key]))
                }
              })
            }
            
            // Update React state - React handles change detection
            // This causes a re-render, NOT a page refresh
            const entryClone = JSON.parse(JSON.stringify(entry))
            const mapped = mapHomepage(entry)
            
            // Only update if data actually changed - React handles re-rendering efficiently
            setCmsData(prev => {
              const newStr = JSON.stringify(mapped)
              const prevStr = JSON.stringify(prev)
              // Only update if data actually changed - prevents unnecessary re-renders
              return newStr !== prevStr ? mapped : prev
            })
            
            setEntry(prev => {
              const newStr = JSON.stringify(entryClone)
              const prevStr = JSON.stringify(prev)
              return newStr !== prevStr ? entryClone : prev
            })
            
            // Note: We rely on React's natural re-rendering when state changes
            // updateKey is only used as a last resort if React's reconciliation doesn't detect changes
            // By not incrementing updateKey, we prevent component remounts that look like page refreshes
            
            // Update tracking
            if (entry._version) {
              sessionStorage.setItem('contentstack_last_version', String(entry._version))
            }
            if (entry.updated_at) {
              sessionStorage.setItem('contentstack_last_updated', String(entry.updated_at))
            }
            if (entry?.uid) {
              setEntryUid(entry.uid)
              sessionStorage.setItem('contentstack_entry_uid', entry.uid)
            }
          } catch (e) {
            // Silent error handling
          }
        }, 200) // Wait 200ms for fast entry updates (when entry is saved)
      })
      
      // Start polling after subscription is set up (as fallback)
      if (isInLivePreview()) {
        // Delay polling start slightly to avoid immediate checks
        setTimeout(() => startPolling(), 500)
      }
    }, 300) // Wait only 300ms for Live Preview SDK to initialize (faster updates)
    
    return () => {
      clearTimeout(timeoutId)
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      if (typeof unsubscribeFn === 'function') {
        unsubscribeFn()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navigation scrollY={scrollY} data={cmsData?.navigation} entry={entry} />
      <Hero data={cmsData?.hero} loading={loading} entry={entry} />
      <Features data={cmsData?.features} entry={entry} />
      <Benefits data={cmsData?.benefits} entry={entry} />
      <Testimonials data={cmsData?.testimonials} entry={entry} />
      <CTA data={cmsData?.cta} entry={entry} />
      <Footer data={cmsData?.footer} entry={entry} />
    </div>
  )
}

export default App
