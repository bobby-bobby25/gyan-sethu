import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export type AcademicYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AcademicYearInsert = {
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
};

export type AcademicYearUpdate = Partial<AcademicYearInsert> & {
  is_active?: boolean;
};

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const response = await api.get("/AcademicYears");
      const mappedAcademicYears: AcademicYear[] = response.data.map((row: any) => ({
        id: String(row.id),
        name: row.name,

        start_date: row.startDate,
        end_date: row.endDate,

        is_current: row.isCurrent,
        is_active: row.isActive,

        created_at: row.createdAt,
        updated_at: row.updatedAt
      }));
      return mappedAcademicYears;
    },
  });
};

export const useActiveAcademicYears = () => {
  return useQuery({
    queryKey: ["academic-years-active"],
    queryFn: async () => {
      const response = await api.get("/AcademicYears?isActive=true");
      const mappedAcademicYears: AcademicYear[] = response.data.map((row: any) => ({
        id: String(row.id),
        name: row.name,

        start_date: row.startDate,
        end_date: row.endDate,

        is_current: row.isCurrent,
        is_active: row.isActive,

        created_at: row.createdAt,
        updated_at: row.updatedAt
      }));
      return mappedAcademicYears;
    },
  });
};

export const useCurrentAcademicYear = () => {
  return useQuery({
    queryKey: ["academic-year-current"],
    queryFn: async () => {
      try {
        const response = await api.get("/AcademicYears/Current");
        return response.data as AcademicYear | null;
      } catch (error: any) {
        if (error?.response?.status === 404) return null;
        throw error;
      }
    },
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (year: AcademicYearInsert) => {
      const response = await api.post("/AcademicYears", year);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      queryClient.invalidateQueries({ queryKey: ["academic-years-active"] });
      toast.success("Academic year created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create academic year: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: AcademicYearUpdate & { id: string }) => {
      await api.put(`/AcademicYears/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      queryClient.invalidateQueries({ queryKey: ["academic-years-active"] });
      queryClient.invalidateQueries({ queryKey: ["academic-year-current"] });
      toast.success("Academic year updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update academic year: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useSetCurrentAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/AcademicYears/${id}/SetCurrent`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      queryClient.invalidateQueries({ queryKey: ["academic-years-active"] });
      queryClient.invalidateQueries({ queryKey: ["academic-year-current"] });
      toast.success("Current academic year updated");
    },
    onError: (error: any) => {
      toast.error("Failed to set current year: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/AcademicYears/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      queryClient.invalidateQueries({ queryKey: ["academic-years-active"] });
      toast.success("Academic year deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete academic year: " + (error?.response?.data?.message || error.message));
    },
  });
};
