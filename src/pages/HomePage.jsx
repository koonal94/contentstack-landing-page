import { useState, useEffect, useRef } from 'react'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
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
  const [scrollY, setScrollY] = useState(0)
  const [cmsData, setCmsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [entryUid, setEntryUid] = useState(null)
  const [entry, setEntry] = useState(null)
  const [updateKey, setUpdateKey] = useState(0)

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
          if (newUid && newUid !== entryUid) {
            console.debug('[LP] Received entry UID update:', newUid)
            setEntryUid(newUid)
            sessionStorage.setItem('contentstack_entry_uid', newUid)
            handleEntryChange()
          }
        }
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
          
          const freshEntry = await fetchHomepage(stored)
          if (!freshEntry) {
            const entryClone = JSON.parse(JSON.stringify(freshEntry))
            const mapped = mapHomepage(freshEntry)
            
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
          }
        } catch (e) {
          console.warn('[LP] Live edit update failed:', e)
        } finally {
          callbackWorkingRef.current = false
        }
      }, 400)
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
              sessionStorage.removeItem('contentstack_last_version')
              sessionStorage.removeItem('contentstack_last_updated')
            } catch {}
            return
          }
          
          if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits)) {
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
          // If error indicates entry doesn't exist (422), clear invalid UID
          if (e?.status === 422 || e?.error_code === 141 || 
              (e?.error_message && e.error_message.includes("doesn't exist"))) {
            try {
              sessionStorage.removeItem('contentstack_entry_uid')
              sessionStorage.removeItem('contentstack_last_version')
              sessionStorage.removeItem('contentstack_last_updated')
            } catch {}
          }
          // Silent error handling for other errors
        }
      }, 600)
    }
    
    async function load() {
      try {
        const fetchedEntry = await fetchHomepage()
        const mapped = mapHomepage(fetchedEntry)
        setCmsData(mapped)
        
        const entryWithTags = fetchedEntry ? JSON.parse(JSON.stringify(fetchedEntry)) : null
        setEntry(entryWithTags)
        
        if (fetchedEntry?.uid) {
          setEntryUid(fetchedEntry.uid)
          try {
            sessionStorage.setItem('contentstack_entry_uid', fetchedEntry.uid)
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
      if (updateTimer) clearTimeout(updateTimer)
    }
  }, [])

  useEffect(() => {
    // Live Preview: initialize first
    const timeoutId = setTimeout(() => {
      initLivePreview()
      
      // Set up onLivePreviewChange callback
      const unsubscribeFn = onLivePreviewChange(async (data) => {
        if (!data || !data.entry_uid) return
        
        const stored = sessionStorage.getItem('contentstack_entry_uid')
        if (!stored || stored !== data.entry_uid) {
          sessionStorage.setItem('contentstack_entry_uid', data.entry_uid)
          setEntryUid(data.entry_uid)
        }
        
        try {
          const entry = await fetchHomepage(data.entry_uid)
          if (!entry) return
          
          if (!entry.fields && (entry.hero || entry.navigation || entry.cta || entry.benefits)) {
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
          
          if (entry?.uid) {
            setEntryUid(entry.uid)
            sessionStorage.setItem('contentstack_entry_uid', entry.uid)
          }
        } catch (e) {
          // Silent error handling
        }
      })
      
      // Polling fallback
      let pollInterval = null
      function startPolling() {
        if (pollInterval) return
        
        pollInterval = setInterval(async () => {
          const stored = sessionStorage.getItem('contentstack_entry_uid')
          if (!stored) {
            // If no stored UID, clear interval to stop polling
            if (pollInterval) {
              clearInterval(pollInterval)
              pollInterval = null
            }
            return
          }
          
          try {
            const entry = await fetchHomepage(stored)
            if (!entry) {
              // If entry is null and we had a stored UID, it might be invalid
              // Clear it to prevent repeated failed attempts and stop polling
              try {
                sessionStorage.removeItem('contentstack_entry_uid')
                sessionStorage.removeItem('contentstack_last_version')
                sessionStorage.removeItem('contentstack_last_updated')
                localStorage.removeItem('contentstack_entry_uid')
                localStorage.removeItem('contentstack_last_version')
                localStorage.removeItem('contentstack_last_updated')
              } catch {}
              // Stop polling if entry is invalid
              if (pollInterval) {
                clearInterval(pollInterval)
                pollInterval = null
              }
              return
            }
            
            const lastVersion = sessionStorage.getItem('contentstack_last_version')
            const lastUpdated = sessionStorage.getItem('contentstack_last_updated')
            
            if (lastVersion && entry._version && String(entry._version) === lastVersion) {
              return // No changes
            }
            if (lastUpdated && entry.updated_at && String(entry.updated_at) === lastUpdated) {
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
            
            if (entry._version) {
              sessionStorage.setItem('contentstack_last_version', String(entry._version))
            }
            if (entry.updated_at) {
              sessionStorage.setItem('contentstack_last_updated', String(entry.updated_at))
            }
          } catch (e) {
            // If error indicates entry doesn't exist (422), clear invalid UID and stop polling
            const is422Error = e?.status === 422 || 
                              e?.error_code === 141 || 
                              (e?.error_message && e.error_message.includes("doesn't exist")) ||
                              (typeof e === 'object' && e !== null && 'status' in e && e.status === 422)
            
            if (is422Error) {
              try {
                sessionStorage.removeItem('contentstack_entry_uid')
                sessionStorage.removeItem('contentstack_last_version')
                sessionStorage.removeItem('contentstack_last_updated')
                localStorage.removeItem('contentstack_entry_uid')
                localStorage.removeItem('contentstack_last_version')
                localStorage.removeItem('contentstack_last_updated')
              } catch {}
              // Stop polling if entry doesn't exist
              if (pollInterval) {
                clearInterval(pollInterval)
                pollInterval = null
              }
            }
            // Silent error handling for other errors
          }
        }, 5000)
      }
      
      if (typeof window !== 'undefined') {
        try {
          const inIframe = window.self !== window.top
          if (inIframe) {
            setTimeout(() => startPolling(), 500)
          }
        } catch {}
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

  return (
    <div className="min-h-screen bg-white">
      <Navigation scrollY={scrollY} data={cmsData?.navigation} entry={entry} />
      <Hero data={cmsData?.hero} loading={loading} entry={entry} />
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

