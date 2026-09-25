import React from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    const message = error?.message || '';
    const isChunkError =
      message.includes('dynamically imported module') ||
      message.includes('MIME type') ||
      message.includes('Failed to fetch') ||
      message.includes('Importing a module script failed') ||
      error?.name === 'TypeError';

    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    const message = error?.message || '';
    const isChunkError =
      message.includes('dynamically imported module') ||
      message.includes('MIME type') ||
      message.includes('Failed to fetch') ||
      message.includes('Importing a module script failed');

    if (isChunkError) {
      const now = Date.now();
      const lastReload = Number(sessionStorage.getItem('last_error_boundary_reload') || 0);
      // Auto-reload once if this is a stale chunk after deployment
      if (now - lastReload > 10000) {
        sessionStorage.setItem('last_error_boundary_reload', String(now));
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('last_error_boundary_reload');
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {this.state.isChunkError ? 'New Update Available' : 'Something Went Wrong'}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {this.state.isChunkError
                ? 'A new version of EduSure was deployed. Please refresh the page to load the latest updates.'
                : 'An unexpected error occurred while loading this page. Please refresh or return to the home page.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-md shadow-violet-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm active:scale-98 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
