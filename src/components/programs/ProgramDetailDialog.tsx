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
  Program,
  useProgramClusters,
  useProgramStudents,
} from "@/hooks/usePrograms";
import { BookOpen, MapPin, Users, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgramDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: Program | null;
}

const ProgramDetailDialog = ({
  open,
  onOpenChange,
  program,
}: ProgramDetailDialogProps) => {
  const { data: clusters, isLoading: loadingClusters } = useProgramClusters(
    program?.id || null
  );
  const { data: students, isLoading: loadingStudents } = useProgramStudents(
    program?.id || null
  );

  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {program.name}
                <Badge variant={program.is_active ? "success" : "secondary"}>
                  {program.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {program.description && (
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Description</div>
              <p>{program.description}</p>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <MapPin className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <div className="text-2xl font-bold">{clusters?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Clusters</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <GraduationCap className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <div className="text-2xl font-bold">{students?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Student Records</div>
            </div>
          </div>

          {/* Clusters & Students Tabs */}
          <Tabs defaultValue="clusters" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clusters" className="gap-2">
                <MapPin className="h-4 w-4" />
                Clusters ({clusters?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="students" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Students ({students?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clusters" className="mt-4">
              {loadingClusters ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : clusters && clusters.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cluster Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clusters.map((cluster) => (
                        <TableRow key={cluster.id}>
                          <TableCell className="font-medium">
                            {cluster.name}
                          </TableCell>
                          <TableCell>{cluster.city || "-"}</TableCell>
                          <TableCell>{cluster.state || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No clusters associated with this program
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
                        <TableHead>Cluster</TableHead>
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
                            {(record.clusters as { name: string })?.name}
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
                  No students enrolled in this program
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramDetailDialog;
