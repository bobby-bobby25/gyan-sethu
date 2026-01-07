import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  BookOpen,
  Users,
  MapPin,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProgramsWithStats, ProgramWithStats } from "@/hooks/usePrograms";
import ProgramFormDialog from "@/components/programs/ProgramFormDialog";
import ProgramDetailDialog from "@/components/programs/ProgramDetailDialog";
import DeleteProgramDialog from "@/components/programs/DeleteProgramDialog";

// Color palette for programs
const programColors = [
  "bg-primary",
  "bg-info",
  "bg-accent",
  "bg-success",
  "bg-warning",
  "bg-destructive",
];

const Programs = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithStats | null>(null);

  const { data: programs, isLoading } = useProgramsWithStats();

  const handleEdit = (program: ProgramWithStats) => {
    setSelectedProgram(program);
    setFormOpen(true);
  };

  const handleView = (program: ProgramWithStats) => {
    setSelectedProgram(program);
    setDetailOpen(true);
  };

  const handleDelete = (program: ProgramWithStats) => {
    setSelectedProgram(program);
    setDeleteOpen(true);
  };

  const handleAdd = () => {
    setSelectedProgram(null);
    setFormOpen(true);
  };

  const getProgramColor = (index: number) => {
    return programColors[index % programColors.length];
  };

  // Consider mapping API fields (e.g., programID -> id) in your data hook for consistency
  const formatCount = (count?: number) => {
    if (typeof count !== "number" || isNaN(count)) return "0";
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <DashboardLayout pageTitle="Programs" pageSubtitle="Manage educational programs and their configurations">
      <div className="space-y-6">
        {/* Mobile title */}
        <h1 className="text-2xl font-display font-bold sm:hidden">Programs</h1>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button variant="hero" className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Program
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} variant="elevated">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : programs && programs.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No programs found</h3>
            <p className="text-muted-foreground mt-1">
              Get started by adding your first program
            </p>
            <Button variant="hero" className="mt-4 gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              Add Program
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {programs?.map((program, index) => (
              <Card
                key={program.id}
                variant="elevated"
                className={!program.is_active ? "opacity-70" : ""}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${getProgramColor(index)} flex items-center justify-center shrink-0`}
                    >
                      <BookOpen className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{program.name}</CardTitle>
                        <Badge
                          variant={program.is_active ? "success" : "secondary"}
                        >
                          {program.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {program.description && (
                        <p className="text-sm text-muted-foreground mt-1 max-w-md line-clamp-2">
                          {program.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => handleView(program)}
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => handleEdit(program)}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => handleDelete(program)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs">Clusters</span>
                      </div>
                      <p className="text-xl font-display font-bold">
                        {formatCount(program.cluster_count)}
                      </p>
                    </div>
                    <div className="text-center border-x">
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Students</span>
                      </div>
                      <p className="text-xl font-display font-bold">
                        {formatCount(program.student_count)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                        <UserCheck className="h-4 w-4" />
                        <span className="text-xs">Teachers</span>
                      </div>
                      <p className="text-xl font-display font-bold">
                        {formatCount(program.teacher_count)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(program)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProgramFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        program={selectedProgram}
      />

      <ProgramDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        program={selectedProgram}
      />

      <DeleteProgramDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        program={selectedProgram}
      />
    </DashboardLayout>
  );
};

export default Programs;
