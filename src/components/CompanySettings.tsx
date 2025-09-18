import React, { useState } from 'react';
import { Building2, Save, RefreshCw, Settings, Palette, Download, CheckCircle, AlertTriangle, Globe, DollarSign } from 'lucide-react';
import { CompanyConfiguration } from '../types/company';
import { INDUSTRY_TEMPLATES, getIndustryTemplate } from '../utils/industryTemplates';
import { UICustomizationPanel } from './UICustomizationPanel';
import { useUICustomization } from '../hooks/useUICustomization';
import { companyLabels } from '../config/labels';

interface CompanySettingsProps {
  currentConfig: CompanyConfiguration;
  onConfigUpdate: (config: CompanyConfiguration) => void;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({
  currentConfig,
  onConfigUpdate
}) => {
  type TabId = 'general' | 'payroll' | 'features' | 'compliance' | 'ui';
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showUICustomization, setShowUICustomization] = useState(false);
  const [localConfig, setLocalConfig] = useState<CompanyConfiguration>(currentConfig);
  const {
    isCustomized,
    getNavLabel,
    getButtonLabel,
    getFormLabel,
    getGeneralTerm
  } = useUICustomization();

  const handleConfigChange = (updates: Partial<CompanyConfiguration>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    onConfigUpdate(localConfig);
    setUnsavedChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(currentConfig);
    setUnsavedChanges(false);
  };

