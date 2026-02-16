import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export type LearningCentre = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  cluster_id: number;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  geo_radius_meters: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LearningCentreWithDetails = LearningCentre & {
  cluster_name: string;
  student_count: number;
};

export type LearningCentreInsert = {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  cluster_id: number;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geo_radius_meters?: number | null;
};

export type LearningCentreUpdate = Partial<LearningCentreInsert> & {
  is_active?: boolean;
};

export const useLearningCentresHook = () => {
  return useQuery({
    queryKey: ["learning-centres"],
    queryFn: async () => {
      const response = await api.get("/LearningCentres?isActive=true");
      return response.data as LearningCentre[];
    },
  });
};

export const useLearningCentresWithDetails = () => {
  return useQuery({
    queryKey: ["learning-centres-with-details"],
    queryFn: async () => {
      const response = await api.get("/LearningCentres/Stats");

      const mapLearningCentreWithDetails = (row: any): LearningCentreWithDetails => ({
        id: Number(row.id),
        name: row.name,
        address: row.address ?? null,
        city: row.city ?? null,
        state: row.state ?? null,
        cluster_id: Number(row.cluster_id),
        notes: row.notes ?? null,
        latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
        longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
        geo_radius_meters: row.geo_radius_meters !== null && row.geo_radius_meters !== undefined ? Number(row.geo_radius_meters) : null,
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at,
        cluster_name: row.cluster_name || "Unknown Cluster",
        student_count: Number(row.student_count ?? 0),
      });

      return (response.data as any[]).map(mapLearningCentreWithDetails);
    },
  });
};

export const useLearningCentre = (id: number | null) => {
  return useQuery({
    queryKey: ["learning-centre", id],
    queryFn: async () => {
      const response = await api.get(`/LearningCentres/${id}`);
      return response.data as LearningCentre;
    },
    enabled: !!id,
  });
};

export const useLearningCentres = (clusterId?: number | null) => {
  return useQuery({
    queryKey: ["learning-centres", clusterId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clusterId) params.append("clusterId", String(clusterId));
      const response = await api.get(`/LearningCentres?${params.toString()}`);
      return response.data as LearningCentre[];
    },
  });
};

export const useCreateLearningCentre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LearningCentreInsert) => {
      const response = await api.post("/LearningCentres", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-centres"] });
      queryClient.invalidateQueries({ queryKey: ["learning-centres-with-details"] });
      toast.success("Learning Centre created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create learning centre");
    },
  });
};

export const useUpdateLearningCentre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & LearningCentreUpdate) => {
      const response = await api.put(`/LearningCentres/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-centres"] });
      queryClient.invalidateQueries({ queryKey: ["learning-centres-with-details"] });
      toast.success("Learning Centre updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update learning centre");
    },
  });
};

export const useDeleteLearningCentre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/LearningCentres/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-centres"] });
      queryClient.invalidateQueries({ queryKey: ["learning-centres-with-details"] });
      toast.success("Learning Centre deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete learning centre");
    },
  });
};

export const useLearningCentreTeachers = (learningCentreId: number | null) => {
  return useQuery({
    queryKey: ["learning-centre-teachers", learningCentreId],
    queryFn: async () => {
      const response = await api.get(`/LearningCentres/${learningCentreId}/Teachers`);
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
    enabled: !!learningCentreId,
  });
};

export const useLearningCentreStudents = (learningCentreId: number | null) => {
  return useQuery({
    queryKey: ["learning-centre-students", learningCentreId],
    queryFn: async () => {
      const response = await api.get(`/LearningCentres/${learningCentreId}/Students`);
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
    enabled: !!learningCentreId,
  });
};
