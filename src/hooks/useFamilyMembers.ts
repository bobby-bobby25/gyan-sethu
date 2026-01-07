import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export interface FamilyMember {
  id: string;
  student_id: string;
  name: string;
  relationship: string;
  phone: string | null;
  id_proof_type_id: string | null;
  id_proof_number: string | null;
  // optional extended details used in forms
  date_of_birth?: string | null;
  occupation?: string | null;
  annual_income?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface FamilyMemberInsert {
  student_id: string;
  name: string;
  relationship: string;
  phone?: string | null;
  id_proof_type_id?: string | null;
  id_proof_number?: string | null;
}

export interface FamilyMemberUpdate extends Partial<FamilyMemberInsert> {}

export interface FamilyMemberWithDetails extends FamilyMember {
  id_proof_types?: { id: string; name: string } | null;
}

export function useFamilyMembers(studentId: string | null) {
  return useQuery({
    queryKey: ["family_members", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const response = await api.get(`/Students/${studentId}/FamilyMembers`);
      return response.data as FamilyMemberWithDetails[];
    },
    enabled: !!studentId,
  });
}

export function useCreateFamilyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: FamilyMemberInsert) => {
      const response = await api.post("/FamilyMembers", member);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["family_members", variables.student_id] });
      toast.success("Family member added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add family member: ${error?.response?.data?.message || error.message}`);
    },
  });
}

export function useUpdateFamilyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, studentId, ...updates }: FamilyMemberUpdate & { id: string; studentId: string }) => {
      const response = await api.put(`/FamilyMembers/${id}`, updates);
      return { data: response.data, studentId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["family_members", result.studentId] });
      toast.success("Family member updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update family member: ${error?.response?.data?.message || error.message}`);
    },
  });
}

export function useDeleteFamilyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
      await api.delete(`/FamilyMembers/${id}`);
      return { studentId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["family_members", result.studentId] });
      toast.success("Family member removed successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to remove family member: ${error?.response?.data?.message || error.message}`);
    },
  });
}
