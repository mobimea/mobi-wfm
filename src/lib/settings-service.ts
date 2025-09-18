import { DatabaseService } from './supabase';

export class SettingsService {
  // System Settings
  static async fetchSystemSettings() {
    return await DatabaseService.fetchSystemSettings();
  }

  static async updateSystemSettings(settings: any) {
    return await DatabaseService.updateSystemSettings(settings);
  }

  // Security Settings
  static async fetchSecuritySettings() {
    return await DatabaseService.fetchSecuritySettings();
  }

  static async updateSecuritySettings(settings: any) {
    return await DatabaseService.updateSecuritySettings(settings);
  }

  // Notification Settings
  static async fetchNotificationSettings() {
    return await DatabaseService.fetchNotificationSettings();
  }

  static async updateNotificationSettings(settings: any) {
    return await DatabaseService.updateNotificationSettings(settings);
  }

  // Audit Logs
  static async fetchAuditLogs(limit: number = 1000) {
    return await DatabaseService.fetchAuditLogs(limit);
  }

  static async insertAuditLog(log: { action: string; details: string; success?: boolean; ip_address?: string }) {
    return await DatabaseService.insertAuditLog(log);
  }

  static async clearAuditLogs() {
    return await DatabaseService.clearAuditLogs();
  }

  // Company Configurations
  static async fetchCompanyConfigurations() {
    return await DatabaseService.fetchCompanyConfigurations();
  }

  static async fetchCompanyConfiguration(companyName: string) {
    return await DatabaseService.fetchCompanyConfiguration(companyName);
  }

  static async insertCompanyConfiguration(config: any) {
    return await DatabaseService.insertCompanyConfiguration(config);
  }

  static async updateCompanyConfiguration(id: string, config: any) {
    return await DatabaseService.updateCompanyConfiguration(id, config);
  }

  static async deleteCompanyConfiguration(id: string) {
    return await DatabaseService.deleteCompanyConfiguration(id);
  }
}
