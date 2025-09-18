-- Migration to create employees table

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  hired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id),
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaves table
CREATE TABLE IF NOT EXISTS public.leaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_imports table for bulk import tracking
CREATE TABLE IF NOT EXISTS public.employee_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_by UUID,
  file_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  result TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_imports ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Employees select" ON public.employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employees insert" ON public.employees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Employees update" ON public.employees
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Employees delete" ON public.employees
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for other tables
CREATE POLICY "Attendance all" ON public.attendance
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Leaves all" ON public.leaves
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Locations all" ON public.locations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for employee_imports table with service role bypass
CREATE POLICY "Employee imports select" ON public.employee_imports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employee imports insert" ON public.employee_imports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Employee imports update" ON public.employee_imports
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Employee imports delete" ON public.employee_imports
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow service role to bypass RLS for employee_imports
CREATE POLICY "Service role bypass employee_imports" ON public.employee_imports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow service role to bypass RLS for employees
CREATE POLICY "Service role bypass employees" ON public.employees
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
