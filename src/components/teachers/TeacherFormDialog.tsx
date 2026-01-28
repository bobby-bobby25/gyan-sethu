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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useCreateTeacher,
  useUpdateTeacher,
  useUpdateTeacherPhoto,
  useIdProofTypes,
  TeacherWithAssignments,
} from "@/hooks/useTeachers";
import { useCities } from "@/hooks/useMasterData";
import { useUploadDocument, useDocumentUrl } from "@/hooks/useDocuments";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

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
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const updateTeacherPhoto = useUpdateTeacherPhoto();
  const uploadDocument = useUploadDocument();
  const { getDocumentUrl } = useDocumentUrl();
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
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
    },
  });

  const selectedState = form.watch("state");
  
  const formatForDateInput = (value?: string) =>
  value ? value.split("T")[0] : "";

  const filteredCities = useMemo(() => {
    if (!cities || !selectedState) return cities || [];
    return cities.filter((c) => c.state === selectedState);
  }, [cities, selectedState]);

  useEffect(() => {
    if (teacher) {
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
      });
      if (teacher.photo_document_id) {
        const url = getDocumentUrl(teacher.photo_document_id);
        setPhotoPreview(url);
      } else {
        setPhotoPreview(null);
      }
      setPhotoFile(null);
      setPhotoChanged(false);
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
      });
      setPhotoPreview(null);
      setPhotoFile(null);
      setPhotoChanged(false);
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
    const teacherData = {
      name: values.name,
      gender: values.gender || null,
      dob: values.date_of_birth || null,
      email: values.email || null,
      phone: values.phone || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      id_proof_type_id: values.id_proof_type_id || null,
      id_proof_number: values.id_number || null,
      photo_document_id: null,
      notes: values.notes || null,
      is_active: true,
    };

    let teacherId: string;
    let photoDocumentId: number;

    if (teacher) {
      await updateTeacher.mutateAsync({ id: teacher.id, ...teacherData });
      teacherId = teacher.id;
    } else {
      const result = await createTeacher.mutateAsync(teacherData);
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {teacher ? "Edit Teacher" : "Add New Teacher"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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