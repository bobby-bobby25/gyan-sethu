import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudents, useClusters, usePrograms, type StudentWithDetails } from "@/hooks/useStudents";
import { StudentFormDialog } from "@/components/students/StudentFormDialog";
import { DeleteStudentDialog } from "@/components/students/DeleteStudentDialog";
import { StudentDetailDialog } from "@/components/students/StudentDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  
  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);

  // Fetch data
  const { data: students, isLoading, error } = useStudents({
    search: searchQuery || undefined,
    clusterId: selectedCluster !== "all" ? selectedCluster : undefined,
    programId: selectedProgram !== "all" ? selectedProgram : undefined,
    isActive: selectedStatus === "active" ? true : selectedStatus === "inactive" ? false : undefined,
  });
  const { data: clusters } = useClusters();
  const { data: programs } = usePrograms();

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setFormOpen(true);
  };

  const handleEditStudent = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const handleDeleteStudent = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setDeleteOpen(true);
  };

  const handleViewDetails = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const getStatusBadge = (student: StudentWithDetails) => {
    const attendance = student.current_academic_record?.attendance_percentage;
    if (attendance === null || attendance === undefined) {
      return <Badge variant="muted">No Data</Badge>;
    }
    if (attendance >= 75) {
      return <Badge variant="success">Active</Badge>;
    }
    return <Badge variant="warning">Needs Attention</Badge>;
  };

  const getAttendanceColor = (attendance: number | null | undefined) => {
    if (attendance === null || attendance === undefined) return "text-muted-foreground";
    if (attendance >= 90) return "text-success";
    if (attendance >= 75) return "text-warning";
    return "text-destructive";
  };

  // Calculate stats
  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter(s => s.is_active).length || 0;
  const avgAttendance = students?.length
    ? (students.reduce((sum, s) => sum + (s.current_academic_record?.attendance_percentage || 0), 0) / 
       students.filter(s => s.current_academic_record?.attendance_percentage).length || 0).toFixed(1)
    : "0";

  return (
    <DashboardLayout pageTitle="Students" pageSubtitle="Manage student records and track their progress">
      <div className="space-y-6">
        {/* Mobile title */}
        <h1 className="text-2xl font-display font-bold sm:hidden">Students</h1>

        {/* Search, Filters and Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCluster} onValueChange={setSelectedCluster}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Cluster" />
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
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Program" />
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button> */}
          </div>
          <Button variant="hero" className="gap-2 shrink-0" onClick={handleAddStudent}>
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="stat" className="border-l-primary">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-muted flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-display font-bold">{totalStudents.toLocaleString()}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-l-success">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success-muted flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-success" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-display font-bold">{activeStudents.toLocaleString()}</p>
                )}
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-l-accent">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent-muted flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-display font-bold">{avgAttendance}%</p>
                )}
                <p className="text-sm text-muted-foreground">Avg. Attendance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-destructive">
                Failed to load students. Please try again.
              </div>
            ) : students?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p>No students found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/15 hover:bg-primary/15">
                    <TableHead className="w-28 font-bold text-foreground">ID</TableHead>
                    <TableHead className="font-bold text-foreground">Name</TableHead>
                    <TableHead className="font-bold text-foreground">Cluster</TableHead>
                    <TableHead className="font-bold text-foreground">Program</TableHead>
                    <TableHead className="font-bold text-foreground">Class</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Attendance</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Performance</TableHead>
                    <TableHead className="font-bold text-foreground">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {students?.map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {student.student_code || student.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          {student.current_academic_record?.clusters?.name || "—"}
                        </TableCell>
                        <TableCell>
                          {student.current_academic_record?.programs?.name ? (
                            <Badge variant="secondary">
                              {student.current_academic_record.programs.name}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {student.current_academic_record?.class_grade || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.current_academic_record?.attendance_percentage !== null &&
                          student.current_academic_record?.attendance_percentage !== undefined ? (
                            <span
                              className={`font-semibold ${getAttendanceColor(
                                student.current_academic_record.attendance_percentage
                              )}`}
                            >
                              {student.current_academic_record.attendance_percentage}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.current_academic_record?.result_percentage !== null &&
                          student.current_academic_record?.result_percentage !== undefined ? (
                            <span className="font-semibold">
                              {student.current_academic_record.result_percentage}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(student)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Academic Records"
                              onClick={() => handleViewDetails(student)}
                            >
                              <GraduationCap className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Family Members"
                              onClick={() => handleViewDetails(student)}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleViewDetails(student)}
                                >
                                  <Eye className="h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleEditStudent(student)}
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 text-destructive"
                                  onClick={() => handleDeleteStudent(student)}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={selectedStudent}
      />
      <DeleteStudentDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        studentId={selectedStudent?.id || null}
        studentName={selectedStudent?.name || ""}
      />
      <StudentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        student={selectedStudent}
      />
    </DashboardLayout>
  );
};

export default Students;
