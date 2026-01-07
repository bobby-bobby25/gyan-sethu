import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  BookOpen,
  Users,
  UserCheck,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export function RepositoryDashboard() {
  const { data: clustersData, isLoading: clustersLoading } = useQuery({
    queryKey: ["clusters-with-stats"],
    queryFn: async () => {
      const response = await api.get("/Clusters?isActive=true");
      return response.data;
    },
  });

  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ["programs-with-stats"],
    queryFn: async () => {
      const response = await api.get("/Programs?isActive=true");
      return response.data;
    },
  });

  const { data: recordsData, isLoading: recordsLoading } = useQuery({
    queryKey: ["academic-records-for-repo"],
    queryFn: async () => {
      const response = await api.get("/AcademicRecords");
      return response.data;
    },
  });

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["teacher-assignments-for-repo"],
    queryFn: async () => {
      const response = await api.get("/TeacherAssignments");
      return response.data;
    },
  });

  const isLoading = clustersLoading || programsLoading || recordsLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate stats per cluster
  const clusterStats = clustersData?.map((cluster) => {
    const studentCount = recordsData?.filter((r) => r.cluster_id === cluster.id).length || 0;
    const teacherCount = assignmentsData?.filter((a) => a.cluster_id === cluster.id).length || 0;
    return {
      name: cluster.name,
      students: studentCount,
      teachers: teacherCount,
    };
  }).sort((a, b) => b.students - a.students).slice(0, 6) || [];

  // Calculate stats per program
  const programStats = programsData?.map((program) => {
    const studentCount = recordsData?.filter((r) => r.program_id === program.id).length || 0;
    return {
      name: program.name,
      students: studentCount,
    };
  }).sort((a, b) => b.students - a.students) || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="stat" className="border-l-primary">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-muted flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {clustersData?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Clusters</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-accent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-muted flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {programsData?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Programs</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-info">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-info-muted flex items-center justify-center">
              <Users className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {recordsData?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Student Enrollments</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-success">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success-muted flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {assignmentsData?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Teacher Assignments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clusters Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clusters by Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {clusterStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clusterStats} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="students"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                      name="Students"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No cluster data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Programs Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {programStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={programStats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="students"
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                      name="Students"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No program data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
