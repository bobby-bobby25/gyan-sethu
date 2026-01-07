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
  caste_category_id: string;
  id_proof_type_id: string;
  id_proof_number: string;
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
        return response.data as StudentWithDetails[];
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
