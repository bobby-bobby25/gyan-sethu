import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export type Cluster = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  geo_radius_meters: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ClusterWithStats = Cluster & {
  student_count: number;
  teacher_count: number;
  programs: string[];
};

export type ClusterInsert = {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geo_radius_meters?: number | null;
};

export type ClusterUpdate = Partial<ClusterInsert> & {
  is_active?: boolean;
};

export const useClusters = () => {
  return useQuery({
    queryKey: ["clusters"],
    queryFn: async () => {
      const response = await api.get("/Clusters?isActive=true");
      return response.data as Cluster[];
    },
  });
};

export const useClustersWithStats = () => {
  return useQuery({
    queryKey: ["clusters-with-stats"],
    queryFn: async () => {
      const response = await api.get("/Clusters/Stats");
      return response.data as ClusterWithStats[];
    },
  });
};

export const useCluster = (id: string | null) => {
  return useQuery({
    queryKey: ["cluster", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/Clusters/${id}`);
      return response.data as Cluster;
    },
    enabled: !!id,
  });
};

export const useClusterTeachers = (clusterId: string | null) => {
  return useQuery({
    queryKey: ["cluster-teachers", clusterId],
    queryFn: async () => {
      if (!clusterId) return [];
      const response = await api.get(`/Clusters/${clusterId}/Teachers`);
      return response.data;
    },
    enabled: !!clusterId,
  });
};

export const useClusterStudents = (clusterId: string | null) => {
  return useQuery({
    queryKey: ["cluster-students", clusterId],
    queryFn: async () => {
      if (!clusterId) return [];
      const response = await api.get(`/Clusters/${clusterId}/Students`);
      return response.data;
    },
    enabled: !!clusterId,
  });
};

export const useCreateCluster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cluster: ClusterInsert) => {
      const response = await api.post("/Clusters", cluster);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      queryClient.invalidateQueries({ queryKey: ["clusters-with-stats"] });
      toast.success("Cluster created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create cluster: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useUpdateCluster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ClusterUpdate & { id: string }) => {
      await api.put(`/Clusters/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      queryClient.invalidateQueries({ queryKey: ["clusters-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["cluster"] });
      toast.success("Cluster updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update cluster: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useDeleteCluster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/Clusters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      queryClient.invalidateQueries({ queryKey: ["clusters-with-stats"] });
      toast.success("Cluster deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete cluster: " + (error?.response?.data?.message || error.message));
    },
  });
};
