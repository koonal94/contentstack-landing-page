import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { fetchLogin, mapLogin } from '../cms/login'
import { fetchHomepage, mapHomepage } from '../cms/homepage'
import { initLivePreview, onLivePreviewChange } from '../cms/livePreview'
import { getEditTag } from '../utils/getEditTag'
import { Link, useLocation } from 'react-router-dom'

function LoginPage() {
  const location = useLocation()
  const [scrollY, setScrollY] = useState(0)
  const [cmsData, setCmsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [entryUid, setEntryUid] = useState(null)
  const [entry, setEntry] = useState(null)
  const [homepageData, setHomepageData] = useState(null)
  const [homepageEntry, setHomepageEntry] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

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
            sessionStorage.setItem('contentstack_content_type', 'login')
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
          
          const freshEntry = await fetchLogin(stored)
          if (freshEntry) {
            const entryClone = JSON.parse(JSON.stringify(freshEntry))
            const mapped = mapLogin(freshEntry)
            
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
          
          const entry = await fetchLogin(stored)
          if (!entry) return
          
          const entryClone = JSON.parse(JSON.stringify(entry))
          const mapped = mapLogin(entry)
          
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
            sessionStorage.setItem('contentstack_content_type', 'login')
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
          if (storedContentType !== 'login') {
            sessionStorage.removeItem('contentstack_entry_uid')
            sessionStorage.removeItem('contentstack_content_type')
          }
        } catch (e) {}
        
        const fetchedEntry = await fetchLogin()
        const mapped = mapLogin(fetchedEntry)
        setCmsData(mapped)
        
        const entryWithTags = fetchedEntry ? JSON.parse(JSON.stringify(fetchedEntry)) : null
        setEntry(entryWithTags)
        
        if (fetchedEntry?.uid) {
          setEntryUid(fetchedEntry.uid)
          try {
            sessionStorage.setItem('contentstack_entry_uid', fetchedEntry.uid)
            sessionStorage.setItem('contentstack_content_type', 'login')
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
        console.warn('[LP LOAD] fetchLogin failed:', e)
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
    if (currentPath === '/login' && previousPath !== '/login' && previousPath !== '') {
      setLoading(true)
      async function reload() {
        try {
          // Clear stored UIDs to ensure we fetch published entry (not draft)
          try {
            const storedContentType = sessionStorage.getItem('contentstack_content_type')
            if (storedContentType !== 'login') {
              sessionStorage.removeItem('contentstack_entry_uid')
              sessionStorage.removeItem('contentstack_content_type')
            }
          } catch (e) {}
          
          const fetchedEntry = await fetchLogin()
          const mapped = mapLogin(fetchedEntry)
          setCmsData(mapped)
          
          const entryWithTags = fetchedEntry ? JSON.parse(JSON.stringify(fetchedEntry)) : null
          setEntry(entryWithTags)
          
          if (fetchedEntry?.uid) {
            setEntryUid(fetchedEntry.uid)
            try {
              sessionStorage.setItem('contentstack_entry_uid', fetchedEntry.uid)
              sessionStorage.setItem('contentstack_content_type', 'login')
            } catch (e) {}
          }
        } catch (e) {
          console.warn('[LOGIN] Reload failed:', e)
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
          sessionStorage.setItem('contentstack_content_type', 'login')
          sessionStorage.setItem('contentstack_entry_uid', data.entry_uid)
          setEntryUid(data.entry_uid)
        }
        
        try {
          const entry = await fetchLogin(data.entry_uid)
          if (!entry) return
          
          const entryClone = JSON.parse(JSON.stringify(entry))
          const mapped = mapLogin(entry)
          
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
            sessionStorage.setItem('contentstack_content_type', 'login')
            sessionStorage.setItem('contentstack_entry_uid', entry.uid)
          }
        } catch (e) {
          // Silent error handling
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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login:', { email, password, rememberMe })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Main Content Section with Background Animations */}
      <div className="relative bg-gradient-to-b from-gray-950 via-gray-950 to-gray-950 overflow-hidden">
        {/* Background animations matching hero section */}
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
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-400/30 via-purple-500/25 to-transparent rounded-full filter blur-[120px]"
              animate={{
                scale: [1, 1.6, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
        <Navigation scrollY={scrollY} data={homepageData?.navigation || cmsData?.navigation || {}} entry={homepageEntry || entry} />
        
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative z-10">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Hero Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center md:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-4 py-2 bg-primary-900/50 text-primary-300 rounded-full text-sm font-semibold mb-6 border border-primary-700/50"
                  {...getEditTag(entry, 'hero.eyebrow')}
                >
                  {cmsData?.hero?.eyebrow || '🔐 Secure Access'}
                </motion.div>
                
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                  {...getEditTag(entry, 'hero.heading')}
                >
                  {cmsData?.hero?.heading || 'Welcome Back'}
                </h1>
                
                <p 
                  className="text-xl text-gray-300 mb-8 leading-relaxed"
                  {...getEditTag(entry, 'hero.subheading')}
                >
                  {cmsData?.hero?.subheading || 'Sign in to your account to access your dashboard and manage your content.'}
                </p>

                {/* Features */}
                <div className="space-y-4 mt-12">
                  {(cmsData?.features || [
                    { title: 'Enterprise-grade security', description: 'Your data is protected with bank-level encryption' },
                    { title: '24/7 Support', description: 'Get help whenever you need it' },
                    { title: 'Scalable Platform', description: 'Grows with your business' },
                  ]).map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-900/50 border border-primary-700/50 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-4 h-4 text-primary-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{feature.title}</div>
                        <div className="text-sm text-gray-300">{feature.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column - Login Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-10"
              >
                <div className="mb-8">
                  <h2 
                    className="text-2xl font-bold text-white mb-2"
                    {...getEditTag(entry, 'form.title')}
                  >
                    {cmsData?.form?.title || 'Sign In'}
                  </h2>
                  <p 
                    className="text-gray-300"
                    {...getEditTag(entry, 'form.subtitle')}
                  >
                    {cmsData?.form?.subtitle || 'Enter your credentials to continue'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label 
                      className="block text-sm font-medium text-gray-300 mb-2"
                      {...getEditTag(entry, 'form.password_label')}
                    >
                      {cmsData?.form?.passwordLabel || 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-600 bg-gray-900 rounded focus:ring-primary-500"
                      />
                      <span 
                        className="ml-2 text-sm text-gray-300"
                        {...getEditTag(entry, 'form.remember_me_text')}
                      >
                        {cmsData?.form?.rememberMe || 'Remember me'}
                      </span>
                    </label>
                    <a 
                      href="#"
                      className="text-sm text-primary-400 hover:text-primary-300"
                      {...getEditTag(entry, 'form.forgot_password_text')}
                    >
                      {cmsData?.form?.forgotPassword || 'Forgot password?'}
                    </a>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full btn-primary inline-flex items-center justify-center"
                    {...getEditTag(entry, 'form.submit_text')}
                  >
                    {cmsData?.form?.submitText || 'Sign In'}
                    <ArrowRight className="ml-2" size={20} />
                  </motion.button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span 
                        className="px-2 bg-gray-800 text-gray-400"
                        {...getEditTag(entry, 'form.or_text')}
                      >
                        {cmsData?.form?.orText || 'Or continue with'}
                      </span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-700 bg-gray-800 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-700 bg-gray-800 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/get-started" className="text-primary-400 hover:text-primary-300 font-medium">
                    Get Started
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Footer - Separate section like homepage */}
      <Footer data={homepageData?.footer || cmsData?.footer || {}} entry={homepageEntry || entry} />
    </div>
  )
}

export default LoginPage

