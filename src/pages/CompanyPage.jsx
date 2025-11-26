import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Users, Heart, Award, Globe, ArrowRight, Target, Lightbulb } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { fetchHomepage, mapHomepage } from '../cms/homepage'
import { fetchCompany, mapCompany } from '../cms/company'
import { initLivePreview, onLivePreviewChange } from '../cms/livePreview'
import { getEditTag } from '../utils/getEditTag'
import { getIconByName } from '../utils/iconMap'
import { Link, useLocation } from 'react-router-dom'

function CompanyPage() {
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
      
      if (entryUidFromUrl && contentTypeFromUrl === 'company') {
        console.debug('[CompanyPage] Initial mount - Setting entry UID from URL params:', entryUidFromUrl)
        sessionStorage.setItem('contentstack_entry_uid', entryUidFromUrl)
        sessionStorage.setItem('contentstack_content_type', 'company')
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
          const newContentType = event.data.content_type_uid || event.data.contentTypeUid || 'company'
          if (newUid && newUid !== entryUid) {
            console.debug('[CompanyPage] Updating entry UID from message:', newUid, 'contentType:', newContentType)
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
        
        if (entryUidFromUrl && contentTypeFromUrl === 'company') {
          const storedUid = sessionStorage.getItem('contentstack_entry_uid')
          if (!storedUid || storedUid !== entryUidFromUrl) {
            console.debug('[CompanyPage] Setting entry UID from URL params:', entryUidFromUrl)
            sessionStorage.setItem('contentstack_entry_uid', entryUidFromUrl)
            sessionStorage.setItem('contentstack_content_type', 'company')
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
          
          const freshEntry = await fetchCompany(stored)
          if (freshEntry) {
            const entryClone = JSON.parse(JSON.stringify(freshEntry))
            const mapped = mapCompany(freshEntry)
            
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
          console.warn('[CompanyPage] Error in live edit change:', e)
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
            const freshEntry = await fetchCompany(stored)
            if (freshEntry) {
              const mapped = mapCompany(freshEntry)
              if (mapped) {
                setCmsData(mapped)
                setEntry(freshEntry)
                setEntryUid(freshEntry.uid)
              }
            }
          } else {
            const companyEntry = await fetchCompany()
            if (companyEntry) {
              const mapped = mapCompany(companyEntry)
              if (mapped) {
                setCmsData(mapped)
                setEntry(companyEntry)
                setEntryUid(companyEntry.uid)
              }
            }
          }
        } catch (e) {
          console.warn('[CompanyPage] Error reloading:', e)
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
            const freshEntry = await fetchCompany(stored)
            if (freshEntry) {
              const mapped = mapCompany(freshEntry)
              if (mapped) {
                setCmsData(mapped)
                setEntry(freshEntry)
                setEntryUid(freshEntry.uid)
              }
            }
          } else {
            const companyEntry = await fetchCompany()
            if (companyEntry) {
              const mapped = mapCompany(companyEntry)
              if (mapped) {
                setCmsData(mapped)
                setEntry(companyEntry)
                setEntryUid(companyEntry.uid)
              }
            }
          }
        } catch (e) {
          console.warn('[CompanyPage] Error reloading on path change:', e)
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
          console.warn('[CompanyPage] Error loading homepage:', e)
        }

        // Fetch company page data
        try {
          const companyEntry = await fetchCompany()
          if (companyEntry) {
            const mapped = mapCompany(companyEntry)
            if (mapped) {
              setCmsData(mapped)
              setEntry(companyEntry)
              setEntryUid(companyEntry.uid)
              if (companyEntry.uid) {
                sessionStorage.setItem('contentstack_content_type', 'company')
                sessionStorage.setItem('contentstack_entry_uid', companyEntry.uid)
              }
            }
          }
        } catch (e) {
          console.warn('[CompanyPage] Error loading company:', e)
          // Continue - page will show default content
        }
      } catch (e) {
        console.warn('[CompanyPage] Error loading data:', e)
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
        
        // Check if this is a company page update
        if (data.content_type_uid === 'company' || data.contentTypeUid === 'company') {
          const stored = sessionStorage.getItem('contentstack_entry_uid')
          if (!stored || stored !== data.entry_uid) {
            sessionStorage.setItem('contentstack_content_type', 'company')
            sessionStorage.setItem('contentstack_entry_uid', data.entry_uid)
            setEntryUid(data.entry_uid)
          }
          
          try {
            const entry = await fetchCompany(data.entry_uid)
            if (!entry) return
            
            const entryClone = JSON.parse(JSON.stringify(entry))
            const mapped = mapCompany(entry)
            
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
                sessionStorage.setItem('contentstack_content_type', 'company')
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

  // Default values if CMS data is not available
  const defaultValues = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Our Mission',
      description: 'To empower businesses to deliver exceptional digital experiences through innovative content management solutions.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Innovation',
      description: 'We continuously push the boundaries of what\'s possible in content management and digital experience delivery.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Customer First',
      description: 'Your success is our success. We\'re committed to providing exceptional support and building lasting partnerships.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from product development to customer service.',
      color: 'from-green-500 to-green-600',
    },
  ]

  const defaultStats = [
    { number: '10K+', label: 'Customers' },
    { number: '50+', label: 'Countries' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' },
  ]

  const stats = cmsData?.stats?.length ? cmsData.stats : defaultStats
  const values = cmsData?.values?.length ? cmsData.values : defaultValues

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
                {cmsData?.hero?.heading || 'About Our Company'}
              </h1>
              <p 
                className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                {...getEditTag(entry, 'hero.subheading')}
              >
                {cmsData?.hero?.subheading || 'Building the future of content management, one innovation at a time'}
              </p>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
              {...getEditTag(entry, 'stats')}
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center bg-white/90 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                >
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Values Section */}
            <div className="mb-16">
              <h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12"
                {...getEditTag(entry, 'values_section.heading')}
              >
                {cmsData?.valuesSection?.heading || 'Our Values'}
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {values.map((value, index) => {
                  const IconComponent = typeof value.icon === 'string' ? getIconByName(value.icon) : null
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className="bg-white/90 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8"
                      {...getEditTag(entry, 'values')}
                    >
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.color || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white mb-6`}>
                        {IconComponent ? <IconComponent className="w-8 h-8" /> : (value.icon || <Target className="w-8 h-8" />)}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {value.description}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-center bg-white/90 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-12"
              {...getEditTag(entry, 'cta_section')}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {cmsData?.ctaSection?.heading || 'Join Our Team'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                {cmsData?.ctaSection?.description || 'We\'re always looking for talented individuals who share our passion for innovation and excellence.'}
              </p>
              <Link
                to={cmsData?.ctaSection?.buttonLink || '/get-started'}
                className="btn-primary inline-flex items-center"
              >
                {cmsData?.ctaSection?.buttonText || 'View Open Positions'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer data={homepageData?.footer || cmsData?.footer || {}} entry={homepageEntry || entry} />
    </div>
  )
}

export default CompanyPage

