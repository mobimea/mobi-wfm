import React from 'react';
import { Loader, Database, Wifi, WifiOff } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  connectionStatus: 'connecting' | 'connected' | 'error' | 'offline';
  onRetry?: () => void;
  onUseOffline?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  connectionStatus,
  onRetry,
  onUseOffline
}) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Loader className="h-8 w-8 animate-spin text-blue-600" />;
      case 'connected':
        return <Wifi className="h-8 w-8 text-green-600" />;
      case 'error':
        return <WifiOff className="h-8 w-8 text-red-600" />;
      case 'offline':
        return <Database className="h-8 w-8 text-orange-600" />;
      default:
        return <Loader className="h-8 w-8 animate-spin text-blue-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting to database...';
      case 'connected':
        return 'Connected successfully';
      case 'error':
        return 'Connection failed';
      case 'offline':
        return 'Working offline';
      default:
        return message;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full">
          {getStatusIcon()}
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">HR Workforce Management</h1>
          <p className="text-gray-300">{getStatusMessage()}</p>
          {message && message !== getStatusMessage() && (
            <p className="text-gray-400 text-sm mt-1">{message}</p>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connecting' ? 'animate-pulse bg-blue-400' : 'bg-gray-600'
              }`}
              style={{
                animationDelay: connectionStatus === 'connecting' ? `${i * 0.2}s` : '0s'
              }}
            />
          ))}
        </div>

        {/* Action Buttons for Error State */}
        {connectionStatus === 'error' && (
          <div className="space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto font-medium"
              >
                <Loader className="h-4 w-4" />
                Retry Database Connection
              </button>
            )}
            {onUseOffline && (
              <button
                onClick={onUseOffline}
                className="flex items-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors mx-auto font-medium"
              >
                <Database className="h-4 w-4" />
                Continue with Demo Mode
              </button>
            )}
          </div>
        )}

        {/* Connection Tips */}
        {connectionStatus === 'error' && (
          <div className="max-w-md text-left">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Troubleshooting Tips:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Check your internet connection</li>
                <li>• Verify Supabase project is active</li>
                <li>• Ensure environment variables are set</li>
                <li>• Try refreshing the page</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;