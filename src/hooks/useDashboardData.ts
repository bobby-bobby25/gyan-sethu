import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import api from "@/api/api";

export interface DashboardFilters {
  startDate: Date;
  endDate: Date;
  learningCentreId?: string;
  programId?: string;
  clusterId?: string;
}

export interface SummaryStats {
  activeStudents: number;
  programWiseStudents: { program: string; count: number }[];
  totalTeachers: number;
  mainTeachers: number;
  backupTeachers: number;
  volunteers: number;
}

export interface AttendanceStats {
  attendancePercentage: number;
  totalPresent: number;
  totalExpected: number;
  trendData: { date: string; percentage: number }[];
}

export interface TeacherUnavailable {
  mainTeacherId: string;
  mainTeacherName: string;
  programName: string;
  clusterName: string;
  learningCentreName: string;
  backupTeacherName: string;
  missedDays: number;
}

export interface LearningCentreNeedingAttention {
  teacherName: string;
  programName: string;
  clusterName: string;
  learningCentreName: string;
  missedUpdates: number;
  attendancePercentage: number;
}

export interface AbsentStudent {
  id: string;
  name: string;
  programName: string;
  clusterName: string;
  learningCentreName: string;
  presentCount: number;
  absentCount: number;
}

export type Program = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Cluster = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  geo_radius_meters: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Color coding helper
export const getColorClass = (type: 'attendance' | 'missed' | 'absent', value: number): string => {
  if (type === 'attendance') {
    if (value >= 85) return 'text-success';
    if (value >= 70) return 'text-warning';
    return 'text-destructive';
  }
  if (type === 'missed') {
    if (value === 0) return 'text-success';
    if (value <= 2) return 'text-warning';
    return 'text-destructive';
  }
  // For absent counts, we need context-specific thresholds
  return '';
};

export const getBgColorClass = (type: 'attendance' | 'missed' | 'absent', value: number): string => {
  if (type === 'attendance') {
    if (value >= 85) return 'bg-success/10';
    if (value >= 70) return 'bg-warning/10';
    return 'bg-destructive/10';
  }
  if (type === 'missed') {
    if (value === 0) return 'bg-success/10';
    if (value <= 2) return 'bg-warning/10';
    return 'bg-destructive/10';
  }
  return '';
};

export const useSummaryStats = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard-summary", filters.startDate, filters.endDate, filters.programId, filters.clusterId , filters.learningCentreId],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: format(filters.startDate, "yyyy-MM-dd"),
        endDate: format(filters.endDate, "yyyy-MM-dd"),
        ...(filters.programId && { programId: filters.programId }),
        ...(filters.clusterId && { clusterId: filters.clusterId }),
        ...(filters.learningCentreId && { learningCentreId: filters.learningCentreId }),
      });

      const response = await api.get<SummaryStats>(`/Dashboard/SummaryStats?${params}`);
      return response.data;
    },
  });
};

export const useAttendanceStats = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard-attendance", filters.startDate, filters.endDate, filters.programId, filters.clusterId, filters.learningCentreId],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: format(filters.startDate, "yyyy-MM-dd"),
        endDate: format(filters.endDate, "yyyy-MM-dd"),
        ...(filters.programId && { programId: filters.programId }),
        ...(filters.clusterId && { clusterId: filters.clusterId }),
        ...(filters.learningCentreId && { learningCentreId: filters.learningCentreId }),
      });

      const response = await api.get<AttendanceStats>(`/Dashboard/AttendanceStats?${params}`);
      return response.data;
    },
  });
};

export const useTeachersUnavailable = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard-teachers-unavailable", filters.startDate, filters.endDate, filters.programId, filters.clusterId, filters.learningCentreId],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: format(filters.startDate, "yyyy-MM-dd"),
        endDate: format(filters.endDate, "yyyy-MM-dd"),
        ...(filters.programId && { programId: filters.programId }),
        ...(filters.clusterId && { clusterId: filters.clusterId }),
        ...(filters.learningCentreId && { learningCentreId: filters.learningCentreId }),
      });

      const response = await api.get<TeacherUnavailable[]>(`/Dashboard/TeachersUnavailable?${params}`);
      return response.data;
    },
  });
};

export const useClustersNeedingAttention = (filters: DashboardFilters, poorAttendanceThreshold = 75) => {
  return useQuery({
    queryKey: ["dashboard-clusters-attention", filters.startDate, filters.endDate, filters.programId, filters.clusterId, filters.learningCentreId, poorAttendanceThreshold],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: format(filters.startDate, "yyyy-MM-dd"),
        endDate: format(filters.endDate, "yyyy-MM-dd"),
        poorAttendanceThreshold: poorAttendanceThreshold.toString(),
        ...(filters.programId && { programId: filters.programId }),
        ...(filters.clusterId && { clusterId: filters.clusterId }),
        ...(filters.learningCentreId && { learningCentreId: filters.learningCentreId }),
      });

      const response = await api.get<LearningCentreNeedingAttention[]>(`/Dashboard/ClustersNeedingAttention?${params}`);
      return response.data;
    },
  });
};

export const useMostAbsentStudents = (filters: DashboardFilters, limit = 5) => {
  return useQuery({
    queryKey: ["dashboard-most-absent", filters.startDate, filters.endDate, filters.programId, filters.clusterId, filters.learningCentreId,limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: format(filters.startDate, "yyyy-MM-dd"),
        endDate: format(filters.endDate, "yyyy-MM-dd"),
        limit: limit.toString(),
        ...(filters.programId && { programId: filters.programId }),
        ...(filters.clusterId && { clusterId: filters.clusterId }),
        ...(filters.learningCentreId && { learningCentreId: filters.learningCentreId }),
      });

      const response = await api.get<AbsentStudent[]>(`/Dashboard/MostAbsentStudents?${params}`);
      return response.data;
    },
  });
};

export interface LearningCentrePerformance {
  learningCentreName: string;
  attendancePercentage: number;
}

export const useLearningCentrePerformance = (filters: DashboardFilters, limit = 5) => {
  return useQuery({
    queryKey: ["dashboard-cluster-performance", filters.startDate, filters.endDate, filters.programId, filters.clusterId, filters.learningCentreId, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: format(filters.startDate, "yyyy-MM-dd"),
        endDate: format(filters.endDate, "yyyy-MM-dd"),
        limit: limit.toString(),
        ...(filters.programId && { programId: filters.programId }),
        ...(filters.clusterId && { clusterId: filters.clusterId }),
        ...(filters.learningCentreId && { learningCentreId: filters.learningCentreId }),
      });

      const response = await api.get<{ bestLearningCentres: LearningCentrePerformance[]; worstLearningCentres: LearningCentrePerformance[] }>(`/Dashboard/LearningCentrePerformance?${params}`);
      return response.data;
    },
  });
};

// Get attendance status types
export const useAttendanceStatusTypes = () => {
  return useQuery({
    queryKey: ["attendance-status-types"],
    queryFn: async () => {
      const response = await api.get("/MasterData/AttendanceStatusTypes?isActive=true");
      return response.data;
    },
  });
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

export const usePrograms = () => {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const response = await api.get("/Programs?isActive=true");
      return response.data as Program[];
    },
  });
};