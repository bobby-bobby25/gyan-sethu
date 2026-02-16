import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";
import cluster from "cluster";

export interface AttendanceRecord {
  id: string;
  student_id: string;
  learning_centre_id: string;
  program_id: string;
  cluster_id: string;
  academic_year_id: string;
  attendance_date: string;
  status_id: string;
  teacher_id: string | null;
  marked_at: string | null;
  created_at: string;
  updated_at: string;
  students?: { id: string; name: string } | null;
  clusters?: { id: string; name: string } | null;
  learning_centres?: { id: string; name: string } | null;
  programs?: { id: string; name: string } | null;
  attendance_status_types?: { id: string; name: string; code: string } | null;
  teachers?: { id: string; name: string } | null;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  learning_centre_id: string;
  program_id: string;
  cluster_id: string;
  academic_year_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  learning_centres?: { id: string; 
               name: string, 
               latitude:number; 
               longitude:number; 
               geo_radius_meters: number 
               city: string | null} | null;
  programs?: { id: string; name: string } | null;
  clusters?: { id: string; name: string } | null;
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
  learningCentreId: string | null,
  programId: string | null,
  academicYearId: string | null
) => {
  return useQuery({
    queryKey: ["students-for-attendance", learningCentreId, programId, academicYearId],
    queryFn: async () => {
      if (!learningCentreId || !programId || !academicYearId) return [];
      const response = await api.get(
        `/Attendance/Students?learningCentreId=${learningCentreId}&programId=${programId}&academicYearId=${academicYearId}`
      );
      return response.data as StudentForAttendance[];
    },
    enabled: !!learningCentreId && !!programId && !!academicYearId,
  });
};

// Get existing attendance records for a date
export const useAttendanceRecords = (
  learningCentreId: string | null,
  programId: string | null,
  academicYearId: string | null,
  date: string
) => {
  return useQuery({
    queryKey: ["attendance-records", learningCentreId, programId, academicYearId, date],
    queryFn: async () => {
      if (!learningCentreId || !programId || !academicYearId || !date) return [];
      const response = await api.get(
        `/Attendance?learningCentreId=${learningCentreId}&programId=${programId}&academicYearId=${academicYearId}&fromDate=${date}&toDate=${date}`
      );

      const mappedRecords: AttendanceRecord[] = response.data.map((row: any) => ({
        id: String(row.attendance_record_id),

        student_id: String(row.student_id),
        learning_centre_id: String(row.learning_centre_id),
        program_id: String(row.program_id),
        cluster_id: String(row.cluster_id),
        academic_year_id: String(row.academic_year_id),

        attendance_date: row.attendance_date,
        status_id: String(row.status_id),

        teacher_id: row.marked_by_teacher_id
          ? String(row.marked_by_teacher_id)
          : null,

        marked_at: row.marked_at ?? null,
        created_at: row.created_at,
        updated_at: row.updated_at,

        students: row.student_id
          ? {
              id: String(row.student_id),
              name: row.student_name
            }
          : null,

        clusters: row.cluster_id
          ? {
              id: String(row.cluster_id),
              name: row.cluster_name
            }
          : null,

        learning_centres: row.learning_centre_id
          ? {
              id: String(row.learning_centre_id),
              name: row.learning_centre_name
            }
          : null,

        programs: row.program_id
          ? {
              id: String(row.program_id),
              name: row.program_name
            }
          : null,

        attendance_status_types: row.status_id
          ? {
              id: String(row.status_id),
              name: row.status,
              code: row.status_code?.toUpperCase() ?? null
            }
          : null,

        teachers: row.marked_by_teacher_id
          ? {
              id: String(row.marked_by_teacher_id),
              name: row.marked_by_teacher
            }
          : null
      }));

      return mappedRecords;
    },
    enabled: !!learningCentreId && !!programId && !!academicYearId,
  });
};

// Get all attendance records with filters
export const useAllAttendanceRecords = (
  date: string,
  learningCentreId?: string,
  programId?: string,
  statusId?: string
) => {
  return useQuery({
    queryKey: ["all-attendance-records", date, learningCentreId, programId, statusId],
    queryFn: async () => {
      const params = new URLSearchParams({ date });
      if (learningCentreId && learningCentreId !== "all") params.append("learningCentreId", learningCentreId);
      if (programId && programId !== "all") params.append("programId", programId);
      if (statusId && statusId !== "all") params.append("statusId", statusId);
      if (date && date !== null) params.append("fromDate", date);
      if (date && date !== null) params.append("toDate", date);

      const response = await api.get(`/Attendance?${params.toString()}`);

      const mappedRecords: AttendanceRecord[] = response.data.map((row: any) => ({
        id: String(row.attendance_record_id),

        student_id: String(row.student_id),
        learning_centre_id: String(row.learning_centre_id),
        program_id: String(row.program_id),
        cluster_id: String(row.cluster_id),
        academic_year_id: String(row.academic_year_id),

        attendance_date: row.attendance_date,
        status_id: String(row.status_id),

        teacher_id: row.marked_by_teacher_id
          ? String(row.marked_by_teacher_id)
          : null,

        marked_at: row.marked_at ?? null,
        created_at: row.created_at,
        updated_at: row.updated_at,

        students: row.student_id
          ? {
              id: String(row.student_id),
              name: row.student_name
            }
          : null,
        
        clusters: row.cluster_id
          ? {
              id: String(row.cluster_id),
              name: row.cluster_name
            }
          : null,

        learning_centres: row.learning_centre_id
          ? {
              id: String(row.learning_centre_id),
              name: row.learning_centre_name
            }
          : null,

        programs: row.program_id
          ? {
              id: String(row.program_id),
              name: row.program_name
            }
          : null,

        attendance_status_types: row.status_id
          ? {
              id: String(row.status_id),
              name: row.status,
              code: row.status_code?.toUpperCase() ?? null
            }
          : null,

        teachers: row.marked_by_teacher_id
          ? {
              id: String(row.marked_by_teacher_id),
              name: row.marked_by_teacher
            }
          : null
      }));

      return mappedRecords;
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
        learning_centre_id: string;
        program_id: string;
        cluster_id: string;
        academic_year_id: string;
        attendance_date: string;
        status_id: string;
        teacher_id?: string | null;
      }>
    ) => {
      const response = await api.post("/Attendance/Bulk", { records });
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
  learningCentreLat: number | null,
  learningCentreLon: number | null,
  radiusMeters: number | null
): boolean => {
  if (!learningCentreLat || !learningCentreLon) return true; // No geofence set
  const radius = radiusMeters || 200; // Default 200m
  const distance = calculateDistance(userLat, userLon, learningCentreLat, learningCentreLon);
  return distance <= radius;
};

export function LearningCentreProgramCombinations(academicYearId: string | null) {
  return useQuery({
    queryKey: ["learningcentre-program-combinations", academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];

      const response = await api.get(
        `/Dashboard/LearningCentreProgramCombinations`,
        { params: { academicYearId } }
      );
      return response.data;
    },
    enabled: !!academicYearId
  });
}