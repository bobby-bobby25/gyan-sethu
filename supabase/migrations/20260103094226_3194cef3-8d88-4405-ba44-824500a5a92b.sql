-- Add gender, date_of_birth, and notes columns to teachers table
ALTER TABLE public.teachers
ADD COLUMN gender text,
ADD COLUMN date_of_birth date,
ADD COLUMN notes text;