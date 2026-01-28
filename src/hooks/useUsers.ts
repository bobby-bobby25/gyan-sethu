import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export type AppRole = "admin" | "management" | "teacher";

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type UserWithRole = UserProfile & {
  role: AppRole | null;
};

export type UserUpdate = {
  full_name?: string | null;
  phone?: string | null;
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await api.get("/Users");
        const mappedUsers: UserWithRole[] = response.data.map((row: any) => ({
          id: String(row.userID),
          email: row.email ?? null,
          full_name: row.fullName ?? null,
          phone: row.phone ?? null,
          created_at: row.createdAt,
          updated_at: row.updatedAt,
          role: row.role ?? null
        }));
        return mappedUsers;
      } catch (error) {
        throw error;
      }
    },
  });
};

export const useUser = (id: string | null) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) return null;

      try {
        const response = await api.get(`/Users/${id}`);
        return response.data as UserWithRole;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      profile,
      role,
    }: {
      id: string;
      profile: UserUpdate;
      role?: AppRole;
    }) => {
      const payload = { ...profile, role };
      const response = await api.put(`/Users/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update user: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const response = await api.put(`/Users/${userId}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("User role updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update role: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      fullName,
      role,
    }: {
      email: string;
      fullName: string;
      role: AppRole;
    }) => {
      const response = await api.post("/Users/Invite", {
        email,
        fullName,
        role,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User invited successfully. They will receive an email to set their password.");
    },
    onError: (error: any) => {
      toast.error("Failed to invite user: " + (error?.response?.data?.message || error.message));
    },
  });
};
