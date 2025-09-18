-- Create storage bucket for employee uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee_uploads', 'employee_uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'employee_uploads');

-- Create policy to allow public read access to uploaded files
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'employee_uploads');

-- Create policy to allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'employee_uploads');
