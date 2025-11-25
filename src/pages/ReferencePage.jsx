import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { fetchHomepage, mapHomepage } from '../cms/homepage'

/**
 * Generic page component for displaying reference content types
 * (benefit_card, feature, footer_group, pricing_plan, testimonial)
 * that have their own URL fields
 */
function ReferencePage({ entry, contentType }) {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [homepageData, setHomepageData] = useState(null)
  const [homepageEntry, setHomepageEntry] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Fetch homepage data for navigation and footer
    async function loadHomepage() {
      try {
        const homepageEntry = await fetchHomepage(null, true)
        if (homepageEntry) {
          const homepageMapped = mapHomepage(homepageEntry)
          setHomepageData(homepageMapped)
          setHomepageEntry(homepageEntry)
        }
      } catch (e) {
        // Silent error - navigation will use defaults
      }
    }
    loadHomepage()
  }, [])

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Content not found</p>
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

  // Extract entry fields
  const fields = entry?.fields || entry
  const title = fields?.title || fields?.name || 'Content'
  const description = fields?.description || fields?.content || ''
  const content = fields?.content || fields?.description || ''

  // Render based on content type
  const renderContent = () => {
    switch (contentType) {
      case 'benefit_card':
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {title}
            </h1>
            {description && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                {description}
              </p>
            )}
            {fields?.bullets && Array.isArray(fields.bullets) && fields.bullets.length > 0 && (
              <ul className="space-y-4 mb-8">
                {fields.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-3 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )

      case 'feature':
        return (
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white mx-auto mb-8">
              {fields?.icon && (
                <span className="text-4xl">{fields.icon}</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {title}
            </h1>
            {description && (
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )

      case 'pricing_plan':
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {title}
            </h1>
            {fields?.price && (
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                {fields.price}
              </div>
            )}
            {description && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                {description}
              </p>
            )}
            {fields?.features && Array.isArray(fields.features) && fields.features.length > 0 && (
              <ul className="space-y-4 mb-8">
                {fields.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-3 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {typeof feature === 'string' ? feature : feature?.text || feature?.name || ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )

      case 'testimonial':
        return (
          <div className="max-w-4xl mx-auto text-center">
            {fields?.avatar_emoji && (
              <div className="text-6xl mb-6">{fields.avatar_emoji}</div>
            )}
            {content && (
              <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-8 italic">
                "{content}"
              </blockquote>
            )}
            {fields?.name && (
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {fields.name}
              </div>
            )}
            {fields?.role && (
              <div className="text-gray-600 dark:text-gray-400">
                {fields.role}
              </div>
            )}
            {fields?.rating && (
              <div className="mt-4 text-yellow-500">
                {'★'.repeat(Math.floor(fields.rating))}
              </div>
            )}
          </div>
        )

      case 'footer_group':
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {title}
            </h1>
            {fields?.links && Array.isArray(fields.links) && fields.links.length > 0 && (
              <ul className="space-y-4">
                {fields.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link?.href || '#'}
                      className="text-lg text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {link?.label || link?.title || 'Link'}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )

      default:
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {title}
            </h1>
            {content && (
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {content}
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <Navigation scrollY={scrollY} data={homepageData?.navigation || homepageData} entry={homepageEntry} homepageUrl={homepageData?.homepageUrl || '/'} />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container-custom">
          {renderContent()}
        </div>
      </main>

      <Footer data={homepageData?.footer} entry={homepageEntry} />
    </div>
  )
}

export default ReferencePage

