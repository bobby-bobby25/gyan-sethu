import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  School,
  Navigation,
  Building2,
  Users,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { useLearningCentre, useLearningCentreTeachers, useLearningCentreStudents } from "@/hooks/useLearningCentres";
import { Skeleton } from "@/components/ui/skeleton";

interface LearningCentreDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learningCentreId: number | null;
}

const LearningCentreDetailDialog = ({
  open,
  onOpenChange,
  learningCentreId,
}: LearningCentreDetailDialogProps) => {
  const { data: learningCentre, isLoading } = useLearningCentre(learningCentreId);
  const { data: teachers, isLoading: loadingTeachers } = useLearningCentreTeachers(learningCentreId);
  const { data: students, isLoading: loadingStudents } = useLearningCentreStudents(learningCentreId);

  if (!learningCentre && !isLoading) return null;

  const location = learningCentre ? [learningCentre.city, learningCentre.state].filter(Boolean).join(", ") : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div>{isLoading ? "Loading..." : learningCentre?.name}</div>
              {location && (
                <p className="text-sm font-normal text-muted-foreground">
                  {location}
                </p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        ) : learningCentre ? (
          <div className="space-y-6">
            {/* Learning Centre Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Status</div>
                <Badge
                  variant={learningCentre.is_active ? "default" : "secondary"}
                  className="mt-1"
                >
                  {learningCentre.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3" /> Geo Radius
                </div>
                <div className="font-semibold mt-1">
                  {learningCentre.geo_radius_meters || 200}m
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Latitude</div>
                <div className="font-semibold mt-1">
                  {learningCentre.latitude?.toFixed(6) || "Not set"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Longitude</div>
                <div className="font-semibold mt-1">
                  {learningCentre.longitude?.toFixed(6) || "Not set"}
                </div>
              </div>
            </div>

            {learningCentre.address && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Full Address</div>
                <div className="mt-1">{learningCentre.address}</div>
              </div>
            )}

            {(learningCentre as any).notes && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Notes</div>
                <div className="mt-1 text-sm">{(learningCentre as any).notes}</div>
              </div>
            )}

            {/* Teachers & Students Tabs */}
            <Tabs defaultValue="teachers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teachers" className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Teachers ({teachers?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="students" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Students ({students?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teachers" className="mt-4">
                {loadingTeachers ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : teachers && teachers.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Academic Year</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teachers.map((assignment: any) => (
                          <TableRow key={assignment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {assignment.teachers?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {assignment.teachers?.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={assignment.role === "main" ? "default" : "secondary"}>
                                {assignment.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {assignment.programs?.name}
                            </TableCell>
                            <TableCell>
                              {assignment.academic_years?.name}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No teachers assigned to this learning centre
                  </div>
                )}
              </TabsContent>

              <TabsContent value="students" className="mt-4">
                {loadingStudents ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : students && students.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Academic Year</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((record: any) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-mono text-sm">
                              {record.students?.student_code}
                            </TableCell>
                            <TableCell className="font-medium">
                              {record.students?.name}
                            </TableCell>
                            <TableCell>
                              {record.programs?.name}
                            </TableCell>
                            <TableCell>
                              {record.academic_years?.name}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No students enrolled in this learning centre
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default LearningCentreDetailDialog;
