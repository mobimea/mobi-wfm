import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Loader, RefreshCw, Building2 } from 'lucide-react';
import { DatabaseService } from '../lib/supabase';

interface DatabaseSetupWizardProps {
  onSetupComplete: () => void;
  onUseOfflineMode: () => void;
}

export default function DatabaseSetupWizard({ onSetupComplete, onUseOfflineMode }: DatabaseSetupWizardProps) {
  const [step, setStep] = useState<'testing' | 'ready' | 'complete' | 'error'>('testing');
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStep('testing');
    setError('');
    setIsLoading(true);

    try {
      console.log('🔌 Testing Supabase connection...');
      const connected = await DatabaseService.testConnection();
      setIsConnected(connected);
      
      if (connected) {
        console.log('✅ Connection successful');
        setStep('ready');
      } else {
        console.log('❌ Connection failed');
        setStep('error');
        setError('Failed to connect to Supabase. Please check your connection settings.');
      }
    } catch (err: any) {
      console.error('Connection test error:', err);
      setIsConnected(false);
      setStep('error');
      setError(err.message || 'Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const proceedWithEmptyDatabase = () => {
    console.log('✅ Proceeding with empty Supabase database');
    setStep('complete');
    setTimeout(() => {
      onSetupComplete();
    }, 1000);
  };

  const renderContent = () => {
    switch (step) {
      case 'testing':
        return (
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Testing Connection</h2>
            <p className="text-gray-600 mb-6">Connecting to Supabase database...</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">This may take a few seconds</p>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Database Connected</h2>
            <p className="text-gray-600 mb-6">Your Supabase database is ready and connected</p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Ready to Use</h3>
              </div>
              <p className="text-sm text-green-700">
                Your HR system will start with an empty database and all data will be stored in Supabase as you use the system.
              </p>
            </div>
            
            <button
              onClick={proceedWithEmptyDatabase}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Application
            </button>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">System Ready!</h2>
            <p className="text-gray-600 mb-6">Your HR Workforce Management system is ready to use with Supabase</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">Loading application...</p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connection Error</h2>
            <p className="text-gray-600 mb-6">Something went wrong during setup</p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <p className="text-sm text-red-700 font-mono break-words">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Retry Connection
              </button>
              
              <button
                onClick={onUseOfflineMode}
                className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Use Offline Mode (Demo)
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Database className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-xl font-bold text-gray-800">Supabase Connection</h1>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
}