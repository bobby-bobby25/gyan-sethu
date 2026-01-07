import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";

export interface AttendanceRecord {
  id: string;
  student_id: string;
  cluster_id: string;
  program_id: string;
  academic_year_id: string;
  attendance_date: string;
  status_id: string;
  teacher_id: string | null;
  marked_at: string | null;
  created_at: string;
  updated_at: string;
  students?: { id: string; name: string } | null;
  clusters?: { id: string; name: string } | null;
  programs?: { id: string; name: string } | null;
  attendance_status_types?: { id: string; name: string; code: string } | null;
  teachers?: { id: string; name: string } | null;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  cluster_id: string;
  program_id: string;
  academic_year_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  clusters?: { id: string; name: string } | null;
  programs?: { id: string; name: string } | null;
  academic_years?: { id: string; name: string } | null;
}

export type StudentForAttendance = {
  id: string;
  name: string;
  student_code: string | null;
};

// Get teacher's active assignments
export const useTeacherAssignments = (userId: string | null) => {
  return useQuery({
    queryKey: ["teacher-assignments", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await api.get(`/Teachers/User/${userId}/Assignments`);
      return response.data as TeacherAssignment[];
    },
    enabled: !!userId,
  });
};

// Get current teacher record
export const useCurrentTeacher = (userId: string | null) => {
  return useQuery({
    queryKey: ["current-teacher", userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const response = await api.get(`/Teachers/User/${userId}`);
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
  });
};

// Get students enrolled in a specific cluster/program for current academic year
export const useStudentsForAttendance = (
  clusterId: string | null,
  programId: string | null,
  academicYearId: string | null
) => {
  return useQuery({
    queryKey: ["students-for-attendance", clusterId, programId, academicYearId],
    queryFn: async () => {
      if (!clusterId || !programId || !academicYearId) return [];
      const response = await api.get(
        `/Attendance/Students?clusterId=${clusterId}&programId=${programId}&academicYearId=${academicYearId}`
      );
      return response.data as StudentForAttendance[];
    },
    enabled: !!clusterId && !!programId && !!academicYearId,
  });
};

// Get existing attendance records for a date
export const useAttendanceRecords = (
  clusterId: string | null,
  programId: string | null,
  academicYearId: string | null,
  date: string
) => {
  return useQuery({
    queryKey: ["attendance-records", clusterId, programId, academicYearId, date],
    queryFn: async () => {
      if (!clusterId || !programId || !academicYearId) return [];
      const response = await api.get(
        `/Attendance?clusterId=${clusterId}&programId=${programId}&academicYearId=${academicYearId}&date=${date}`
      );
      return response.data as AttendanceRecord[];
    },
    enabled: !!clusterId && !!programId && !!academicYearId,
  });
};

// Get all attendance records with filters
export const useAllAttendanceRecords = (
  date: string,
  clusterId?: string,
  programId?: string,
  statusId?: string
) => {
  return useQuery({
    queryKey: ["all-attendance-records", date, clusterId, programId, statusId],
    queryFn: async () => {
      const params = new URLSearchParams({ date });
      if (clusterId && clusterId !== "all") params.append("clusterId", clusterId);
      if (programId && programId !== "all") params.append("programId", programId);
      if (statusId && statusId !== "all") params.append("statusId", statusId);
      
      const response = await api.get(`/Attendance?${params.toString()}`);
      return response.data as AttendanceRecord[];
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

// Get current academic year
export const useCurrentAcademicYear = () => {
  return useQuery({
    queryKey: ["current-academic-year"],
    queryFn: async () => {
      try {
        const response = await api.get("/AcademicYears/Current");
        return response.data;
      } catch {
        // Fallback to most recent active year
        const response = await api.get("/AcademicYears?isActive=true");
        return response.data?.[0];
      }
    },
  });
};

// Mark attendance for multiple students
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      records: Array<{
        student_id: string;
        cluster_id: string;
        program_id: string;
        academic_year_id: string;
        attendance_date: string;
        status_id: string;
        teacher_id?: string | null;
      }>
    ) => {
      const response = await api.post("/Attendance/MarkBulk", { records });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      queryClient.invalidateQueries({ queryKey: ["all-attendance-records"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      toast.success("Attendance marked successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to mark attendance: " + (error?.response?.data?.message || error.message));
    },
  });
};

// Calculate distance between two coordinates in meters
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Check if location is within cluster's geo-fence
export const isWithinGeofence = (
  userLat: number,
  userLon: number,
  clusterLat: number | null,
  clusterLon: number | null,
  radiusMeters: number | null
): boolean => {
  if (!clusterLat || !clusterLon) return true; // No geofence set
  const radius = radiusMeters || 200; // Default 200m
  const distance = calculateDistance(userLat, userLon, clusterLat, clusterLon);
  return distance <= radius;
};
