import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  Navigation,
  Users,
  Save,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  useClusterProgramCombinations,
} from "@/hooks/useAttendance";
import { useAuth } from "@/contexts/AuthContext";
import { useClusters } from "@/hooks/useClusters";
import { usePrograms } from "@/hooks/usePrograms";
import { useQuery } from "@tanstack/react-query";

interface AttendanceMarkingProps {
  onComplete?: () => void;
}

export function AttendanceMarking({ onComplete }: AttendanceMarkingProps) {
  const { user, userRole } = useAuth();
  const isAdmin = userRole === "admin";
  
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [selectedCombination, setSelectedCombination] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { data: teacher } = useCurrentTeacher(user? String(user.id) : null);
  const { data: assignments, isLoading: assignmentsLoading } =
    useTeacherAssignments(user? String(user.id) : null);
  const { data: academicYear } = useCurrentAcademicYear();
  const { data: statusTypes } = useAttendanceStatusTypes();
  
  // For admin: fetch cluster-program combinations with students
  const { data: combinations, isLoading: combinationsLoading } = useClusterProgramCombinations(
    isAdmin ? academicYear?.id || null : null
  );

  const currentAssignment = assignments?.find((a) => a.id === selectedAssignment);
  
  // Parse selected combination for admin
  const selectedCombo = useMemo(() => {
    if (!selectedCombination || !combinations) return null;
    return combinations.find(c => `${c.cluster_id}-${c.program_id}` === selectedCombination);
  }, [selectedCombination, combinations]);
  
  // Determine which cluster/program to use based on role
  const effectiveClusterId = isAdmin ? selectedCombo?.cluster_id : currentAssignment?.cluster_id;
  const effectiveProgramId = isAdmin ? selectedCombo?.program_id : currentAssignment?.program_id;
  const effectiveAcademicYearId = isAdmin ? academicYear?.id : currentAssignment?.academic_year_id;

  const { data: students, isLoading: studentsLoading } = useStudentsForAttendance(
    effectiveClusterId || null,
    effectiveProgramId || null,
    effectiveAcademicYearId || null
  );

  const { data: existingRecords, isLoading: recordsLoading } = useAttendanceRecords(
    effectiveClusterId || null,
    effectiveProgramId || null,
    effectiveAcademicYearId || null,
    selectedDate
  );

  const markAttendance = useMarkAttendance();
  const isTeacher = userRole === "teacher";
  
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
            setLocationError("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
        }
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Check if user is within geofence (admins bypass this)
  const isInGeofence = isAdmin 
    ? true 
    : userLocation && currentAssignment?.clusters
      ? isWithinGeofence(
          userLocation.lat,
          userLocation.lon,
          currentAssignment.clusters.latitude,
          currentAssignment.clusters.longitude,
          currentAssignment.clusters.geo_radius_meters
        )
      : false;

  // For admins, check if they can proceed
  const canProceed = isAdmin 
    ? (selectedCombo && academicYear?.id)
    : (userLocation && isInGeofence);

  const handleStatusChange = (studentId: string, statusId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: statusId,
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
    if (!effectiveClusterId || !effectiveProgramId || !effectiveAcademicYearId) return;
    
    // For non-admins, require location
    if (!isAdmin && !userLocation) return;

    const records = Object.entries(attendanceMap).map(([studentId, statusId]) => ({
      student_id: studentId,
      cluster_id: effectiveClusterId,
      program_id: effectiveProgramId,
      academic_year_id: effectiveAcademicYearId,
      attendance_date: selectedDate,
      status_id: statusId,
      marked_by_teacher_id: teacher?.id || null,
      marked_by_user_id: user?.id || null,
      latitude: userLocation?.lat || null,
      longitude: userLocation?.lon || null,
      marked_at: new Date().toISOString(),
    }));

    await markAttendance.mutateAsync(records);
    onComplete?.();
  };

  const presentStatusId = statusTypes?.find((s) => s.code === "P")?.id?.toString();
  const absentStatusId = statusTypes?.find((s) => s.code === "A")?.id?.toString();

  const markedCount = Object.keys(attendanceMap).length;
  const presentCount = Object.values(attendanceMap).filter(
    (id) => id === presentStatusId
  ).length;

  // Loading state
  if (isAdmin && combinationsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin && assignmentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin && (!assignments || assignments.length === 0)) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Assignments</AlertTitle>
        <AlertDescription>
          You don't have any active cluster/program assignments. Please contact an
          administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin: Date and Cluster/Program Selection */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date & Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Attendance Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cluster & Program</label>
                <Select value={selectedCombination} onValueChange={setSelectedCombination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cluster & program" />
                  </SelectTrigger>
                  <SelectContent>
                    {combinations?.map((combo) => (
                      <SelectItem 
                        key={`${combo.cluster_id}-${combo.program_id}`} 
                        value={`${combo.cluster_id}-${combo.program_id}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{combo.cluster_name}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{combo.program_name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {combo.student_count} students
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {academicYear && (
                <Badge variant="info">
                  Academic Year: {academicYear.name}
                </Badge>
              )}
              {selectedCombo && (
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedCombo.cluster_city || "No location"}
                </Badge>
              )}
            </div>
            {combinations?.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Students Enrolled</AlertTitle>
                <AlertDescription>
                  No students are enrolled in any cluster/program for the current academic year.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teacher: Assignment Selection */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date & Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Attendance Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  readOnly={isTeacher}                  
                  className={isTeacher ? "opacity-70 cursor-not-allowed" : ""}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignment</label>
                <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cluster & program" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments?.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        <div className="flex items-center gap-2">
                          <span>{assignment.clusters?.name}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{assignment.programs?.name}</span>
                          <Badge variant={assignment.role === "main" ? "default" : "outline"} className="ml-2">
                            {assignment.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentAssignment && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {currentAssignment.clusters?.city || "N/A"}
                </div>
                <Badge variant="info">
                  {currentAssignment.academic_years?.name}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Location Verification - Only for non-admins */}
      {!isAdmin && selectedAssignment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Location Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!userLocation ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please verify your location before marking attendance.
                  {currentAssignment?.clusters?.geo_radius_meters && (
                    <span className="block mt-1">
                      You must be within{" "}
                      {currentAssignment.clusters.geo_radius_meters}m of the cluster
                      location.
                    </span>
                  )}
                </p>
                <Button
                  onClick={getLocation}
                  disabled={isGettingLocation}
                  className="gap-2"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  Get My Location
                </Button>
                {locationError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{locationError}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {isInGeofence ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-success" />
                    <AlertTitle className="text-success">Location Verified</AlertTitle>
                    <AlertDescription>
                      You are within the cluster's designated area. You can mark
                      attendance.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Outside Geofence</AlertTitle>
                    <AlertDescription>
                      You are outside the cluster's designated area. Please move closer
                      to mark attendance.
                    </AlertDescription>
                  </Alert>
                )}
                <Button variant="outline" size="sm" onClick={getLocation}>
                  Refresh Location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student List */}
      {canProceed && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mark Attendance</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDate} • {students?.length || 0} students
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => presentStatusId && handleMarkAll(presentStatusId)}
                className="w-8 h-8 p-0 md:w-auto md:h-auto md:px-3"
              >
                <span className="hidden md:inline">Mark All Present</span>
                <span className="md:hidden text-xs font-bold">P</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => absentStatusId && handleMarkAll(absentStatusId)}
                className="w-8 h-8 p-0 md:w-auto md:h-auto md:px-3"
              >
                <span className="hidden md:inline">Mark All Absent</span>
                <span className="md:hidden text-xs font-bold">A</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {studentsLoading || recordsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : students && students.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {student.student_code || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={attendanceMap[student.id] === presentStatusId}
                              onCheckedChange={(checked) =>
                                checked &&
                                presentStatusId &&
                                handleStatusChange(student.id, presentStatusId)
                              }
                              className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={attendanceMap[student.id] === absentStatusId}
                              onCheckedChange={(checked) =>
                                checked &&
                                absentStatusId &&
                                handleStatusChange(student.id, absentStatusId)
                              }
                              className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2 p-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.student_code || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0 scale-75 origin-right">
                        <Checkbox
                          checked={attendanceMap[student.id] === presentStatusId}
                          onCheckedChange={(checked) =>
                            checked &&
                            presentStatusId &&
                            handleStatusChange(student.id, presentStatusId)
                          }
                          className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                          title="Present"
                        />
                        <Checkbox
                          checked={attendanceMap[student.id] === absentStatusId}
                          onCheckedChange={(checked) =>
                            checked &&
                            absentStatusId &&
                            handleStatusChange(student.id, absentStatusId)
                          }
                          className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                          title="Absent"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary & Submit */}
                <div className="p-4 border-t bg-muted/30">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 md:gap-4 text-sm flex-wrap">
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {presentCount} Present
                      </Badge>
                      <Badge variant="destructive" className="gap-1">
                        <Users className="h-3 w-3" />
                        {markedCount - presentCount} Absent
                      </Badge>
                      <span className="text-muted-foreground text-xs md:text-sm">
                        {students.length - markedCount} unmarked
                      </span>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={markedCount === 0 || markAttendance.isPending}
                      className="gap-2 w-full md:w-auto"
                    >
                      {markAttendance.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Submit Attendance
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No students enrolled in this cluster/program for the current academic
                year.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
