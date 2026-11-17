import React from 'react'
import ReactDOM from 'react-dom/client'

// Prints any error in a red bar at the bottom of the page so a blank screen shows its cause.
const show = (title, err) => {
  const el = document.createElement('pre')
  el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:45vh;z-index:99999;margin:0;padding:14px;background:#fff0f0;color:#b00020;font:12px monospace;white-space:pre-wrap;overflow:auto;border-top:3px solid #b00020'
  el.textContent = title + '\n' + ((err && (err.stack || err.message)) || String(err))
  document.body.appendChild(el)
}
window.addEventListener('error', (e) => show('Runtime error:', e.error || e.message))
window.addEventListener('unhandledrejection', (e) => show('Unhandled promise rejection:', e.reason))

// Dynamic import so an error while loading App.jsx or its imports is caught and shown too.
import('./App.jsx')
  .then(({ default: App }) => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
  .catch((err) => show('Failed to load App.jsx or one of its imports:', err))