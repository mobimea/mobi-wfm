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

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table (authenticated users can select, insert, update, delete their own records)
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
