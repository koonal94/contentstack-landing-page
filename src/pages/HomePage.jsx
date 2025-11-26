import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import CustomerLogos from '../components/CustomerLogos'
import Features from '../components/Features'
import Benefits from '../components/Benefits'
import Testimonials from '../components/Testimonials'
import Pricing from '../components/Pricing'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import { fetchHomepage, mapHomepage } from '../cms/homepage'
import { initLivePreview, onLivePreviewChange } from '../cms/livePreview'

// Helper to get edit tags from entry data
function getEditTags(entry, fieldPath) {
  if (!entry?.$ || !fieldPath) return {}
  const parts = fieldPath.split('.')
  let tag = entry.$
  for (const part of parts) {
    tag = tag?.[part]
    if (!tag) break
  }
  return tag || {}
}

function HomePage() {
  const location = useLocation()
  const [scrollY, setScrollY] = useState(0)
  const [cmsData, setCmsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [entryUid, setEntryUid] = useState(null)
  const [entry, setEntry] = useState(null)
  const [updateKey, setUpdateKey] = useState(0)

  const callbackWorkingRef = useRef(false)
  const callbackUpdateTimeRef = useRef(0)

  // CRITICAL: Check URL params immediately on mount (before VEB requests entries)
  // This ensures sessionStorage is set before handleGetEntriesOnPage is called
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const entryUidFromUrl = urlParams.get('entry_uid') || urlParams.get('entryUid')
      const contentTypeFromUrl = urlParams.get('content_type_uid') || urlParams.get('contentTypeUid')
      
      if (entryUidFromUrl && (contentTypeFromUrl === 'homepage' || !contentTypeFromUrl)) {
        console.debug('[HomePage] Initial mount - Setting entry UID from URL params:', entryUidFromUrl)
        sessionStorage.setItem('contentstack_entry_uid', entryUidFromUrl)
        sessionStorage.setItem('contentstack_content_type', 'homepage')
        setEntryUid(entryUidFromUrl)
      }
    } catch (e) {
      // Silent fail
    }
  }, []) // Run only once on mount

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Listen for ALL postMessage events from Contentstack Live Preview SDK
    window.addEventListener('message', handleMessage)
    
    // Also listen for custom Live Edit events (if SDK emits them)
    window.addEventListener('contentstack-live-edit-change', handleLiveEditChange)
    
    function handleMessage(event) {
      // Contentstack Live Preview SDK sends messages when fields are edited
      // Accept messages from contentstack.com or localhost (for development)
      const allowedOrigins = [
        'https://app.contentstack.com',
        'https://app.contentstack.io',
        'http://localhost:3000',
        'http://localhost:5174',
      ]
      
      if (!allowedOrigins.some(origin => event.origin.includes(origin.replace('https://', '').replace('http://', '')))) {
        return
      }
      
      // Handle various message types
      if (event.data && typeof event.data === 'object') {
        // Live Edit change notification
        if (event.data.type === 'live-edit-change' || event.data.action === 'live-edit-change') {
          console.debug('[LP] Received live-edit-change message:', event.data)
          handleLiveEditChange(event)
        }
        // Entry change notification
        else if (event.data.type === 'entry-change' || event.data.action === 'entry-change') {
          console.debug('[LP] Received entry-change message:', event.data)
          handleEntryChange()
        }
        // Entry UID update
        else if (event.data.entry_uid || event.data.entryUid) {
          const newUid = event.data.entry_uid || event.data.entryUid
          const newContentType = event.data.content_type_uid || event.data.contentTypeUid || 'homepage'
          if (newUid && newUid !== entryUid) {
            console.debug('[LP] Received entry UID update:', newUid, 'contentType:', newContentType)
            setEntryUid(newUid)
            sessionStorage.setItem('contentstack_entry_uid', newUid)
            sessionStorage.setItem('contentstack_content_type', newContentType)
            handleEntryChange()
          }
        }
      }
      
      // Also check URL params on page load (Contentstack might add them to the iframe URL)
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const entryUidFromUrl = urlParams.get('entry_uid') || urlParams.get('entryUid')
        const contentTypeFromUrl = urlParams.get('content_type_uid') || urlParams.get('contentTypeUid')
        
        if (entryUidFromUrl && (contentTypeFromUrl === 'homepage' || !contentTypeFromUrl)) {
          const storedUid = sessionStorage.getItem('contentstack_entry_uid')
          if (!storedUid || storedUid !== entryUidFromUrl) {
            console.debug('[HomePage] Setting entry UID from URL params:', entryUidFromUrl)
            sessionStorage.setItem('contentstack_entry_uid', entryUidFromUrl)
            sessionStorage.setItem('contentstack_content_type', 'homepage')
            setEntryUid(entryUidFromUrl)
          }
        }
      } catch (e) {
        // Silent fail
      }
    }
    
    function handleLiveEditChange(event) {
      // Debounce rapid changes to prevent page refreshes
      const now = Date.now()
      const lastUpdate = callbackUpdateTimeRef.current
      
      // If callback is working and update was recent (< 400ms), skip
      if (callbackWorkingRef.current && (now - lastUpdate) < 400) {
        return
      }
      
      callbackWorkingRef.current = true
      callbackUpdateTimeRef.current = now
      
      setTimeout(async () => {
        try {
          const stored = sessionStorage.getItem('contentstack_entry_uid')
          if (!stored) {
            callbackWorkingRef.current = false
            return
          }
          
          // Fetch the entry with the stored UID to get latest changes
          // Use shorter timeout for RTE fields to update faster
          const freshEntry = await fetchHomepage(stored, false)
          if (freshEntry) {
            // Normalize entry structure
            if (!freshEntry.fields && (freshEntry.hero || freshEntry.navigation || freshEntry.cta || freshEntry.benefits || freshEntry.pricing)) {
              freshEntry.fields = {}
              Object.keys(freshEntry).forEach(key => {
                if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
                    typeof freshEntry[key] === 'object' && freshEntry[key] !== null) {
                  freshEntry.fields[key] = JSON.parse(JSON.stringify(freshEntry[key]))
                }
              })
            }
            
            const entryClone = JSON.parse(JSON.stringify(freshEntry))
            const mapped = mapHomepage(freshEntry)
            
            // Force update for RTE fields - check if heading changed
            setCmsData(prev => {
              // For RTE fields, always update if heading exists (even if stringified same, HTML might have changed)
              if (mapped?.hero?.heading && prev?.hero?.heading !== mapped.hero.heading) {
                return mapped
              }
              const newStr = JSON.stringify(mapped)
              const prevStr = JSON.stringify(prev)
              return newStr !== prevStr ? mapped : prev
            })
            
            setEntry(prev => {
              const newStr = JSON.stringify(entryClone)
              const prevStr = JSON.stringify(prev)
              return newStr !== prevStr ? entryClone : prev
            })
            
            // Update stored UID if changed
            if (freshEntry?.uid) {
              setEntryUid(freshEntry.uid)
              sessionStorage.setItem('contentstack_entry_uid', freshEntry.uid)
            }
          }
        } catch (e) {
          console.warn('[LP] Live edit update failed:', e)
        } finally {
          callbackWorkingRef.current = false
        }
      }, 200) // Reduced from 400ms to 200ms for faster RTE updates
    }
    
    let updateTimer = null
    let updatePending = false
    
    function handleEntryChange() {
      if (updateTimer) clearTimeout(updateTimer)
      updatePending = true
      
      updateTimer = setTimeout(async () => {
        if (!updatePending) return
        updatePending = false
        
          try {
            const stored = sessionStorage.getItem('contentstack_entry_uid')
          if (!stored) return
          
          const entry = await fetchHomepage(stored)
          if (!entry) {
            // If entry is null and we had a stored UID, it might be invalid
            // Clear it to prevent repeated failed attempts
            try {
              sessionStorage.removeItem('contentstack_entry_uid')
              sessionStorage.removeItem('contentstack_homepage_last_version')
              sessionStorage.removeItem('contentstack_homepage_last_updated')
            } catch {}
            return
          }
          
          if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits || entry.pricing)) {
            entry.fields = {}
            Object.keys(entry).forEach(key => {
              if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
                  typeof entry[key] === 'object' && entry[key] !== null) {
                entry.fields[key] = JSON.parse(JSON.stringify(entry[key]))
              }
            })
          }
          
          const entryClone = JSON.parse(JSON.stringify(entry))
          const mapped = mapHomepage(entry)
          
          setCmsData(prev => {
            const newStr = JSON.stringify(mapped)
            const prevStr = JSON.stringify(prev)
            return newStr !== prevStr ? mapped : prev
          })
          
          setEntry(prev => {
            const newStr = JSON.stringify(entryClone)
            const prevStr = JSON.stringify(prev)
            return newStr !== prevStr ? entryClone : prev
          })
          
          if (entry._version) {
            sessionStorage.setItem('contentstack_homepage_last_version', String(entry._version))
          }
          if (entry.updated_at) {
            sessionStorage.setItem('contentstack_homepage_last_updated', String(entry.updated_at))
          }
          if (entry?.uid) {
            setEntryUid(entry.uid)
            sessionStorage.setItem('contentstack_entry_uid', entry.uid)
          }
        } catch (e) {
          // If error indicates entry doesn't exist (422), clear invalid UID
          if (e?.status === 422 || e?.error_code === 141 || 
              (e?.error_message && e.error_message.includes("doesn't exist"))) {
            try {
              sessionStorage.removeItem('contentstack_entry_uid')
              sessionStorage.removeItem('contentstack_homepage_last_version')
              sessionStorage.removeItem('contentstack_homepage_last_updated')
            } catch {}
          }
          // Silent error handling for other errors
        }
      }, 600)
    }
    
    async function load() {
      try {
        // Check if we're in Live Preview (iframe)
        let inIframe = false
        try {
          inIframe = window.self !== window.top
        } catch {}
        
        // CRITICAL: When NOT in Live Preview (production/Launch), clear stored UIDs
        // to ensure we always fetch published entries, not draft/unpublished entries
        if (!inIframe) {
          try {
            sessionStorage.removeItem('contentstack_entry_uid')
            sessionStorage.removeItem('contentstack_content_type')
            sessionStorage.removeItem('contentstack_homepage_last_version')
            sessionStorage.removeItem('contentstack_homepage_last_updated')
            localStorage.removeItem('contentstack_entry_uid')
            localStorage.removeItem('contentstack_content_type')
          } catch (e) {}
        } else {
          // In Live Preview, only clear if content type doesn't match
          try {
            const storedContentType = sessionStorage.getItem('contentstack_content_type')
            if (storedContentType !== 'homepage') {
              sessionStorage.removeItem('contentstack_entry_uid')
              sessionStorage.removeItem('contentstack_content_type')
            }
          } catch (e) {}
        }
        
        const fetchedEntry = await fetchHomepage()
        const mapped = mapHomepage(fetchedEntry)
        setCmsData(mapped)
        
        const entryWithTags = fetchedEntry ? JSON.parse(JSON.stringify(fetchedEntry)) : null
        setEntry(entryWithTags)
        
        // CRITICAL: Only store entry UID in Live Preview (iframe)
        // In production/Launch, don't store UIDs to ensure we always query for published entries
        if (fetchedEntry?.uid) {
          setEntryUid(fetchedEntry.uid)
          if (inIframe) {
            // Only store in Live Preview
            try {
              sessionStorage.setItem('contentstack_entry_uid', fetchedEntry.uid)
              sessionStorage.setItem('contentstack_content_type', 'homepage')
            } catch (e) {}
          }
        }
        if (fetchedEntry?._version && inIframe) {
          try {
            sessionStorage.setItem('contentstack_homepage_last_version', String(fetchedEntry._version))
          } catch (e) {}
        }
        if (fetchedEntry?.updated_at && inIframe) {
          try {
            sessionStorage.setItem('contentstack_homepage_last_updated', String(fetchedEntry.updated_at))
          } catch (e) {}
        }
      } catch (e) {
        console.warn('[LP LOAD] fetchHomepage failed:', e)
        // If 422 error, clear invalid UID
        if (e?.status === 422 || e?.error_code === 141 || 
            (e?.error_message && e.error_message.includes("doesn't exist"))) {
          try {
            sessionStorage.removeItem('contentstack_entry_uid')
            sessionStorage.removeItem('contentstack_content_type')
            sessionStorage.removeItem('contentstack_homepage_last_version')
            sessionStorage.removeItem('contentstack_homepage_last_updated')
          } catch {}
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    
    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('contentstack-live-edit-change', handleLiveEditChange)
      if (updateTimer) clearTimeout(updateTimer)
    }
  }, [])

  useEffect(() => {
    // Live Preview: initialize first
    const timeoutId = setTimeout(() => {
      initLivePreview()
      
      // Set up onLivePreviewChange callback
      const unsubscribeFn = onLivePreviewChange(async (data) => {
        if (!data) return
        
        // Get entry UID from data or sessionStorage
        const entryUid = data.entry_uid || data.entryUid || sessionStorage.getItem('contentstack_entry_uid')
        if (!entryUid) {
          console.debug('[LP] onLivePreviewChange: No entry UID found')
          return
        }
        
        console.debug('[LP] onLivePreviewChange: Updating entry', entryUid, data)
        
        // Update stored UID if different
        const stored = sessionStorage.getItem('contentstack_entry_uid')
        if (!stored || stored !== entryUid) {
          sessionStorage.setItem('contentstack_entry_uid', entryUid)
          setEntryUid(entryUid)
        }
        
        try {
          // Fetch entry with the UID to get latest changes (including unpublished edits)
          // Pass false for ignoreStoredUid to use the entryUid parameter
          const entry = await fetchHomepage(entryUid, false)
          if (!entry) {
            console.warn('[LP] onLivePreviewChange: Entry not found for UID', entryUid)
            return
          }
          
          // Normalize entry structure
          if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits || entry.pricing)) {
            entry.fields = {}
            Object.keys(entry).forEach(key => {
              if (!key.startsWith('_') && key !== 'uid' && key !== '$' && key !== 'fields' && 
                  typeof entry[key] === 'object' && entry[key] !== null) {
                entry.fields[key] = JSON.parse(JSON.stringify(entry[key]))
              }
            })
          }
          
          const entryClone = JSON.parse(JSON.stringify(entry))
          const mapped = mapHomepage(entry)
          
          // Update state only if data actually changed
          setCmsData(prev => {
            const newStr = JSON.stringify(mapped)
            const prevStr = JSON.stringify(prev)
            return newStr !== prevStr ? mapped : prev
          })
          
          setEntry(prev => {
            const newStr = JSON.stringify(entryClone)
            const prevStr = JSON.stringify(prev)
            return newStr !== prevStr ? entryClone : prev
          })
          
          // Update stored UID and version info
          if (entry?.uid) {
            setEntryUid(entry.uid)
            sessionStorage.setItem('contentstack_entry_uid', entry.uid)
            sessionStorage.setItem('contentstack_content_type', 'homepage')
          }
          if (entry?._version) {
            sessionStorage.setItem('contentstack_homepage_last_version', String(entry._version))
          }
          if (entry?.updated_at) {
            sessionStorage.setItem('contentstack_homepage_last_updated', String(entry.updated_at))
          }
        } catch (e) {
          console.warn('[LP] onLivePreviewChange update failed:', e)
        }
      })
      
      // Polling fallback
      let pollInterval = null
      function startPolling() {
        if (pollInterval) return
        
        pollInterval = setInterval(async () => {
          try {
            // Temporarily clear stored UID to ensure we fetch published entry
            const savedUid = sessionStorage.getItem('contentstack_entry_uid')
            const savedContentType = sessionStorage.getItem('contentstack_content_type')
            try {
              sessionStorage.removeItem('contentstack_entry_uid')
              sessionStorage.removeItem('contentstack_content_type')
            } catch {}
            
            // Fetch latest published entry (no UID to get published)
            const entry = await fetchHomepage()
            
            // Restore saved UID if needed
            if (savedUid && savedContentType === 'homepage') {
              try {
                sessionStorage.setItem('contentstack_entry_uid', savedUid)
                sessionStorage.setItem('contentstack_content_type', savedContentType)
              } catch {}
            }
            
            if (!entry) return
            
            const lastVersion = sessionStorage.getItem('contentstack_homepage_last_version')
            const lastUpdated = sessionStorage.getItem('contentstack_homepage_last_updated')
            
            const versionChanged = lastVersion && entry._version && String(entry._version) !== lastVersion
            const updatedChanged = lastUpdated && entry.updated_at && String(entry.updated_at) !== lastUpdated
            
            if (!versionChanged && !updatedChanged && lastVersion && lastUpdated) {
              return // No changes
            }
            
            const entryClone = JSON.parse(JSON.stringify(entry))
            const mapped = mapHomepage(entry)
            
            setCmsData(prev => {
              const newStr = JSON.stringify(mapped)
              const prevStr = JSON.stringify(prev)
              return newStr !== prevStr ? mapped : prev
            })
            
            setEntry(prev => {
              const newStr = JSON.stringify(entryClone)
              const prevStr = JSON.stringify(prev)
              return newStr !== prevStr ? entryClone : prev
            })
            
            // CRITICAL: Only store entry UID in Live Preview (iframe)
            // In production/Launch, don't store UIDs to ensure we always query for published entries
            let inIframe = false
            try {
              inIframe = window.self !== window.top
            } catch {}
            
            if (entry.uid && inIframe) {
              sessionStorage.setItem('contentstack_entry_uid', entry.uid)
              sessionStorage.setItem('contentstack_content_type', 'homepage')
            }
            if (entry._version && inIframe) {
              sessionStorage.setItem('contentstack_homepage_last_version', String(entry._version))
            }
            if (entry.updated_at && inIframe) {
              sessionStorage.setItem('contentstack_homepage_last_updated', String(entry.updated_at))
            }
          } catch (e) {
            // Silent error handling
          }
        }, 5000)
      }
      
      // Check if we're in live preview (iframe)
      let inIframe = false
      try {
        inIframe = window.self !== window.top
      } catch {}
      
      // Polling should run when NOT in live preview (regular browser) to detect published updates
      if (!inIframe) {
        setTimeout(() => startPolling(), 500)
      }
      
      return () => {
        if (typeof unsubscribeFn === 'function') {
          unsubscribeFn()
        }
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      }
    }, 300)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  // Handle hash navigation on page load
  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1) // Remove the #
      const scrollToElement = (hashId, retries = 5) => {
        const element = document.getElementById(hashId)
        if (element) {
          // Account for fixed navbar height
          const yOffset = -100
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
          return true
        }
        
        // If element not found and retries remaining, try again
        if (retries > 0) {
          setTimeout(() => scrollToElement(hashId, retries - 1), 100 * (6 - retries))
        }
        return false
      }
      
      // Wait for page to load, then scroll
      setTimeout(() => {
        scrollToElement(hash)
      }, 300)
    }
  }, [location.hash])

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation scrollY={scrollY} data={cmsData?.navigation} entry={entry} homepageUrl={cmsData?.homepageUrl} />
      <Hero data={cmsData?.hero} loading={loading} entry={entry} />
      <CustomerLogos data={cmsData?.customerLogos} entry={entry} />
      <Features data={cmsData?.features} entry={entry} />
      <Benefits data={cmsData?.benefits} entry={entry} />
      <Testimonials data={cmsData?.testimonials} entry={entry} />
      <Pricing data={cmsData?.pricing} entry={entry} />
      <CTA data={cmsData?.cta} entry={entry} />
      <Footer data={cmsData?.footer} entry={entry} />
    </div>
  )
}

export default HomePage

