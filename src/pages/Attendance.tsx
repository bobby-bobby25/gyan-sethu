import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Download,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Loader2,
  CalendarCheck,
  List,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import {
  useAllAttendanceRecords,
  useAttendanceStatusTypes,
} from "@/hooks/useAttendance";
import { useClusters, usePrograms } from "@/hooks/useTeachers";
import { AttendanceMarking } from "@/components/attendance/AttendanceMarking";
import AttendanceReports from "@/components/attendance/AttendanceReports";
import { useAuth } from "@/contexts/AuthContext";

const Attendance = () => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("mark");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filterCluster, setFilterCluster] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: records, isLoading: recordsLoading } = useAllAttendanceRecords(
    selectedDate,
    filterCluster,
    filterProgram,
    filterStatus
  );
  const { data: clusters } = useClusters();
  const { data: programs } = usePrograms();
  const { data: statusTypes } = useAttendanceStatusTypes();
  const isTeacher = userRole === "teacher";

  const stats = useMemo(() => {
    if (!records) return { present: 0, absent: 0, total: 0, rate: 0 };
    const present = records.filter(
      (r) => r.attendance_status_types?.code === "P"
    ).length;
    const absent = records.filter(
      (r) => r.attendance_status_types?.code === "A"
    ).length;
    const total = records.length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : "0";
    return { present, absent, total, rate };
  }, [records]);

  const uniqueClusters = useMemo(() => {
    if (!records) return 0;
    return new Set(records.map((r) => r.cluster_id)).size;
  }, [records]);

  return (
    <DashboardLayout pageTitle="Attendance" pageSubtitle="Track and manage student attendance across all clusters">
      <div className="space-y-6">
        {/* Mobile title */}
        <h1 className="text-2xl font-display font-bold sm:hidden">Attendance</h1>

        {/* Action Row */}
        <div className="flex items-center justify-end gap-3">
          <Badge variant="info" className="gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(selectedDate), "MMM dd, yyyy")}
          </Badge>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="mark" className="gap-2">
              <CalendarCheck className="h-4 w-4" />
              Mark Attendance
            </TabsTrigger>
            {/* <TabsTrigger value="view" className="gap-2">
              <List className="h-4 w-4" />
              View Records
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </TabsTrigger> */}

            {!isTeacher && (
              <TabsTrigger value="view" className="gap-2">
                <List className="h-4 w-4" />
                View Records
              </TabsTrigger>
            )}

            {!isTeacher && (
              <TabsTrigger value="reports" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            )}


          </TabsList>

          {/* Mark Attendance Tab */}
          <TabsContent value="mark" className="mt-6">
            <AttendanceMarking onComplete={() => setActiveTab("view")} />
          </TabsContent>

          {/* View Records Tab */}
          {!isTeacher && (
          <TabsContent value="view" className="mt-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card variant="stat" className="border-l-success">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-success-muted flex items-center justify-center">
                    <Check className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {stats.present}
                    </p>
                    <p className="text-sm text-muted-foreground">Present Today</p>
                  </div>
                </CardContent>
              </Card>
              <Card variant="stat" className="border-l-destructive">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <X className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {stats.absent}
                    </p>
                    <p className="text-sm text-muted-foreground">Absent Today</p>
                  </div>
                </CardContent>
              </Card>
              <Card variant="stat" className="border-l-primary">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {stats.rate}%
                    </p>
                    <p className="text-sm text-muted-foreground">Today's Rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card variant="stat" className="border-l-accent">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {uniqueClusters}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Clusters Active
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cluster</label>
                    <Select value={filterCluster} onValueChange={setFilterCluster}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Clusters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clusters</SelectItem>
                        {clusters?.map((cluster) => (
                          <SelectItem key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Program</label>
                    <Select value={filterProgram} onValueChange={setFilterProgram}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Programs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programs?.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statusTypes?.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Records Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Attendance Records</CardTitle>
                <Badge variant="muted" className="gap-1">
                  <Users className="h-3 w-3" />
                  {records?.length || 0} records
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {recordsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : records && records.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Cluster</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead>Marked By</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record) => (
                          <TableRow key={record.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {record.students?.name || "-"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {record.students?.id || "-"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{record.clusters?.name || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {record.programs?.name || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {record.attendance_status_types?.code === "P" ? (
                                <Badge variant="success" className="gap-1">
                                  <Check className="h-3 w-3" /> Present
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="gap-1">
                                  <X className="h-3 w-3" /> Absent
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {record.teachers?.name || "-"}
                            </TableCell>
                            <TableCell>
                              {record.marked_at ? (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(record.marked_at), "hh:mm a")}
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records found for the selected filters.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Reports Tab */}
          {!isTeacher && (
          <TabsContent value="reports" className="mt-6">
            <AttendanceReports />
          </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