  const applyTemplate = (templateId: string) => {
    const template = getIndustryTemplate(templateId);
    if (template) {
      const newConfig = {
        ...template.configuration,
        id: localConfig.id,
        companyName: localConfig.companyName,
        employeeCount: localConfig.employeeCount,
        createdAt: localConfig.createdAt,
        updatedAt: new Date().toISOString(),
        createdBy: localConfig.createdBy
      } as CompanyConfiguration;
      
      setLocalConfig(newConfig);
      setUnsavedChanges(true);
    }
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(localConfig, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${localConfig.companyName.replace(/\s+/g, '_').toLowerCase()}_config.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number | string }> }[] = [
  { id: 'general', label: getNavLabel('company'), icon: Building2 },
  { id: 'payroll', label: getNavLabel('payroll'), icon: DollarSign },
  { id: 'features', label: getNavLabel('settings'), icon: Settings },
  { id: 'compliance', label: getNavLabel('reports'), icon: Globe },
  { id: 'ui', label: getNavLabel('settings') === 'Admin Settings' ? 'UI & Branding' : getNavLabel('settings'), icon: Palette }
];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{companyLabels.title}</h1>
          <p className="text-gray-600 mt-1">{companyLabels.employeeManagement}</p>
        </div>
        <div className="flex items-center gap-3">
          {unsavedChanges && (
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              <AlertTriangle size={16} />
              {companyLabels.unsavedChanges}
            </div>
          )}
          {isCustomized && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <CheckCircle size={16} />
              {companyLabels.customized}
            </div>
          )}
          <button
            onClick={exportConfig}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download size={16} />
            {companyLabels.exportData}
          </button>
          <button
            onClick={handleReset}
            disabled={!unsavedChanges}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {companyLabels.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!unsavedChanges}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {companyLabels.save}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border p-1">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{companyLabels.companyInformation}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {companyLabels.companyName}
                </label>
                <input
                  type="text"
                  value={localConfig.companyName}
                  onChange={(e) => handleConfigChange({ companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={companyLabels.companyName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {companyLabels.industry}
                </label>
                <select
                  value={localConfig.industry}
                  onChange={(e) => handleConfigChange({ industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={companyLabels.industry}
                >
                  <option value="construction">{companyLabels.industries.construction}</option>
                  <option value="delivery">{companyLabels.industries.delivery}</option>
                  <option value="manufacturing">{companyLabels.industries.manufacturing}</option>
                  <option value="retail">{companyLabels.industries.retail}</option>
                  <option value="services">{companyLabels.industries.services}</option>
                  <option value="other">{companyLabels.industries.other}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {companyLabels.employees}
                </label>
                <input
                  type="number"
                  min="1"
                  value={localConfig.employeeCount}
                  onChange={(e) => handleConfigChange({ employeeCount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={companyLabels.employees}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {companyLabels.primaryColor}
                </label>
                <input
                  type="color"
                  value={localConfig.primaryColor}
                  onChange={(e) => handleConfigChange({ primaryColor: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  aria-label={companyLabels.primaryColor}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{companyLabels.shiftSchedule}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {companyLabels.workingHoursPerDay}
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={localConfig.workingSchedule?.workingHoursPerDay || 8}
                  onChange={(e) => handleConfigChange({
                    workingSchedule: {
                      ...localConfig.workingSchedule,
                      workingHoursPerDay: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={companyLabels.workingHoursPerDay}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {companyLabels.workingDaysPerMonth}
                </label>
                <input
                  type="number"
                  min="20"
                  max="31"
                  value={localConfig.baseSalaryStructure?.workingDaysPerMonth || 26}
                  onChange={(e) => handleConfigChange({
                    baseSalaryStructure: {
                      ...localConfig.baseSalaryStructure,
                      workingDaysPerMonth: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={companyLabels.workingDaysPerMonth}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {companyLabels.lunchBreak}
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={localConfig.workingSchedule?.lunchBreakMinutes || 30}
                  onChange={(e) => handleConfigChange({
                    workingSchedule: {
                      ...localConfig.workingSchedule,
                      lunchBreakMinutes: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={companyLabels.lunchBreak}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{getFormLabel('salary').replace('Salary', 'Salary Structure')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getFormLabel('salary').replace('Salary', 'Default Monthly Salary')} ({localConfig.baseSalaryStructure?.currencySymbol || 'Rs'})
                </label>
                <input
                  type="number"
                  min="10000"
                  value={localConfig.baseSalaryStructure?.defaultMonthlySalary || 17710}
                  onChange={(e) => handleConfigChange({
                    baseSalaryStructure: {
                      ...localConfig.baseSalaryStructure,
                      defaultMonthlySalary: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Default Monthly Salary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={localConfig.localization?.currency || 'MUR'}
                  onChange={(e) => handleConfigChange({
                    localization: {
                      ...localConfig.localization,
                      currency: e.target.value,
                      currencySymbol: e.target.value === 'MUR' ? 'Rs' : e.target.value === 'USD' ? '$' : '€'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Currency"
                >
                  <option value="MUR">Mauritian Rupee (Rs)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{getGeneralTerm('overtime')} Rules</h2>
            <div className="space-y-4">
              {Object.entries(localConfig.overtimeRules || {}).map(([key, rule]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      OT {key.replace('ot', '').replace('_', '.')} Rate
                    </h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => handleConfigChange({
                          overtimeRules: {
                            ...localConfig.overtimeRules,
                            [key]: { ...rule, enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enabled</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hourly Rate ({localConfig.baseSalaryStructure?.currencySymbol || 'Rs'})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rule.rate}
                        onChange={(e) => handleConfigChange({
                          overtimeRules: {
                            ...localConfig.overtimeRules,
                            [key]: { ...rule, rate: parseFloat(e.target.value) }
                          }
                        })}
                        disabled={!rule.enabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        aria-label={`OT ${key.replace('ot', '').replace('_', '.')} Rate`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={rule.description}
                        onChange={(e) => handleConfigChange({
                          overtimeRules: {
                            ...localConfig.overtimeRules,
                            [key]: { ...rule, description: e.target.value }
                          }
                        })}
                        disabled={!rule.enabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        aria-label={`OT ${key.replace('ot', '').replace('_', '.')} Description`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{getGeneralTerm('allowance')}s</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Meal Allowance</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.mealAllowance?.enabled || false}
                      onChange={(e) => handleConfigChange({
                        mealAllowance: {
                          ...localConfig.mealAllowance,
                          enabled: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Meal Allowance</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount ({localConfig.baseSalaryStructure?.currencySymbol || 'Rs'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={localConfig.mealAllowance?.amount || 150}
                      onChange={(e) => handleConfigChange({
                        mealAllowance: {
                          ...localConfig.mealAllowance,
                          amount: parseInt(e.target.value)
                        }
                      })}
                      disabled={!localConfig.mealAllowance?.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      aria-label="Meal Allowance Amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Hours Required
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={localConfig.mealAllowance?.minimumHours || 10}
                      onChange={(e) => handleConfigChange({
                        mealAllowance: {
                          ...localConfig.mealAllowance,
                          minimumHours: parseInt(e.target.value)
                        }
                      })}
                      disabled={!localConfig.mealAllowance?.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      aria-label="Meal Allowance Minimum Hours"
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Transport Allowance</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.transportAllowance?.enabled || false}
                      onChange={(e) => handleConfigChange({
                        transportAllowance: {
                          ...localConfig.transportAllowance,
                          enabled: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Transport Allowance</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Cap ({localConfig.baseSalaryStructure?.currencySymbol || 'Rs'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={localConfig.transportAllowance?.monthlyCap || 10000}
                      onChange={(e) => handleConfigChange({
                        transportAllowance: {
                          ...localConfig.transportAllowance,
                          monthlyCap: parseInt(e.target.value)
                        }
                      })}
                      disabled={!localConfig.transportAllowance?.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Industry Templates</h2>
            <p className="text-gray-600 mb-4">Apply pre-configured settings for your industry</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDUSTRY_TEMPLATES.map(template => (
                <div key={template.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <button
                    onClick={() => applyTemplate(template.id)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {getButtonLabel('save')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Configuration</h2>
          <p className="text-gray-600 mb-6">Enable or disable features based on your business needs</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(localConfig.features || {}).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {key === 'gpsTracking' ? 'Location-based attendance verification' :
                     key === 'qrKiosk' ? 'QR code check-in stations' :
                     key === 'aiAssistant' ? 'AI-powered workforce insights' :
                     key === 'fieldOperations' ? 'Mobile team management' :
                     'Advanced feature configuration'}
                  </p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleConfigChange({
                      features: {
                        ...localConfig.features,
                        [key]: e.target.checked
                      }
                    })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mauritius Compliance</h2>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={localConfig.mauritiusSettings?.enabled || false}
                onChange={(e) => handleConfigChange({
                  mauritiusSettings: {
                    ...localConfig.mauritiusSettings,
                    enabled: e.target.checked
                  }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable Mauritius Tax Compliance</span>
            </div>
            
            {localConfig.mauritiusSettings?.enabled && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Statutory Contributions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Employee Contributions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">NPF</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={localConfig.mauritiusSettings?.statutoryContributions?.employeeNPF?.rate || 3.0}
                            onChange={(e) => handleConfigChange({
                              mauritiusSettings: {
                                ...localConfig.mauritiusSettings,
                                statutoryContributions: {
                                  ...localConfig.mauritiusSettings?.statutoryContributions,
                                  employeeNPF: {
                                    enabled: localConfig.mauritiusSettings?.statutoryContributions?.employeeNPF?.enabled ?? true,
                                    rate: parseFloat(e.target.value)
                                  }
                                }
                              }
                            })}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                            aria-label="Employee NPF Rate (%)"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">NSF</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={localConfig.mauritiusSettings?.statutoryContributions?.employeeNSF?.rate || 2.5}
                            onChange={(e) => handleConfigChange({
                              mauritiusSettings: {
                                ...localConfig.mauritiusSettings,
                                statutoryContributions: {
                                  ...localConfig.mauritiusSettings?.statutoryContributions,
                                  employeeNSF: {
                                    enabled: localConfig.mauritiusSettings?.statutoryContributions?.employeeNSF?.enabled ?? true,
                                    rate: parseFloat(e.target.value)
                                  }
                                }
                              }
                            })}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                            aria-label="Employee NSF Rate (%)"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Employer Contributions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">NPF</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={localConfig.mauritiusSettings?.statutoryContributions?.employerNPF?.rate || 6.0}
                            onChange={(e) => handleConfigChange({
                              mauritiusSettings: {
                                ...localConfig.mauritiusSettings,
                                statutoryContributions: {
                                  ...localConfig.mauritiusSettings?.statutoryContributions,
                                  employerNPF: {
                                    ...localConfig.mauritiusSettings?.statutoryContributions?.employerNPF,
                                    rate: parseFloat(e.target.value)
                                  }
                                }
                              }
                            })}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                            aria-label="Employer NPF Rate (%)"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">NSF</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={localConfig.mauritiusSettings?.statutoryContributions?.employerNSF?.rate || 2.5}
                            onChange={(e) => handleConfigChange({
                              mauritiusSettings: {
                                ...localConfig.mauritiusSettings,
                                statutoryContributions: {
                                  ...localConfig.mauritiusSettings?.statutoryContributions,
                                  employerNSF: {
                                    ...localConfig.mauritiusSettings?.statutoryContributions?.employerNSF,
                                    rate: parseFloat(e.target.value)
                                  }
                                }
                              }
                            })}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                            aria-label="Employer NSF Rate (%)"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UI Tab */}
      {activeTab === 'ui' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Interface Customization</h2>
            <p className="text-gray-600 mb-6">
              Customize the look, feel, and terminology of your HR system to match your company culture
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Palette className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">{getButtonLabel('edit')} UI Customization</h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  {getGeneralTerm('employee')} Interface Customization. Change {getNavLabel('dashboard').toLowerCase()},
                  {getButtonLabel('save').toLowerCase()} buttons, {getFormLabel('employeeName').toLowerCase()}, colors, and terminology.
                </p>
                <button
                  onClick={() => setShowUICustomization(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {getButtonLabel('edit')} UI Customization
                </button>
              </div>

              {isCustomized && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-green-900">UI Customizations Active</h3>
                  </div>
                  <p className="text-sm text-green-700">
                    Your interface has been customized with industry-specific terminology and branding.
                  </p>
                </div>
              )}
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Customization Options</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Navigation menu labels</li>
                  <li>• Button text and terminology</li>
                  <li>• Form field labels</li>
                  <li>• Status and workflow names</li>
                  <li>• Colors and branding</li>
                  <li>• Typography and layout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UI Customization Modal */}
      {showUICustomization && (
        <UICustomizationPanel onClose={() => setShowUICustomization(false)} />
      )}
    </div>
  );
};

export default CompanySettings;