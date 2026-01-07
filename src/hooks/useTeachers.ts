import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  id_proof_type_id: string;
  id_proof_number: string;
  address: string;
  city: string;
  state: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  cluster_id: string;
  program_id: string;
  academic_year_id: string;
  role: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  clusters?: { id: string; name: string } | null;
  programs?: { id: string; name: string } | null;
  academic_years?: { id: string; name: string, is_current: boolean } | null;
}

export interface TeacherWithAssignments extends Teacher {
  id_proof_types?: { id: string; name: string } | null;
  teacher_assignments?: TeacherAssignment[];
}

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
      return mapped;
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
        Name: teacher.name,
        Email: teacher.email || null,
        Phone: teacher.phone || null,
        Address: teacher.address || null,
        City: teacher.city || null,
        State: teacher.state || null,
        IDProofTypeID: teacher.id_proof_type_id ? parseInt(teacher.id_proof_type_id, 10) : null,
        IDNumber: teacher.id_proof_number || null,
        // keep original keys for compatibility
        id_proof_type_id: teacher.id_proof_type_id,
        id_proof_number: teacher.id_proof_number,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
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
      toast.error("Failed to update teacher: " + (error?.response?.data?.message || error.message));
    },
  });
};

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
