import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import GetStartedPage from './pages/GetStartedPage'
import DynamicPage from './pages/DynamicPage'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <ThemeProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        {/* Catch-all route for dynamic URLs from Contentstack URL field */}
        <Route path="/*" element={<DynamicPage />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
