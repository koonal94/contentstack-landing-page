import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Book, FileText, Video, Download, ArrowRight, Users, Zap } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { fetchHomepage, mapHomepage } from '../cms/homepage'
import { fetchResources, mapResources } from '../cms/resources'
import { initLivePreview, onLivePreviewChange } from '../cms/livePreview'
import { getEditTag } from '../utils/getEditTag'
import { getIconByName } from '../utils/iconMap'
import { Link, useLocation } from 'react-router-dom'

function ResourcesPage() {
  const location = useLocation()
  const [scrollY, setScrollY] = useState(0)
  const [homepageData, setHomepageData] = useState(null)
  const [homepageEntry, setHomepageEntry] = useState(null)
  const [cmsData, setCmsData] = useState(null)
  const [entry, setEntry] = useState(null)
  const [entryUid, setEntryUid] = useState(null)

  const callbackWorkingRef = useRef(false)
  const callbackUpdateTimeRef = useRef(0)
  const lastLocationRef = useRef(location.pathname)

  // CRITICAL: Check URL params immediately on mount (before VEB requests entries)
  // This ensures sessionStorage is set before handleGetEntriesOnPage is called
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const entryUidFromUrl = urlParams.get('entry_uid') || urlParams.get('entryUid')
      const contentTypeFromUrl = urlParams.get('content_type_uid') || urlParams.get('contentTypeUid')
      
      if (entryUidFromUrl && contentTypeFromUrl === 'resources') {
        console.debug('[ResourcesPage] Initial mount - Setting entry UID from URL params:', entryUidFromUrl)
        sessionStorage.setItem('contentstack_entry_uid', entryUidFromUrl)
        sessionStorage.setItem('contentstack_content_type', 'resources')
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
    window.addEventListener('message', handleMessage)
    window.addEventListener('contentstack-live-edit-change', handleLiveEditChange)
    
    function handleMessage(event) {
      const allowedOrigins = [
        'https://app.contentstack.com',
        'https://app.contentstack.io',
        'http://localhost:3000',
        'http://localhost:5174',
      ]
      
      if (!allowedOrigins.some(origin => event.origin.includes(origin.replace('https://', '').replace('http://', '')))) {
        return
      }
      
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'live-edit-change' || event.data.action === 'live-edit-change') {
          handleLiveEditChange(event)
        } else if (event.data.type === 'entry-change' || event.data.action === 'entry-change') {
          handleEntryChange()
        } else if (event.data.entry_uid || event.data.entryUid) {
          const newUid = event.data.entry_uid || event.data.entryUid
          const newContentType = event.data.content_type_uid || event.data.contentTypeUid || 'resources'
          if (newUid && newUid !== entryUid) {
            console.debug('[ResourcesPage] Updating entry UID from message:', newUid, 'contentType:', newContentType)
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
        
        if (entryUidFromUrl && contentTypeFromUrl === 'resources') {
          const storedUid = sessionStorage.getItem('contentstack_entry_uid')
          if (!storedUid || storedUid !== entryUidFromUrl) {
            console.debug('[ResourcesPage] Setting entry UID from URL params:', entryUidFromUrl)
            sessionStorage.setItem('contentstack_entry_uid', entryUidFromUrl)
            sessionStorage.setItem('contentstack_content_type', 'resources')
            setEntryUid(entryUidFromUrl)
          }
        }
      } catch (e) {
        // Silent fail
      }
    }
    
    function handleLiveEditChange(event) {
      const now = Date.now()
      const lastUpdate = callbackUpdateTimeRef.current
      
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
          
          const freshEntry = await fetchResources(stored)
          if (freshEntry) {
            const entryClone = JSON.parse(JSON.stringify(freshEntry))
            const mapped = mapResources(freshEntry)
            
            if (mapped) {
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
          }
        } catch (e) {
          console.warn('[ResourcesPage] Error in live edit change:', e)
        } finally {
          callbackWorkingRef.current = false
        }
      }, 100)
    }
    
    function handleEntryChange() {
      async function reload() {
        try {
          const stored = sessionStorage.getItem('contentstack_entry_uid')
          if (stored) {
            const freshEntry = await fetchResources(stored)
            if (freshEntry) {
              const mapped = mapResources(freshEntry)
              if (mapped) {
                setCmsData(mapped)
                setEntry(freshEntry)
                setEntryUid(freshEntry.uid)
              }
            }
          } else {
            const resourcesEntry = await fetchResources()
            if (resourcesEntry) {
              const mapped = mapResources(resourcesEntry)
              if (mapped) {
                setCmsData(mapped)
                setEntry(resourcesEntry)
                setEntryUid(resourcesEntry.uid)
              }
            }
          }
        } catch (e) {
          console.warn('[ResourcesPage] Error reloading:', e)
        }
      }
      reload()
    }
    
    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('contentstack-live-edit-change', handleLiveEditChange)
    }
  }, [entryUid])

  useEffect(() => {
    const currentPath = location.pathname
    if (lastLocationRef.current !== currentPath) {
      async function reload() {
        try {
          const stored = sessionStorage.getItem('contentstack_entry_uid')
          if (stored) {
            const freshEntry = await fetchResources(stored)
            if (freshEntry) {
              const mapped = mapResources(freshEntry)
              if (mapped) {
                setCmsData(mapped)
                setEntry(freshEntry)
                setEntryUid(freshEntry.uid)
              }
            }
          } else {
            const resourcesEntry = await fetchResources()
            if (resourcesEntry) {
              const mapped = mapResources(resourcesEntry)
              if (mapped) {
                setCmsData(mapped)
                setEntry(resourcesEntry)
                setEntryUid(resourcesEntry.uid)
              }
            }
          }
        } catch (e) {
          console.warn('[ResourcesPage] Error reloading on path change:', e)
        }
      }
      reload()
    }
    lastLocationRef.current = currentPath
  }, [location.pathname])

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch homepage data for navigation
        try {
          const homepageEntry = await fetchHomepage(null, true)
          if (homepageEntry) {
            const homepageMapped = mapHomepage(homepageEntry)
            setHomepageData(homepageMapped)
            setHomepageEntry(homepageEntry)
          }
        } catch (e) {
          console.warn('[ResourcesPage] Error loading homepage:', e)
        }

        // Fetch resources page data
        try {
          const resourcesEntry = await fetchResources()
          if (resourcesEntry) {
            const mapped = mapResources(resourcesEntry)
            if (mapped) {
              setCmsData(mapped)
              setEntry(resourcesEntry)
              setEntryUid(resourcesEntry.uid)
              if (resourcesEntry.uid) {
                sessionStorage.setItem('contentstack_content_type', 'resources')
                sessionStorage.setItem('contentstack_entry_uid', resourcesEntry.uid)
              }
            }
          }
        } catch (e) {
          console.warn('[ResourcesPage] Error loading resources:', e)
          // Continue - page will show default content
        }
      } catch (e) {
        console.warn('[ResourcesPage] Error loading data:', e)
        // Continue - page will show default content
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      initLivePreview()
      
      const unsubscribeFn = onLivePreviewChange(async (data) => {
        if (!data || !data.entry_uid) return
        
        // Check if this is a homepage update (for navigation)
        if (data.content_type_uid === 'homepage' || data.contentTypeUid === 'homepage') {
          try {
            const homepageEntry = await fetchHomepage(data.entry_uid, false)
            if (homepageEntry) {
              const homepageMapped = mapHomepage(homepageEntry)
              setHomepageData(homepageMapped)
              setHomepageEntry(homepageEntry)
            }
          } catch (e) {
            // Silent error handling
          }
          return
        }
        
        // Check if this is a resources page update
        if (data.content_type_uid === 'resources' || data.contentTypeUid === 'resources') {
          const stored = sessionStorage.getItem('contentstack_entry_uid')
          if (!stored || stored !== data.entry_uid) {
            sessionStorage.setItem('contentstack_content_type', 'resources')
            sessionStorage.setItem('contentstack_entry_uid', data.entry_uid)
            setEntryUid(data.entry_uid)
          }
          
          try {
            const entry = await fetchResources(data.entry_uid)
            if (!entry) return
            
            const entryClone = JSON.parse(JSON.stringify(entry))
            const mapped = mapResources(entry)
            
            if (mapped) {
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
                sessionStorage.setItem('contentstack_content_type', 'resources')
                sessionStorage.setItem('contentstack_entry_uid', entry.uid)
              }
            }
          } catch (e) {
            // Silent error handling
          }
        }
      })
      
      return () => {
        if (typeof unsubscribeFn === 'function') {
          unsubscribeFn()
        }
      }
    }, 300)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  // Default resources if CMS data is not available
  const defaultResources = [
    {
      icon: <Book className="w-8 h-8" />,
      title: 'Documentation',
      description: 'Comprehensive guides and API references to help you build with ContentStack.',
      link: '#',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Blog',
      description: 'Latest articles, tutorials, and insights from our team and community.',
      link: '#',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides to help you master ContentStack features.',
      link: '#',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: 'Downloads',
      description: 'SDKs, tools, and resources to accelerate your development.',
      link: '#',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community',
      description: 'Join our community forum to connect with other developers.',
      link: '#',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Webinars',
      description: 'Live sessions and recorded webinars on best practices and new features.',
      link: '#',
      color: 'from-yellow-500 to-yellow-600',
    },
  ]

  const resources = cmsData?.resources?.length ? cmsData.resources : defaultResources

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 overflow-hidden">
        {/* Background animations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/40 via-purple-400/30 to-transparent rounded-full filter blur-[140px]"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-purple-500/35 via-primary-500/25 to-transparent rounded-full filter blur-[130px]"
              animate={{
                x: [0, -80, 0],
                y: [0, 60, 0],
                scale: [1.3, 1, 1.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </div>
        </div>
        
        <Navigation scrollY={scrollY} data={homepageData?.navigation || {}} entry={homepageEntry} homepageUrl={homepageData?.homepageUrl || '/'} />
        
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative z-10">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                {...getEditTag(entry, 'hero.heading')}
              >
                {cmsData?.hero?.heading || 'Resources'}
              </h1>
              <p 
                className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                {...getEditTag(entry, 'hero.subheading')}
              >
                {cmsData?.hero?.subheading || 'Everything you need to build amazing digital experiences with ContentStack'}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource, index) => {
                const IconComponent = typeof resource.icon === 'string' ? getIconByName(resource.icon) : null
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white/90 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    {...getEditTag(entry, 'resources')}
                  >
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${resource.color || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white mb-6`}>
                      {IconComponent ? <IconComponent className="w-8 h-8" /> : (resource.icon || <Book className="w-8 h-8" />)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {resource.description}
                    </p>
                    <a
                      href={resource.link || '#'}
                      className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
                    >
                      Learn more
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </a>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      <Footer data={homepageData?.footer || cmsData?.footer || {}} entry={homepageEntry || entry} />
    </div>
  )
}

export default ResourcesPage

