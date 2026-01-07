import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export type AttendanceReportData = {
  id: string;
  attendance_date: string;
  status_code: string;
  status_name: string;
  student_name: string;
  student_code: string;
  cluster_id: string;
  cluster_name: string;
  program_id: string;
  program_name: string;
  teacher_name: string | null;
  marked_at: string | null;
};

export type ClusterStats = {
  cluster_id: string;
  cluster_name: string;
  present: number;
  absent: number;
  total: number;
  rate: number;
};

export type ProgramStats = {
  program_id: string;
  program_name: string;
  present: number;
  absent: number;
  total: number;
  rate: number;
};

export type DailyStats = {
  date: string;
  present: number;
  absent: number;
  total: number;
  rate: number;
};

export const useAttendanceReport = (
  startDate: string,
  endDate: string,
  clusterId?: string,
  programId?: string
) => {
  return useQuery({
    queryKey: ["attendance-report", startDate, endDate, clusterId, programId],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      if (clusterId && clusterId !== "all") params.append("clusterId", clusterId);
      if (programId && programId !== "all") params.append("programId", programId);

      const response = await api.get(`/Reports/Attendance?${params.toString()}`);
      const data = response.data;

      // Transform data
      const records: AttendanceReportData[] = (data.records || []).map(
        (r: any) => ({
          id: r.id,
          attendance_date: r.attendance_date,
          status_code: r.status_code || "",
          status_name: r.status_name || "",
          student_name: r.student_name || "",
          student_code: r.student_code || "",
          cluster_id: r.cluster_id || "",
          cluster_name: r.cluster_name || "",
          program_id: r.program_id || "",
          program_name: r.program_name || "",
          teacher_name: r.teacher_name || null,
          marked_at: r.marked_at,
        })
      );

      // Calculate cluster stats
      const clusterMap = new Map<string, ClusterStats>();
      records.forEach((r) => {
        if (!clusterMap.has(r.cluster_id)) {
          clusterMap.set(r.cluster_id, {
            cluster_id: r.cluster_id,
            cluster_name: r.cluster_name,
            present: 0,
            absent: 0,
            total: 0,
            rate: 0,
          });
        }
        const stats = clusterMap.get(r.cluster_id)!;
        stats.total++;
        if (r.status_code === "P") stats.present++;
        else stats.absent++;
        stats.rate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
      });

      // Calculate program stats
      const programMap = new Map<string, ProgramStats>();
      records.forEach((r) => {
        if (!programMap.has(r.program_id)) {
          programMap.set(r.program_id, {
            program_id: r.program_id,
            program_name: r.program_name,
            present: 0,
            absent: 0,
            total: 0,
            rate: 0,
          });
        }
        const stats = programMap.get(r.program_id)!;
        stats.total++;
        if (r.status_code === "P") stats.present++;
        else stats.absent++;
        stats.rate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
      });

      // Calculate daily stats
      const dailyMap = new Map<string, DailyStats>();
      records.forEach((r) => {
        if (!dailyMap.has(r.attendance_date)) {
          dailyMap.set(r.attendance_date, {
            date: r.attendance_date,
            present: 0,
            absent: 0,
            total: 0,
            rate: 0,
          });
        }
        const stats = dailyMap.get(r.attendance_date)!;
        stats.total++;
        if (r.status_code === "P") stats.present++;
        else stats.absent++;
        stats.rate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
      });

      // Overall stats
      const present = records.filter((r) => r.status_code === "P").length;
      const absent = records.filter((r) => r.status_code === "A").length;
      const total = records.length;
      const rate = total > 0 ? (present / total) * 100 : 0;

      return {
        records,
        clusterStats: Array.from(clusterMap.values()).sort((a, b) => b.rate - a.rate),
        programStats: Array.from(programMap.values()).sort((a, b) => b.rate - a.rate),
        dailyStats: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
        overallStats: { present, absent, total, rate },
      };
    },
    enabled: !!startDate && !!endDate,
  });
};

export const exportToCSV = (
  records: AttendanceReportData[],
  filename: string
) => {
  const headers = [
    "Date",
    "Student Name",
    "Student Code",
    "Cluster",
    "Program",
    "Status",
    "Marked By",
    "Marked At",
  ];

  const rows = records.map((r) => [
    r.attendance_date,
    r.student_name,
    r.student_code,
    r.cluster_name,
    r.program_name,
    r.status_name,
    r.teacher_name || "",
    r.marked_at ? new Date(r.marked_at).toLocaleString() : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};
