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
    const hash = href.substring(1) // Remove the #
    
    // If we're not on homepage, navigate there first
    if (location.pathname !== '/') {
      navigate('/')
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          // Account for fixed navbar height
          const yOffset = -100
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 300)
    } else {
      // Already on homepage, just scroll
      const element = document.getElementById(hash)
      if (element) {
        // Account for fixed navbar height
        const yOffset = -100
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }

  const navItems = data?.items?.length
    ? data.items.map((i) => ({ name: i.label, href: i.href }))
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
          ? 'bg-white shadow-lg py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span 
              className="text-2xl font-bold gradient-text"
              {...getEditTag(entry, 'navigation.brand_name')}
            >
              {data?.brandName || 'ContentStack'}
            </span>
          </div>

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
              
              if (isHashLink) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleHashLink(item.href, e)}
                    className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium cursor-pointer"
                  >
                    {item.name}
                  </a>
                )
              }
              
              if (isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </a>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href || '/'}
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
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
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
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
            className="md:hidden text-gray-700"
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
              
              if (isHashLink) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      setIsOpen(false)
                      handleHashLink(item.href, e)
                    }}
                    className="block text-gray-700 hover:text-primary-600 transition-colors py-2 cursor-pointer"
                  >
                    {item.name}
                  </a>
                )
              }
              
              if (isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-700 hover:text-primary-600 transition-colors py-2"
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
            <div className="pt-4 border-t space-y-3">
              <Link 
                to="/login"
                className="block w-full text-gray-700 hover:text-primary-600 font-medium text-center py-2"
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
