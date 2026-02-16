import { useState, useMemo } from "react";
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
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  MapPin,
  BookOpen,
  Loader2,
  ClipboardList,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useTeachers,
  TeacherWithAssignments,
} from "@/hooks/useTeachers";
import { TeacherFormDialog } from "@/components/teachers/TeacherFormDialog";
import { DeleteTeacherDialog } from "@/components/teachers/DeleteTeacherDialog";
import { TeacherDetailDialog } from "@/components/teachers/TeacherDetailDialog";

const Teachers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] =
    useState<TeacherWithAssignments | null>(null);

  const { data: teachers, isLoading } = useTeachers();

  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teachers, searchQuery]);

  const stats = useMemo(() => {
    if (!teachers) return { total: 0, main: 0, backup: 0 };
    
    let main = 0;
    let backup = 0;
    
    teachers.forEach((teacher) => {
      const activeAssignments = teacher.teacher_assignments?.filter(
        (a) => a.is_active
      );
      const hasMainRole = activeAssignments?.some((a) => a.role === "main");
      if (hasMainRole) {
        main++;
      } else if (activeAssignments && activeAssignments.length > 0) {
        backup++;
      }
    });

    return { total: teachers.length, main, backup };
  }, [teachers]);

  const handleEdit = (teacher: TeacherWithAssignments) => {
    setSelectedTeacher(teacher);
    setFormDialogOpen(true);
  };

  const handleDelete = (teacher: TeacherWithAssignments) => {
    setSelectedTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (teacher: TeacherWithAssignments) => {
    setSelectedTeacher(teacher);
    setDetailDialogOpen(true);
  };

  const getUniqueValues = (
    assignments: TeacherWithAssignments["teacher_assignments"],
    key: "clusters" | "programs"
  ) => {
    if (!assignments) return [];
    const activeAssignments = assignments.filter((a) => a.is_active);
    const uniqueNames = new Set(
      activeAssignments.map((a) => a[key]?.name).filter(Boolean)
    );
    return Array.from(uniqueNames);
  };

  const getPrimaryRole = (
    assignments: TeacherWithAssignments["teacher_assignments"]
  ) => {
    if (!assignments) return null;
    const activeAssignments = assignments.filter((a) => a.is_active);
    return activeAssignments.some((a) => a.role === "main") ? "main" : "backup";
  };

  return (
    <DashboardLayout pageTitle="Teachers" pageSubtitle="Manage teacher assignments and program allocations">
      <div className="space-y-6">
        {/* Mobile title */}
        <h1 className="text-2xl font-display font-bold sm:hidden">Teachers</h1>

        {/* Search, Filters and Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative w-full flex-1 sm:flex-[0.66]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button> */}
          </div>
          <Button
            variant="hero"
            className="gap-2 shrink-0"
            onClick={() => {
              setSelectedTeacher(null);
              setFormDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="stat" className="border-l-info">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-info-muted flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-l-primary">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-muted flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stats.main}</p>
                <p className="text-sm text-muted-foreground">Main Teachers</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-l-accent">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent-muted flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stats.backup}</p>
                <p className="text-sm text-muted-foreground">Backup Teachers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teachers Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No teachers found matching your search."
                : "No teachers found. Add your first teacher to get started."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/15 hover:bg-primary/15">
                    <TableHead className="font-bold text-foreground">Name</TableHead>
                    <TableHead className="font-bold text-foreground">Contact</TableHead>
                    <TableHead className="font-bold text-foreground">Clusters</TableHead>
                    <TableHead className="font-bold text-foreground">Programs</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Role</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTeachers.map((teacher) => {
                      const clusters = getUniqueValues(
                        teacher.teacher_assignments,
                        "clusters"
                      );
                      const programs = getUniqueValues(
                        teacher.teacher_assignments,
                        "programs"
                      );
                      const role = getPrimaryRole(teacher.teacher_assignments);

                      return (
                        <TableRow key={teacher.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {teacher.name}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{teacher.email || "-"}</p>
                              <p className="text-muted-foreground">
                                {teacher.phone || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {clusters.length > 0 ? (
                                clusters.map((cluster) => (
                                  <Badge
                                    key={cluster}
                                    variant="muted"
                                    className="text-xs"
                                  >
                                    {cluster}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  -
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {programs.length > 0 ? (
                                programs.map((program) => (
                                  <Badge
                                    key={program}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {program}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  -
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {role ? (
                              <Badge
                                variant={
                                  role === "main" ? "default" : "outline"
                                }
                              >
                                {role}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                title="View Assignments"
                                onClick={() => handleViewDetails(teacher)}
                              >
                                <ClipboardList className="h-4 w-4" />
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
                                    onClick={() => handleViewDetails(teacher)}
                                  >
                                    <Eye className="h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onClick={() => handleEdit(teacher)}
                                  >
                                    <Edit className="h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2 text-destructive"
                                    onClick={() => handleDelete(teacher)}
                                  >
                                    <Trash2 className="h-4 w-4" /> Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <TeacherFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        teacher={selectedTeacher}
      />

      <DeleteTeacherDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        teacher={selectedTeacher}
      />

      <TeacherDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        teacher={selectedTeacher}
      />
    </DashboardLayout>
  );
};

export default Teachers;
