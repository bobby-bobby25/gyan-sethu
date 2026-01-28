import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, MoreHorizontal, Edit, Trash2, Loader2, MapPin, 
  GraduationCap, Users, IndianRupee, Briefcase, Phone, 
  FileText, Upload, Download, File, ExternalLink, Calendar
} from "lucide-react";
import { useStudentAcademicRecords, useDeleteAcademicRecord, type AcademicRecordWithDetails } from "@/hooks/useAcademicRecords";
import { useFamilyMembers, useDeleteFamilyMember, type FamilyMemberWithDetails } from "@/hooks/useFamilyMembers";
import { useDocumentsByReference, useUploadDocument, useDeleteDocument, useDownloadDocument, useDocumentUrl, type Document } from "@/hooks/useDocuments";
import { useStudents, type StudentWithDetails } from "@/hooks/useStudents";
import { AcademicRecordFormDialog } from "./AcademicRecordFormDialog";
import { FamilyMemberFormDialog } from "./FamilyMemberFormDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentWithDetails | null;
}

type SectionType = "academic" | "family" | "documents";

export function StudentDetailDialog({ open, onOpenChange, student }: StudentDetailDialogProps) {
  const [activeSection, setActiveSection] = useState<SectionType>("academic");
  
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

  // Documents state
  const [deleteDocOpen, setDeleteDocOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: number; name: string } | null>(null);
  const [docMetadataOpen, setDocMetadataOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("Personal");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadDocument = useDownloadDocument();

  // Data fetching
  const { data: academicRecords, isLoading: recordsLoading } = useStudentAcademicRecords(student?.id || null);
  const { data: familyMembers, isLoading: membersLoading } = useFamilyMembers(student?.id || null);
  const { data: documents, isLoading: docsLoading } = useDocumentsByReference('Student', student?.id ? parseInt(student.id) : null);
  const deleteRecord = useDeleteAcademicRecord();
  const deleteMember = useDeleteFamilyMember();
  const uploadFile = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const { getDocumentUrl } = useDocumentUrl();

  if (!student) return null;

  const s = student as any;

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

  // Document handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocName(file.name.replace(/\.[^/.]+$/, ""));
      setDocMetadataOpen(true);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !student) return;
    await uploadFile.mutateAsync({ 
      file: selectedFile,
      referenceType: 'Student',
      referenceId: parseInt(student.id),
      name: docName,
      documentType: docType
    });
    setDocMetadataOpen(false);
    setSelectedFile(null);
    setDocName("");
    setDocType("Personal");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadDoc = (documentId: number, fileName: string) => {
    downloadDocument.mutateAsync(documentId).catch((error) => {
      console.error("Download error:", error);
    });
  };

  const handleOpenDocExternal = (documentId: number) => {
    const url = getDocumentUrl(documentId);
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDeleteDoc = (doc: { id: number; name: string }) => {
    setDocToDelete(doc);
    setDeleteDocOpen(true);
  };

  const confirmDeleteDoc = async () => {
    if (!docToDelete || !student) return;
    await deleteDocument.mutateAsync(docToDelete.id);
    setDeleteDocOpen(false);
    setDocToDelete(null);
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

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Get current academic record for quick display
  const currentRecord = academicRecords?.find(r => r.academic_years?.is_current);

  const sections = [
    { id: "academic" as const, label: "Academic Records", icon: GraduationCap, count: academicRecords?.length },
    { id: "family" as const, label: "Family Members", icon: Users, count: familyMembers?.length },
    { id: "documents" as const, label: "Documents", icon: FileText, count: documents?.length },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          {/* Minimal Student Context - Metadata bar */}
          <div className="px-5 py-2.5 border-b flex items-center gap-2.5 text-sm">
            <Avatar className="h-7 w-7">
              <AvatarImage src={s.photo_url || undefined} />
              <AvatarFallback className="bg-muted text-xs">
                {student.name?.charAt(0)?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground">{student.name}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-mono text-xs text-muted-foreground">
              {student.student_code || student.id.slice(0, 8)}
            </span>
            {(s.city || currentRecord?.clusters?.name) && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {currentRecord?.clusters?.name || [s.city, s.state].filter(Boolean).join(", ")}
                </span>
              </>
            )}
          </div>

          {/* Section Navigation */}
          <div className="px-5 pt-4 pb-3 flex items-center gap-6 border-b">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "relative pb-3 text-base font-bold transition-colors flex items-center gap-2",
                    isActive 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground/70"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                  {section.label}
                  {section.count !== undefined && section.count > 0 && (
                    <span className={cn(
                      "text-sm font-medium",
                      isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                    )}>
                      ({section.count})
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Section Content */}
          <div className="p-5">
            {/* Academic Records Section */}
            {activeSection === "academic" && (
              <div className="rounded-lg border bg-card shadow-sm">
                {/* Section Header */}
                <div className="px-5 py-4 border-b bg-muted/30 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-4.5 w-4.5 text-primary" />
                        </div>
                        Academic Records
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 ml-10">
                        Track yearly progress, cluster assignments, and performance
                      </p>
                    </div>
                    <Button onClick={handleAddRecord} className="shadow-sm">
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Record
                    </Button>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-5">
                  {recordsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : academicRecords?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center min-h-[280px]">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <GraduationCap className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-foreground">No academic records yet</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Add a record to assign this student to a cluster and program for the academic year
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden min-h-[280px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="font-semibold">Year</TableHead>
                            <TableHead className="font-semibold">Cluster</TableHead>
                            <TableHead className="font-semibold">Program</TableHead>
                            <TableHead className="font-semibold">Class</TableHead>
                            <TableHead className="font-semibold text-center">Attendance</TableHead>
                            <TableHead className="font-semibold text-center">Result</TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {academicRecords?.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium">{record.academic_years?.name}</span>
                                  {record.academic_years?.is_current && (
                                    <Badge variant="success" className="text-xs">Current</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{record.clusters?.name || "—"}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{record.programs?.name || "—"}</Badge>
                              </TableCell>
                              <TableCell>{record.class_grade || "—"}</TableCell>
                              <TableCell className="text-center">
                                {record.attendance_percentage !== null ? (
                                  <span className={`font-semibold ${getAttendanceColor(record.attendance_percentage)}`}>
                                    {record.attendance_percentage}%
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {record.result_percentage !== null ? (
                                  <span className="font-semibold">{record.result_percentage}%</span>
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
                </div>
              </div>
            )}

            {/* Family Members Section */}
            {activeSection === "family" && (
              <div className="rounded-lg border bg-card shadow-sm">
                {/* Section Header */}
                <div className="px-5 py-4 border-b bg-muted/30 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Users className="h-4.5 w-4.5 text-primary" />
                        </div>
                        Family Members
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 ml-10">
                        Parents, guardians, and their income details
                      </p>
                    </div>
                    <Button onClick={handleAddMember} className="shadow-sm">
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Member
                    </Button>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-5">
                  {membersLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : familyMembers?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center min-h-[280px]">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-foreground">No family members added</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Add parents or guardians with their contact and income details
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 min-h-[280px]">
                      {familyMembers?.map((member) => {
                        const m = member as any;
                        return (
                          <Card key={member.id} variant="flat" className="border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={m.photo_url || undefined} />
                                    <AvatarFallback className="bg-muted text-sm">
                                      {member.name?.charAt(0)?.toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold">{member.name}</p>
                                      <Badge variant="outline">{member.relationship}</Badge>
                                      {m.gender && (
                                        <Badge variant="secondary" className="text-xs">{m.gender}</Badge>
                                      )}
                                      {m.is_active === false && (
                                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                      {m.phone && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="h-3.5 w-3.5" />
                                          {m.phone}
                                        </span>
                                      )}
                                      {member.occupation && (
                                        <span className="flex items-center gap-1">
                                          <Briefcase className="h-3.5 w-3.5" />
                                          {member.occupation}
                                        </span>
                                      )}
                                      {member.annual_income && (
                                        <span className="flex items-center gap-1">
                                          <IndianRupee className="h-3.5 w-3.5" />
                                          {formatCurrency(member.annual_income)}/year
                                        </span>
                                      )}
                                      {member.date_of_birth && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3.5 w-3.5" />
                                          {format(new Date(member.date_of_birth), "PP")}
                                        </span>
                                      )}
                                      {(m.city || m.state) && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3.5 w-3.5" />
                                          {[m.city, m.state].filter(Boolean).join(", ")}
                                        </span>
                                      )}
                                    </div>
                                    {member.bank_name && (
                                      <p className="text-xs text-muted-foreground">
                                        Bank: {member.bank_name}
                                        {member.bank_account_number && ` (****${member.bank_account_number.slice(-4)})`}
                                      </p>
                                    )}
                                    {m.notes && (
                                      <p className="text-xs text-muted-foreground italic">
                                        {m.notes}
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
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === "documents" && (
              <div className="rounded-lg border bg-card shadow-sm">
                {/* Section Header */}
                <div className="px-5 py-4 border-b bg-muted/30 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4.5 w-4.5 text-primary" />
                        </div>
                        Documents
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 ml-10">
                        Important supporting documents and certificates
                      </p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()} className="shadow-sm">
                      <Upload className="h-4 w-4 mr-1.5" />
                      Upload Document
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-5">
                  {docsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : documents?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center min-h-[280px]">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-foreground">No documents uploaded</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Upload birth certificates, ID proofs, and other important documents
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2 min-h-[280px]">
                      {documents?.map((doc: any) => (
                        <Card key={doc.id} variant="flat" className="border">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-muted">
                                  <File className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{doc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(doc.file_size)} • {format(new Date(doc.created_at), "PP")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleOpenDocExternal(doc.id)}
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDownloadDoc(doc.id, doc.name)}
                                  disabled={downloadDocument.isPending}
                                  title="Download document"
                                >
                                  {downloadDocument.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDeleteDoc({ id: doc.id, name: doc.name })}
                                  disabled={deleteDocument.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {uploadFile.isPending && (
                    <div className="flex items-center justify-center py-4 mt-2">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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

      {/* Delete Academic Record Dialog */}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecord}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecord.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Family Member Form Dialog */}
      <FamilyMemberFormDialog
        open={memberFormOpen}
        onOpenChange={setMemberFormOpen}
        studentId={student.id}
        studentName={student.name}
        member={selectedMember}
      />

      {/* Delete Family Member Dialog */}
      <AlertDialog open={deleteMemberOpen} onOpenChange={setDeleteMemberOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{memberToDelete?.name}</strong> from the family members? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Document Dialog */}
      <AlertDialog open={deleteDocOpen} onOpenChange={setDeleteDocOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{docToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDoc}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDocument.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Metadata Dialog */}
      <AlertDialog open={docMetadataOpen} onOpenChange={setDocMetadataOpen}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Document Details</AlertDialogTitle>
            <AlertDialogDescription>
              Enter details for <strong>{selectedFile?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Document Name</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md text-sm bg-background"
                placeholder="e.g., Birth Certificate"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md text-sm bg-background"
              >
                <option value="Personal">Personal</option>
                <option value="ID Proof">ID Proof</option>
                <option value="Address Proof">Address Proof</option>
                <option value="Educational Certificate">Educational Certificate</option>
                <option value="Medical">Medical</option>
                <option value="Financial">Financial</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUpload}
              disabled={uploadFile.isPending || !docName}
            >
              {uploadFile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
