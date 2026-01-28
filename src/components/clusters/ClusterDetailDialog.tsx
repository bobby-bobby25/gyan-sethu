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
  Cluster,
  useClusterTeachers,
  useClusterStudents,
} from "@/hooks/useClusters";
import { MapPin, Users, UserCheck, Navigation, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ClusterDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cluster: Cluster | null;
}

const ClusterDetailDialog = ({
  open,
  onOpenChange,
  cluster,
}: ClusterDetailDialogProps) => {
  const { data: teachers, isLoading: loadingTeachers } = useClusterTeachers(
    cluster?.id || null
  );
  const { data: students, isLoading: loadingStudents } = useClusterStudents(
    cluster?.id || null
  );

  if (!cluster) return null;

  const location = [cluster.city, cluster.state].filter(Boolean).join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div>{cluster.name}</div>
              {location && (
                <p className="text-sm font-normal text-muted-foreground">
                  {location}
                </p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cluster Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge
                variant={cluster.is_active ? "default" : "secondary"}
                className="mt-1"
              >
                {cluster.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Navigation className="h-3 w-3" /> Geo Radius
              </div>
              <div className="font-semibold mt-1">
                {cluster.geo_radius_meters || 200}m
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Latitude</div>
              <div className="font-semibold mt-1">
                {cluster.latitude?.toFixed(6) || "Not set"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Longitude</div>
              <div className="font-semibold mt-1">
                {cluster.longitude?.toFixed(6) || "Not set"}
              </div>
            </div>
          </div>

          {cluster.address && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Full Address</div>
              <div className="mt-1">{cluster.address}</div>
            </div>
          )}

          {(cluster as any).notes && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Notes</div>
              <div className="mt-1 text-sm">{(cluster as any).notes}</div>
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
                      {teachers.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {(assignment.teachers as { name: string })?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {(assignment.teachers as { email: string })?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={assignment.role === "main" ? "default" : "secondary"}>
                              {assignment.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(assignment.programs as { name: string })?.name}
                          </TableCell>
                          <TableCell>
                            {(assignment.academic_years as { name: string })?.name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No teachers assigned to this cluster
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
                      {students.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono text-sm">
                            {(record.students as { student_code: string })?.student_code}
                          </TableCell>
                          <TableCell className="font-medium">
                            {(record.students as { name: string })?.name}
                          </TableCell>
                          <TableCell>
                            {(record.programs as { name: string })?.name}
                          </TableCell>
                          <TableCell>
                            {(record.academic_years as { name: string })?.name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No students enrolled in this cluster
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClusterDetailDialog;
