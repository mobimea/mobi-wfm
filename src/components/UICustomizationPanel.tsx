import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Palette, AlertTriangle } from 'lucide-react';
import { useUICustomization } from '../hooks/useUICustomization';

interface UICustomizationPanelProps {
  onClose: () => void;
}

const UICustomizationPanel: React.FC<UICustomizationPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'labels' | 'branding'>('labels');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const {
    labels,
    branding,
    updateLabels,
    updateBranding,
    resetToDefault,
    isCustomized
  } = useUICustomization();

  // Track initial state for change detection
  const [initialState] = useState(() => ({
    labels: JSON.stringify(labels),
    branding: JSON.stringify(branding)
  }));

  // Check for unsaved changes
  useEffect(() => {
    const currentLabels = JSON.stringify(labels);
    const currentBranding = JSON.stringify(branding);
    const hasChanges = currentLabels !== initialState.labels || currentBranding !== initialState.branding;
    setHasUnsavedChanges(hasChanges);
  }, [labels, branding, initialState]);

  const handleSave = () => {
    // Customizations are automatically saved via the hook when changes are made
    // Just close the panel since changes are already persisted
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    resetToDefault();
    setShowResetConfirm(false);
    setHasUnsavedChanges(false);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const updateLabel = (section: keyof typeof labels, key: string, value: string) => {
    updateLabels({
      [section]: {
        ...labels[section],
        [key]: value
      }
    });
  };

  const updateBrandingLocal = (section: string, key: string, value: string | number) => {
    updateBranding({
      [section]: {
        ...branding[section as keyof typeof branding],
        [key]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Palette className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">UI Customization</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('labels')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'labels'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Labels & Text
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'branding'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Branding & Theme
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'labels' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Navigation Labels</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(labels.mainNavigation).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateLabel('mainNavigation', key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Button Labels</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(labels.buttons).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateLabel('buttons', key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Form Labels</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(labels.formLabels).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateLabel('formLabels', key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Company Branding</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={branding.branding.companyName}
                        onChange={(e) => updateBrandingLocal('branding', 'companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={branding.branding.tagline || ''}
                        onChange={(e) => updateBrandingLocal('branding', 'tagline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Color Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(branding.colorTheme).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => updateBrandingLocal('colorTheme', key, e.target.value)}
                            className="w-12 h-8 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateBrandingLocal('colorTheme', key, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Default
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                hasUnsavedChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" />
                Confirm Reset
              </h3>
              <p className="mb-6">Are you sure you want to reset all customizations to default? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { UICustomizationPanel };
