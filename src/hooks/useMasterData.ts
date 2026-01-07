import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

// ID Proof Types
export type IdProofType = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export const useIdProofTypes = () => {
  return useQuery({
    queryKey: ["id-proof-types"],
    queryFn: async () => {
      const response = await api.get("/MasterData/IdProofTypes?isActive=true");
      return response.data as IdProofType[];
    },
  });
};

export const useCreateIdProofType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post("/MasterData/IdProofTypes", { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["id-proof-types"] });
      toast.success("ID proof type added");
    },
    onError: (error: any) => toast.error("Failed to add: " + (error?.response?.data?.message || error.message)),
  });
};

export const useUpdateIdProofType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await api.put(`/MasterData/IdProofTypes/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["id-proof-types"] });
      toast.success("ID proof type updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + (error?.response?.data?.message || error.message)),
  });
};

export const useDeleteIdProofType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/MasterData/IdProofTypes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["id-proof-types"] });
      toast.success("ID proof type deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + (error?.response?.data?.message || error.message)),
  });
};

// Caste Categories
export type CasteCategory = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
};

export const useCasteCategories = () => {
  return useQuery({
    queryKey: ["caste-categories"],
    queryFn: async () => {
      const response = await api.get("/MasterData/CasteCategories?isActive=true");
      return response.data as CasteCategory[];
    },
  });
};

export const useCreateCasteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, code }: { name: string; code: string }) => {
      const response = await api.post("/MasterData/CasteCategories", { name, code });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caste-categories"] });
      toast.success("Caste category added");
    },
    onError: (error: any) => toast.error("Failed to add: " + (error?.response?.data?.message || error.message)),
  });
};

export const useUpdateCasteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, code }: { id: string; name: string; code: string }) => {
      await api.put(`/MasterData/CasteCategories/${id}`, { name, code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caste-categories"] });
      toast.success("Caste category updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + (error?.response?.data?.message || error.message)),
  });
};

export const useDeleteCasteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/MasterData/CasteCategories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caste-categories"] });
      toast.success("Caste category deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + (error?.response?.data?.message || error.message)),
  });
};

// Attendance Status Types
export type AttendanceStatusType = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
};

export const useAttendanceStatusTypes = () => {
  return useQuery({
    queryKey: ["attendance-status-types"],
    queryFn: async () => {
      const response = await api.get("/MasterData/AttendanceStatusTypes?isActive=true");
      return response.data as AttendanceStatusType[];
    },
  });
};

export const useCreateAttendanceStatusType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, code }: { name: string; code: string }) => {
      const response = await api.post("/MasterData/AttendanceStatusTypes", { name, code });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-status-types"] });
      toast.success("Attendance status added");
    },
    onError: (error: any) => toast.error("Failed to add: " + (error?.response?.data?.message || error.message)),
  });
};

export const useUpdateAttendanceStatusType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, code }: { id: string; name: string; code: string }) => {
      await api.put(`/MasterData/AttendanceStatusTypes/${id}`, { name, code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-status-types"] });
      toast.success("Attendance status updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + (error?.response?.data?.message || error.message)),
  });
};

export const useDeleteAttendanceStatusType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/MasterData/AttendanceStatusTypes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-status-types"] });
      toast.success("Attendance status deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + (error?.response?.data?.message || error.message)),
  });
};

// Payment Modes
export type PaymentMode = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export const usePaymentModes = () => {
  return useQuery({
    queryKey: ["payment-modes"],
    queryFn: async () => {
      const response = await api.get("/MasterData/PaymentModes?isActive=true");
      return response.data as PaymentMode[];
    },
  });
};

export const useCreatePaymentMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post("/MasterData/PaymentModes", { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-modes"] });
      toast.success("Payment mode added");
    },
    onError: (error: any) => toast.error("Failed to add: " + (error?.response?.data?.message || error.message)),
  });
};

export const useUpdatePaymentMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await api.put(`/MasterData/PaymentModes/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-modes"] });
      toast.success("Payment mode updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + (error?.response?.data?.message || error.message)),
  });
};

export const useDeletePaymentMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/MasterData/PaymentModes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-modes"] });
      toast.success("Payment mode deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + (error?.response?.data?.message || error.message)),
  });
};
