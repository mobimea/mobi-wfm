-- Migration for employee_imports, payslips, leaves, employee_leave_balances tables

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
CREATE POLICY "Allow admins to manage employee_imports" ON public.employee_imports
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies for payslips
CREATE POLICY "Allow employees to view own payslips" ON public.payslips
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Allow admins to manage payslips" ON public.payslips
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies for leaves
CREATE POLICY "Allow employees to manage own leaves" ON public.leaves
  FOR ALL TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Allow managers and admins to manage leaves" ON public.leaves
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'supervisor'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'supervisor'));

-- Policies for employee_leave_balances
CREATE POLICY "Allow employees to view own leave balances" ON public.employee_leave_balances
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Allow admins to manage leave balances" ON public.employee_leave_balances
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
