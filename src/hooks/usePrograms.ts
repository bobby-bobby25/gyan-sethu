import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export type Program = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProgramWithStats = Program & {
  cluster_count: number;
  student_count: number;
  teacher_count: number;
};

export type ProgramInsert = {
  name: string;
  description?: string | null;
};

export type ProgramUpdate = Partial<ProgramInsert> & {
  is_active?: boolean;
};

export const usePrograms = () => {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const response = await api.get("/Programs?isActive=true");
      return response.data as Program[];
    },
  });
};

export const useProgramsWithStats = () => {
  return useQuery({
    queryKey: ["programs-with-stats"],
    queryFn: async () => {
      const response = await api.get("/Programs/Stats");
      return response.data as ProgramWithStats[];
    },
  });
};

export const useProgram = (id: string | null) => {
  return useQuery({
    queryKey: ["program", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/Programs/${id}`);
      return response.data as Program;
    },
    enabled: !!id,
  });
};

export const useProgramClusters = (programId: string | null) => {
  return useQuery({
    queryKey: ["program-clusters", programId],
    queryFn: async () => {
      if (!programId) return [];
      const response = await api.get(`/Programs/${programId}/Clusters`);
      return response.data;
    },
    enabled: !!programId,
  });
};

export const useProgramStudents = (programId: string | null) => {
  return useQuery({
    queryKey: ["program-students", programId],
    queryFn: async () => {
      if (!programId) return [];
      const response = await api.get(`/Programs/${programId}/Students`);
      return response.data;
    },
    enabled: !!programId,
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: ProgramInsert) => {
      const response = await api.post("/Programs", program);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs-with-stats"] });
      toast.success("Program created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create program: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ProgramUpdate & { id: string }) => {
      await api.put(`/Programs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["program"] });
      toast.success("Program updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update program: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/Programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs-with-stats"] });
      toast.success("Program deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete program: " + (error?.response?.data?.message || error.message));
    },
  });
};
