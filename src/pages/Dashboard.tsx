import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Heart } from "lucide-react";
import { subDays, format } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DonorDashboard } from "@/components/dashboard/DonorDashboard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { ColorLegend } from "@/components/dashboard/ColorLegend";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { AttendanceSection } from "@/components/dashboard/AttendanceSection";
import { ClusterPerformanceCharts } from "@/components/dashboard/ClusterPerformanceCharts";
import { TeachersUnavailableTable } from "@/components/dashboard/TeachersUnavailableTable";
import { ClustersNeedingAttentionTable } from "@/components/dashboard/ClustersNeedingAttentionTable";
import { MostAbsentStudentsTable } from "@/components/dashboard/MostAbsentStudentsTable";
import {
  useSummaryStats,
  useAttendanceStats,
  useTeachersUnavailable,
  useClustersNeedingAttention,
  useMostAbsentStudents,
  useClusterPerformance,
  usePrograms,
  useClusters,
  DashboardFilters as DashboardFiltersType,
} from "@/hooks/useDashboardData";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Default date range: yesterday
  const yesterday = subDays(new Date(), 1);
  const [dateRange, setDateRange] = useState({ from: yesterday, to: yesterday });
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>();
  const [selectedClusterId, setSelectedClusterId] = useState<string | undefined>();

  // Lookup data
  const { data: programs } = usePrograms();
  const { data: clusters } = useClusters();

  // Build filters object
  const filters: DashboardFiltersType = useMemo(() => ({
    startDate: dateRange.from,
    endDate: dateRange.to,
    programId: selectedProgramId,
    clusterId: selectedClusterId,
  }), [dateRange, selectedProgramId, selectedClusterId]);

  // Dashboard data hooks
  const { data: summaryStats, isLoading: summaryLoading } = useSummaryStats(filters);
  const { data: attendanceStats, isLoading: attendanceLoading } = useAttendanceStats(filters);
  const { data: clusterPerformance, isLoading: clusterPerfLoading } = useClusterPerformance(filters);
  const { data: teachersUnavailable, isLoading: teachersLoading } = useTeachersUnavailable(filters);
  const { data: clustersNeedingAttention, isLoading: clustersLoading } = useClustersNeedingAttention(filters);
  const { data: mostAbsentStudents, isLoading: absentsLoading } = useMostAbsentStudents(filters);

  // Export functions
  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleExportAttendance = () => {
    if (attendanceStats?.trendData) {
      exportToCSV(
        attendanceStats.trendData.map(d => ({ Date: d.date, "Attendance %": d.percentage })),
        "attendance_trend"
      );
    }
  };

  const handleExportTeachersUnavailable = () => {
    if (teachersUnavailable) {
      exportToCSV(
        teachersUnavailable.map(t => ({
          "Main Teacher": t.mainTeacherName,
          Program: t.programName,
          Cluster: t.clusterName,
          "Backup Teacher": t.backupTeacherName,
          "Missed Days": t.missedDays,
        })),
        "teachers_unavailable"
      );
    }
  };

  const handleExportClustersAttention = () => {
    if (clustersNeedingAttention) {
      exportToCSV(
        clustersNeedingAttention.map(c => ({
          Teacher: c.teacherName,
          Program: c.programName,
          Cluster: c.clusterName,
          "Missed Updates": c.missedUpdates,
          "Attendance %": c.attendancePercentage,
        })),
        "clusters_needing_attention"
      );
    }
  };

  const handleExportMostAbsent = () => {
    if (mostAbsentStudents) {
      exportToCSV(
        mostAbsentStudents.map(s => ({
          Student: s.name,
          Program: s.programName,
          Cluster: s.clusterName,
          Present: s.presentCount,
          Absent: s.absentCount,
        })),
        "most_absent_students"
      );
    }
  };

  const handleStudentClick = (studentId: string) => {
    console.log("View student attendance:", studentId);
  };

  return (
    <DashboardLayout pageTitle="Dashboard" pageSubtitle="Overview of your organization's performance">
      <div className="space-y-3">
        {/* Mobile title */}
        <h1 className="text-xl font-display font-bold sm:hidden">Dashboard</h1>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto sm:inline-grid sm:grid-cols-2 h-8">
            <TabsTrigger value="dashboard" className="gap-1.5 text-xs h-7">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="donors" className="gap-1.5 text-xs h-7">
              <Heart className="h-3.5 w-3.5" />
              Donors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-1.5 space-y-1.5">
            {/* Filters + Legend Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <DashboardFilters
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                programs={programs || []}
                clusters={clusters || []}
                selectedProgramId={selectedProgramId}
                selectedClusterId={selectedClusterId}
                onProgramChange={setSelectedProgramId}
                onClusterChange={setSelectedClusterId}
              />
              <ColorLegend />
            </div>

            {/* Summary Cards */}
            <SummaryCards stats={summaryStats} isLoading={summaryLoading} />

            {/* Analytics Grid: Attendance + Most Absent side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
              <AttendanceSection
                stats={attendanceStats}
                isLoading={attendanceLoading}
                onExport={handleExportAttendance}
              />
              <MostAbsentStudentsTable
                data={mostAbsentStudents}
                isLoading={absentsLoading}
                onExport={handleExportMostAbsent}
                onStudentClick={handleStudentClick}
              />
            </div>

            {/* Cluster Performance Charts - side by side */}
            <ClusterPerformanceCharts
              bestClusters={clusterPerformance?.bestClusters}
              worstClusters={clusterPerformance?.worstClusters}
              isLoading={clusterPerfLoading}
            />

            {/* Operational Tables - 2 column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
              <TeachersUnavailableTable
                data={teachersUnavailable}
                isLoading={teachersLoading}
                onExport={handleExportTeachersUnavailable}
              />
              <ClustersNeedingAttentionTable
                data={clustersNeedingAttention}
                isLoading={clustersLoading}
                onExport={handleExportClustersAttention}
              />
            </div>
          </TabsContent>

          <TabsContent value="donors" className="mt-3">
            <DonorDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
