-- Add photo_url, gender, and notes to family_members
ALTER TABLE public.family_members 
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS notes text;

-- Add notes to clusters
ALTER TABLE public.clusters 
ADD COLUMN IF NOT EXISTS notes text;

-- Add photo_url to teachers
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS photo_url text;