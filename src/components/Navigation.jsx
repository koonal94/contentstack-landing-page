import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const Navigation = ({ scrollY, data, entry }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setIsScrolled(scrollY > 20)
  }, [scrollY])

  // Handle hash links - navigate to homepage first if needed, then scroll
  const handleHashLink = (href, e) => {
    e.preventDefault()
    e.stopPropagation()
    const hash = href.substring(1) // Remove the #
    
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
    
    // If we're not on homepage, navigate there first (same tab, no new tab)
    if (location.pathname !== '/') {
      navigate(`/#${hash}`, { replace: false })
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        scrollToElement(hash)
      }, 300)
    } else {
      // Already on homepage, try to scroll immediately
      // If element not found, retry with increasing delays
      if (!scrollToElement(hash)) {
        // If still not found after retries, try once more after a longer delay
        setTimeout(() => scrollToElement(hash, 0), 500)
      }
    }
  }

  // Map navigation item names to section IDs (case-insensitive)
  const nameToSectionId = {
    'product': 'features',
    'solutions': 'benefits',
    'pricing': 'pricing',
    'resources': 'resources',
    'company': 'company',
  }

  // Ensure navItems is always an array with valid hrefs
  const navItems = data?.items?.length
    ? data.items
        .filter((i) => i && (i.label || i.name) && (i.href || i.link))
        .map((i) => {
          const name = i.label || i.name || ''
          const nameLower = name.toLowerCase().trim()
          let href = i.href || i.link || '#'
          
          // For Product, Solutions, and Pricing, force them to be hash links to correct sections
          if (nameToSectionId[nameLower]) {
            const sectionId = nameToSectionId[nameLower]
            href = `#${sectionId}`
          }
          // If href is already a hash link, ensure it matches the correct section ID based on name
          else if (href.startsWith('#')) {
            const sectionId = nameToSectionId[nameLower]
            if (sectionId) {
              href = `#${sectionId}`
            }
          }
          
          return { name, href }
        })
    : [
        { name: 'Product', href: '#features' },
        { name: 'Solutions', href: '#benefits' },
        { name: 'Resources', href: '#resources' },
        { name: 'Company', href: '#company' },
        { name: 'Pricing', href: '#pricing' },
      ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg py-4 border-b border-gray-800'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              // If already on homepage, scroll to top instead of navigating
              if (location.pathname === '/') {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span 
              className="text-2xl font-bold gradient-text"
              {...getEditTag(entry, 'navigation.brand_name')}
            >
              {data?.brandName || 'ContentStack'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div 
            className="hidden md:flex items-center space-x-8"
            {...getEditTag(entry, 'navigation.nav_items')}
          >
            {navItems.map((item) => {
              // Check if item.href is a hash link (section anchor)
              const isHashLink = item.href && item.href.startsWith('#')
              
              // Check if item.href is an external link
              const isExternal = item.href && item.href.startsWith('http')
              
              // Force Product, Solutions, and Pricing to be hash links
              const nameLower = item.name?.toLowerCase().trim()
              const isHashNavItem = nameToSectionId[nameLower]
              
              if (isHashLink || isHashNavItem) {
                // Ensure href is set correctly for hash nav items
                const href = isHashNavItem ? `#${nameToSectionId[nameLower]}` : item.href
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={(e) => handleHashLink(href, e)}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200 font-medium cursor-pointer bg-transparent border-none p-0"
                  >
                    {item.name}
                  </button>
                )
              }
              
              if (isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </a>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href || '/'}
                  className="text-gray-300 hover:text-primary-400 transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login"
              className={`font-medium transition-colors ${
                location.pathname === '/login' 
                  ? 'text-primary-400' 
                  : 'text-gray-300 hover:text-primary-400'
              }`}
            >
              Log in
            </Link>
            <Link to="/get-started" className="btn-primary">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navItems.map((item) => {
              const isHashLink = item.href && item.href.startsWith('#')
              const isExternal = item.href && item.href.startsWith('http')
              
              // Force Product, Solutions, and Pricing to be hash links
              const nameLower = item.name?.toLowerCase().trim()
              const isHashNavItem = nameToSectionId[nameLower]
              
              if (isHashLink || isHashNavItem) {
                // Ensure href is set correctly for hash nav items
                const href = isHashNavItem ? `#${nameToSectionId[nameLower]}` : item.href
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={(e) => {
                      setIsOpen(false)
                      handleHashLink(href, e)
                    }}
                    className="block w-full text-left text-gray-300 hover:text-primary-400 transition-colors py-2 cursor-pointer bg-transparent border-none p-0"
                  >
                    {item.name}
                  </button>
                )
              }
              
              if (isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-300 hover:text-primary-400 transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href || '/'}
                  className="block text-gray-700 hover:text-primary-600 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
            <div className="pt-4 border-t border-gray-800 space-y-3">
              <Link 
                to="/login"
                className="block w-full text-gray-300 hover:text-primary-400 font-medium text-center py-2"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
              <Link 
                to="/get-started"
                className="block w-full btn-primary text-center"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation

