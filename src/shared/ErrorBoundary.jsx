import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    const isChunkLoadError = 
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('dynamically imported module') ||
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('Expected a JavaScript-or-Wasm module script');

    if (isChunkLoadError && !sessionStorage.getItem('chunk_reload_attempted')) {
      sessionStorage.setItem('chunk_reload_attempted', 'true');
      window.location.reload();
    }

    return { hasError: true, error, isChunkLoadError };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Component Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    sessionStorage.removeItem('chunk_reload_attempted');
    window.location.reload();
  };

  handleGoHome = () => {
    sessionStorage.removeItem('chunk_reload_attempted');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black tracking-tight text-white">Something went wrong</h2>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                An unexpected error occurred in the application. You can reload the page or return home.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-700/50 text-left font-mono text-[11px] text-red-300 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-3 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home size={15} />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
