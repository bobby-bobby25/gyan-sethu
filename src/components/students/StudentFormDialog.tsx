import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  useCreateStudent, 
  useUpdateStudent, 
  useUpdateStudentPhoto,
  useCasteCategories, 
  useIdProofTypes,
  useAmbitions,
  useHobbies,
  useCities,
  useStates,
} from "@/hooks/useStudents";
import { useSearchStudentsByCode } from "@/hooks/useMasterData";
import type { Student } from "@/hooks/useStudents";
import { useUploadDocument, useDocumentsByReference, useDeleteDocument, useDocumentUrl } from "@/hooks/useDocuments";
import { Loader2, Check, ChevronsUpDown, X, Camera, User, FileText, Download, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().max(500, "Address must be less than 500 characters").optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  state: z.string().max(100, "State must be less than 100 characters").optional(),
  caste_id: z.string().optional(),
  ambition: z.string().optional(),
  hobbies: z.array(z.string()).optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  id_proof_type_id: z.string().optional(),
  id_number: z.string().max(50, "ID number must be less than 50 characters").optional(),
  sibling_student_code: z.string().max(50, "Sibling student code must be less than 50 characters").optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
}

export function StudentFormDialog({ open, onOpenChange, student }: StudentFormDialogProps) {
  const isEditing = !!student;
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const uploadDocument = useUploadDocument();
  const updateStudentPhoto = useUpdateStudentPhoto();
  const { data: studentDocuments } = useDocumentsByReference(
    student?.id ? "Student" : null,
    student?.id ? parseInt(student.id) : null
  );
  const { data: casteCategories } = useCasteCategories();
  const { data: idProofTypes } = useIdProofTypes();
  const { data: ambitions } = useAmbitions();
  const { data: hobbies } = useHobbies();
  const { data: cities } = useCities();
  const { data: states } = useStates();

  const [cityOpen, setCityOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [hobbiesOpen, setHobbiesOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [documentsToUpload, setDocumentsToUpload] = useState<File[]>([]);
  const [documentNames, setDocumentNames] = useState<Record<string, string>>({});
  const [documentTypes, setDocumentTypes] = useState<Record<string, string>>({});
  const [hasSibling, setHasSibling] = useState(false);
  const [siblingCodeSearch, setSiblingCodeSearch] = useState<string>("");
  const [siblingCodeOpen, setSiblingCodeOpen] = useState(false);
  const [fetchedSiblingData, setFetchedSiblingData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const { getDocumentUrl } = useDocumentUrl();
  const { data: siblingSearchResults, isLoading: siblingSearchLoading } = useSearchStudentsByCode(siblingCodeSearch);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      gender: "",
      date_of_birth: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      caste_id: "",
      ambition: "",
      hobbies: [],
      notes: "",
      id_proof_type_id: "",
      id_number: "",
      sibling_student_code: "",
    },
  });

  useEffect(() => {
    if (student) {
      const s = student as any;
      form.reset({
        name: student.name || "",
        gender: s.gender || "",
        date_of_birth: student.dob || "",
        phone: s.phone || "",
        email: s.email || "",
        address: student.address || "",
        city: s.city || "",
        state: s.state || "",
        caste_id: student.caste_category_id || "",
        ambition: s.ambition || "",
        hobbies: s.hobbies || [],
        notes: s.notes || "",
        id_proof_type_id: student.id_proof_type_id || "",
        id_number: student.id_proof_number || "",
        sibling_student_code: s.sibling_student_code || "",
      });
      if (student?.photo_document_id) {
        const url = getDocumentUrl(student.photo_document_id);
        setPhotoPreview(url);
      } else {
        setPhotoPreview(null);
      }
      setPhotoFile(null);
      setPhotoChanged(false);
      // In edit mode, if sibling_student_code exists, tick the checkbox
      if (s.sibling_student_code) {
        setHasSibling(true);
        setFetchedSiblingData({
          student_code: s.sibling_student_code,
          name: "Fetched from existing data"
        });
      } else {
        setHasSibling(false);
        setFetchedSiblingData(null);
      }
      setSiblingCodeSearch("");
    } else {
      form.reset({
        name: "",
        gender: "",
        date_of_birth: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        caste_id: "",
        ambition: "",
        hobbies: [],
        notes: "",
        id_proof_type_id: "",
        id_number: "",
        sibling_student_code: "",
      });
      setPhotoPreview(null);
      setPhotoFile(null);
      setPhotoChanged(false);
      setHasSibling(false);
      setSiblingCodeSearch("");
      setFetchedSiblingData(null);
    }
  }, [student, form, open]);

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

  const onSubmit = async (data: StudentFormData) => {
    const payload = {
      name: data.name,
      gender: data.gender || null,
      dob: data.date_of_birth || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      caste_category_id: data.caste_id || null,
      ambition: data.ambition || null,
      hobbies: data.hobbies && data.hobbies.length > 0 ? data.hobbies : null,
      notes: data.notes || null,
      id_proof_type_id: data.id_proof_type_id || null,
      id_proof_number: data.id_number || null,
      sibling_student_code: data.sibling_student_code || null,
    };

    let studentId: string;
    let photoDocumentId: number;

    if (isEditing && student) {
      await updateStudent.mutateAsync({ id: student.id, ...payload });
      studentId = student.id;
    } else {
      const result = await createStudent.mutateAsync(payload as any);
      studentId = result.id;
    }

    // Upload photo
    if (photoChanged && photoFile && studentId) {
      const result = await uploadDocument.mutateAsync({ file: photoFile, referenceType: "StudentPhoto", referenceId: parseInt(studentId), name: "Profile Photo", documentType: "Photo", description: "Uploaded during student registration"});
      photoDocumentId = result.documentId;
    }

    if(photoChanged && photoDocumentId && studentId) {
      await updateStudentPhoto.mutateAsync({ studentId, documentId: photoDocumentId }); 
    }

    // Upload documents
    if (documentsToUpload.length > 0 && studentId) {
      for (let i = 0; i < documentsToUpload.length; i++) {
        const file = documentsToUpload[i];
        const key = `${file.name}-${file.size}`;
        const docName = documentNames[key] || file.name.replace(/\.[^/.]+$/, "");
        const docType = documentTypes[key] || "Personal";

        try {
          await uploadDocument.mutateAsync({
            file,
            referenceType: "Student",
            referenceId: parseInt(studentId),
            name: docName,
            documentType: docType,
            description: `Uploaded during student registration`,
          });
        } catch (error) {
          console.error(`Failed to upload document: ${file.name}`, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    }

    onOpenChange(false);
  };

  const isSubmitting = createStudent.isPending || updateStudent.isPending || uploadDocument.isPending;

  const selectedHobbies = form.watch("hobbies") || [];

  // Update fetched sibling data when search results come back
  useEffect(() => {
    if (siblingSearchResults && siblingSearchResults.length > 0) {
      // Results will be shown in the dropdown, no need to auto-select
    }
  }, [siblingSearchResults, siblingSearchLoading]);

  const handleSiblingSelect = (selectedStudent: any) => {
    form.setValue("sibling_student_code", selectedStudent.student_code);
    setFetchedSiblingData({
      id: selectedStudent.id,
      student_code: selectedStudent.student_code,
      name: selectedStudent.name,
      gender: selectedStudent.gender,
      date_of_birth: selectedStudent.date_of_birth,
      email: selectedStudent.email,
      phone: selectedStudent.phone,
    });
    setSiblingCodeOpen(false);
  };

  const toggleHobby = (hobbyName: string) => {
    const current = form.getValues("hobbies") || [];
    if (current.includes(hobbyName)) {
      form.setValue("hobbies", current.filter(h => h !== hobbyName));
    } else {
      form.setValue("hobbies", [...current, hobbyName]);
    }
  };

  const uniqueCities = cities?.filter((c, i, arr) => 
    arr.findIndex(x => x.name === c.name) === i
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update student information below." : "Enter the student details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Basic Information</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-12 gap-4">
                  {/* Photo Upload */}
                  <div className="col-span-2 flex flex-col items-center">
                    <div 
                      className="relative w-24 h-24 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={photoPreview} />
                          <AvatarFallback className="bg-muted">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <>
                          <Camera className="h-6 w-6 text-primary/60 mb-1" />
                          <span className="text-[10px] text-primary/60 font-medium">Add Photo</span>
                        </>
                      )}
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
                              <Input placeholder="Enter student name" {...field} className="h-9" />
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

                    <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email address" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="caste_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caste Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {casteCategories?.map((cat) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                  {cat.name} ({cat.code})
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
            </div>

            {/* Contact & Location Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Contact & Location</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street address" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>City</FormLabel>
                        <Popover open={cityOpen} onOpenChange={setCityOpen}>
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
                                {field.value || "Select city"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Search city..." />
                              <CommandList>
                                <CommandEmpty>
                                  <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setCityOpen(false)}
                                  >
                                    Use typed value
                                  </Button>
                                </CommandEmpty>
                                <CommandGroup>
                                  {uniqueCities.map((city) => (
                                    <CommandItem
                                      key={city.id}
                                      value={city.name}
                                      onSelect={() => {
                                        form.setValue("city", city.name);
                                        form.setValue("state", city.state);
                                        setCityOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === city.name ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {city.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>State</FormLabel>
                        <Popover open={stateOpen} onOpenChange={setStateOpen}>
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
                                {field.value || "Select state"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Search state..." />
                              <CommandList>
                                <CommandEmpty>No state found.</CommandEmpty>
                                <CommandGroup>
                                  {states?.map((state) => (
                                    <CommandItem
                                      key={state}
                                      value={state}
                                      onSelect={() => {
                                        form.setValue("state", state);
                                        setStateOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === state ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {state}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Additional Details</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-4 gap-3 items-start">
                  <FormField
                    control={form.control}
                    name="ambition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ambition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ambitions?.map((amb) => (
                              <SelectItem key={amb.id} value={amb.name}>
                                {amb.name}
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
                    name="hobbies"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Hobbies</FormLabel>
                        <Popover open={hobbiesOpen} onOpenChange={setHobbiesOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between font-normal h-9",
                                  selectedHobbies.length === 0 && "text-muted-foreground"
                                )}
                              >
                                {selectedHobbies.length > 0 
                                  ? `${selectedHobbies.length} selected`
                                  : "Select"
                                }
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Search hobbies..." />
                              <CommandList>
                                <CommandEmpty>No hobbies found.</CommandEmpty>
                                <CommandGroup>
                                  {hobbies?.map((hobby) => (
                                    <CommandItem
                                      key={hobby.id}
                                      value={hobby.name}
                                      onSelect={() => toggleHobby(hobby.name)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedHobbies.includes(hobby.name) ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {hobby.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {selectedHobbies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedHobbies.map((hobby) => (
                              <Badge key={hobby} variant="secondary" className="text-xs">
                                {hobby}
                                <button
                                  type="button"
                                  className="ml-1 hover:text-destructive"
                                  onClick={() => toggleHobby(hobby)}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          <Input placeholder="Enter ID" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional notes about this student" 
                              className="resize-none" 
                              rows={2}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sibling Details - Add Mode (fully editable) and Edit Mode (disabled) */}
            <div>
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Sibling Details</h3>
              </div>
              <div className="bg-primary/5 p-4">
                {/* Has Sibling Checkbox */}
                    <div className="min-h-[44px] flex items-center">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasSibling"
                          checked={hasSibling}
                          disabled={isEditing}
                          onChange={(e) => {
                            setHasSibling(e.target.checked);
                            if (!e.target.checked) {
                              form.setValue("sibling_student_code", "");
                              setFetchedSiblingData(null);
                              setSiblingCodeSearch("");
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                        <label
                          htmlFor="hasSibling"
                          className="text-sm leading-4 font-medium text-foreground cursor-pointer"
                        >
                          Has a sibling studying here?{" "}
                          <span className="text-muted-foreground font-normal">
                            (If yes, we’ll link family details automatically.)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Sibling Student Code Autofill */}
                    {hasSibling && (
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="sibling_student_code"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Sibling Student Code</FormLabel>
                              <Popover open={siblingCodeOpen} onOpenChange={setSiblingCodeOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      disabled={isEditing}
                                      className={cn(
                                        "justify-between font-normal h-9",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value || "Search by student name"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder="Search student name..."
                                      value={siblingCodeSearch}
                                      onValueChange={setSiblingCodeSearch}
                                    />
                                    <CommandList>
                                      {siblingSearchLoading ? (
                                        <div className="flex items-center justify-center py-6">
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                      ) : siblingSearchResults && siblingSearchResults.length > 0 ? (
                                        <CommandGroup>
                                          {siblingSearchResults.map((student: any) => (
                                            <CommandItem
                                              key={student.id}
                                              value={student.name}
                                              onSelect={() => handleSiblingSelect(student)}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  field.value === student.student_code ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              <div className="flex flex-col">
                                                <span className="font-medium">{student.name}</span>
                                                <span className="text-xs text-muted-foreground">{student.student_code}</span>
                                              </div>
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      ) : siblingCodeSearch ? (
                                        <CommandEmpty>No students found matching "{siblingCodeSearch}"</CommandEmpty>
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

                        {/* Fetched Sibling Details Display - Hidden in Edit Mode */}
                        {!isEditing && fetchedSiblingData ? (
                          <div className="mt-3 p-3 border rounded-lg bg-card">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Student Code</p>
                                <p className="text-sm font-medium">{fetchedSiblingData.student_code || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Name</p>
                                <p className="text-sm font-medium">{fetchedSiblingData.name || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Gender</p>
                                <p className="text-sm font-medium">{fetchedSiblingData.gender || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Date of Birth</p>
                                <p className="text-sm font-medium">{fetchedSiblingData.date_of_birth ? format(new Date(fetchedSiblingData.date_of_birth), "dd MMM yyyy") : "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Email</p>
                                <p className="text-sm font-medium">{fetchedSiblingData.email || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Phone</p>
                                <p className="text-sm font-medium">{fetchedSiblingData.phone || "—"}</p>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Student" : "Create Student"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}