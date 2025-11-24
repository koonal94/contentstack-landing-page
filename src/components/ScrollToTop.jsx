import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop component that scrolls to top of page on route change
 * This fixes the issue where navigating from a scrolled homepage to another page
 * shows the new page at the bottom instead of the top
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Scroll to top whenever the pathname changes (route change)
    // This ensures new pages always start at the top
    // Hash navigation is handled separately by page components
    // Only scroll to top if there's no hash (hash navigation handles its own scrolling)
    if (!hash) {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}

export default ScrollToTop

