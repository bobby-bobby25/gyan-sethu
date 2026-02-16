import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";
import { sub } from "date-fns";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  id_proof_type_id: string;
  id_proof_number: string;
  photo_document_id: number | null;
  address: string;
  city: string;
  state: string;
  notes: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  subjects: string;
  student_id?: number;
  is_ex_student?: boolean;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  cluster_id: string;
  program_id: string;
  learning_centre_id?: string;
  academic_year_id: string;
  role: "main" | "backup";
  created_at: string;
  updated_at: string;
  is_active: boolean;
  clusters?: { id: string; name: string } | null;
  programs?: { id: string; name: string } | null;
  learning_centres?: { id: string; name: string } | null;
  academic_years?: { id: string; name: string, is_current: boolean } | null;
}

export interface TeacherWithAssignments extends Teacher {
  id_proof_types?: { id: string; name: string } | null;
  teacher_assignments?: TeacherAssignment[];
}

export type StudentForExStudentLookup = {
  id: number;
  name: string;
  student_code: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  id_proof_type_id?: number;
  id_proof_number?: string;
  caste_category?: string;
};

const formatForDateInput = (value?: string) =>
  value ? value.split("T")[0] : "";

export const useTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await api.get("/Teachers?isActive=true");
      const items: any[] = response.data || [];
      const mapped = items.map((t) => {
        const id = t.id ?? t.TeacherID ?? t.teacherID ?? t.TeacherId ?? t.teacherId;
        return {
          ...t,
          id: id != null ? String(id) : undefined,
        } as TeacherWithAssignments;
      });

      const mappedTeachers: TeacherWithAssignments[] = response.data.map((row: any) => ({
        id: String(row.id),
        name: row.name,
        email: row.email,
        phone: row.phone,

        dob: formatForDateInput(row.dob),
        gender: row.gender, 

        id_proof_type_id: String(row.id_proof_type_id),
        id_proof_number: row.id_proof_number,
        photo_document_id: row.photo_document_id ?? null,

        address: row.address,
        city: row.city,
        state: row.state,
        notes: row.notes,

        created_at: row.created_at,
        updated_at: row.updated_at,
        is_active: row.is_active,
        student_id: row.student_id,
        is_ex_student: row.is_ex_student,
        subjects:
          typeof row.subjects === "string" && row.subjects.trim().length > 0
            ? row.subjects.trim()
            : "",

        id_proof_types: row.id_proof_type
          ? {
              id: String(row.id_proof_type_id),
              name: row.id_proof_type
            }
          : null,

        teacher_assignments: row.teacher_assignment_id
          ? [
              {
                id: String(row.teacher_assignment_id),
                teacher_id: String(row.id),
                cluster_id: String(row.cluster_id),
                program_id: String(row.program_id),
                learning_centre_id: row.learning_centre_id ? String(row.learning_centre_id) : undefined,
                academic_year_id: String(row.academic_year_id),
                role: row.role,

                created_at: row.created_at,
                updated_at: row.updated_at,
                is_active: row.is_active,

                clusters: row.cluster
                  ? { id: String(row.cluster_id), name: row.cluster }
                  : null,

                programs: row.program
                  ? { id: String(row.program_id), name: row.program }
                  : null,

                learning_centres: row.learning_centre
                  ? { id: String(row.learning_centre_id), name: row.learning_centre }
                  : null,

                academic_years: row.academic_year_name
                  ? {
                      id: String(row.academic_year_id),
                      name: row.academic_year_name,
                      is_current: row.academic_year_is_current
                    }
                  : null
              }
            ]
          : []
      }));
      return mappedTeachers;
    },
  });
};

export const useTeacher = (teacherId: string | null) => {
  return useQuery({
    queryKey: ["teacher", teacherId],
    queryFn: async () => {
      if (!teacherId) return null;
      const response = await api.get(`/Teachers/${teacherId}`);
      return response.data as TeacherWithAssignments;
    },
    enabled: !!teacherId,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teacher: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) => {
      const payload: any = {
        name: teacher.name,
        email: teacher.email || null,
        phone: teacher.phone || null,
        address: teacher.address || null,
        city: teacher.city || null,
        state: teacher.state || null,
        gender: teacher.gender || null,
        dob: teacher.dob || null,
        notes: teacher.notes || null,
        id_proof_type_id: teacher.id_proof_type_id ? parseInt(teacher.id_proof_type_id, 10) : null,
        id_proof_number: teacher.id_proof_number,
        subjects: teacher.subjects,
        student_id: teacher.student_id
      };

      const response = await api.post("/Teachers", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create teacher: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...teacher
    }: Partial<Omit<Teacher, 'id' | 'created_at' | 'updated_at'>> & { id: string }) => {
      const response = await api.put(`/Teachers/${id}`, teacher);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher updated successfully");
    },
    onError: (error: any) => {
      console.error("Update Teacher Error:", error);
      toast.error("Failed to update teacher: " + (error?.response?.data?.message || error.message));
    },
  });
};

export function useUpdateTeacherPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({teacherId, documentId,}: { teacherId: string; documentId: number; }) => {
      const response = await api.put(`/Teachers/${teacherId}/Photo`, { documentId });
      return response.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({queryKey: ["teacher", variables.teacherId],});
      toast.success("Teacher photo updated successfully");
    },

    onError: (error: any) => {
      toast.error(`Failed to update teacher photo: ${ error?.response?.data?.message || error.message }`);
    },
  });
}

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) throw new Error("Invalid teacher id");
      await api.delete(`/Teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher removed successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to remove teacher: " + (error?.response?.data?.message || error.message));
    },
  });
};

// Teacher Assignments
export const useCreateTeacherAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: Omit<TeacherAssignment, 'id' | 'created_at' | 'updated_at' | 'clusters' | 'programs' | 'academic_years'>) => {
      const response = await api.post("/TeacherAssignments", assignment);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      toast.success("Assignment created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create assignment: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useUpdateTeacherAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...assignment
    }: Partial<Omit<TeacherAssignment, 'id' | 'created_at' | 'updated_at' | 'clusters' | 'programs' | 'academic_years'>> & { id: string }) => {
      const response = await api.put(`/TeacherAssignments/${id}`, assignment);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      toast.success("Assignment updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update assignment: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useDeleteTeacherAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/TeacherAssignments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      toast.success("Assignment removed successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to remove assignment: " + (error?.response?.data?.message || error.message));
    },
  });
};

// Lookup data hooks
export const useClusters = () => {
  return useQuery({
    queryKey: ["clusters"],
    queryFn: async () => {
      const response = await api.get("/Clusters?isActive=true");
      return response.data;
    },
  });
};

export const usePrograms = () => {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const response = await api.get("/Programs?isActive=true");
      return response.data;
    },
  });
};

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const response = await api.get("/AcademicYears?isActive=true");
      return response.data;
    },
  });
};

export const useIdProofTypes = () => {
  return useQuery({
    queryKey: ["id-proof-types"],
    queryFn: async () => {
      const response = await api.get("/MasterData/IdProofTypes?isActive=true");
      return response.data;
    },
  });
};

export const useStudentByCode = (studentCode: string | null) => {
  return useQuery({
    queryKey: ["student-by-code", studentCode],
    queryFn: async () => {
      const response = await api.get(`/Teachers/ExStudent/${studentCode}`);
      return response.data as StudentForExStudentLookup;
    },
    enabled: !!studentCode && studentCode.length > 0,
  });
};

