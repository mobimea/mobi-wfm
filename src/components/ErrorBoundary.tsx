import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('Error details:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Application Error</h1>
              <p className="text-gray-300">Something went wrong. Please try refreshing the application.</p>
            </div>

            <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">Error Details:</h3>
                <p className="text-sm text-red-700 font-mono">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Application
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Go to Home
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  If the problem persists, please contact system administrator.
                </p>
              </div>

              {/* Debug Information */}
              <details className="text-left">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  Show Technical Details
                </summary>
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify({
                      error: this.state.error?.toString(),
                      stack: this.state.error?.stack?.slice(0, 500),
                      componentStack: this.state.errorInfo?.componentStack?.slice(0, 300),
                      timestamp: new Date().toISOString()
                    }, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;