import React from 'react';
import { AlertCircle, RefreshCw, Compass } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StoreRate ErrorBoundary caught an unhandled exception:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate to /dashboard or /stores to safely recover state without looping
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F6F1] flex flex-col items-center justify-center p-6 text-[#171A18] text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-3xl flex items-center justify-center text-[#9B2C2C] shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md">
            <span className="text-[10px] font-extrabold text-[#9B2C2C] uppercase tracking-widest bg-rose-100/60 px-3.5 py-1.5 rounded-full inline-block border border-rose-200">
              APPLICATION SHELL RECOVERY
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171A18] tracking-tight">
              Something went wrong.
            </h2>
            <p className="text-xs sm:text-sm text-[#707873] font-normal">
              Unable to load this page component. An unexpected runtime error occurred, but your data is safe.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs flex items-center space-x-2 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <a
              href="/stores"
              className="px-5 py-2.5 bg-white border border-[#E2E5DF] hover:bg-[#F7F6F1] text-[#171A18] font-bold rounded-xl text-xs flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#C9A24A]" />
              <span>Back to Explore Stores</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
