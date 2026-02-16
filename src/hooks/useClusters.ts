import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export type Cluster = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ClusterWithStats = Cluster & {
  student_count: number;
  teacher_count: number;
  learning_centre_count: number;
  programs: string[];
};

export type ClusterInsert = {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
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

      const mapClusterWithStats = (row: any): ClusterWithStats => ({
        id: String(row.id),

        name: row.name,
        address: row.address ?? null,
        city: row.city ?? null,
        state: row.state ?? null,
        notes: row.notes ?? null,
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at,

        student_count: Number(row.student_count ?? 0),
        teacher_count: Number(row.teacher_count ?? 0),
        learning_centre_count: Number(row.learning_centre_count ?? 0),
        
        programs:
          typeof row.programs === "string" && row.programs.trim().length > 0
            ? row.programs.split(",").map((p: string) => p.trim())
            : [],
      });

      return (response.data as any[]).map(mapClusterWithStats);
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
      const mappedTeachers = response.data
        .filter((row: any) => row.teacher_assignment_id)
        .map((row: any) => ({
          id: String(row.teacher_assignment_id),

          role: row.role,

          teacher_id: String(row.id),
          cluster_id: String(row.cluster_id),
          program_id: String(row.program_id),
          academic_year_id: String(row.academic_year_id),

          created_at: row.created_at,
          updated_at: row.updated_at,
          is_active: row.is_active,
          student_id: row.student_id,
          is_ex_student: row.is_ex_student,
          subjects:
          typeof row.subjects === "string" && row.subjects.trim().length > 0
            ? row.subjects.split(",").map((p: string) => p.trim())
            : [],

          teachers: {
            id: String(row.id),
            name: row.name,
            email: row.email,
            phone: row.phone
          },

          clusters: row.cluster
            ? {
                id: String(row.cluster_id),
                name: row.cluster
              }
            : null,

          programs: row.program
            ? {
                id: String(row.program_id),
                name: row.program
              }
            : null,

          academic_years: row.academic_year_name
            ? {
                id: String(row.academic_year_id),
                name: row.academic_year_name,
                is_current: row.academic_year_is_current
              }
            : null
        }));

      return mappedTeachers;
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
      const mappedStudents = response.data.map((row: any) => ({
        id: String(row.id),

        students: {
          id: String(row.student_id ?? row.id),
          name: row.student_name ?? row.name,
          student_code: row.student_code
        },

        programs: row.program
          ? {
              id: String(row.program_id),
              name: row.program
            }
          : null,

        academic_years: row.academic_year_name
          ? {
              id: String(row.academic_year_id),
              name: row.academic_year_name,
              is_current: row.academic_year_is_current
            }
          : null
      }));
      return mappedStudents;
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
