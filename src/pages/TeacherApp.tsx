import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  Navigation,
  Users,
  GraduationCap,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  useTeacherAssignments,
  useCurrentTeacher,
  useStudentsForAttendance,
  useAttendanceRecords,
  useAttendanceStatusTypes,
  useCurrentAcademicYear,
  useMarkAttendance,
  isWithinGeofence,
  TeacherAssignment,
} from "@/hooks/useAttendance";
import { TeacherStudentList } from "@/components/teacher-app/TeacherStudentList";

const TeacherApp = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut, profile } = useAuth();

  // States
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [hasFetchedStudents, setHasFetchedStudents] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data hooks
  const { data: teacher, isLoading: teacherLoading } = useCurrentTeacher(user?.id || null);
  const { data: assignments, isLoading: assignmentsLoading } = useTeacherAssignments(user?.id || null);
  const { data: academicYear } = useCurrentAcademicYear();
  const { data: statusTypes } = useAttendanceStatusTypes();

  const currentAssignment = useMemo(() => 
    assignments?.find((a) => a.id === selectedAssignment),
    [assignments, selectedAssignment]
  );

  const today = new Date().toISOString().split("T")[0];

  const { data: students, isLoading: studentsLoading, refetch: refetchStudents } = useStudentsForAttendance(
    currentAssignment?.cluster_id || null,
    currentAssignment?.program_id || null,
    currentAssignment?.academic_year_id || null
  );

  const { data: existingRecords, isLoading: recordsLoading } = useAttendanceRecords(
    currentAssignment?.cluster_id || null,
    currentAssignment?.program_id || null,
    currentAssignment?.academic_year_id || null,
    today
  );

  const markAttendance = useMarkAttendance();

  // Check if attendance already marked today
  const isAttendanceAlreadyMarked = existingRecords && existingRecords.length > 0;

  // Auto-select assignment if only one
  useEffect(() => {
    if (assignments && assignments.length === 1 && !selectedAssignment) {
      setSelectedAssignment(assignments[0].id);
    }
  }, [assignments, selectedAssignment]);

  // Initialize attendance map with existing records
  useEffect(() => {
    if (existingRecords && statusTypes) {
      const map: Record<string, string> = {};
      existingRecords.forEach((record) => {
        map[record.student_id] = record.status_id;
      });
      setAttendanceMap(map);
    }
  }, [existingRecords, statusTypes]);

  // Redirect if not teacher
  useEffect(() => {
    if (userRole && userRole !== "teacher") {
      navigate("/dashboard", { replace: true });
    }
  }, [userRole, navigate]);

  // Get user's current location
  const getLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please enable location access in your device settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("An unknown error occurred.");
        }
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Check if user is within geofence
  const isInGeofence = useMemo(() => {
    if (!userLocation || !currentAssignment?.clusters) return false;
    return isWithinGeofence(
      userLocation.lat,
      userLocation.lon,
      currentAssignment.clusters.latitude,
      currentAssignment.clusters.longitude,
      currentAssignment.clusters.geo_radius_meters
    );
  }, [userLocation, currentAssignment]);

  const handleFetchStudents = () => {
    if (!userLocation) {
      getLocation();
      return;
    }
    
    if (!isInGeofence) {
      toast.error("You are not within the permitted location for this cluster.");
      return;
    }

    setHasFetchedStudents(true);
    refetchStudents();
  };

  const handleStatusChange = (studentId: string, statusId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: statusId,
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setNotesMap((prev) => ({
      ...prev,
      [studentId]: notes,
    }));
  };

  const handleMarkAll = (statusId: string) => {
    if (!students) return;
    const newMap: Record<string, string> = {};
    students.forEach((student) => {
      newMap[student.id] = statusId;
    });
    setAttendanceMap(newMap);
  };

  const handleSubmit = async () => {
    if (!currentAssignment || !userLocation) return;
    
    // Validate all students are marked
    const unmarkedStudents = students?.filter(s => !attendanceMap[s.id]);
    if (unmarkedStudents && unmarkedStudents.length > 0) {
      toast.error(`Please mark attendance for all students. ${unmarkedStudents.length} remaining.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const records = Object.entries(attendanceMap).map(([studentId, statusId]) => ({
        student_id: studentId,
        cluster_id: currentAssignment.cluster_id,
        program_id: currentAssignment.program_id,
        academic_year_id: currentAssignment.academic_year_id,
        attendance_date: today,
        status_id: statusId,
        marked_by_teacher_id: teacher?.id || null,
        marked_by_user_id: user?.id || null,
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        marked_at: new Date().toISOString(),
      }));

      await markAttendance.mutateAsync(records);
      toast.success("Attendance successfully submitted!");
      setHasFetchedStudents(false);
    } catch (error: any) {
      toast.error("Failed to submit attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/teacher-login", { replace: true });
  };

  const presentStatusId = statusTypes?.find((s) => s.code === "P")?.id;
  const absentStatusId = statusTypes?.find((s) => s.code === "A")?.id;

  const markedCount = Object.keys(attendanceMap).length;
  const presentCount = Object.values(attendanceMap).filter((id) => id === presentStatusId).length;
  const totalStudents = students?.length || 0;

  // Loading state
  if (teacherLoading || assignmentsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  // No teacher record
  if (!teacher) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto" />
            <h2 className="text-xl font-semibold">No Teacher Profile</h2>
            <p className="text-muted-foreground">
              Your account is not linked to a teacher profile. Please contact an administrator.
            </p>
            <Button onClick={handleSignOut} variant="outline" className="mt-4">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No assignments
  if (!assignments || assignments.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto" />
            <h2 className="text-xl font-semibold">No Assignments</h2>
            <p className="text-muted-foreground">
              You don't have any active cluster/program assignments for the current academic year.
            </p>
            <Button onClick={handleSignOut} variant="outline" className="mt-4">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">GyanSethu</h1>
              <p className="text-xs text-primary-foreground/70">Teacher Attendance</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Teacher Info Card */}
      <div className="px-4 -mt-2">
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={teacher.photo_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {teacher.name?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground truncate">{teacher.name}</h2>
                <p className="text-sm text-muted-foreground truncate">{teacher.email || teacher.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Context Section */}
      <div className="px-4 mt-4 space-y-4">
        {/* Date Display */}
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Date</p>
                <p className="font-semibold">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Selection */}
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Select Assignment</span>
            </div>
            
            {assignments.length === 1 ? (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{assignments[0].clusters?.name}</p>
                    <p className="text-sm text-muted-foreground">{assignments[0].programs?.name}</p>
                  </div>
                  <Badge variant={assignments[0].role === "main" ? "default" : "secondary"}>
                    {assignments[0].role}
                  </Badge>
                </div>
              </div>
            ) : (
              <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                <SelectTrigger className="h-12 rounded-lg">
                  <SelectValue placeholder="Select cluster & program" />
                </SelectTrigger>
                <SelectContent>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{assignment.clusters?.name}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{assignment.programs?.name}</span>
                        <Badge variant={assignment.role === "main" ? "default" : "outline"} className="ml-2 text-xs">
                          {assignment.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {currentAssignment && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{currentAssignment.clusters?.city || "Location not set"}</span>
                {currentAssignment.clusters?.geo_radius_meters && (
                  <Badge variant="outline" className="text-xs">
                    {currentAssignment.clusters.geo_radius_meters}m radius
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Verification */}
        {selectedAssignment && !hasFetchedStudents && (
          <Card className="rounded-xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Navigation className="h-4 w-4" />
                <span>Location Verification</span>
              </div>

              {!userLocation ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Verify your location to mark attendance. You must be within the cluster's permitted area.
                  </p>
                  <Button
                    onClick={getLocation}
                    disabled={isGettingLocation}
                    className="w-full h-12 rounded-xl"
                    variant="outline"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Get My Location
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {isInGeofence ? (
                    <Alert className="bg-success/10 border-success/30">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <AlertDescription className="text-success">
                        You are within the permitted location. You can now fetch students.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-destructive/10 border-destructive/30">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-destructive">
                        You are not within the permitted location for this cluster. Attendance cannot be taken.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    onClick={getLocation}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Location
                  </Button>
                </div>
              )}

              {locationError && (
                <Alert className="bg-destructive/10 border-destructive/30">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {locationError}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Attendance Already Marked */}
        {isAttendanceAlreadyMarked && !hasFetchedStudents && (
          <Card className="rounded-xl bg-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <p className="font-medium text-info">Attendance Already Marked</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Attendance for today has already been recorded for this assignment.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHasFetchedStudents(true)}
                    className="mt-2 text-info"
                  >
                    View Attendance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fetch Students Button */}
        {selectedAssignment && userLocation && isInGeofence && !hasFetchedStudents && !isAttendanceAlreadyMarked && (
          <Button
            onClick={handleFetchStudents}
            className="w-full h-14 rounded-xl text-base font-semibold shadow-lg"
            size="lg"
          >
            <Users className="h-5 w-5 mr-2" />
            Fetch Students
          </Button>
        )}

        {/* Student List */}
        {hasFetchedStudents && (
          <TeacherStudentList
            students={students || []}
            isLoading={studentsLoading || recordsLoading}
            attendanceMap={attendanceMap}
            notesMap={notesMap}
            presentStatusId={presentStatusId}
            absentStatusId={absentStatusId}
            onStatusChange={handleStatusChange}
            onNotesChange={handleNotesChange}
            onMarkAll={handleMarkAll}
            isReadOnly={isAttendanceAlreadyMarked}
          />
        )}
      </div>

      {/* Sticky Submit Button */}
      {hasFetchedStudents && !isAttendanceAlreadyMarked && students && students.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg safe-area-bottom">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Marked:</span>
              <span className="font-semibold ml-1">{markedCount}/{totalStudents}</span>
            </div>
            <div className="text-sm">
              <span className="text-success font-semibold">{presentCount}</span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-destructive font-semibold">{markedCount - presentCount}</span>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || markedCount !== totalStudents}
            className="w-full h-14 rounded-xl text-base font-semibold"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Submit Attendance
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeacherApp;
