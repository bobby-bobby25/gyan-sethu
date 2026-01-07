-- Add city and state columns to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- Add city, state, and phone columns to family_members table
ALTER TABLE public.family_members 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS phone text;

-- Add city and state columns to teachers table
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- Add city and state columns to donors table
ALTER TABLE public.donors 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;