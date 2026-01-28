import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export interface Student {
  id: string;
  name: string;
  student_code: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  ambition: string;
  hobbies: string[];
  notes: string;
  caste_category_id: string;
  id_proof_type_id: string;
  id_proof_number: string;
  photo_document_id: number | null;
  address: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface StudentInsert {
  name: string;
  student_code: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  city: string;
  state: string;
  ambition: string;
  hobbies: string[];
  notes: string;
  caste_category_id?: string;
  id_proof_type_id?: string;
  id_proof_number?: string;
  address?: string;
}

export interface StudentUpdate extends Partial<StudentInsert> {}

export interface StudentWithDetails extends Student {
  caste_categories?: { name: string } | null;
  id_proof_types?: { name: string } | null;
  current_academic_record?: {
    id: string;
    cluster_id: string;
    program_id: string;
    academic_year_id: string;
    class_grade: string | null;
    school_name: string | null;
    attendance_percentage: number | null;
    result_percentage: number | null;
    clusters?: { name: string } | null;
    programs?: { name: string } | null;
    academic_years?: { name: string; is_current: boolean } | null;
  } | null;
}

export interface StudentFilters {
  search?: string;
  clusterId?: string;
  programId?: string;
  isActive?: boolean;
}

const formatForDateInput = (value?: string) =>
  value ? value.split("T")[0] : "";

export function useStudents(filters?: StudentFilters) {
  return useQuery({
    queryKey: ["students", filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.clusterId) params.append("clusterId", filters.clusterId);
        if (filters?.programId) params.append("programId", filters.programId);
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));

        const response = await api.get(`/Students${params.toString() ? '?' + params.toString() : ''}`);

        const mappedStudents: Student[] = response.data.map((row: any) => ({
          id: String(row.id),
          name: row.name,
          student_code: row.student_code,

          // assuming these may come later or be nullable
          email: row.email ?? "",
          phone: row.phone ?? "",
          gender: row.gender ?? "",
          city: row.city ?? "",
          state: row.state ?? "",
          notes: row.notes ?? "",
          ambition: row.ambition ?? "",
          hobbies:
          typeof row.hobbies === "string" && row.hobbies.trim().length > 0
            ? row.hobbies.split(",").map((p: string) => p.trim())
            : [],


          dob: formatForDateInput(row.dob),
          caste_category_id: String(row.caste_category_id),
          id_proof_type_id: String(row.id_proof_type_id),
          id_proof_number: row.id_proof_number,
          photo_document_id: row.photo_document_id,
          address: row.address,

          created_at: row.created_at,
          updated_at: row.updated_at,
          is_active: row.is_active,

          caste_categories: row.caste_category
            ? { name: row.caste_category }
            : null,

          id_proof_types: row.id_proof_type
            ? { name: row.id_proof_type }
            : null,

          current_academic_record: row.academic_record_id
            ? {
                id: String(row.academic_record_id),
                cluster_id: String(row.cluster_id),
                program_id: String(row.program_id),
                academic_year_id: String(row.academic_year_id),

                class_grade: row.class_grade,
                school_name: row.school_name,
                attendance_percentage: row.attendance_percentage,
                result_percentage: row.result_percentage,

                clusters: row.cluster
                  ? { name: row.cluster }
                  : null,

                programs: row.program
                  ? { name: row.program }
                  : null,

                academic_years: row.academic_year_name
                  ? {
                      name: row.academic_year_name,
                      is_current: row.academic_year_is_current
                    }
                  : null
              }
            : null
        }));

        return mappedStudents;
        // return response.data as StudentWithDetails[];
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useStudent(id: string | null) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const response = await api.get(`/Students/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (student: StudentInsert) => {
      const response = await api.post("/Students", student);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create student: ${error?.response?.data?.message || error.message}`);
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: StudentUpdate & { id: string }) => {
      const response = await api.put(`/Students/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update student: ${error?.response?.data?.message || error.message}`);
    },
  });
}

export function useUpdateStudentPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({studentId, documentId,}: { studentId: string; documentId: number; }) => {
      const response = await api.put(`/Students/${studentId}/Photo`, { documentId });
      return response.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({queryKey: ["student", variables.studentId],});
      toast.success("Student photo updated successfully");
    },

    onError: (error: any) => {
      toast.error(`Failed to update student photo: ${ error?.response?.data?.message || error.message }`);
    },
  });
}


export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/Students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete student: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Lookup data hooks
export function useClusters() {
  return useQuery({
    queryKey: ["clusters"],
    queryFn: async () => {
      const response = await api.get("/Clusters?isActive=true");
      return response.data;
    },
  });
}

export function usePrograms() {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const response = await api.get("/Programs?isActive=true");
      return response.data;
    },
  });
}

export function useCasteCategories() {
  return useQuery({
    queryKey: ["caste_categories"],
    queryFn: async () => {
      const response = await api.get("/MasterData/CasteCategories?isActive=true");
      return response.data;
    },
  });
}

export function useIdProofTypes() {
  return useQuery({
    queryKey: ["id_proof_types"],
    queryFn: async () => {
      const response = await api.get("/MasterData/IdProofTypes?isActive=true");
      return response.data;
    },
  });
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic_years"],
    queryFn: async () => {
      const response = await api.get("/AcademicYears?isActive=true");
      return response.data;
    },
  });
}

export function useAmbitions() {
  return useQuery({
    queryKey: ["ambitions"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/MasterData/Ambitions");
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
        }));
      } catch (error) {
        console.error("Error fetching ambitions:", error);
        throw error;
      }
    },
  });
}

export function useHobbies() {
  return useQuery({
    queryKey: ["hobbies"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/MasterData/Hobbies");
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
        }));
      } catch (error) {
        console.error("Error fetching hobbies:", error);
        throw error;
      }
    },
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/MasterData/Cities");
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          state: row.state,
        }));
      } catch (error) {
        console.error("Error fetching cities:", error);
        throw error;
      }
    },
  });
}

export function useStates() {
  return useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/MasterData/States");
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          code: row.code,
        }));
      } catch (error) {
        console.error("Error fetching states:", error);
        throw error;
      }
    },
  });
}