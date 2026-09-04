import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--off)', fontFamily: 'var(--sans)',
      }}>
        <div style={{
          background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 20,
          padding: '48px 44px', maxWidth: 480, width: '100%', textAlign: 'center',
          boxShadow: 'var(--sh-lg)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: 'var(--g500)', lineHeight: 1.7, marginBottom: 28 }}>
            An unexpected error occurred. Try refreshing the page, or go back to the home screen.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 22px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
              Refresh page
            </button>
            <Link to="/"
              style={{ padding: '10px 22px', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--g200)', borderRadius: 8, fontWeight: 700, fontSize: 13.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Go home
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
