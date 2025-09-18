import React, { useState } from 'react';
import { Building2, Users, Settings, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { INDUSTRY_TEMPLATES, createCompanyConfigFromTemplate } from '../utils/industryTemplates';
import { CompanyConfiguration, IndustryTemplate } from '../types/company';

interface CompanySetupWizardProps {
  onSetupComplete: (config: CompanyConfiguration) => void;
  onSkipSetup: () => void;
}

interface SetupFormData {
  companyName: string;
  industry: string;
  employeeCount: number;
  selectedTemplate: IndustryTemplate | null;
}

const CompanySetupWizard: React.FC<CompanySetupWizardProps> = ({
  onSetupComplete,
  onSkipSetup
}) => {
  const [currentStep, setCurrentStep] = useState<'basics' | 'template' | 'features' | 'review'>('basics');
  const [formData, setFormData] = useState<SetupFormData>({
    companyName: '',
    industry: '',
    employeeCount: 50,
    selectedTemplate: null
  });

  const [customizedConfig, setCustomizedConfig] = useState<CompanyConfiguration | null>(null);

  const handleBasicsNext = () => {
    if (formData.companyName && formData.industry && formData.employeeCount > 0) {
      setCurrentStep('template');
    }
  };

  const handleTemplateSelect = (template: IndustryTemplate) => {
    setFormData({ ...formData, selectedTemplate: template });
    const config = createCompanyConfigFromTemplate(template, formData.companyName, formData.employeeCount);
    setCustomizedConfig(config);
    setCurrentStep('features');
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    if (!customizedConfig) return;
    
    setCustomizedConfig({
      ...customizedConfig,
      features: {
        ...customizedConfig.features,
        [feature]: enabled
      }
    });
  };

  const handleFinish = () => {
    if (customizedConfig) {
      onSetupComplete(customizedConfig);
    }
  };

  const renderBasicsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Building2 className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
        <p className="text-gray-600">Let's start by learning about your company</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry *
          </label>
          <select
            required
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select your industry</option>
            <option value="construction">Construction & Engineering</option>
            <option value="delivery">Delivery & Logistics</option>
            <option value="manufacturing">Manufacturing & Production</option>
            <option value="retail">Retail & Customer Service</option>
            <option value="services">Professional Services</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Employees *
          </label>
          <select
            value={formData.employeeCount}
            onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>1-10 employees</option>
            <option value={25}>11-25 employees</option>
            <option value={50}>26-50 employees</option>
            <option value={100}>51-100 employees</option>
            <option value={250}>101-250 employees</option>
            <option value={500}>251-500 employees</option>
            <option value={1000}>500+ employees</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onSkipSetup}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Skip Setup
        </button>
        <button
          onClick={handleBasicsNext}
          disabled={!formData.companyName || !formData.industry}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderTemplateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
        <p className="text-gray-600">Select a pre-configured template for your industry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INDUSTRY_TEMPLATES.filter(template => 
          formData.industry === 'other' || template.industry === formData.industry
        ).map(template => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
            <p className="text-gray-600 mb-4">{template.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Features included:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {template.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {feature}
                  </li>
                ))}
                {template.features.length > 4 && (
                  <li className="text-blue-600">+ {template.features.length - 4} more features</li>
                )}
              </ul>
            </div>
          </div>
        ))}
        
        {formData.industry === 'other' && (
          <div
            onClick={() => {
              const defaultTemplate = INDUSTRY_TEMPLATES[0];
              handleTemplateSelect({
                ...defaultTemplate,
                id: 'custom',
                name: 'Custom Configuration',
                industry: 'other',
                description: 'Start with default settings and customize as needed'
              });
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-center"
          >
            <div className="text-center">
              <Settings className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Custom Setup</h3>
              <p className="text-gray-600">Configure everything from scratch</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('basics')}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
    </div>
  );

  const renderFeaturesStep = () => {
    if (!customizedConfig) return null;

    const featureList = [
      { key: 'supervisorRoster', name: 'Advanced Scheduling', description: 'Drag-and-drop roster management' },
      { key: 'fieldOperations', name: 'Field Operations', description: 'GPS tracking and field team management' },
      { key: 'qrKiosk', name: 'QR Code Kiosks', description: 'On-site QR code check-in stations' },
      { key: 'aiAssistant', name: 'AI Assistant', description: 'AI-powered workforce insights' },
      { key: 'advancedReporting', name: 'Advanced Reports', description: 'Custom reports and analytics' },
      { key: 'gpsTracking', name: 'GPS Verification', description: 'Location-verified attendance' },
      { key: 'photographicVerification', name: 'Photo Verification', description: 'Camera-based attendance verification' },
      { key: 'shiftSwapping', name: 'Shift Swapping', description: 'Employee-initiated shift exchanges' },
      { key: 'performanceBonuses', name: 'Performance Bonuses', description: 'Automated bonus calculations' }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Features</h2>
          <p className="text-gray-600">Enable the features you need for {formData.companyName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureList.map(feature => (
            <div key={feature.key} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{feature.name}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <label className="flex items-center ml-4">
                  <input
                    type="checkbox"
                    checked={customizedConfig.features[feature.key as keyof CompanyConfiguration['features']]}
                    onChange={(e) => handleFeatureToggle(feature.key, e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Template Configuration Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Base Salary:</strong> {customizedConfig.baseSalaryStructure.currencySymbol}{customizedConfig.baseSalaryStructure.defaultMonthlySalary.toLocaleString()}/month</p>
              <p><strong>Standard Hours:</strong> {customizedConfig.baseSalaryStructure.standardWorkingHours}h/day</p>
              <p><strong>Working Days:</strong> {customizedConfig.baseSalaryStructure.workingDaysPerMonth}/month</p>
            </div>
            <div>
              <p><strong>Meal Allowance:</strong> {customizedConfig.mealAllowance.enabled ? `${customizedConfig.baseSalaryStructure.currencySymbol}${customizedConfig.mealAllowance.amount}` : 'Disabled'}</p>
              <p><strong>Transport:</strong> {customizedConfig.transportAllowance.enabled ? `${customizedConfig.transportAllowance.categories.length} categories` : 'Disabled'}</p>
              <p><strong>Leave Types:</strong> {customizedConfig.leaveTypes.length} configured</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('template')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={() => setCurrentStep('review')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Review Setup
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    if (!customizedConfig || !formData.selectedTemplate) return null;

    const enabledFeatures = Object.entries(customizedConfig.features)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete</h2>
          <p className="text-gray-600">Review your configuration before launching</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Company Details</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Name:</strong> {formData.companyName}</p>
                  <p><strong>Industry:</strong> {formData.selectedTemplate.name}</p>
                  <p><strong>Employee Count:</strong> {formData.employeeCount}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Payroll Configuration</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Base Salary:</strong> {customizedConfig.baseSalaryStructure.currencySymbol}{customizedConfig.baseSalaryStructure.defaultMonthlySalary.toLocaleString()}</p>
                  <p><strong>Working Days:</strong> {customizedConfig.baseSalaryStructure.workingDaysPerMonth}/month</p>
                  <p><strong>Standard Hours:</strong> {customizedConfig.baseSalaryStructure.standardWorkingHours}/day</p>
                  <p><strong>Overtime Rates:</strong> OT1.5 at {customizedConfig.baseSalaryStructure.currencySymbol}{customizedConfig.overtimeRules.ot1_5.rate}/hr</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Enabled Features</h4>
                <div className="mt-2 space-y-1">
                  {enabledFeatures.slice(0, 8).map(feature => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-sm text-gray-600 capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </div>
                  ))}
                  {enabledFeatures.length > 8 && (
                    <p className="text-sm text-blue-600">+ {enabledFeatures.length - 8} more features</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Leave Types</h4>
                <div className="mt-2 space-y-1">
                  {customizedConfig.leaveTypes.slice(0, 5).map(leaveType => (
                    <div key={leaveType.id} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-sm text-gray-600">
                        {leaveType.name} {leaveType.isPaid ? '(Paid)' : '(Unpaid)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">🚀 You're Ready to Launch!</h3>
          <p className="text-sm text-green-700">
            Your HR system is configured for {formData.selectedTemplate.name.toLowerCase()}. 
            You can always modify these settings later in the Company Settings page.
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('features')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Launch {formData.companyName}
            <CheckCircle size={16} />
          </button>
        </div>
      </div>
    );
  };

  const steps = [
    { id: 'basics', title: 'Company Info', completed: currentStep !== 'basics' },
    { id: 'template', title: 'Industry Template', completed: !['basics', 'template'].includes(currentStep) },
    { id: 'features', title: 'Features', completed: !['basics', 'template', 'features'].includes(currentStep) },
    { id: 'review', title: 'Review', completed: currentStep === 'review' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.completed ? 'bg-blue-600 border-blue-600 text-white' :
                  currentStep === step.id ? 'border-blue-600 text-blue-600' :
                  'border-gray-300 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle size={16} /> : index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.completed || currentStep === step.id ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 'basics' && renderBasicsStep()}
          {currentStep === 'template' && renderTemplateStep()}
          {currentStep === 'features' && renderFeaturesStep()}
          {currentStep === 'review' && renderReviewStep()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Customizable HR Workforce Management Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanySetupWizard;