import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __MRS_APP_MOUNTED__?: boolean;
    __MRS_MOUNTED_AT__?: string;
  }
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'Unexpected application error' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('MRS App Store runtime error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl bg-zinc-900 border border-white/10 p-6 text-center space-y-4">
            <h1 className="text-xl font-bold text-white">MRS App Store</h1>
            <p className="text-xs text-zinc-400">{this.state.message}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, message: '' })}
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                Try Recover
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Reload Store
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MountTracker({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.__MRS_APP_MOUNTED__ = true;
    window.__MRS_MOUNTED_AT__ = new Date().toISOString();
  }, []);

  return <>{children}</>;
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <AppErrorBoundary>
      <MountTracker>
        <App />
      </MountTracker>
    </AppErrorBoundary>
  );
}
