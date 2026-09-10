import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { bootstrapSyncedContent } from './lib/syncedStore.js'

function render() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

// Pull shared admin content from the server into localStorage before first paint
// so every device shows the same data. Never blocks the app for more than ~4s.
bootstrapSyncedContent().finally(render)
