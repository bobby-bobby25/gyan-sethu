import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export interface AcademicRecord {
  id: string;
  studentId: string;
  academicYearId: string;
  clusterId: string;
  programId: string;
  classGrade?: string | null;
  schoolName?: string | null;
  attendancePercentage?: number | null;
  resultPercentage?: number | null;
  yearlyFees?: number | null;
  remarks?: string | null;
  isActive: boolean;
}

export interface AcademicRecordInsert {
  studentId: string;
  clusterId: string;
  programId: string;
  academicYearId: string;
  classGrade?: string | null;
  schoolName?: string | null;
  attendancePercentage?: number | null;
  resultPercentage?: number | null;
  yearlyFees?: number | null;
  remarks?: string | null;
}

export interface AcademicRecordUpdate extends Partial<AcademicRecordInsert> {}

export interface AcademicRecordWithDetails extends AcademicRecord {
  clusters?: { id: string; name: string } | null;
  programs?: { id: string; name: string } | null;
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
        studentId: String(row.studentId),
        academicYearId: String(row.academicYearId),
        clusterId: String(row.clusterId),
        programId: String(row.programId),

        classGrade: row.classGrade,
        schoolName: row.schoolName,
        attendancePercentage: row.attendancePercentage,
        resultPercentage: row.resultPercentage,
        yearlyFees: row.yearlyFees,
        remarks: row.remarks,
        isActive: row.isActive,

        clusters: row.clusterId
          ? { id: String(row.clusterId), name: row.clusterName }
          : null,

        programs: row.programId
          ? { id: String(row.programId), name: row.programName }
          : null,

        academic_years: row.academicYearId
          ? {
              id: String(row.academicYearId),
              name: row.academicYearName,
              is_current: row.academicYearIsCurrent
            }
          : null
      }));

      console.log("Fetched academic records:", mappedRecords);

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
      queryClient.invalidateQueries({ queryKey: ["student_academic_records", variables.studentId] });
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
