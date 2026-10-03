import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Automatically route API requests to Render backend in production
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  const API_HOST = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://mansalvic-org.onrender.com' : '');
  if (API_HOST) {
    window.fetch = function(url, options) {
      if (typeof url === 'string' && url.startsWith('/api')) {
        return originalFetch(`${API_HOST}${url}`, options);
      }
      return originalFetch(url, options);
    };
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Application UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '60px auto', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--slate-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--emerald-900)', marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ color: 'var(--ink-500)', fontSize: '0.95rem', marginBottom: '24px' }}>
            {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ background: 'var(--emerald-600)', color: 'var(--white)', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
