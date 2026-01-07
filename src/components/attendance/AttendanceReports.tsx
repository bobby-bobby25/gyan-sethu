import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Download,
  CalendarIcon,
  Check,
  X,
  TrendingUp,
  MapPin,
  BookOpen,
  BarChart3,
  Users,
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
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useAttendanceReport,
  exportToCSV,
} from "@/hooks/useAttendanceReport";
import { useClusters, usePrograms } from "@/hooks/useTeachers";

const AttendanceReports = () => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [filterCluster, setFilterCluster] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");

  const { data: reportData, isLoading } = useAttendanceReport(
    format(startDate, "yyyy-MM-dd"),
    format(endDate, "yyyy-MM-dd"),
    filterCluster,
    filterProgram
  );

  const { data: clusters } = useClusters();
  const { data: programs } = usePrograms();

  const handleExport = () => {
    if (reportData?.records) {
      const filename = `attendance_report_${format(startDate, "yyyy-MM-dd")}_to_${format(endDate, "yyyy-MM-dd")}`;
      exportToCSV(reportData.records, filename);
    }
  };

  const handleQuickRange = (range: "week" | "month" | "thisMonth") => {
    const today = new Date();
    if (range === "week") {
      setStartDate(subDays(today, 7));
      setEndDate(today);
    } else if (range === "month") {
      setStartDate(subDays(today, 30));
      setEndDate(today);
    } else if (range === "thisMonth") {
      setStartDate(startOfMonth(today));
      setEndDate(endOfMonth(today));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Attendance Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Range Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRange("week")}
            >
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRange("month")}
            >
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRange("thisMonth")}
            >
              This Month
            </Button>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Cluster Filter */}
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

            {/* Program Filter */}
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

            {/* Export Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button
                onClick={handleExport}
                disabled={!reportData?.records.length}
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : reportData ? (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">
                    {reportData.overallStats.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                </div>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-success-muted flex items-center justify-center">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">
                    {reportData.overallStats.present.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Present</p>
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
                    {reportData.overallStats.absent.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">
                    {reportData.overallStats.rate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend Chart */}
            {reportData.dailyStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daily Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => format(new Date(value), "MMM d")}
                          className="text-xs"
                        />
                        <YAxis
                          tickFormatter={(value) => `${value}%`}
                          domain={[0, 100]}
                          className="text-xs"
                        />
                        <Tooltip
                          labelFormatter={(value) => format(new Date(value), "PPP")}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, "Rate"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cluster Stats Chart */}
            {reportData.clusterStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Attendance by Cluster</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.clusterStats.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <YAxis
                          type="category"
                          dataKey="cluster_name"
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Rate"]} />
                        <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cluster Stats Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  By Cluster
                </CardTitle>
                <Badge variant="muted">{reportData.clusterStats.length} clusters</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {reportData.clusterStats.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cluster</TableHead>
                          <TableHead className="text-center">Present</TableHead>
                          <TableHead className="text-center">Absent</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.clusterStats.map((stat) => (
                          <TableRow key={stat.cluster_id}>
                            <TableCell className="font-medium">
                              {stat.cluster_name}
                            </TableCell>
                            <TableCell className="text-center text-success">
                              {stat.present}
                            </TableCell>
                            <TableCell className="text-center text-destructive">
                              {stat.absent}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  stat.rate >= 90
                                    ? "success"
                                    : stat.rate >= 75
                                    ? "warning"
                                    : "destructive"
                                }
                              >
                                {stat.rate.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Program Stats Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  By Program
                </CardTitle>
                <Badge variant="muted">{reportData.programStats.length} programs</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {reportData.programStats.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Program</TableHead>
                          <TableHead className="text-center">Present</TableHead>
                          <TableHead className="text-center">Absent</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.programStats.map((stat) => (
                          <TableRow key={stat.program_id}>
                            <TableCell className="font-medium">
                              {stat.program_name}
                            </TableCell>
                            <TableCell className="text-center text-success">
                              {stat.present}
                            </TableCell>
                            <TableCell className="text-center text-destructive">
                              {stat.absent}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  stat.rate >= 90
                                    ? "success"
                                    : stat.rate >= 75
                                    ? "warning"
                                    : "destructive"
                                }
                              >
                                {stat.rate.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Select a date range to view the report
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;
