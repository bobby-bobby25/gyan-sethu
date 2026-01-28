import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export interface FamilyMember {
  id: string;
  student_id: string;
  name: string;
  relationship: string;
  gender: string | null;
  phone: string | null;
  id_proof_type_id: string | null;
  id_proof_number: string | null;
  photo_document_id: number | null;
  // optional extended details used in forms
  date_of_birth?: string | null;
  occupation?: string | null;
  annual_income?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
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

const formatForDateInput = (value?: string) =>
  value ? value.split("T")[0] : "";

export function useFamilyMembers(studentId: string | null) {
  return useQuery({
    queryKey: ["family_members", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const response = await api.get(`/FamilyMembers/${studentId}`);

      const mapped = (response.data as any[]).map((row) => ({
        id: String(row.id ?? row.family_member_id),
        student_id: String(row.student_id),

        name: row.name,
        relationship: row.relationship,

        gender: row.gender ?? null,
        phone: row.phone ?? null,

        id_proof_type_id: row.id_proof_type_id
          ? String(row.id_proof_type_id)
          : null,

        id_proof_number: row.id_proof_number ?? null,
        photo_document_id: row.photo_document_id ?? null,

        date_of_birth: row.date_of_birth
          ? formatForDateInput(row.date_of_birth)
          : null,

        occupation: row.occupation ?? null,
        annual_income:
          row.annual_income !== null && row.annual_income !== undefined
            ? Number(row.annual_income)
            : null,

        address: row.address ?? null,
        city: row.city ?? null,
        state: row.state ?? null,

        notes: row.notes ?? null,

        bank_name: row.bank_name ?? null,
        bank_account_number: row.bank_account_number ?? null,

        created_at: row.created_at,
        updated_at: row.updated_at,

        is_active: Boolean(row.is_active ?? true),
        id_proof_types: row.id_proof_type
          ? { id: row.id_proof_type_id, name: row.id_proof_type }
          : null,
      }));

      return mapped as FamilyMemberWithDetails[];
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

export function useUpdateFamilyMemberPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({memberId, documentId,}: { memberId: string; documentId: number; }) => {
      const response = await api.put(`/FamilyMembers/${memberId}/Photo`, { documentId });
      return response.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["family_members"] });
      queryClient.invalidateQueries({queryKey: ["family_member", variables.memberId],});
      toast.success("Family member photo updated successfully");
    },

    onError: (error: any) => {
      toast.error(`Failed to update family member photo: ${ error?.response?.data?.message || error.message }`);
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
