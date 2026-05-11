-- Supabase Storage Configuration
-- Run this SQL in Supabase SQL Editor to set up storage buckets

-- Create storage buckets with policies

-- 1. Uploads bucket (for test artifacts)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,
  52428800, -- 50MB
  ARRAY['text/plain', 'text/log', 'application/json', 'application/xml', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/xhtml+xml', 'application/trace+json']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Screenshots bucket (for failure screenshots)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screenshots',
  'screenshots',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Exports bucket (for reports)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  false,
  104857600, -- 100MB
  ARRAY['application/pdf', 'application/json', 'text/csv', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies

-- Uploads bucket policies
CREATE POLICY "Users can upload to uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Screenshots bucket policies (public read)
CREATE POLICY "Anyone can view screenshots"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'screenshots');

CREATE POLICY "Users can upload screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Exports bucket policies
CREATE POLICY "Users can manage their exports"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'exports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Helper function to get folder name from path
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[] AS $$
  SELECT string_to_array(name, '/');
$$ LANGUAGE SQL STABLE;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;