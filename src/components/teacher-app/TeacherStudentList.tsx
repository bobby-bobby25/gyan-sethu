import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Users,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Search,
} from "lucide-react";
import { StudentForAttendance } from "@/hooks/useAttendance";

interface TeacherStudentListProps {
  students: StudentForAttendance[];
  isLoading: boolean;
  attendanceMap: Record<string, string>;
  notesMap: Record<string, string>;
  presentStatusId: string | undefined;
  absentStatusId: string | undefined;
  onStatusChange: (studentId: string, statusId: string) => void;
  onNotesChange: (studentId: string, notes: string) => void;
  onMarkAll: (statusId: string) => void;
  isReadOnly?: boolean;
}

export function TeacherStudentList({
  students,
  isLoading,
  attendanceMap,
  notesMap,
  presentStatusId,
  absentStatusId,
  onStatusChange,
  onNotesChange,
  onMarkAll,
  isReadOnly = false,
}: TeacherStudentListProps) {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleNotes = (studentId: string) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No Students Found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            No students are enrolled in this cluster and program.
          </p>
        </CardContent>
      </Card>
    );
  }

  const markedCount = Object.keys(attendanceMap).length;
  const presentCount = Object.values(attendanceMap).filter((id) => id === presentStatusId).length;

  return (
    <div className="space-y-4">
      {/* Summary & Quick Actions */}
      <Card className="rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{students.length} Students</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                {presentCount} Present
              </Badge>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                {markedCount - presentCount} Absent
              </Badge>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-lg"
            />
          </div>

          {/* Quick Actions */}
          {!isReadOnly && presentStatusId && absentStatusId && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAll(presentStatusId)}
                className="flex-1 h-10 rounded-lg border-success/30 text-success hover:bg-success/10"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAll(absentStatusId)}
                className="flex-1 h-10 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Mark All Absent
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student List */}
      <div className="space-y-3">
        {filteredStudents.map((student, index) => {
          const status = attendanceMap[student.id];
          const isPresent = status === presentStatusId;
          const isAbsent = status === absentStatusId;
          const hasNotes = expandedNotes[student.id];

          return (
            <Card
              key={student.id}
              className={`rounded-xl transition-all ${
                isPresent
                  ? "bg-success/5 border-success/30"
                  : isAbsent
                  ? "bg-destructive/5 border-destructive/30"
                  : "bg-card"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                      {student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{student.name}</p>
                    {student.student_code && (
                      <p className="text-sm text-muted-foreground">{student.student_code}</p>
                    )}
                  </div>

                  {/* Attendance Buttons */}
                  {!isReadOnly ? (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant={isPresent ? "default" : "outline"}
                        className={`h-11 w-11 rounded-xl ${
                          isPresent
                            ? "bg-success hover:bg-success/90 text-success-foreground"
                            : "border-success/30 text-success hover:bg-success/10"
                        }`}
                        onClick={() => presentStatusId && onStatusChange(student.id, presentStatusId)}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant={isAbsent ? "default" : "outline"}
                        className={`h-11 w-11 rounded-xl ${
                          isAbsent
                            ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            : "border-destructive/30 text-destructive hover:bg-destructive/10"
                        }`}
                        onClick={() => absentStatusId && onStatusChange(student.id, absentStatusId)}
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <Badge
                      variant={isPresent ? "default" : "destructive"}
                      className={`${
                        isPresent
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }`}
                    >
                      {isPresent ? "Present" : isAbsent ? "Absent" : "—"}
                    </Badge>
                  )}
                </div>

                {/* Notes Toggle */}
                {!isReadOnly && status && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleNotes(student.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Add note</span>
                      {hasNotes ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    
                    {hasNotes && (
                      <Input
                        placeholder="Add a note for this student..."
                        value={notesMap[student.id] || ""}
                        onChange={(e) => onNotesChange(student.id, e.target.value)}
                        className="mt-2 h-10 rounded-lg text-sm"
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && searchQuery && (
        <Card className="rounded-xl">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No students match "{searchQuery}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
