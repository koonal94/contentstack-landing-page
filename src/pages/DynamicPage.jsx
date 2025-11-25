import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchEntryByUrl, fetchEntryData } from '../cms/fetchByUrl'
import { mapHomepage } from '../cms/homepage'
import { mapLogin } from '../cms/login'
import { mapGetStarted } from '../cms/getStarted'
import HomePage from './HomePage'
import LoginPage from './LoginPage'
import GetStartedPage from './GetStartedPage'
import ReferencePage from './ReferencePage'

/**
 * Dynamic page component that handles routing based on URL field from Contentstack
 * This allows entries to have custom URLs like /contentstack-testing
 */
function DynamicPage() {
  const { '*': urlPath } = useParams() // Catch-all route parameter
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [entryData, setEntryData] = useState(null)
  const [contentType, setContentType] = useState(null)
  const [component, setComponent] = useState(null)

  // Store entry UID in sessionStorage so the page components can use it
  // This must be called before any conditional returns to follow React hooks rules
  useEffect(() => {
    if (entryData?.uid && contentType) {
      try {
        sessionStorage.setItem('contentstack_entry_uid', entryData.uid)
        sessionStorage.setItem('contentstack_content_type', contentType)
        // Also set a flag to indicate we're using URL-based routing
        sessionStorage.setItem('contentstack_url_based', 'true')
      } catch (e) {
        // Silent fail
      }
    }
  }, [entryData, contentType])

  useEffect(() => {
    async function loadEntry() {
      setLoading(true)
      setError(null)
      
      try {
        // Construct the full path (add leading slash if not present)
        const fullPath = urlPath ? `/${urlPath}` : '/'
        
        // Fetch entry by URL
        const result = await fetchEntryByUrl(fullPath)
        
        if (!result) {
          // No entry found for this URL - could be a 404 or fallback to default routes
          // Check if it's one of the standard routes first
          if (fullPath === '/' || fullPath === '') {
            // Homepage - fetch default homepage
            const entry = await fetchEntryData('homepage')
            if (entry) {
              setEntryData(entry)
              setContentType('homepage')
              setComponent('homepage')
              setLoading(false)
              return
            }
          } else if (fullPath === '/login') {
            // Login page - fetch default login
            const entry = await fetchEntryData('login')
            if (entry) {
              setEntryData(entry)
              setContentType('login')
              setComponent('login')
              setLoading(false)
              return
            }
          } else if (fullPath === '/get-started') {
            // Get Started page - fetch default get started
            const entry = await fetchEntryData('get_started')
            if (entry) {
              setEntryData(entry)
              setContentType('get_started')
              setComponent('get_started')
              setLoading(false)
              return
            }
          }
          
          // No entry found - show 404 or redirect
          setError('Page not found')
          setLoading(false)
          return
        }
        
        // Entry found - fetch full entry data using the entry UID
        const fullEntry = await fetchEntryData(result.contentType, result.entry.uid)
        
        if (!fullEntry) {
          setError('Failed to load page data')
          setLoading(false)
          return
        }
        
        setEntryData(fullEntry)
        setContentType(result.contentType)
        setComponent(result.component)
        setLoading(false)
      } catch (err) {
        console.error('[DynamicPage] Error loading entry:', err)
        setError('Failed to load page')
        setLoading(false)
      }
    }
    
    loadEntry()
  }, [urlPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  // Render the appropriate component based on content type
  // The components will fetch their own data, but they'll use the entry UID from sessionStorage
  if (component === 'homepage') {
    return <HomePage />
  } else if (component === 'login') {
    return <LoginPage />
  } else if (component === 'get_started') {
    return <GetStartedPage />
  } else if (component === 'reference' && entryData && contentType) {
    // Render reference content types (benefit_card, feature, footer_group, pricing_plan, testimonial)
    return <ReferencePage entry={entryData} contentType={contentType} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Unable to render page</p>
      </div>
    </div>
  )
}

export default DynamicPage

