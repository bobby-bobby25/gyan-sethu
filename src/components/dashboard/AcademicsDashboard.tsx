import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  MapPin,
  TrendingUp,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAcademicStats } from "@/hooks/useDashboard";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
];

export function AcademicsDashboard() {
  const { data: stats, isLoading } = useAcademicStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const programData = stats?.studentsByProgram.map((p, i) => ({
    ...p,
    color: COLORS[i % COLORS.length],
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="stat" className="border-l-primary">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-muted flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {stats?.totalRecords || 0}
              </p>
              <p className="text-sm text-muted-foreground">Academic Records</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-success">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success-muted flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {stats?.averageAttendance.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-info">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-info-muted flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {stats?.averageResult.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Result</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-accent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-muted flex items-center justify-center">
              <MapPin className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {stats?.studentsByCluster.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Active Clusters</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Cluster */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Cluster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {stats?.studentsByCluster && stats.studentsByCluster.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.studentsByCluster} layout="vertical">
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
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students by Program */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {programData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={programData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                    >
                      {programData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
