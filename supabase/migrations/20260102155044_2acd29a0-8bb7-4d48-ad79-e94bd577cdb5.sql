-- Add new columns to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS ambition text,
ADD COLUMN IF NOT EXISTS hobbies text[],
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS photo_url text;

-- Create ambitions master table
CREATE TABLE IF NOT EXISTS public.ambitions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for ambitions
ALTER TABLE public.ambitions ENABLE ROW LEVEL SECURITY;

-- RLS policies for ambitions
CREATE POLICY "Authenticated users can read ambitions" 
ON public.ambitions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage ambitions" 
ON public.ambitions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create hobbies master table
CREATE TABLE IF NOT EXISTS public.hobbies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for hobbies
ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;

-- RLS policies for hobbies
CREATE POLICY "Authenticated users can read hobbies" 
ON public.hobbies 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage hobbies" 
ON public.hobbies 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create cities master table
CREATE TABLE IF NOT EXISTS public.cities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  state text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for cities
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- RLS policies for cities
CREATE POLICY "Authenticated users can read cities" 
ON public.cities 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage cities" 
ON public.cities 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create student_documents table for attachments
CREATE TABLE IF NOT EXISTS public.student_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for student_documents
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_documents
CREATE POLICY "Admin and management can read student documents" 
ON public.student_documents 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'management'::app_role));

CREATE POLICY "Admins can manage student documents" 
ON public.student_documents 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for student files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-files', 'student-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for student files bucket
CREATE POLICY "Anyone can view student files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'student-files');

CREATE POLICY "Admins can upload student files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'student-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update student files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'student-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete student files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'student-files' AND has_role(auth.uid(), 'admin'::app_role));

-- Insert some common ambitions
INSERT INTO public.ambitions (name) VALUES
  ('Doctor'),
  ('Engineer'),
  ('Teacher'),
  ('Police Officer'),
  ('Scientist'),
  ('Artist'),
  ('Musician'),
  ('Lawyer'),
  ('Business Owner'),
  ('Government Officer'),
  ('Nurse'),
  ('Athlete'),
  ('Social Worker'),
  ('Farmer'),
  ('Other')
ON CONFLICT DO NOTHING;

-- Insert some common hobbies
INSERT INTO public.hobbies (name) VALUES
  ('Reading'),
  ('Sports'),
  ('Music'),
  ('Dance'),
  ('Art & Drawing'),
  ('Cooking'),
  ('Gardening'),
  ('Photography'),
  ('Gaming'),
  ('Writing'),
  ('Crafts'),
  ('Swimming'),
  ('Cycling'),
  ('Yoga'),
  ('Other')
ON CONFLICT DO NOTHING;

-- Insert major Indian states and cities
INSERT INTO public.cities (name, state) VALUES
  ('Mumbai', 'Maharashtra'),
  ('Pune', 'Maharashtra'),
  ('Nagpur', 'Maharashtra'),
  ('Thane', 'Maharashtra'),
  ('Delhi', 'Delhi'),
  ('New Delhi', 'Delhi'),
  ('Bangalore', 'Karnataka'),
  ('Mysore', 'Karnataka'),
  ('Chennai', 'Tamil Nadu'),
  ('Coimbatore', 'Tamil Nadu'),
  ('Hyderabad', 'Telangana'),
  ('Kolkata', 'West Bengal'),
  ('Ahmedabad', 'Gujarat'),
  ('Surat', 'Gujarat'),
  ('Jaipur', 'Rajasthan'),
  ('Lucknow', 'Uttar Pradesh'),
  ('Kanpur', 'Uttar Pradesh'),
  ('Patna', 'Bihar'),
  ('Bhopal', 'Madhya Pradesh'),
  ('Indore', 'Madhya Pradesh'),
  ('Chandigarh', 'Punjab'),
  ('Ludhiana', 'Punjab'),
  ('Kochi', 'Kerala'),
  ('Thiruvananthapuram', 'Kerala'),
  ('Bhubaneswar', 'Odisha'),
  ('Guwahati', 'Assam'),
  ('Ranchi', 'Jharkhand'),
  ('Raipur', 'Chhattisgarh'),
  ('Dehradun', 'Uttarakhand'),
  ('Shimla', 'Himachal Pradesh')
ON CONFLICT DO NOTHING;

-- Add trigger for updated_at on student_documents
CREATE TRIGGER update_student_documents_updated_at
BEFORE UPDATE ON public.student_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();