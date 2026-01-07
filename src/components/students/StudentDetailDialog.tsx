import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MoreHorizontal, Edit, Trash2, Loader2, Calendar, MapPin, GraduationCap, User, Users, IndianRupee, Briefcase } from "lucide-react";
import { useStudentAcademicRecords, useDeleteAcademicRecord, type AcademicRecordWithDetails } from "@/hooks/useAcademicRecords";
import { useFamilyMembers, useDeleteFamilyMember, type FamilyMemberWithDetails } from "@/hooks/useFamilyMembers";
import { AcademicRecordFormDialog } from "./AcademicRecordFormDialog";
import { FamilyMemberFormDialog } from "./FamilyMemberFormDialog";
import type { StudentWithDetails } from "@/hooks/useStudents";
import { format } from "date-fns";

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentWithDetails | null;
}

export function StudentDetailDialog({ open, onOpenChange, student }: StudentDetailDialogProps) {
  // Academic records state
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AcademicRecordWithDetails | null>(null);
  const [deleteRecordOpen, setDeleteRecordOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AcademicRecordWithDetails | null>(null);

  // Family members state
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMemberWithDetails | null>(null);
  const [deleteMemberOpen, setDeleteMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMemberWithDetails | null>(null);

  // Data fetching
  const { data: academicRecords, isLoading: recordsLoading } = useStudentAcademicRecords(student?.id || null);
  const { data: familyMembers, isLoading: membersLoading } = useFamilyMembers(student?.id || null);
  const deleteRecord = useDeleteAcademicRecord();
  const deleteMember = useDeleteFamilyMember();

  if (!student) return null;

  // Academic record handlers
  const handleAddRecord = () => {
    setSelectedRecord(null);
    setRecordFormOpen(true);
  };

  const handleEditRecord = (record: AcademicRecordWithDetails) => {
    setSelectedRecord(record);
    setRecordFormOpen(true);
  };

  const handleDeleteRecord = (record: AcademicRecordWithDetails) => {
    setRecordToDelete(record);
    setDeleteRecordOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (!recordToDelete || !student) return;
    await deleteRecord.mutateAsync({ id: recordToDelete.id, studentId: student.id });
    setDeleteRecordOpen(false);
    setRecordToDelete(null);
  };

  // Family member handlers
  const handleAddMember = () => {
    setSelectedMember(null);
    setMemberFormOpen(true);
  };

  const handleEditMember = (member: FamilyMemberWithDetails) => {
    setSelectedMember(member);
    setMemberFormOpen(true);
  };

  const handleDeleteMember = (member: FamilyMemberWithDetails) => {
    setMemberToDelete(member);
    setDeleteMemberOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete || !student) return;
    await deleteMember.mutateAsync({ id: memberToDelete.id, studentId: student.id });
    setDeleteMemberOpen(false);
    setMemberToDelete(null);
  };

  const getAttendanceColor = (attendance: number | null | undefined) => {
    if (attendance === null || attendance === undefined) return "text-muted-foreground";
    if (attendance >= 90) return "text-success";
    if (attendance >= 75) return "text-warning";
    return "text-destructive";
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Details
            </DialogTitle>
          </DialogHeader>

          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="flat" className="border">
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-mono text-sm">{student.student_code || (student.id ? String(student.id).slice(0, 8) : "—")}</p>
                </div>
                {student.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="text-sm">{format(new Date(student.date_of_birth), "PPP")}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card variant="flat" className="border">
              <CardContent className="p-4 space-y-3">
                {student.caste_categories && (
                  <div>
                    <p className="text-sm text-muted-foreground">Caste Category</p>
                    <Badge variant="secondary">{student.caste_categories.name}</Badge>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-sm">{student.address}</p>
                    </div>
                  </div>
                )}
                {student.enrolledAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Enrolled On</p>
                    <p className="text-sm">{format(new Date(student.enrolledAt), "PPP")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Tabs for Academic Records and Family Members */}
          <Tabs defaultValue="academic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="academic" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic Records
              </TabsTrigger>
              <TabsTrigger value="family" className="gap-2">
                <Users className="h-4 w-4" />
                Family Members
              </TabsTrigger>
            </TabsList>

            {/* Academic Records Tab */}
            <TabsContent value="academic" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Track yearly academic progress and cluster assignments
                </p>
                <Button size="sm" onClick={handleAddRecord}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Record
                </Button>
              </div>

              {recordsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : academicRecords?.length === 0 ? (
                <Card variant="flat" className="border border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <GraduationCap className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No academic records yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add a record to assign this student to a cluster and program
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-center">Attendance</TableHead>
                        <TableHead className="text-center">Result</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicRecords?.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {record.academic_years?.name}
                              {record.academic_years?.is_current && (
                                <Badge variant="success" className="text-xs">Current</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{record.clusters?.name || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{record.programs?.name || "—"}</Badge>
                          </TableCell>
                          <TableCell>{record.classGrade || "—"}</TableCell>
                          <TableCell className="text-center">
                            {record.attendancePercentage !== null ? (
                              <span className={`font-semibold ${getAttendanceColor(record.attendancePercentage)}`}>
                                {record.attendancePercentage}%
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {record.resultPercentage !== null ? (
                              <span className="font-semibold">{record.resultPercentage}%</span>
                            ) : (
                              "—"
                            )}
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
                                  onClick={() => handleEditRecord(record)}
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 text-destructive"
                                  onClick={() => handleDeleteRecord(record)}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
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

            {/* Family Members Tab */}
            <TabsContent value="family" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Parents, guardians, and their income details
                </p>
                <Button size="sm" onClick={handleAddMember}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Member
                </Button>
              </div>

              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : familyMembers?.length === 0 ? (
                <Card variant="flat" className="border border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No family members added</p>
                    <p className="text-sm text-muted-foreground">
                      Add parents or guardians with their details
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {familyMembers?.map((member) => (
                    <Card key={member.id} variant="flat" className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.name}</p>
                              <Badge variant="outline">{member.relationship}</Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              {member.occupation && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  <span>{member.occupation}</span>
                                </div>
                              )}
                              {member.annual_income && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <IndianRupee className="h-3.5 w-3.5" />
                                  <span>{formatCurrency(member.annual_income)}/year</span>
                                </div>
                              )}
                              {member.date_of_birth && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{format(new Date(member.date_of_birth), "PP")}</span>
                                </div>
                              )}
                            </div>
                            {member.bank_name && (
                              <p className="text-xs text-muted-foreground">
                                Bank: {member.bank_name}
                                {member.bank_account_number && ` (****${member.bank_account_number.slice(-4)})`}
                              </p>
                            )}
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
                                onClick={() => handleEditMember(member)}
                              >
                                <Edit className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() => handleDeleteMember(member)}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Academic Record Form Dialog */}
      <AcademicRecordFormDialog
        open={recordFormOpen}
        onOpenChange={setRecordFormOpen}
        studentId={student.id}
        studentName={student.name}
        record={selectedRecord}
      />

      {/* Family Member Form Dialog */}
      <FamilyMemberFormDialog
        open={memberFormOpen}
        onOpenChange={setMemberFormOpen}
        studentId={student.id}
        studentName={student.name}
        member={selectedMember}
      />

      {/* Delete Academic Record Confirmation */}
      <AlertDialog open={deleteRecordOpen} onOpenChange={setDeleteRecordOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Academic Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the academic record for{" "}
              <strong>{recordToDelete?.academic_years?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRecord.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecord}
              disabled={deleteRecord.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecord.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Family Member Confirmation */}
      <AlertDialog open={deleteMemberOpen} onOpenChange={setDeleteMemberOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToDelete?.name}</strong> ({memberToDelete?.relationship})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMember.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              disabled={deleteMember.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
