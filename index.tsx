import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Error boundary wrapper
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#020204',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#a855f7', marginBottom: '16px' }}>⚡ SENTINEL AI</h1>
          <h2 style={{ marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#a855f7',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mount the app
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="color: white; padding: 20px;">Could not find root element</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  console.log('🚀 Starting SENTINEL AI...');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✅ SENTINEL AI mounted successfully');
} catch (error) {
  console.error('❌ Failed to mount app:', error);
  rootElement.innerHTML = `
    <div style="color: white; padding: 20px; text-align: center;">
      <h1 style="color: #a855f7;">⚡ SENTINEL AI</h1>
      <p>Failed to load the application</p>
      <p style="color: #666;">${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  `;
}