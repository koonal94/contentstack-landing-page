import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Initialize theme from localStorage before rendering
const savedTheme = localStorage.getItem('theme') || 'dark'
const root = document.documentElement
if (savedTheme === 'light') {
  root.classList.add('light')
  root.classList.remove('dark')
} else {
  root.classList.add('dark')
  root.classList.remove('light')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
