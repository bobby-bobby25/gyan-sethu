import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import {
  useCreateTeacher,
  useUpdateTeacher,
  useUpdateTeacherPhoto,
  useIdProofTypes,
  TeacherWithAssignments,
  useStudentByCode
} from "@/hooks/useTeachers";
import { useCities, useSearchStudentsByCode } from "@/hooks/useMasterData";
import { useUploadDocument, useDocumentUrl } from "@/hooks/useDocuments";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useTeacherSubjects } from "@/hooks/useMasterData";

const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  state: z.string().max(100, "State must be less than 100 characters").optional(),
  id_proof_type_id: z.string().optional(),
  id_number: z.string().optional(),
  notes: z.string().optional(),
  is_ex_student: z.boolean().optional(),
  student_code: z.string().optional(),
  subjects: z.string().optional(),
  student_id: z.number().optional(),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: TeacherWithAssignments | null;
}

export function TeacherFormDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherFormDialogProps) {
  const { data: idProofTypes } = useIdProofTypes();
  const { data: cities } = useCities();
  const { data: subjects, isLoading: subjectsIsLoading } = useTeacherSubjects();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const updateTeacherPhoto = useUpdateTeacherPhoto();
  const uploadDocument = useUploadDocument();
  const { getDocumentUrl } = useDocumentUrl();
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [isExStudent, setIsExStudent] = useState(false);
  const [studentCodeSearch, setStudentCodeSearch] = useState("");
  const [studentCodeOpen, setStudentCodeOpen] = useState(false);
  const [fetchedStudentData, setFetchedStudentData] = useState<any>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const { data: studentSearchResults, isLoading: studentSearchLoading } = useSearchStudentsByCode(studentCodeSearch);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const states = useMemo(() => {
    if (!cities) return [];
    const uniqueStates = [...new Set(cities.map((c) => c.state))];
    return uniqueStates.sort();
  }, [cities]);

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      gender: "",
      date_of_birth: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      id_proof_type_id: "",
      id_number: "",
      notes: "",
      is_ex_student: false,
      student_code: "",
      subjects: "",
      student_id: undefined,
    },
  });

  const selectedState = form.watch("state");
  
  const formatForDateInput = (value?: string) =>
  value ? value.split("T")[0] : "";

  const filteredCities = useMemo(() => {
    if (!cities || !selectedState) return cities || [];
    return cities.filter((c) => c.state === selectedState);
  }, [cities, selectedState]);

  // Reset ex-student state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsExStudent(false);
      setStudentCodeSearch("");
      setFetchedStudentData(null);
    }
  }, [open]);

  // Clear student details when student code is cleared (to allow searching for different student)
  useEffect(() => {
    if (studentCodeSearch.trim() === "") {
      // User cleared the field, reset student_id
      form.setValue("student_id", undefined);
      setFetchedStudentData(null);
    }
  }, [studentCodeSearch, form]);

  // Handle student selection from search results
  const handleStudentSelect = (selectedStudent: any) => {
    form.setValue("student_code", selectedStudent.student_code);
    form.setValue("student_id", selectedStudent.id);
    form.setValue("name", selectedStudent.name || form.getValues("name"));
    form.setValue("gender", selectedStudent.gender || form.getValues("gender"));
    if (selectedStudent.date_of_birth) {
      form.setValue("date_of_birth", selectedStudent.date_of_birth.split("T")[0]);
    }
    form.setValue("email", selectedStudent.email || form.getValues("email"));
    form.setValue("phone", selectedStudent.phone || form.getValues("phone"));

    setFetchedStudentData({
      id: selectedStudent.id,
      student_code: selectedStudent.student_code,
      name: selectedStudent.name,
      gender: selectedStudent.gender,
      date_of_birth: selectedStudent.date_of_birth,
      email: selectedStudent.email,
      phone: selectedStudent.phone,
    });
    setStudentCodeOpen(false);
  };

  useEffect(() => {
    if (teacher) {
      const studentId = (teacher as any).student_id;
      const studentCode = (teacher as any).student_code || "";
      
      form.reset({
        name: teacher.name,
        gender: (teacher as any).gender || "",
        date_of_birth: formatForDateInput(teacher.dob) || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        address: teacher.address || "",
        city: (teacher as any).city || "",
        state: (teacher as any).state || "",
        id_proof_type_id: teacher.id_proof_type_id || "",
        id_number: teacher.id_proof_number || "",
        notes: (teacher as any).notes || "",
        is_ex_student: !!(studentId && studentId > 0),
        student_code: studentCode,
        subjects: (teacher as any).subjects || "",
        student_id: studentId,
      });
      
      // Parse subjects string to IDs
      if ((teacher as any).subjects) {
        let subjectIds: number[] = [];
        const subjectsData = (teacher as any).subjects;
        
        if (typeof subjectsData === "string") {
          subjectIds = subjectsData.split(",").map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
        } else if (Array.isArray(subjectsData)) {
          subjectIds = subjectsData.map((id: any) => typeof id === "string" ? parseInt(id.trim()) : id).filter((id: number) => !isNaN(id));
        }
        
        setSelectedSubjectIds(subjectIds);
      } else {
        setSelectedSubjectIds([]);
      }
      
      if (teacher.photo_document_id) {
        const url = getDocumentUrl(teacher.photo_document_id);
        setPhotoPreview(url);
      } else {
        setPhotoPreview(null);
      }
      setPhotoFile(null);
      setPhotoChanged(false);
      setIsExStudent(!!(studentId && studentId > 0));
    } else {
      form.reset({
        name: "",
        gender: "",
        date_of_birth: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        id_proof_type_id: "",
        id_number: "",
        notes: "",
        is_ex_student: false,
        student_code: "",
        subjects: "",
      });
      setPhotoPreview(null);
      setPhotoFile(null);
      setPhotoChanged(false);
      setSelectedSubjectIds([]);
    }
  }, [teacher?.id, teacher?.photo_document_id, open, form]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoChanged(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = async (values: TeacherFormValues) => {
    try {      
      const teacherData = {
        name: values.name,
        gender: values.gender || null,
        dob: values.date_of_birth || null,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        city: values.city || null,
        state: values.state || null,
        id_proof_type_id: values.id_proof_type_id ? parseInt(values.id_proof_type_id) : null,
        id_proof_number: values.id_number || null,
        notes: values.notes || null,
        is_active: true,
        subjects: selectedSubjectIds.length > 0 ? selectedSubjectIds.join(",") : "",
        student_id: values.student_id || null,
      };

      let teacherId: string;
      let photoDocumentId: number;

      if (teacher) {
        const updatePayload = { 
          id: teacher.id, 
          name: teacherData.name,
          gender: teacherData.gender,
          dob: teacherData.dob,
          email: teacherData.email,
          phone: teacherData.phone,
          address: teacherData.address,
          city: teacherData.city,
          state: teacherData.state,
          id_proof_type_id: teacherData.id_proof_type_id?.toString() || null,
          id_proof_number: teacherData.id_proof_number,
          notes: teacherData.notes,
          subjects: teacherData.subjects,
          student_id: teacherData.student_id,
        };
        await updateTeacher.mutateAsync(updatePayload as any);
        teacherId = teacher.id;
      } else {
        const result = await createTeacher.mutateAsync({
          user_id: 0,
          ...teacherData,
        } as any);
        teacherId = result.teacherId;
      }

      // Upload photo
      if (photoChanged && photoFile && teacherId) {
        const result = 
          await uploadDocument.mutateAsync({
            file: photoFile,
            referenceType: "TeacherPhoto",
            referenceId: parseInt(teacherId),
            name: "Profile Photo",
            documentType: "Photo",
            description: "Teacher profile photo",
          });
        photoDocumentId = result.documentId;
      }

      if(photoChanged && photoDocumentId && teacherId) {
        await updateTeacherPhoto.mutateAsync({ teacherId, documentId: photoDocumentId });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("An error occurred while saving. Check console for details.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {teacher ? "Edit Teacher" : "Add New Teacher"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => {
            form.handleSubmit(onSubmit)(e);
          }} className="space-y-4">
            {/* Ex-Student Information Section - TOP (Create Mode) */}
            {!teacher && (
              <div className="rounded-lg border border-primary/10 overflow-hidden">
                <div className="bg-primary/15 px-4 py-2.5">
                  <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Ex-Student Conversion</h3>
                </div>
                <div className="bg-primary/5 p-4 space-y-3">
                  <FormField
                    control={form.control}
                    name="is_ex_student"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl className="flex items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              setIsExStudent(checked as boolean);
                              if (!checked) {
                                form.setValue("student_code", "");
                                setStudentCodeSearch("");
                                setFetchedStudentData(null);
                              }
                            }}
                          />
                        </FormControl>

                        <FormLabel className="m-0 leading-none cursor-pointer">
                          Is an ex-student?
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {isExStudent && (
                    <div className="space-y-3 p-3 bg-white/50 rounded border border-primary/20">
                      <FormField
                        control={form.control}
                        name="student_code"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm">Student Code</FormLabel>
                            <Popover open={studentCodeOpen} onOpenChange={setStudentCodeOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "justify-between font-normal h-9",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value || "Search by student code or name"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search by code or name..."
                                    value={studentCodeSearch}
                                    onValueChange={setStudentCodeSearch}
                                  />
                                  <CommandList>
                                    {studentSearchLoading ? (
                                      <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      </div>
                                    ) : studentSearchResults && studentSearchResults.length > 0 ? (
                                      <CommandGroup>
                                        {studentSearchResults.map((student: any) => (
                                          <CommandItem
                                            key={student.id}
                                            value={student.name}
                                            onSelect={() => handleStudentSelect(student)}
                                          >
                                            <div className="flex flex-col w-full">
                                              <span className="font-medium">{student.name}</span>
                                              <span className="text-xs text-muted-foreground">{student.student_code}</span>
                                            </div>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    ) : studentCodeSearch ? (
                                      <CommandEmpty>No students found matching "{studentCodeSearch}"</CommandEmpty>
                                    ) : (
                                      <CommandEmpty>Start typing to search...</CommandEmpty>
                                    )}
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {fetchedStudentData && (
                        <div className="mt-3 p-3 bg-primary/10 rounded border border-primary/30">
                          <p className="font-semibold text-sm text-foreground">✓ Student Details Loaded</p>
                          <p className="text-xs text-muted-foreground mt-1">{fetchedStudentData.name} ({fetchedStudentData.student_code})</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ex-Student Information Section - EDIT MODE (Disabled/Read-only) */}
            {teacher && (
              <div className="rounded-lg border border-primary/10 overflow-hidden bg-muted/50">
                <div className="bg-primary/15 px-4 py-2.5">
                  <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Ex-Student Conversion (Cannot be changed)</h3>
                </div>
                <div className="bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center space-x-2 opacity-60">
                    <Checkbox checked={form.watch("student_id") && form.watch("student_id") > 0 ? true : false} disabled />
                    <FormLabel className="font-medium cursor-not-allowed">Is an ex-student?</FormLabel>
                  </div>
                  {/* <div className="p-3 bg-white/50 rounded border border-primary/20">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Student Code</p>
                        <p className="font-medium">{form.watch("student_code") || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Student ID</p>
                        <p className="font-medium">{form.watch("student_id")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Email</p>
                        <p className="font-medium">{form.watch("email") || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Phone</p>
                        <p className="font-medium">{form.watch("phone") || "N/A"}</p>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            )}

            {/* Personal Info Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Personal Information</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-12 gap-4">
                  {/* Photo Upload */}
                  <div className="col-span-2 flex flex-col items-center">
                    <div 
                      className="relative w-20 h-20 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={photoPreview} />
                          <AvatarFallback className="bg-muted text-lg">
                            {form.watch("name")?.charAt(0)?.toUpperCase() || "T"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-primary/60 mb-1" />
                          <span className="text-[10px] text-primary/60 font-medium">Add Photo</span>
                        </>
                      )}
                    </div>
                    {/* {photoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPhotoPreview(null);
                          setPhotoFile(null);
                          setPhotoChanged(true);
                        }}
                        className="h-6 text-xs px-2 mt-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    )} */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>

                  <div className="col-span-10 grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 98765 43210" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Location Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Address & Location</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("city", "");
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCities.map((city) => (
                              <SelectItem key={city.id} value={city.name}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* ID & Notes Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Identification & Notes</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-4 gap-3">
                  <FormField
                    control={form.control}
                    name="id_proof_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Proof Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {idProofTypes?.map((type) => (
                              <SelectItem key={type.id} value={String(type.id)}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ID number" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Additional notes" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Teaching Subjects Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Teaching Subjects</h3>
              </div>
              <div className="bg-primary/5 p-4">
                {subjectsIsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : subjects && subjects.length > 0 ? (
                  <div className="space-y-3">
                    <Popover open={subjectsOpen} onOpenChange={setSubjectsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between font-normal",
                            selectedSubjectIds.length === 0 && "text-muted-foreground"
                          )}
                        >
                          {selectedSubjectIds.length > 0
                            ? `${selectedSubjectIds.length} selected`
                            : "Select subjects"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search subjects..." />
                          <CommandList>
                            <CommandEmpty>No subjects found.</CommandEmpty>
                            <CommandGroup>
                              {subjects.map((subject) => (
                                <CommandItem
                                  key={subject.id}
                                  value={String(subject.id)}
                                  onSelect={() => {
                                    if (selectedSubjectIds.includes(subject.id)) {
                                      setSelectedSubjectIds(
                                        selectedSubjectIds.filter((id) => id !== subject.id)
                                      );
                                    } else {
                                      setSelectedSubjectIds([...selectedSubjectIds, subject.id]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={selectedSubjectIds.includes(subject.id)}
                                    className="mr-2"
                                  />
                                  {subject.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {selectedSubjectIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {subjects
                          .filter((s) => selectedSubjectIds.includes(s.id))
                          .map((subject) => (
                            <Badge key={subject.id} variant="secondary" className="text-xs">
                              {subject.name}
                              <button
                                type="button"
                                className="ml-1 hover:text-destructive"
                                onClick={() =>
                                  setSelectedSubjectIds(
                                    selectedSubjectIds.filter((id) => id !== subject.id)
                                  )
                                }
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No subjects available</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t sticky bottom-0 bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTeacher.isPending || updateTeacher.isPending || uploadDocument.isPending || updateTeacherPhoto.isPending}
              >
                {(createTeacher.isPending || updateTeacher.isPending || uploadDocument.isPending || updateTeacherPhoto.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {teacher ? "Update Teacher" : "Create Teacher"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}