import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.scss'
import './styles/animations.scss'
import './lib/gpu-init'

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  window.__STATIC_NEWS_PERF__ = {
    start: performance.now(),
    marks: {}
  }
}

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Remove loading screen after app loads
window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen')
    const rootElement = document.getElementById('root')
    
    if (loadingScreen) {
      loadingScreen.style.opacity = '0'
      setTimeout(() => {
        loadingScreen.remove()
      }, 1000)
    }
    
    if (rootElement) {
      rootElement.classList.add('loaded')
    }
  }, 1500)
})