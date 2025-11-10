import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail, User, Building, Check, ArrowRight, Sparkles } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { fetchGetStarted, mapGetStarted } from '../cms/getStarted'
import { fetchHomepage, mapHomepage } from '../cms/homepage'
import { initLivePreview, onLivePreviewChange } from '../cms/livePreview'
import { getEditTag } from '../utils/getEditTag'
import { Link, useLocation } from 'react-router-dom'

function GetStartedPage() {
  const location = useLocation()
  const [scrollY, setScrollY] = useState(0)
  const [cmsData, setCmsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [entryUid, setEntryUid] = useState(null)
  const [entry, setEntry] = useState(null)
  const [homepageData, setHomepageData] = useState(null)
  const [homepageEntry, setHomepageEntry] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
  })

  const callbackWorkingRef = useRef(false)
  const callbackUpdateTimeRef = useRef(0)
  const lastLocationRef = useRef(location.pathname)

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
          if (newUid && newUid !== entryUid) {
            setEntryUid(newUid)
            sessionStorage.setItem('contentstack_content_type', 'get_started')
            sessionStorage.setItem('contentstack_entry_uid', newUid)
            handleEntryChange()
          }
        }
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
          
          const freshEntry = await fetchGetStarted(stored)
          if (freshEntry) {
            const entryClone = JSON.parse(JSON.stringify(freshEntry))
            const mapped = mapGetStarted(freshEntry)
            
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
          
          const entry = await fetchGetStarted(stored)
          if (!entry) return
          
          const entryClone = JSON.parse(JSON.stringify(entry))
          const mapped = mapGetStarted(entry)
          
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
            sessionStorage.setItem('contentstack_content_type', 'get_started')
            sessionStorage.setItem('contentstack_entry_uid', entry.uid)
          }
        } catch (e) {
          // Silent error handling
        }
      }, 600)
    }
    
    async function load() {
      try {
        // Clear stored UIDs to ensure we fetch published entry (not draft)
        try {
          const storedContentType = sessionStorage.getItem('contentstack_content_type')
          if (storedContentType !== 'get_started') {
            sessionStorage.removeItem('contentstack_entry_uid')
            sessionStorage.removeItem('contentstack_content_type')
          }
        } catch (e) {}
        
        const fetchedEntry = await fetchGetStarted()
        const mapped = mapGetStarted(fetchedEntry)
        setCmsData(mapped)
        
        const entryWithTags = fetchedEntry ? JSON.parse(JSON.stringify(fetchedEntry)) : null
        setEntry(entryWithTags)
        
        if (fetchedEntry?.uid) {
          setEntryUid(fetchedEntry.uid)
          try {
            sessionStorage.setItem('contentstack_entry_uid', fetchedEntry.uid)
            sessionStorage.setItem('contentstack_content_type', 'get_started')
          } catch (e) {}
        }
        
        // Fetch homepage data for navigation (logo text) to keep it consistent across pages
        try {
          const savedHomepageUid = sessionStorage.getItem('contentstack_entry_uid') || localStorage.getItem('contentstack_entry_uid')
          const savedContentType = sessionStorage.getItem('contentstack_content_type') || localStorage.getItem('contentstack_content_type')
          if (savedContentType === 'homepage') {
            sessionStorage.removeItem('contentstack_entry_uid')
            sessionStorage.removeItem('contentstack_content_type')
            localStorage.removeItem('contentstack_entry_uid')
            localStorage.removeItem('contentstack_content_type')
          }
          
          // Pass ignoreStoredUid=true to force fetching published entry, not stored UID
          const homepageEntry = await fetchHomepage(null, true)
          if (homepageEntry) {
            const homepageMapped = mapHomepage(homepageEntry)
            setHomepageData(homepageMapped)
            setHomepageEntry(homepageEntry)
          }
          
          // Restore saved UID if it wasn't homepage
          if (savedHomepageUid && savedContentType !== 'homepage') {
            sessionStorage.setItem('contentstack_entry_uid', savedHomepageUid)
            sessionStorage.setItem('contentstack_content_type', savedContentType)
          }
        } catch (e) {
          // Silent error - navigation will use defaults
        }
      } catch (e) {
        console.warn('[LP LOAD] fetchGetStarted failed:', e)
        // If 422 error, clear invalid UID
        if (e?.status === 422 || e?.error_code === 141 || 
            (e?.error_message && e.error_message.includes("doesn't exist"))) {
          try {
            sessionStorage.removeItem('contentstack_entry_uid')
            sessionStorage.removeItem('contentstack_content_type')
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
  
  // Refetch data when route changes (navigation from other pages)
  useEffect(() => {
    const currentPath = location.pathname
    const previousPath = lastLocationRef.current
    
    // Only refetch if we're navigating TO this page (not initial mount)
    if (currentPath === '/get-started' && previousPath !== '/get-started' && previousPath !== '') {
      setLoading(true)
      async function reload() {
        try {
          // Clear stored UIDs to ensure we fetch published entry (not draft)
          try {
            const storedContentType = sessionStorage.getItem('contentstack_content_type')
            if (storedContentType !== 'get_started') {
              sessionStorage.removeItem('contentstack_entry_uid')
              sessionStorage.removeItem('contentstack_content_type')
            }
          } catch (e) {}
          
          const fetchedEntry = await fetchGetStarted()
          const mapped = mapGetStarted(fetchedEntry)
          setCmsData(mapped)
          
          const entryWithTags = fetchedEntry ? JSON.parse(JSON.stringify(fetchedEntry)) : null
          setEntry(entryWithTags)
          
          if (fetchedEntry?.uid) {
            setEntryUid(fetchedEntry.uid)
            try {
              sessionStorage.setItem('contentstack_entry_uid', fetchedEntry.uid)
              sessionStorage.setItem('contentstack_content_type', 'get_started')
            } catch (e) {}
          }
        } catch (e) {
          console.warn('[GET_STARTED] Reload failed:', e)
          // If 422 error, clear invalid UID
          if (e?.status === 422 || e?.error_code === 141 || 
              (e?.error_message && e.error_message.includes("doesn't exist"))) {
            try {
              sessionStorage.removeItem('contentstack_entry_uid')
              sessionStorage.removeItem('contentstack_content_type')
            } catch {}
          }
        } finally {
          setLoading(false)
        }
      }
      reload()
    }
    
    // Update the ref for next comparison
    lastLocationRef.current = currentPath
  }, [location.pathname])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      initLivePreview()
      
      const unsubscribeFn = onLivePreviewChange(async (data) => {
        if (!data || !data.entry_uid) return
        
        // Check if this is a homepage update (for navigation logo)
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
        
        const stored = sessionStorage.getItem('contentstack_entry_uid')
        if (!stored || stored !== data.entry_uid) {
          sessionStorage.setItem('contentstack_content_type', 'get_started')
          sessionStorage.setItem('contentstack_entry_uid', data.entry_uid)
          setEntryUid(data.entry_uid)
        }
        
        try {
          const entry = await fetchGetStarted(data.entry_uid)
          if (!entry) return
          
          const entryClone = JSON.parse(JSON.stringify(entry))
          const mapped = mapGetStarted(entry)
          
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
            sessionStorage.setItem('contentstack_content_type', 'get_started')
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
          if (!stored) return
          
          try {
            const entry = await fetchGetStarted(stored)
            if (!entry) return
            
            const lastVersion = sessionStorage.getItem('contentstack_last_version')
            const lastUpdated = sessionStorage.getItem('contentstack_last_updated')
            
            if (lastVersion && entry._version && String(entry._version) === lastVersion) {
              return // No changes
            }
            if (lastUpdated && entry.updated_at && String(entry.updated_at) === lastUpdated) {
              return // No changes
            }
            
            const entryClone = JSON.parse(JSON.stringify(entry))
            const mapped = mapGetStarted(entry)
            
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
            // Silent error handling
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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle signup logic here
    console.log('Signup:', formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <Navigation scrollY={scrollY} data={homepageData?.navigation || cmsData?.navigation || {}} entry={homepageEntry || entry} />
      
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 bg-primary-900/50 text-primary-300 rounded-full text-sm font-semibold mb-6 border border-primary-700/50"
                {...getEditTag(entry, 'hero.eyebrow')}
              >
                {cmsData?.hero?.eyebrow || '🚀 Start Your Journey'}
              </motion.div>
              
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                {...getEditTag(entry, 'hero.heading')}
              >
                {cmsData?.hero?.heading || 'Get Started Today'}
              </h1>
              
              <p 
                className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
                {...getEditTag(entry, 'hero.subheading')}
              >
                {cmsData?.hero?.subheading || 'Join thousands of companies building modern digital experiences with our platform.'}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Left Column - Steps & Benefits */}
              <div className="space-y-12">
                {/* Steps */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-8">How It Works</h2>
                  <div className="space-y-6">
                    {(cmsData?.steps || [
                      { number: 1, title: 'Create Your Account', description: 'Sign up with your email and company details' },
                      { number: 2, title: 'Set Up Your Stack', description: 'Configure your content model and workspace' },
                      { number: 3, title: 'Start Creating', description: 'Begin managing your content immediately' },
                    ]).map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {step.number || idx + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                          <p className="text-gray-300">{step.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">What You'll Get</h2>
                  <div className="space-y-4">
                    {(cmsData?.benefits || [
                      { title: '14-day free trial', description: 'Full access to all features' },
                      { title: 'No credit card required', description: 'Start risk-free' },
                      { title: 'Expert support', description: 'Get help when you need it' },
                    ]).map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-primary-900/50 border border-primary-700/50 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-4 h-4 text-primary-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{benefit.title}</div>
                          <div className="text-sm text-gray-300">{benefit.description}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Signup Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-10 sticky top-32"
              >
                <div className="mb-8">
                  <h2 
                    className="text-2xl font-bold text-white mb-2"
                    {...getEditTag(entry, 'form.title')}
                  >
                    {cmsData?.form?.title || 'Create Your Account'}
                  </h2>
                  <p 
                    className="text-gray-300"
                    {...getEditTag(entry, 'form.subtitle')}
                  >
                    {cmsData?.form?.subtitle || 'Fill in your details to get started'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-300 mb-2"
                      {...getEditTag(entry, 'form.name_label')}
                    >
                      {cmsData?.form?.nameLabel || 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-300 mb-2"
                      {...getEditTag(entry, 'form.email_label')}
                    >
                      {cmsData?.form?.emailLabel || 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-300 mb-2"
                      {...getEditTag(entry, 'form.company_label')}
                    >
                      {cmsData?.form?.companyLabel || 'Company Name'}
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                        placeholder="Your Company"
                        required
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 border-gray-600 bg-gray-900 rounded focus:ring-primary-500 mt-1"
                      required
                    />
                    <label className="ml-2 text-sm text-gray-300">
                      <span {...getEditTag(entry, 'form.terms_text')}>
                        {cmsData?.form?.termsText || 'I agree to the Terms of Service and Privacy Policy'}
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full btn-primary inline-flex items-center justify-center"
                    {...getEditTag(entry, 'form.submit_text')}
                  >
                    {cmsData?.form?.submitText || 'Get Started Free'}
                    <ArrowRight className="ml-2" size={20} />
                  </motion.button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                    Sign In
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer data={homepageData?.footer || cmsData?.footer || {}} entry={homepageEntry || entry} />
    </div>
  )
}

export default GetStartedPage

