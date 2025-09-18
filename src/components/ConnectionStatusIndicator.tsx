import React from 'react';
import { Wifi, WifiOff, Database, AlertTriangle, RefreshCw } from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  status: 'connecting' | 'connected' | 'error' | 'offline';
  onRetry?: () => void;
  onToggleMode?: () => void;
  compact?: boolean;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  status,
  onRetry,
  onToggleMode,
  compact = false
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          text: 'Online',
          description: 'Connected to Supabase'
        };
      case 'offline':
        return {
          icon: Database,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-200',
          text: 'Offline',
          description: 'Using demo data'
        };
      case 'error':
        return {
          icon: WifiOff,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          text: 'Error',
          description: 'Connection failed'
        };
      default:
        return {
          icon: RefreshCw,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          text: 'Connecting',
          description: 'Initializing...'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
        <Icon className={`h-3 w-3 ${statusConfig.color} ${status === 'connecting' ? 'animate-spin' : ''}`} />
        <span className={`font-medium ${statusConfig.color}`}>
          {statusConfig.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${statusConfig.color} ${status === 'connecting' ? 'animate-spin' : ''}`} />
        <div>
          <div className={`font-medium ${statusConfig.color}`}>
            {statusConfig.text}
          </div>
          <div className="text-xs text-gray-600">
            {statusConfig.description}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        {status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        )}
        {onToggleMode && (
          <button
            onClick={onToggleMode}
            className="text-xs text-gray-600 hover:text-gray-800 underline"
          >
            {status === 'offline' ? 'Go Online' : 'Offline Mode'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusIndicator;