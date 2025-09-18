-- Fix RLS policy for employee_imports to allow admins to insert rows

DROP POLICY IF EXISTS "Allow admins to manage employee_imports" ON public.employee_imports;

CREATE POLICY "Allow admins to select employee_imports" ON public.employee_imports
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admins to insert employee_imports" ON public.employee_imports
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' AND uploaded_by = auth.uid());

CREATE POLICY "Allow admins to update employee_imports" ON public.employee_imports
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admins to delete employee_imports" ON public.employee_imports
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
