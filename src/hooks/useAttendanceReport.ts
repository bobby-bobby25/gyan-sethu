import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export type AttendanceReportData = {
  id: string;
  attendance_date: string;
  status_code: string;
  status_name: string;
  student_name: string;
  student_code: string;
  learning_centre_id: string;
  learning_centre_name: string;
  program_id: string;
  program_name: string;
  cluster_id: string;
  cluster_name: string;
  teacher_name: string | null;
  marked_at: string | null;
};

export type learningCentreStats = {
  learning_centre_id: string;
  learning_centre_name: string;
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
  learningCentreId?: string,
  programId?: string
) => {
  return useQuery({
    queryKey: ["attendance-report", startDate, endDate, learningCentreId, programId],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      if (learningCentreId && learningCentreId !== "all") params.append("learningCentreId", learningCentreId);
      if (programId && programId !== "all") params.append("programId", programId);

      const response = await api.get(`/Reports/Attendance?${params.toString()}`);
      const rows = response.data ?? [];

      // Transform data
      const records: AttendanceReportData[] = rows.map((r: any) => ({
        id: String(r.id),
        attendance_date: r.attendance_date,
        status_code: r.status_code || "",
        status_name: r.status_name || "",
        student_name: r.student_name || "",
        student_code: r.student_code || "",
        learning_centre_id: String(r.learning_centre_id),
        learning_centre_name: r.learning_centre_name || "",
        program_id: String(r.program_id),
        program_name: r.program_name || "",
        cluster_id: String(r.cluster_id),
        cluster_name: r.cluster_name || "",
        teacher_name: r.teacher_name ?? null,
        marked_at: r.marked_at,
      }));

      /* ---------------- LEARNING CENTRE STATS ---------------- */
      const learningCentreMap = new Map<string, learningCentreStats>();

      records.forEach((r) => {
        if (!learningCentreMap.has(r.learning_centre_id)) {
          learningCentreMap.set(r.learning_centre_id, {
            learning_centre_id: r.learning_centre_id,
            learning_centre_name: r.learning_centre_name,
            present: 0,
            absent: 0,
            total: 0,
            rate: 0,
          });
        }

        const stats = learningCentreMap.get(r.learning_centre_id)!;
        stats.total++;
        r.status_code === "P" ? stats.present++ : stats.absent++;
      });

      learningCentreMap.forEach((stats) => {
        stats.rate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
      });

      /* ---------------- PROGRAM STATS ---------------- */
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
        r.status_code === "P" ? stats.present++ : stats.absent++;
      });

      programMap.forEach((stats) => {
        stats.rate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
      });

      /* ---------------- DAILY STATS ---------------- */
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
        r.status_code === "P" ? stats.present++ : stats.absent++;
      });

      dailyMap.forEach((stats) => {
        stats.rate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
      });

      /* ---------------- OVERALL STATS ---------------- */
      const present = records.filter((r) => r.status_code === "P").length;
      const absent = records.filter((r) => r.status_code === "A").length;
      const total = records.length;
      const rate = total > 0 ? (present / total) * 100 : 0;

      return {
        records,
        learningCentreStats: Array.from(learningCentreMap.values()).sort((a, b) => b.rate - a.rate),
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
    "Learning Centre",
    "Program",
    "Cluster",
    "Status",
    "Marked By",
    "Marked At",
  ];

  const rows = records.map((r) => [
    r.attendance_date,
    r.student_name,
    r.student_code,
    r.learning_centre_name,
    r.program_name,
    r.cluster_name,
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
