import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Linkedin, Twitter, Github, Mail } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const Footer = ({ data, entry }) => {
  const location = useLocation()
  
  const groups = (data?.linkGroups?.length ? data.linkGroups : [
    { title: 'Product', links: [
      { label: 'Features' },
      { label: 'Pricing' },
      { label: 'Integrations' },
      { label: 'API Documentation' },
      { label: 'Security' },
    ]},
    { title: 'Solutions', links: [
      { label: 'E-commerce' },
      { label: 'Healthcare' },
      { label: 'Finance' },
      { label: 'Media & Publishing' },
      { label: 'Enterprise' },
    ]},
    { title: 'Resources', links: [
      { label: 'Blog' },
      { label: 'Case Studies' },
      { label: 'Documentation' },
      { label: 'Developer Portal' },
      { label: 'Community' },
    ]},
    { title: 'Company', links: [
      { label: 'About Us' },
      { label: 'Careers' },
      { label: 'Contact' },
      { label: 'Partners' },
      { label: 'Press Kit' },
    ]},
  ])

  const socialLinks = [
    { icon: <Twitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <Linkedin size={20} />, href: '#', label: 'LinkedIn' },
    { icon: <Github size={20} />, href: '#', label: 'GitHub' },
    { icon: <Mail size={20} />, href: '#', label: 'Email' },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 text-gray-700 dark:text-gray-300 py-12 md:py-16">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12 items-start">
          {/* Brand Section */}
          <div className="flex-shrink-0 md:w-1/3 lg:w-2/5">
            <Link 
              to="/" 
              className="flex items-center space-x-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                // If already on homepage, scroll to top and clear hash
                if (location.pathname === '/') {
                  e.preventDefault()
                  // Clear the URL hash
                  window.history.pushState(null, '', '/')
                  // Scroll to top
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold gradient-text">ContentStack</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              The leading headless CMS platform for building modern digital 
              experiences. Fast, secure, and scalable.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 text-gray-700 dark:text-gray-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections - Four columns side by side */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
            {groups.map((group, groupIndex) => (
              <div 
                key={`footer-group-${groupIndex}-${group.title || groupIndex}`}
                {...getEditTag(entry, 'footer.link_groups')}
              >
                <h3 className="text-gray-900 dark:text-white font-semibold mb-4">{group.title}</h3>
                <ul className="space-y-3">
                  {(group.links || []).map((link, linkIndex) => (
                    <li key={`footer-link-${groupIndex}-${linkIndex}-${link.label || linkIndex}`}>
                      <a
                        href={link.href || '#'}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-900/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} ContentStack. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
