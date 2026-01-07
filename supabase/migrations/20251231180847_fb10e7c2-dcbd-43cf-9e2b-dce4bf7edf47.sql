-- =============================================
-- MASTER/REFERENCE TABLES
-- =============================================

-- Academic Years
CREATE TABLE public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ID Proof Types
CREATE TABLE public.id_proof_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Caste Categories
CREATE TABLE public.caste_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Attendance Status Types
CREATE TABLE public.attendance_status_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payment Modes
CREATE TABLE public.payment_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- CORE TABLES
-- =============================================

-- Programs
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Clusters (Teaching Centers)
CREATE TABLE public.clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  geo_radius_meters INTEGER DEFAULT 200,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Teachers
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  id_proof_type_id UUID REFERENCES public.id_proof_types(id),
  id_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Teacher Role Type
CREATE TYPE public.teacher_role AS ENUM ('main', 'backup');

-- Teacher Program Assignments (per academic year)
CREATE TABLE public.teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  cluster_id UUID NOT NULL REFERENCES public.clusters(id),
  program_id UUID NOT NULL REFERENCES public.programs(id),
  role teacher_role NOT NULL DEFAULT 'backup',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (teacher_id, academic_year_id, cluster_id, program_id)
);

-- Students
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code TEXT UNIQUE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  id_proof_type_id UUID REFERENCES public.id_proof_types(id),
  id_number TEXT,
  address TEXT,
  caste_id UUID REFERENCES public.caste_categories(id),
  enrolled_at DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Student Academic Records (yearly data)
CREATE TABLE public.student_academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  cluster_id UUID NOT NULL REFERENCES public.clusters(id),
  program_id UUID NOT NULL REFERENCES public.programs(id),
  school_name TEXT,
  class_grade TEXT,
  attendance_percentage DECIMAL(5, 2),
  result_percentage DECIMAL(5, 2),
  yearly_fees DECIMAL(10, 2),
  remarks TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (student_id, academic_year_id, program_id)
);

-- Family Members
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE,
  id_proof_type_id UUID REFERENCES public.id_proof_types(id),
  id_number TEXT,
  address TEXT,
  occupation TEXT,
  annual_income DECIMAL(12, 2),
  currency TEXT DEFAULT 'INR',
  bank_name TEXT,
  bank_account_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Attendance Records
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  cluster_id UUID NOT NULL REFERENCES public.clusters(id),
  program_id UUID NOT NULL REFERENCES public.programs(id),
  attendance_date DATE NOT NULL,
  status_id UUID NOT NULL REFERENCES public.attendance_status_types(id),
  marked_by_teacher_id UUID REFERENCES public.teachers(id),
  marked_by_user_id UUID REFERENCES auth.users(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (student_id, program_id, cluster_id, attendance_date)
);

-- Donors
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_code TEXT UNIQUE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  id_proof_type_id UUID REFERENCES public.id_proof_types(id),
  id_number TEXT,
  address TEXT,
  company TEXT,
  phone TEXT,
  email TEXT,
  donor_type TEXT DEFAULT 'adhoc', -- 'regular', 'csr', 'adhoc'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Donations
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_mode_id UUID REFERENCES public.payment_modes(id),
  reference_number TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit Log for tracking changes
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_cluster ON public.teacher_assignments(cluster_id);
CREATE INDEX idx_teacher_assignments_program ON public.teacher_assignments(program_id);
CREATE INDEX idx_teacher_assignments_year ON public.teacher_assignments(academic_year_id);

CREATE INDEX idx_students_code ON public.students(student_code);
CREATE INDEX idx_student_records_student ON public.student_academic_records(student_id);
CREATE INDEX idx_student_records_cluster ON public.student_academic_records(cluster_id);
CREATE INDEX idx_student_records_program ON public.student_academic_records(program_id);
CREATE INDEX idx_student_records_year ON public.student_academic_records(academic_year_id);

CREATE INDEX idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_attendance_cluster ON public.attendance_records(cluster_id);
CREATE INDEX idx_attendance_program ON public.attendance_records(program_id);
CREATE INDEX idx_attendance_teacher ON public.attendance_records(marked_by_teacher_id);

CREATE INDEX idx_donations_donor ON public.donations(donor_id);
CREATE INDEX idx_donations_date ON public.donations(donation_date);

CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at ON public.audit_logs(changed_at);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_proof_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_status_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - MASTER DATA (Read by all authenticated)
-- =============================================

-- Academic Years
CREATE POLICY "Authenticated users can read academic years"
ON public.academic_years FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admins can manage academic years"
ON public.academic_years FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ID Proof Types
CREATE POLICY "Authenticated users can read id proof types"
ON public.id_proof_types FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admins can manage id proof types"
ON public.id_proof_types FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Caste Categories
CREATE POLICY "Authenticated users can read caste categories"
ON public.caste_categories FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admins can manage caste categories"
ON public.caste_categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Attendance Status Types
CREATE POLICY "Authenticated users can read attendance status types"
ON public.attendance_status_types FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admins can manage attendance status types"
ON public.attendance_status_types FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Payment Modes
CREATE POLICY "Authenticated users can read payment modes"
ON public.payment_modes FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admins can manage payment modes"
ON public.payment_modes FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - PROGRAMS
-- =============================================

