-- =============================================
-- STORAGE BUCKET POLICIES FOR 'images' BUCKET
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;

-- Allow public to read all images
CREATE POLICY "Public can read images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow anyone to upload images (admin validation in app)
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Allow anyone to update images (admin validation in app)
CREATE POLICY "Anyone can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Allow anyone to delete images (admin validation in app)
CREATE POLICY "Anyone can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');
