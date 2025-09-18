-- Create settings tables for admin configuration
-- This migration creates tables for system settings, security settings, notifications, audit logs, and company configurations

-- System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  currency VARCHAR(3) DEFAULT 'MUR',
  timezone VARCHAR(50) DEFAULT 'Indian/Mauritius',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  language VARCHAR(10) DEFAULT 'en',
  gps_accuracy INTEGER DEFAULT 10,
  photo_quality VARCHAR(20) DEFAULT 'high',
  session_timeout INTEGER DEFAULT 30,
  auto_backup BOOLEAN DEFAULT true,
  backup_frequency VARCHAR(20) DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Settings Table
CREATE TABLE IF NOT EXISTS public.security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  max_login_attempts INTEGER DEFAULT 5,
  password_expiry INTEGER DEFAULT 90,
  two_factor_auth BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 30,
  password_complexity BOOLEAN DEFAULT true,
  audit_logging BOOLEAN DEFAULT true,
  email_on_login BOOLEAN DEFAULT false,
  lockout_duration INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  webhook_enabled BOOLEAN DEFAULT false,
  smtp_host VARCHAR(255),
  smtp_port INTEGER DEFAULT 587,
  smtp_user VARCHAR(255),
  smtp_password VARCHAR(255),
  webhook_url VARCHAR(500),
  notify_on_leave BOOLEAN DEFAULT true,
  notify_on_late_arrival BOOLEAN DEFAULT true,
  notify_on_absence BOOLEAN DEFAULT true,
  notify_on_overtime BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_email VARCHAR(255) DEFAULT 'admin@demo',
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  success BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Configurations Table (JSON storage for complex configurations)
CREATE TABLE IF NOT EXISTS public.company_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) DEFAULT 'other',
  employee_count INTEGER DEFAULT 0,
  primary_color VARCHAR(7) DEFAULT '#007bff',
  configuration JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_name)
);

-- Insert default settings
INSERT INTO public.system_settings DEFAULT VALUES;
INSERT INTO public.security_settings DEFAULT VALUES;
INSERT INTO public.notification_settings DEFAULT VALUES;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_company_configurations_company_name ON public.company_configurations(company_name);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for settings tables (admin only access)
CREATE POLICY "System settings admin access" ON public.system_settings
  FOR ALL TO authenticated
  USING ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Security settings admin access" ON public.security_settings
  FOR ALL TO authenticated
  USING ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Notification settings admin access" ON public.notification_settings
  FOR ALL TO authenticated
  USING ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Audit logs admin access" ON public.audit_logs
  FOR ALL TO authenticated
  USING ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Company configurations admin access" ON public.company_configurations
  FOR ALL TO authenticated
  USING ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt())::jsonb ->> 'role' = 'admin' OR (auth.jwt())::jsonb -> 'user_metadata' ->> 'role' = 'admin');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at BEFORE UPDATE ON public.security_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_configurations_updated_at BEFORE UPDATE ON public.company_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
