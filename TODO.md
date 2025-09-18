# UI Customization Integration Plan

## Overview
Fix hardcoded UI text in CompanySettings.tsx and implement proper save/reset functionality in UICustomizationPanel.tsx by integrating with the existing useUICustomization hook.

## Problems Identified
1. **CompanySettings.tsx (6 problems)**:
   - Hardcoded tab labels ("Company Info", "Payroll & Overtime", etc.)
   - Hardcoded button text ("Save Changes", "Reset", "Export")
   - Hardcoded form labels ("Company Name", "Industry", etc.)
   - Hardcoded section headers ("Basic Information", "Working Schedule", etc.)
   - Hardcoded descriptions and status text
   - Hardcoded feature descriptions

2. **UICustomizationPanel.tsx (4 problems)**:
   - Local state instead of global useUICustomization hook
   - Placeholder save handler with console.log
   - Placeholder reset handler with console.log
   - TODO comments in handlers

## Solution Steps

### Phase 1: Update CompanySettings.tsx
1. Import and use customization labels from useUICustomization hook
2. Replace hardcoded tab labels with getNavLabel() calls
3. Replace hardcoded button text with getButtonLabel() calls
4. Replace hardcoded form labels with getFormLabel() calls
5. Replace hardcoded section headers with customized text
6. Replace hardcoded descriptions with customized content

### Phase 2: Update UICustomizationPanel.tsx
1. Remove local state for labels and branding
2. Use global useUICustomization hook
3. Implement proper save functionality using updateLabels() and updateBranding()
4. Implement proper reset functionality using resetToDefault()
5. Remove console.log statements and TODO comments
6. Add success feedback for save/reset operations

### Phase 3: Testing and Validation
1. Verify customization changes persist to localStorage
2. Verify CompanySettings.tsx reflects customization changes
3. Verify save/reset functionality works correctly
4. Test end-to-end customization workflow

## Files to Edit
- `src/components/CompanySettings.tsx`
- `src/components/UICustomizationPanel.tsx`

## Dependencies
- `src/hooks/useUICustomization.ts` (already implemented)
- `src/types/uiCustomization.ts` (already implemented)
- `src/utils/uiTemplates.ts` (for CSS generation, already implemented)

## Expected Outcome
- All hardcoded UI text replaced with customizable labels
- Proper save/reset functionality with persistence
- Seamless integration between customization panel and UI components
- Dynamic CSS application for branding changes
