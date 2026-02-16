import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export interface AcademicRecord {
  id: string;
  student_id: string;
  academic_year_id: string;
  cluster_id: string;
  program_id: string;
  learning_centre_id: string;
  class_grade?: string | null;
  school_name?: string | null;
  attendance_percentage?: number | null;
  result_percentage?: number | null;
  yearly_fees?: number | null;
  remarks?: string | null;
  is_active: boolean;
}

export interface AcademicRecordInsert {
  student_id: string;
  cluster_id: string;
  program_id: string;
  learning_centre_id: string;
  academic_year_id: string;
  class_grade?: string | null;
  school_name?: string | null;
  attendance_percentage?: number | null;
  result_percentage?: number | null;
  yearly_fees?: number | null;
  remarks?: string | null;
}

export interface AcademicRecordUpdate extends Partial<AcademicRecordInsert> {}

export interface AcademicRecordWithDetails extends AcademicRecord {
  clusters?: { id: string; name: string } | null;
  programs?: { id: string; name: string } | null;
  learningCentres?: { id: string; name: string } | null;
  academic_years?: { id: string; name: string; is_current: boolean } | null;
}

export function useStudentAcademicRecords(studentId: string | null) {
  return useQuery({
    queryKey: ["student_academic_records", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const response = await api.get(`/Students/${studentId}/AcademicRecords`);
      const mappedRecords: AcademicRecordWithDetails[] = response.data.map((row: any) => ({
        id: String(row.id),
        student_id: String(row.student_id),
        academic_year_id: String(row.academic_year_id),
        cluster_id: String(row.cluster_id),
        program_id: String(row.program_id),
        learning_centre_id: String(row.learning_centre_id),

        class_grade: row.class_grade,
        school_name: row.school_name,
        attendance_percentage: row.attendance_percentage,
        result_percentage: row.result_percentage,
        yearly_fees: row.yearly_fees,
        remarks: row.remarks,
        is_active: row.is_active,

        clusters: row.cluster_id
          ? { id: String(row.cluster_id), name: row.cluster_name }
          : null,

        programs: row.program_id
          ? { id: String(row.program_id), name: row.program_name }
          : null,

        learningCentres: row.learning_centre_id
          ? { id: String(row.learning_centre_id), name: row.learning_centre_name }
          : null,

        academic_years: row.academic_year_id
          ? {
              id: String(row.academic_year_id),
              name: row.academic_year_name,
              is_current: row.academic_year_is_current
            }
          : null
      }));
      return mappedRecords;
    },
    enabled: !!studentId,
  });
}

export function useAcademicRecord(id: string | null) {
  return useQuery({
    queryKey: ["academic_record", id],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await api.get(`/Students/AcademicRecords/${id}`);
      return response.data as AcademicRecordWithDetails;
    },
    enabled: !!id,
  });
}

export function useCreateAcademicRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: AcademicRecordInsert) => {
      // Send snake_case keys as-is
      const response = await api.post("/Students/AcademicRecords", record);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["student_academic_records", variables.student_id] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Academic record created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create record: ${error?.response?.data?.message || error.message}`);
    },
  });
}

export function useUpdateAcademicRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, studentId, ...updates }: AcademicRecordUpdate & { id: string; studentId: string }) => {
      // Send snake_case keys as-is
      const response = await api.put(`/Students/AcademicRecords/${id}`, updates);
      return { data: response.data, studentId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["student_academic_records", result.studentId] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Academic record updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update record: ${error?.response?.data?.message || error.message}`);
    },
  });
}

export function useDeleteAcademicRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
      await api.delete(`/Students/AcademicRecords/${id}`);
      return { studentId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["student_academic_records", result.studentId] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Academic record deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete record: ${error?.response?.data?.message || error.message}`);
    },
  });
}
