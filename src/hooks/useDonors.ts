import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export interface Donor {
  id: number;
  name: string;
  donor_code: string;
  donor_type: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  company: string | null; 
  date_of_birth: string | null;
  city: string | null;
  state: string | null;
  id_proof_type_id: string | null;
  id_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  id_proof_types?: { id: string; name: string } | null;
}

export interface Donation {
  id: string;
  donor_id: string;
  amount: number;
  donation_date: string;
  payment_mode_id: string | null;
  notes?: string | null;
  reference_number?: string | null;
  currency?: string | null;
  remarks?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  payment_modes?: { id: string; name: string } | null;
}

export interface DonorWithDonations extends Donor {
  donations?: Donation[];
}

export const formatDate = (value?: string | null) => {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleDateString("en-IN");
};

export const useDonors = () => {
  return useQuery({
    queryKey: ["donors"],
    queryFn: async () => {
      const response = await api.get("/Donors?isActive=true");
      // Map donorID to id for frontend compatibility
      const donors = (response.data as any[]).map((donor) => ({
        id: donor.DonorID ?? donor.id,
        donor_code: donor.DonorCode ?? "",
        name: donor.Name ?? "",
        donor_type: donor.DonorType ?? null,
        email: donor.Email ?? null,
        company: donor.Company ?? null,
        date_of_birth: formatDate(donor.DateOfBirth) ?? null,
        phone: donor.Phone ?? null,
        address: donor.Address ?? null,
        city: donor.City ?? null,
        state: donor.State ?? null,
        id_proof_type_id: donor.IDProofTypeID ? String(donor.IDProofTypeID) : null,
        id_number: donor.IDNumber ?? null,
        is_active: donor.IsActive ?? true,
        created_at: donor.CreatedAt ?? "",
        updated_at: donor.UpdatedAt ?? "",
        id_proof_types: donor.IdProofTypes ?? null,
        donations: Array.isArray(donor.donations)
          ? donor.donations.map((donation) => ({
              id: donation.DonationId ?? donation.id,
              donor_id: donation.DonorId ?? donation.donorId,
              amount: donation.Amount ?? 0,
              donation_date: donation.DonationDate ?? "",
              payment_mode_id: donation.PaymentModeID ? String(donation.PaymentModeID) : null,
              notes: donation.Notes ?? null,
              reference_number: donation.ReferenceNumber ?? null,
              currency: donation.Currency ?? null,
              remarks: donation.Remarks ?? null,
              is_active: donation.IsActive ?? true,
              created_at: donation.CreatedAt ?? "",
              updated_at: donation.UpdatedAt ?? "",
              payment_modes: donation.PaymentModes ?? null,
            }))
          : [],
      }));
      return donors as DonorWithDonations[];
    },
  });
};

export const useDonor = (donorId: string | null) => {
  return useQuery({
    queryKey: ["donor", donorId],
    queryFn: async () => {
      if (!donorId) return null;
      const response = await api.get(`/Donors/${donorId}`);
      return response.data as DonorWithDonations;
    },
    enabled: !!donorId,
  });
};

export const useCreateDonor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donor: Omit<Donor, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'id_proof_types' | 'donor_code'>) => {
      const response = await api.post("/Donors", donor);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      toast.success("Donor created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create donor: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useUpdateDonor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...donor
    }: Partial<Omit<Donor, 'id' | 'created_at' | 'updated_at' | 'id_proof_types'>> & { id: string }) => {
      const response = await api.put(`/Donors/${id}`, donor);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      toast.success("Donor updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update donor: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useDeleteDonor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/Donors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      toast.success("Donor removed successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to remove donor: " + (error?.response?.data?.message || error.message));
    },
  });
};

// Donations
export const useCreateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donation: Omit<Donation, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'payment_modes'>) => {
      const response = await api.post("/Donations", donation);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      queryClient.invalidateQueries({ queryKey: ["donor"] });
      toast.success("Donation recorded successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to record donation: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useUpdateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...donation
    }: Partial<Omit<Donation, 'id' | 'created_at' | 'updated_at' | 'payment_modes'>> & { id: string }) => {
      const response = await api.put(`/Donations/${id}`, donation);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      queryClient.invalidateQueries({ queryKey: ["donor"] });
      toast.success("Donation updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update donation: " + (error?.response?.data?.message || error.message));
    },
  });
};

export const useDeleteDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/Donations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      queryClient.invalidateQueries({ queryKey: ["donor"] });
      toast.success("Donation deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete donation: " + (error?.response?.data?.message || error.message));
    },
  });
};

// Lookup data
export const usePaymentModes = () => {
  return useQuery({
    queryKey: ["payment-modes"],
    queryFn: async () => {
      const response = await api.get("/MasterData/PaymentModes?isActive=true");
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
