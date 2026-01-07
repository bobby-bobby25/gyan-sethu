import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { format, subDays, startOfDay, endOfDay, parseISO, subYears } from "date-fns";

export interface UnifiedDashboardStats {
  activeStudents: number;
  studentsEnrolledThisYear: number;
  activeTeachers: number;
  mainTeachers: number;
  backupTeachers: number;
  activeClusters: number;
  activePrograms: number;
}

export interface AttendanceInsights {
  previousDayAttendance: number | null;
  topAttendanceClusters: { name: string; attendance: number }[];
  poorAttendanceClusters: { name: string; attendance: number }[];
  poorAttendanceStudents: { 
    id: string; 
    name: string; 
    cluster: string;
    attendancePercentage: number;
  }[];
}

export interface AcademicInsights {
  poorPerformanceStudents: {
    id: string;
    name: string;
    cluster: string;
    resultPercentage: number;
  }[];
  studentsNeedingAttention: {
    id: string;
    name: string;
    cluster: string;
    issue: "low_attendance" | "low_academic" | "both";
    attendancePercentage: number | null;
    resultPercentage: number | null;
  }[];
}

export interface AttendanceTrendData {
  date: string;
  attendance: number;
}

export const useUnifiedDashboardStats = (academicYearId?: string) => {
  return useQuery({
    queryKey: ["unified-dashboard-stats", academicYearId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (academicYearId) params.append("academicYearId", academicYearId);

      const response = await api.get(`/Dashboard/Unified/Stats?${params.toString()}`);
      return response.data as UnifiedDashboardStats;
    },
  });
};

export const useAttendanceInsights = (academicYearId?: string, date?: Date) => {
  return useQuery({
    queryKey: ["attendance-insights", academicYearId, date?.toISOString()],
    queryFn: async () => {
      const targetDate = date || subDays(new Date(), 1);
      const dateStr = format(targetDate, "yyyy-MM-dd");

      const params = new URLSearchParams({ date: dateStr });
      if (academicYearId) params.append("academicYearId", academicYearId);

      const response = await api.get(`/Dashboard/Attendance/Insights?${params.toString()}`);
      return response.data as AttendanceInsights;
    },
  });
};

export const useAttendanceTrend = (academicYearId?: string) => {
  return useQuery({
    queryKey: ["attendance-trend", academicYearId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (academicYearId) params.append("academicYearId", academicYearId);

      const response = await api.get(`/Dashboard/Attendance/Trends?${params.toString()}`);
      return response.data as AttendanceTrendData[];
    },
  });
};

export const useAcademicInsights = (academicYearId?: string) => {
  return useQuery({
    queryKey: ["academic-insights", academicYearId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (academicYearId) params.append("academicYearId", academicYearId);

      const response = await api.get(`/Dashboard/Academic/Insights?${params.toString()}`);
      return response.data as AcademicInsights;
    },
  });
};

// Donor Dashboard hooks
export interface DonorDashboardStats {
  totalDonors: number;
  regularDonors: number;
  newDonorsThisYear: number;
  adhocDonors: number;
}

export interface DonorYearComparison {
  lastYearTotal: number;
  thisYearTotal: number;
  percentageChange: number;
}

export interface MonthlyDonationTrend {
  month: string;
  currentYear: number;
  previousYear: number;
}

export const useDonorDashboardStats = (financialYear?: string) => {
  return useQuery({
    queryKey: ["donor-dashboard-stats", financialYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (financialYear) params.append("financialYear", financialYear);

      const response = await api.get(`/Dashboard/Donor/Stats?${params.toString()}`);
      return response.data as DonorDashboardStats;
    },
  });
};

export const useDonorYearComparison = () => {
  return useQuery({
    queryKey: ["donor-year-comparison"],
    queryFn: async () => {
      const response = await api.get("/Dashboard/Donor/YearComparison");
      return response.data as DonorYearComparison;
    },
  });
};

export const useMonthlyDonationTrends = () => {
  return useQuery({
    queryKey: ["monthly-donation-trends"],
    queryFn: async () => {
      const response = await api.get("/Dashboard/Donation/MonthlyTrends");
      return response.data as MonthlyDonationTrend[];
    },
  });
};
