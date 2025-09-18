import { useState, useEffect } from 'react';
import { CustomizableUILabels, BrandingCustomization, UICustomizationState } from '../types/uiCustomization';
import { DEFAULT_UI_LABELS, DEFAULT_BRANDING } from '../types/uiCustomization';
import { getUITemplate, applyUITemplate, generateCustomCSS, INDUSTRY_UI_TEMPLATES } from '../utils/uiTemplates';

const STORAGE_KEY = 'hr_ui_customization';

export const useUICustomization = () => {
  const [customization, setCustomization] = useState<UICustomizationState>({
    labels: DEFAULT_UI_LABELS,
    branding: DEFAULT_BRANDING,
    customizations: {},
    isCustomized: false,
    lastModified: new Date().toISOString()
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomization();
  }, []);

  // Apply CSS variables when branding changes
  useEffect(() => {
    const styleElement = document.getElementById('dynamic-theme');
    if (styleElement) {
      styleElement.remove();
    }
    
    const newStyleElement = document.createElement('style');
    newStyleElement.id = 'dynamic-theme';
    newStyleElement.textContent = generateCustomCSS(customization.branding);
    document.head.appendChild(newStyleElement);
  }, [customization.branding]);

  const loadCustomization = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedCustomization = JSON.parse(stored);
        setCustomization(parsedCustomization);
      }
    } catch (error) {
      console.error('Error loading UI customization:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLabels = (newLabels: Partial<CustomizableUILabels>) => {
    const updatedCustomization = {
      ...customization,
      labels: { ...customization.labels, ...newLabels },
      isCustomized: true,
      lastModified: new Date().toISOString()
    };
    
    setCustomization(updatedCustomization);
    saveCustomization(updatedCustomization);
  };

  const updateBranding = (newBranding: Partial<BrandingCustomization>) => {
    const updatedCustomization = {
      ...customization,
      branding: { ...customization.branding, ...newBranding },
      isCustomized: true,
      lastModified: new Date().toISOString()
    };
    
    setCustomization(updatedCustomization);
    saveCustomization(updatedCustomization);
  };

  const applyTemplate = (templateId: string) => {
    const template = INDUSTRY_UI_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Apply template labels directly
    const newLabels = {
      ...customization.labels,
      mainNavigation: { ...customization.labels.mainNavigation, ...(template.labels.mainNavigation || {}) },
      formLabels: { ...customization.labels.formLabels, ...(template.labels.formLabels || {}) },
      statusLabels: { ...customization.labels.statusLabels, ...(template.labels.statusLabels || {}) },
      generalTerms: { ...customization.labels.generalTerms, ...(template.labels.generalTerms || {}) }
    };
    
    // Apply template branding if available
    const newBranding = template.branding ? {
      ...customization.branding,
      colorTheme: { ...customization.branding.colorTheme, ...(template.branding.colorTheme || {}) }
    } : customization.branding;

    const updatedCustomization = {
      ...customization,
      labels: newLabels,
      branding: newBranding,
      activeTemplate: templateId,
      isCustomized: true,
      lastModified: new Date().toISOString()
    };
    
    setCustomization(updatedCustomization);
    saveCustomization(updatedCustomization);
  };

  const resetToDefault = () => {
    const defaultCustomization = {
      labels: DEFAULT_UI_LABELS,
      branding: DEFAULT_BRANDING,
      customizations: {},
      isCustomized: false,
      lastModified: new Date().toISOString()
    };
    
    setCustomization(defaultCustomization);
    saveCustomization(defaultCustomization);
  };

  const saveCustomization = (customizationToSave: UICustomizationState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customizationToSave));
    } catch (error) {
      console.error('Error saving UI customization:', error);
    }
  };

  // Helper functions to get specific labels
  const getLabel = (category: keyof CustomizableUILabels, key: string): string => {
    const categoryLabels = customization.labels[category] as Record<string, string>;
    return categoryLabels?.[key] || key;
  };

  const getNavLabel = (key: keyof CustomizableUILabels['mainNavigation']): string => {
    return customization.labels.mainNavigation[key];
  };

  const getButtonLabel = (key: keyof CustomizableUILabels['buttons']): string => {
    return customization.labels.buttons[key];
  };

  const getFormLabel = (key: keyof CustomizableUILabels['formLabels']): string => {
    return customization.labels.formLabels[key];
  };

  const getStatusLabel = (key: keyof CustomizableUILabels['statusLabels']): string => {
    return customization.labels.statusLabels[key];
  };

  const getGeneralTerm = (key: keyof CustomizableUILabels['generalTerms']): string => {
    return customization.labels.generalTerms[key];
  };

  return {
    customization,
    loading,
    updateLabels,
    updateBranding,
    applyTemplate,
    resetToDefault,
    
    // Helper functions
    getLabel,
    getNavLabel,
    getButtonLabel,
    getFormLabel,
    getStatusLabel,
    getGeneralTerm,
    
    // Quick access to current values
    labels: customization.labels,
    branding: customization.branding,
    isCustomized: customization.isCustomized
  };
};