import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MapPin,
  UserCheck,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useUnifiedDashboardStats,
  useAttendanceInsights,
  useAcademicInsights,
  useAttendanceTrend,
} from "@/hooks/useUnifiedDashboard";

interface UnifiedDashboardProps {
  selectedYearId?: string;
}

export function UnifiedDashboard({ selectedYearId }: UnifiedDashboardProps) {
  const { data: stats, isLoading: statsLoading } = useUnifiedDashboardStats(selectedYearId);
  const { data: attendanceInsights, isLoading: attendanceLoading } = useAttendanceInsights(selectedYearId);
  const { data: academicInsights, isLoading: academicLoading } = useAcademicInsights(selectedYearId);
  const { data: attendanceTrend, isLoading: trendLoading } = useAttendanceTrend(selectedYearId);

  const isLoading = statsLoading || attendanceLoading || academicLoading || trendLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Attendance Insights Header with KPIs */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <CalendarCheck className="h-4 w-4" />
          Attendance Insights
        </h2>
        
        {/* Compact KPI Row */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* Previous Day Attendance */}
          <Card variant="stat" className="border-l-primary">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-primary-muted flex items-center justify-center shrink-0">
                  <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-display font-bold text-primary leading-tight">
                    {attendanceInsights?.previousDayAttendance !== null 
                      ? `${attendanceInsights.previousDayAttendance}%` 
                      : "N/A"}
                  </p>
                  <p className="text-[9px] text-muted-foreground truncate">Prev Day</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Students */}
          <Card variant="stat" className="border-l-info">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-info-muted flex items-center justify-center shrink-0">
                  <Users className="h-3.5 w-3.5 text-info" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-display font-bold leading-tight">{stats?.activeStudents || 0}</p>
                  <p className="text-[9px] text-muted-foreground truncate">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrolled This Year */}
          <Card variant="stat" className="border-l-success">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-success-muted flex items-center justify-center shrink-0">
                  <Users className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-display font-bold leading-tight">{stats?.studentsEnrolledThisYear || 0}</p>
                  <p className="text-[9px] text-muted-foreground truncate">Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teachers */}
          <Card variant="stat" className="border-l-warning">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-warning/20 flex items-center justify-center shrink-0">
                  <UserCheck className="h-3.5 w-3.5 text-warning" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-display font-bold leading-tight">{stats?.activeTeachers || 0}</p>
                  <p className="text-[9px] text-muted-foreground truncate">Teachers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clusters */}
          <Card variant="stat" className="border-l-accent">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-accent-muted flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-display font-bold leading-tight">{stats?.activeClusters || 0}</p>
                  <p className="text-[9px] text-muted-foreground truncate">Clusters</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programs */}
          <Card variant="stat" className="border-l-secondary">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center shrink-0">
                  <BookOpen className="h-3.5 w-3.5 text-secondary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-display font-bold leading-tight">{stats?.activePrograms || 0}</p>
                  <p className="text-[9px] text-muted-foreground truncate">Programs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Trend Sparkline */}
          <Card variant="stat" className="border-l-primary col-span-1 sm:col-span-1">
            <CardContent className="p-2">
              <div className="flex items-center gap-2 h-full">
                <div className="w-7 h-7 rounded bg-primary-muted flex items-center justify-center shrink-0">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 h-8 min-w-0">
                  {attendanceTrend && attendanceTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceTrend}>
                        <Line 
                          type="monotone" 
                          dataKey="attendance" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "4px",
                            fontSize: "10px",
                            padding: "4px 8px",
                          }}
                          formatter={(value: number) => [`${value}%`, ""]}
                          labelFormatter={(label) => label}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-[9px] text-muted-foreground">No trend</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Best Attendance Clusters */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-success" />
                Best Clusters
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="h-28">
                {attendanceInsights?.topAttendanceClusters && attendanceInsights.topAttendanceClusters.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceInsights.topAttendanceClusters.slice(0, 4)} layout="vertical" margin={{ left: 0, right: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" width={120} fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "4px",
                          fontSize: "10px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Attendance"]}
                      />
                      <Bar dataKey="attendance" fill="hsl(var(--success))" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                    No data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Poor Attendance Clusters */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <TrendingDown className="h-3 w-3 text-destructive" />
                Needs Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="h-28">
                {attendanceInsights?.poorAttendanceClusters && attendanceInsights.poorAttendanceClusters.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceInsights.poorAttendanceClusters.slice(0, 4)} layout="vertical" margin={{ left: 0, right: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" width={120} fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "4px",
                          fontSize: "10px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Attendance"]}
                      />
                      <Bar dataKey="attendance" fill="hsl(var(--destructive))" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                    No data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Poor Attendance Students - Compact */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">Poor Attendance Students</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="h-28 overflow-auto">
                {attendanceInsights?.poorAttendanceStudents && attendanceInsights.poorAttendanceStudents.length > 0 ? (
                  <div className="space-y-1">
                    {attendanceInsights.poorAttendanceStudents.slice(0, 4).map((student) => (
                      <div key={student.id} className="flex items-center justify-between text-xs">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium truncate block">{student.name}</span>
                          <span className="text-[10px] text-muted-foreground">{student.cluster}</span>
                        </div>
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-2 shrink-0">
                          {student.attendancePercentage.toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                    No data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Academic Performance Insights - Compact */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Academic Performance
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Poor Academic Performance */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">Poor Academic Performance</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="h-28 overflow-auto">
                {academicInsights?.poorPerformanceStudents && academicInsights.poorPerformanceStudents.length > 0 ? (
                  <div className="space-y-1">
                    {academicInsights.poorPerformanceStudents.slice(0, 4).map((student) => (
                      <div key={student.id} className="flex items-center justify-between text-xs">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium truncate block">{student.name}</span>
                          <span className="text-[10px] text-muted-foreground">{student.cluster}</span>
                        </div>
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-2 shrink-0">
                          {student.resultPercentage.toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                    No data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students Needing Attention */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-warning" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="h-28 overflow-auto">
                {academicInsights?.studentsNeedingAttention && academicInsights.studentsNeedingAttention.length > 0 ? (
                  <div className="space-y-1">
                    {academicInsights.studentsNeedingAttention.slice(0, 4).map((student) => (
                      <div key={student.id} className="flex items-center justify-between text-xs">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium truncate block">{student.name}</span>
                          <span className="text-[10px] text-muted-foreground">{student.cluster}</span>
                        </div>
                        <div className="flex gap-1 ml-2 shrink-0">
                          {(student.issue === "low_attendance" || student.issue === "both") && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0">
                              A:{student.attendancePercentage?.toFixed(0)}%
                            </Badge>
                          )}
                          {(student.issue === "low_academic" || student.issue === "both") && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0">
                              R:{student.resultPercentage?.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                    All students performing well
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}