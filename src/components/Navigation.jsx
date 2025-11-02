import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const Navigation = ({ scrollY, data, entry }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setIsScrolled(scrollY > 20)
  }, [scrollY])

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
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Log in
            </button>
            <button className="btn-primary">Get Started</button>
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
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-gray-700 hover:text-primary-600 transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 border-t space-y-3">
              <button className="w-full text-gray-700 hover:text-primary-600 font-medium">
                Log in
              </button>
              <button className="w-full btn-primary">Get Started</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
