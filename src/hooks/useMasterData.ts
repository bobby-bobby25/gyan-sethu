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

// Ambitions
export type Ambition = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

export const useAmbitions = () => {
  return useQuery({
    queryKey: ["ambitions"],
    queryFn: async () => {
      const response = await api.get("/MasterData/Ambitions");
      return response.data as Ambition[];
    },
  });
};

export const useCreateAmbition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post("/MasterData/Ambitions", { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambitions"] });
      toast.success("Ambition added");
    },
    onError: (error: any) => toast.error("Failed to add: " + error.message),
  });
};

export const useUpdateAmbition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await api.put(`/MasterData/Ambitions/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambitions"] });
      toast.success("Ambition updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + error.message),
  });
};

export const useDeleteAmbition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/MasterData/Ambitions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambitions"] });
      toast.success("Ambition deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + error.message),
  });
};

// Hobbies
export type Hobby = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

export const useHobbies = () => {
  return useQuery({
    queryKey: ["hobbies"],
    queryFn: async () => {
      const response = await api.get("/MasterData/Hobbies");
      return response.data as Hobby[];
    },
  });
};

export const useCreateHobby = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post("/MasterData/Hobbies", { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hobbies"] });
      toast.success("Hobby added");
    },
    onError: (error: any) => toast.error("Failed to add: " + error.message),
  });
};

export const useUpdateHobby = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await api.put(`/MasterData/Hobbies/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hobbies"] });
      toast.success("Hobby updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + error.message),
  });
};

export const useDeleteHobby = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/MasterData/Hobbies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hobbies"] });
      toast.success("Hobby deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + error.message),
  });
};

// Cities
export type City = {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
  createdAt: string;
};

export type SchoolType = {
  id: number;
  name: string;
  code: string;
};

export type StudentMedium = {
  id: number;
  name: string;
  code: string;
};

export type TeacherSubject = {
  id: number;
  name: string;
  code: string;
};


export const useCities = () => {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const response = await api.get("/MasterData/Cities");
      return response.data as City[];
    },
  });
};

export const useCreateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, state }: { name: string; state: string }) => {
      const response = await api.post("/MasterData/Cities", { name, state });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City added");
    },
    onError: (error: any) => toast.error("Failed to add: " + error.message),
  });
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, state }: { id: string; name: string; state: string }) => {
      await api.put(`/MasterData/Cities/${id}`, { name, state });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + error.message),
  });
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/MasterData/Cities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + error.message),
  });
};

// Teacher Subjects
export const useTeacherSubjects = () => {
  return useQuery({
    queryKey: ["teacher-subjects"],
    queryFn: async () => {
      const response = await api.get("/MasterData/Subjects");
      return response.data as TeacherSubject[];
    },
  });
};

export const useCreateTeacherSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, code, description }: { name: string; code: string; description?: string }) => {
      const response = await api.post("/MasterData/Subjects", { name, code, description });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      toast.success("Teacher subject added");
    },
    onError: (error: any) => toast.error("Failed to add: " + (error?.response?.data?.message || error.message)),
  });
};

export const useUpdateTeacherSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, code, description }: { id: number; name: string; code: string; description?: string }) => {
      await api.put(`/MasterData/Subjects/${id}`, { name, code, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      toast.success("Teacher subject updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + (error?.response?.data?.message || error.message)),
  });
};

export const useDeleteTeacherSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/MasterData/Subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      toast.success("Teacher subject deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + (error?.response?.data?.message || error.message)),
  });
};

// School Types
export const useSchoolTypes = () => {
  return useQuery({
    queryKey: ["school-types"],
    queryFn: async () => {
      const response = await api.get("/MasterData/SchoolTypes");
      return response.data as SchoolType[];
    },
  });
};

export const useCreateSchoolType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, code }: { name: string; code: string }) => {
      const response = await api.post("/MasterData/SchoolTypes", { name, code });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-types"] });
      toast.success("School type added");
    },
    onError: (error: any) => toast.error("Failed to add: " + (error?.response?.data?.message || error.message)),
  });
};

export const useUpdateSchoolType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, code }: { id: number; name: string; code: string }) => {
      await api.put(`/MasterData/SchoolTypes/${id}`, { name, code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-types"] });
      toast.success("School type updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + (error?.response?.data?.message || error.message)),
  });
};

export const useDeleteSchoolType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/MasterData/SchoolTypes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-types"] });
      toast.success("School type deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + (error?.response?.data?.message || error.message)),
  });
};

// Student Mediums
export const useStudentMediums = () => {
  return useQuery({
    queryKey: ["student-mediums"],
    queryFn: async () => {
      const response = await api.get("/MasterData/Mediums");
      return response.data as StudentMedium[];
    },
  });
};

export const useCreateStudentMedium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, code }: { name: string; code: string }) => {
      const response = await api.post("/MasterData/Mediums", { name, code });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-mediums"] });
      toast.success("Student medium added");
    },
    onError: (error: any) => toast.error("Failed to add: " + (error?.response?.data?.message || error.message)),
  });
};

export const useUpdateStudentMedium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, code }: { id: number; name: string; code: string }) => {
      await api.put(`/MasterData/Mediums/${id}`, { name, code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-mediums"] });
      toast.success("Student medium updated");
    },
    onError: (error: any) => toast.error("Failed to update: " + (error?.response?.data?.message || error.message)),
  });
};

export const useDeleteStudentMedium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/MasterData/Mediums/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-mediums"] });
      toast.success("Student medium deleted");
    },
    onError: (error: any) => toast.error("Failed to delete: " + (error?.response?.data?.message || error.message)),
  });
};

// Search Students by Code
export type StudentSearchResult = {
  id: number;
  name: string;
  student_code: string;
  gender?: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
};

export const useSearchStudentsByCode = (searchName: string) => {
  const isEnabled = !!(searchName && searchName.trim() !== "");
  
  return useQuery({
    queryKey: ["search-students", searchName],
    queryFn: async () => {
      if (!searchName || searchName.trim() === "") {
        return [];
      }
      const response = await api.get("/Students/SearchStudents", {
        params: { name: searchName },
      });
      return response.data as StudentSearchResult[];
    },
    enabled: isEnabled,
  });
};