CREATE POLICY "Authenticated users can read programs"
ON public.programs FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admins can manage programs"
ON public.programs FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - CLUSTERS
-- =============================================

CREATE POLICY "Authenticated users can read clusters"
ON public.clusters FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admins can manage clusters"
ON public.clusters FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - TEACHERS
-- =============================================

CREATE POLICY "Admin and management can read all teachers"
ON public.teachers FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'management')
);

CREATE POLICY "Teachers can read their own record"
ON public.teachers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage teachers"
ON public.teachers FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - TEACHER ASSIGNMENTS
-- =============================================

CREATE POLICY "Admin and management can read all teacher assignments"
ON public.teacher_assignments FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'management')
);

CREATE POLICY "Teachers can read their own assignments"
ON public.teacher_assignments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.id = teacher_id AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage teacher assignments"
ON public.teacher_assignments FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - STUDENTS
-- =============================================

CREATE POLICY "Admin and management can read all students"
ON public.students FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'management')
);

CREATE POLICY "Teachers can read students in their assigned clusters/programs"
ON public.students FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.student_academic_records sar
    JOIN public.teacher_assignments ta ON 
      sar.cluster_id = ta.cluster_id AND 
      sar.program_id = ta.program_id AND
      sar.academic_year_id = ta.academic_year_id
    JOIN public.teachers t ON ta.teacher_id = t.id
    WHERE sar.student_id = students.id 
      AND t.user_id = auth.uid()
      AND ta.is_active = true
  )
);

CREATE POLICY "Admins can manage students"
ON public.students FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - STUDENT ACADEMIC RECORDS
-- =============================================

CREATE POLICY "Admin and management can read all student records"
ON public.student_academic_records FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'management')
);

CREATE POLICY "Teachers can read records for their assignments"
ON public.student_academic_records FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.teacher_assignments ta
    JOIN public.teachers t ON ta.teacher_id = t.id
    WHERE ta.cluster_id = student_academic_records.cluster_id 
      AND ta.program_id = student_academic_records.program_id
      AND ta.academic_year_id = student_academic_records.academic_year_id
      AND t.user_id = auth.uid()
      AND ta.is_active = true
  )
);

CREATE POLICY "Admins can manage student records"
ON public.student_academic_records FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - FAMILY MEMBERS
-- =============================================

CREATE POLICY "Admin and management can read family members"
ON public.family_members FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'management')
);

CREATE POLICY "Admins can manage family members"
ON public.family_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - ATTENDANCE RECORDS
-- =============================================

CREATE POLICY "Admin and management can read all attendance"
ON public.attendance_records FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'management')
);

CREATE POLICY "Teachers can read attendance for their assignments"
ON public.attendance_records FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.teacher_assignments ta
    JOIN public.teachers t ON ta.teacher_id = t.id
    WHERE ta.cluster_id = attendance_records.cluster_id 
      AND ta.program_id = attendance_records.program_id
      AND ta.academic_year_id = attendance_records.academic_year_id
      AND t.user_id = auth.uid()
      AND ta.is_active = true
  )
);

CREATE POLICY "Teachers can insert attendance for their assignments"
ON public.attendance_records FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.teacher_assignments ta
    JOIN public.teachers t ON ta.teacher_id = t.id
    WHERE ta.cluster_id = attendance_records.cluster_id 
      AND ta.program_id = attendance_records.program_id
      AND ta.academic_year_id = attendance_records.academic_year_id
      AND t.user_id = auth.uid()
      AND ta.is_active = true
  )
);

CREATE POLICY "Admins can manage all attendance"
ON public.attendance_records FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - DONORS
-- =============================================

CREATE POLICY "Admin and management can read donors"
ON public.donors FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'management')
);

CREATE POLICY "Admins can manage donors"
ON public.donors FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - DONATIONS
-- =============================================

CREATE POLICY "Admin and management can read donations"
ON public.donations FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'management')
);

CREATE POLICY "Admins can manage donations"
ON public.donations FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - AUDIT LOGS
-- =============================================

CREATE POLICY "Admins can read audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON public.academic_years
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clusters_updated_at BEFORE UPDATE ON public.clusters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teacher_assignments_updated_at BEFORE UPDATE ON public.teacher_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_records_updated_at BEFORE UPDATE ON public.student_academic_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AUTO-GENERATE CODES
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_student_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.student_code IS NULL THEN
    NEW.student_code := 'STU' || LPAD(NEXTVAL('student_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE SEQUENCE IF NOT EXISTS student_code_seq START WITH 1;

CREATE TRIGGER set_student_code
  BEFORE INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.generate_student_code();

CREATE OR REPLACE FUNCTION public.generate_donor_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.donor_code IS NULL THEN
    NEW.donor_code := 'DON' || LPAD(NEXTVAL('donor_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE SEQUENCE IF NOT EXISTS donor_code_seq START WITH 1;

CREATE TRIGGER set_donor_code
  BEFORE INSERT ON public.donors
  FOR EACH ROW EXECUTE FUNCTION public.generate_donor_code();