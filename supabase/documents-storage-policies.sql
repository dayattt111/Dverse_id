-- =============================================
-- STORAGE BUCKET POLICIES FOR 'documents' BUCKET
-- =============================================
-- This bucket is used for PDF files: KTM, proposals, etc.

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete documents" ON storage.objects;

-- Allow public to read all documents
CREATE POLICY "Public can read documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Allow anyone to upload documents (no auth required for public registration)
CREATE POLICY "Anyone can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

-- Allow anyone to update documents (for admin validation in app)
CREATE POLICY "Anyone can update documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users (admin) to delete documents
CREATE POLICY "Admin delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
