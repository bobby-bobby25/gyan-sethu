import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  BookOpen,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
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

// Bold accent colors for left border
const programBorderColors = [
  "border-l-primary",
  "border-l-info",
  "border-l-accent",
  "border-l-success",
  "border-l-warning",
  "border-l-destructive",
];

const programIconColors = [
  "bg-primary text-primary-foreground",
  "bg-info text-info-foreground",
  "bg-accent text-accent-foreground",
  "bg-success text-success-foreground",
  "bg-warning text-warning-foreground",
  "bg-destructive text-destructive-foreground",
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

  const getBorderColor = (index: number) => {
    return programBorderColors[index % programBorderColors.length];
  };

  const getIconColor = (index: number) => {
    return programIconColors[index % programIconColors.length];
  };

  const getEmptyHint = (program: ProgramWithStats) => {
    if (program.cluster_count === 0) return "No clusters assigned yet";
    if (program.student_count === 0) return "No students enrolled yet";
    if (program.teacher_count === 0) return "No teachers assigned yet";
    return null;
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-l-4 border-l-muted">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-5">
                    <Skeleton className="h-14" />
                    <Skeleton className="h-14" />
                    <Skeleton className="h-14" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {programs?.map((program, index) => {
              const emptyHint = getEmptyHint(program);
              return (
                <Card
                  key={program.id}
                  className={`border-l-4 ${getBorderColor(index)} bg-primary/5 transition-all cursor-pointer hover:shadow-lg hover:border-l-[6px] ${!program.is_active ? "opacity-60" : ""}`}
                  onClick={() => handleView(program)}
                >
                  <CardContent className="p-0">
                    {/* Header with darker green background */}
                    <div className="bg-primary/15 p-4 rounded-t-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg ${getIconColor(index)} flex items-center justify-center shrink-0`}
                          >
                            <BookOpen className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-foreground leading-tight">
                                {program.name}
                              </h3>
                              <Badge
                                variant={program.is_active ? "success" : "secondary"}
                                className="shrink-0 text-[10px]"
                              >
                                {program.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {program.description && (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                                {program.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(program);
                              }}
                            >
                              <Eye className="h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(program);
                              }}
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(program);
                              }}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Metrics - Number-first, label-secondary */}
                    <div className="grid grid-cols-3 gap-4 p-4 border-t">
                      <div>
                        <p className={`text-2xl font-bold ${program.cluster_count === 0 ? "text-muted-foreground/30" : "text-foreground"}`}>
                          {program.cluster_count}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Clusters</p>
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${program.student_count === 0 ? "text-muted-foreground/30" : "text-foreground"}`}>
                          {program.student_count}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Students</p>
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${program.teacher_count === 0 ? "text-muted-foreground/30" : "text-foreground"}`}>
                          {program.teacher_count}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Teachers</p>
                      </div>
                    </div>

                    {/* Empty state hint - only for zero-data */}
                    {program.cluster_count === 0 && program.student_count === 0 && program.teacher_count === 0 && (
                      <p className="text-[11px] text-warning mt-2 font-medium">
                        No clusters assigned yet
                      </p>
                    )}

                    {/* Primary Action */}
                    <div className="flex items-center justify-end mt-3 pt-3 border-t">
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5 h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(program);
                        }}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
