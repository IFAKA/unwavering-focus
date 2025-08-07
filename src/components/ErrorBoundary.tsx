import React, { Component, ErrorInfo, ReactNode } from 'react';
import '../styles.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[200px] p-xl bg-bg-primary text-text-primary font-apple">
          <div className="flex flex-col items-center text-center max-w-[300px]">
            <svg className="w-16 h-16 mb-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
            <div className="text-lg font-semibold mb-sm text-text-primary">Something went wrong</div>
            <div className="text-sm text-text-secondary mb-lg leading-relaxed">
              The extension encountered an error. Please refresh the page.
            </div>
            <button 
              className="bg-accent-primary text-white border-none rounded-apple px-lg py-sm text-sm font-medium cursor-pointer transition-opacity duration-200 hover:opacity-80 active:opacity-60"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 