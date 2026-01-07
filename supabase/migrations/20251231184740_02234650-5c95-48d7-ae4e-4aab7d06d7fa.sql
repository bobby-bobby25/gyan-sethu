-- Add unique constraint for attendance records to prevent duplicate entries
-- and enable upsert functionality
ALTER TABLE public.attendance_records 
ADD CONSTRAINT attendance_records_unique_student_date 
UNIQUE (student_id, program_id, cluster_id, attendance_date);