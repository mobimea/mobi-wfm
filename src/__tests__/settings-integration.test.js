// Simple test script to verify settings functionality
import { SettingsService } from './src/lib/settings-service.ts';
import { DatabaseService } from './src/lib/supabase.ts';

async function testSettings() {
  console.log('Testing Settings Service...');

  try {
    // Test system settings
    console.log('Testing system settings...');
    const systemSettings = await SettingsService.fetchSystemSettings();
    console.log('System settings result:', systemSettings);

    // Test security settings
    console.log('Testing security settings...');
    const securitySettings = await SettingsService.fetchSecuritySettings();
    console.log('Security settings result:', securitySettings);

    // Test notification settings
    console.log('Testing notification settings...');
    const notificationSettings = await SettingsService.fetchNotificationSettings();
    console.log('Notification settings result:', notificationSettings);

    // Test audit logs
    console.log('Testing audit logs...');
    const auditLogs = await SettingsService.fetchAuditLogs();
    console.log('Audit logs result:', auditLogs);

    // Test company configurations
    console.log('Testing company configurations...');
    const companyConfigs = await SettingsService.fetchCompanyConfigurations();
    console.log('Company configurations result:', companyConfigs);

    console.log('All settings tests completed successfully!');
  } catch (error) {
    console.error('Settings test failed:', error);
  }
}

testSettings();
