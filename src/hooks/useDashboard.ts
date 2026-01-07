import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClusters: number;
  totalPrograms: number;
  totalDonors: number;
  totalDonations: number;
  mainTeachers: number;
  backupTeachers: number;
}

export interface AcademicStats {
  totalRecords: number;
  averageAttendance: number;
  averageResult: number;
  studentsByCluster: { name: string; count: number }[];
  studentsByProgram: { name: string; count: number }[];
}

export interface DonorStats {
  totalDonors: number;
  totalAmount: number;
  donorsByType: { name: string; value: number; color: string }[];
  recentDonations: {
    id: string;
    donor_name: string;
    amount: number;
    date: string;
  }[];
}

export interface AttendanceStats {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  attendanceByCluster: { name: string; attendance: number }[];
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/Dashboard/Stats");
      return response.data as DashboardStats;
    },
  });
};

export const useAcademicStats = () => {
  return useQuery({
    queryKey: ["academic-stats"],
    queryFn: async () => {
      const response = await api.get("/Dashboard/Academic/Stats");
      return response.data as AcademicStats;
    },
  });
};

export const useDonorStats = () => {
  return useQuery({
    queryKey: ["donor-stats"],
    queryFn: async () => {
      const response = await api.get("/Dashboard/Donor/Stats");
      return response.data as DonorStats;
    },
  });
};

export const useAttendanceStats = () => {
  return useQuery({
    queryKey: ["attendance-stats"],
    queryFn: async () => {
      const response = await api.get("/Dashboard/Attendance/Stats");
      return response.data as AttendanceStats;
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const response = await api.get("/Dashboard/RecentActivity");
      return response.data as { id: string; type: string; message: string; time: string }[];
    },
  });
};
