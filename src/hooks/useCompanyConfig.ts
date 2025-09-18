import { useState, useEffect } from 'react';
import { CompanyConfiguration } from '../types/company';
import { INDUSTRY_TEMPLATES, createCompanyConfigFromTemplate } from '../utils/industryTemplates';
import { initializePayrollCalculator } from '../utils/dynamicPayroll';

const STORAGE_KEY = 'hr_company_config';

const getDefaultConfig = (): CompanyConfiguration => {
  // Default configuration for new companies
  const mauritiusTemplate = INDUSTRY_TEMPLATES.find(t => t.id === 'mauritius_standard') || INDUSTRY_TEMPLATES[0];
  return createCompanyConfigFromTemplate(
    mauritiusTemplate,
    'Demo Company',
    50
  );
};

export const useCompanyConfig = () => {
  const [config, setConfig] = useState<CompanyConfiguration>(() => getDefaultConfig());
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  // Initialize payroll calculator when config changes
  useEffect(() => {
    if (config) {
      try {
        initializePayrollCalculator(config);
      } catch (error) {
        console.warn('Failed to initialize payroll calculator:', error);
      }
    }
  }, [config]);

  const loadConfig = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        setConfig(parsedConfig);
        setIsFirstTimeSetup(false);
      } else {
        setIsFirstTimeSetup(true);
      }
    } catch (error) {
      console.error('Error loading company config:', error);
      setIsFirstTimeSetup(true);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (newConfig: CompanyConfiguration) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
      setIsFirstTimeSetup(false);
    } catch (error) {
      console.error('Error saving company config:', error);
    }
  };

  const resetConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const defaultConfig = getDefaultConfig();
      setConfig(defaultConfig);
      setIsFirstTimeSetup(true);
    } catch (error) {
      console.error('Error resetting company config:', error);
    }
  };

  const skipFirstTimeSetup = () => {
    setIsFirstTimeSetup(false);
    updateConfig(config);
  };

  return {
    config,
    updateConfig,
    resetConfig,
    isFirstTimeSetup,
    skipFirstTimeSetup,
    loading
  };
};