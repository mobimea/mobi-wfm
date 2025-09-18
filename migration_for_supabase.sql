-- Employee Management System Tables and Policies Migration

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.employee_imports (
  id BIGSERIAL PRIMARY KEY,
  uploaded_by UUID REFERENCES auth.users(id),
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending' -- pending, validated, completed
);

CREATE TABLE IF NOT EXISTS public.payslips (
  id BIGSERIAL PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  month INT CHECK (month BETWEEN 1 AND 12),
  year INT CHECK (year >= 2020),
  basic_salary NUMERIC(12,2),
  allowances NUMERIC(12,2),
  deductions NUMERIC(12,2),
  net_pay NUMERIC(12,2) GENERATED ALWAYS AS (basic_salary + allowances - deductions) STORED,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leaves (
  id BIGSERIAL PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  type TEXT CHECK (type IN ('vacation','emergency','local','paid_local','paid_sick','unpaid','unpaid_sick')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  total_hours NUMERIC(5,2),
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  reason TEXT,
  salary_deduction NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
  id BIGSERIAL PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  year INT NOT NULL,
  vacation_days INT DEFAULT 0,
  emergency_days INT DEFAULT 0,
  local_days INT DEFAULT 0,
  paid_local INT DEFAULT 0,
  paid_sick INT DEFAULT 0,
  carried_over INT DEFAULT 0,
  encashed INT DEFAULT 0,
  taken INT DEFAULT 0
);

-- Enable Row Level Security on new tables
ALTER TABLE public.employee_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leave_balances ENABLE ROW LEVEL SECURITY;

-- Policies for employee_imports
DROP POLICY IF EXISTS "Allow admins to manage employee_imports" ON public.employee_imports;
CREATE POLICY "Allow admins to manage employee_imports" ON public.employee_imports
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies for payslips
DROP POLICY IF EXISTS "Allow employees to view own payslips" ON public.payslips;
CREATE POLICY "Allow employees to view own payslips" ON public.payslips
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid());

DROP POLICY IF EXISTS "Allow admins to manage payslips" ON public.payslips;
CREATE POLICY "Allow admins to manage payslips" ON public.payslips
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies for leaves
DROP POLICY IF EXISTS "Allow employees to manage own leaves" ON public.leaves;
CREATE POLICY "Allow employees to manage own leaves" ON public.leaves
  FOR ALL TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

DROP POLICY IF EXISTS "Allow managers and admins to manage leaves" ON public.leaves;
CREATE POLICY "Allow managers and admins to manage leaves" ON public.leaves
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'supervisor'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'supervisor'));

-- Policies for employee_leave_balances
DROP POLICY IF EXISTS "Allow employees to view own leave balances" ON public.employee_leave_balances;
CREATE POLICY "Allow employees to view own leave balances" ON public.employee_leave_balances
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid());

DROP POLICY IF EXISTS "Allow admins to manage leave balances" ON public.employee_leave_balances;
CREATE POLICY "Allow admins to manage leave balances" ON public.employee_leave_balances
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create storage buckets for employee uploads and payslips
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('employee_uploads', 'employee_uploads', false),
  ('payslips', 'payslips', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for employee_uploads bucket
DROP POLICY IF EXISTS "Allow admins to upload employee files" ON storage.objects;
CREATE POLICY "Allow admins to upload employee files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'employee_uploads' AND auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Allow admins to view employee files" ON storage.objects;
CREATE POLICY "Allow admins to view employee files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'employee_uploads' AND auth.jwt() ->> 'role' = 'admin');

-- Storage policies for payslips bucket
DROP POLICY IF EXISTS "Allow admins to manage payslip files" ON storage.objects;
CREATE POLICY "Allow admins to manage payslip files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'payslips' AND auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (bucket_id = 'payslips' AND auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Allow employees to view own payslip files" ON storage.objects;
CREATE POLICY "Allow employees to view own payslip files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payslips');
