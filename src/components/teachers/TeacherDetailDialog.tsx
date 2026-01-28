import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import {
  TeacherWithAssignments,
  TeacherAssignment,
  useDeleteTeacherAssignment,
} from "@/hooks/useTeachers";
import { TeacherAssignmentDialog } from "./TeacherAssignmentDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface TeacherDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherWithAssignments | null;
}

export function TeacherDetailDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherDetailDialogProps) {
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<TeacherAssignment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] =
    useState<TeacherAssignment | null>(null);

  const deleteAssignment = useDeleteTeacherAssignment();

  if (!teacher) return null;

  const activeAssignments =
    teacher.teacher_assignments?.filter((a) => a.is_active) || [];

  const handleEditAssignment = (assignment: TeacherAssignment) => {
    setSelectedAssignment(assignment);
    setAssignmentDialogOpen(true);
  };

  const handleDeleteAssignment = (assignment: TeacherAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (assignmentToDelete) {
      await deleteAssignment.mutateAsync(assignmentToDelete.id);
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    }
  };

  // Format date of birth for display
  const formattedDob = (teacher as any).date_of_birth
    ? format(new Date((teacher as any).date_of_birth), "dd MMM yyyy")
    : null;

  // Get location string
  const locationParts = [
    (teacher as any).city,
    (teacher as any).state,
  ].filter(Boolean);
  const locationString = locationParts.length > 0 ? locationParts.join(", ") : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={(teacher as any).photo_url || undefined} />
                <AvatarFallback className="bg-muted text-lg">
                  {teacher.name?.charAt(0)?.toUpperCase() || "T"}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{teacher.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={teacher.is_active ? "success" : "secondary"}>
                    {teacher.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="assignments">
                Assignments ({activeAssignments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Gender</p>
                          <p className="font-medium">
                            {(teacher as any).gender || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">
                            {formattedDob || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">
                            {teacher.email || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">
                            {teacher.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Address
                          </p>
                          <p className="font-medium">
                            {teacher.address || "Not provided"}
                          </p>
                          {locationString && (
                            <p className="text-sm text-muted-foreground">
                              {locationString}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            ID Proof
                          </p>
                          <p className="font-medium">
                            {teacher.id_proof_types?.name || "Not provided"}
                            {teacher.id_proof_number && ` - ${teacher.id_proof_number}`}
                          </p>
                        </div>
                      </div>

                      {(teacher as any).notes && (
                        <div className="flex items-start gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="font-medium whitespace-pre-wrap">
                              {(teacher as any).notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedAssignment(null);
                    setAssignmentDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </div>

              {activeAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active assignments. Add one to assign this teacher to a
                  cluster and program.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead className="text-center">Role</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {assignment.academic_years?.name}
                              {assignment.academic_years?.is_current && (
                                <Badge variant="secondary" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {assignment.clusters?.name || "-"}
                          </TableCell>
                          <TableCell>
                            {assignment.programs?.name || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                assignment.role === "main"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {assignment.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() =>
                                    handleEditAssignment(assignment)
                                  }
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 text-destructive"
                                  onClick={() =>
                                    handleDeleteAssignment(assignment)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" /> Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <TeacherAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        teacherId={teacher.id}
        assignment={selectedAssignment}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this assignment? This action will
              deactivate the assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
