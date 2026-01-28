import { useEffect, useMemo, useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIdProofTypes } from "@/hooks/useStudents";
import { useCities } from "@/hooks/useMasterData";
import { useCreateFamilyMember, useUpdateFamilyMember, useUpdateFamilyMemberPhoto, type FamilyMemberWithDetails } from "@/hooks/useFamilyMembers";
import { useUploadDocument, useDocumentUrl } from "@/hooks/useDocuments";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

const RELATIONSHIPS = [
  "Father",
  "Mother", 
  "Guardian",
  "Grandfather",
  "Grandmother",
  "Uncle",
  "Aunt",
  "Sibling",
  "Other",
];

const familyMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  relationship: z.string().min(1, "Relationship is required"),
  gender: z.string().optional(),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional(),
  date_of_birth: z.string().optional(),
  occupation: z.string().max(100, "Occupation must be less than 100 characters").optional(),
  annual_income: z.coerce.number().min(0).optional().nullable(),
  address: z.string().max(500, "Address must be less than 500 characters").optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  state: z.string().max(100, "State must be less than 100 characters").optional(),
  bank_name: z.string().max(100, "Bank name must be less than 100 characters").optional(),
  bank_account_number: z.string().max(50, "Account number must be less than 50 characters").optional(),
  id_proof_type_id: z.string().optional(),
  id_number: z.string().max(50, "ID number must be less than 50 characters").optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;

interface FamilyMemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  member?: FamilyMemberWithDetails | null;
}

export function FamilyMemberFormDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  member,
}: FamilyMemberFormDialogProps) {
  const isEditing = !!member;
  const createMember = useCreateFamilyMember();
  const updateMember = useUpdateFamilyMember();
  const updateMemberPhoto = useUpdateFamilyMemberPhoto();
  const { data: idProofTypes } = useIdProofTypes();
  const { data: cities } = useCities();
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

  const form = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      name: "",
      relationship: "",
      gender: "",
      phone: "",
      date_of_birth: "",
      occupation: "",
      annual_income: null,
      address: "",
      city: "",
      state: "",
      bank_name: "",
      bank_account_number: "",
      id_proof_type_id: "",
      id_number: "",
      notes: "",
    },
  });

  const selectedState = form.watch("state");

  const filteredCities = useMemo(() => {
    if (!cities || !selectedState) return cities || [];
    return cities.filter((c) => c.state === selectedState);
  }, [cities, selectedState]);

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name || "",
        relationship: member.relationship || "",
        gender: (member as any).gender || "",
        phone: (member as any).phone || "",
        date_of_birth: member.date_of_birth || "",
        occupation: member.occupation || "",
        annual_income: member.annual_income,
        address: member.address || "",
        city: (member as any).city || "",
        state: (member as any).state || "",
        bank_name: member.bank_name || "",
        bank_account_number: member.bank_account_number || "",
        id_proof_type_id: member.id_proof_type_id || "",
        id_number: member.id_proof_number || "",
        notes: (member as any).notes || "",
      });
      if ((member as any).photo_document_id) {
        const url = getDocumentUrl((member as any).photo_document_id);
        setPhotoPreview(url);
      } else {
        setPhotoPreview(null);
      }
      setPhotoFile(null);
      setPhotoChanged(false);
    } else {
      form.reset({
        name: "",
        relationship: "",
        gender: "",
        phone: "",
        date_of_birth: "",
        occupation: "",
        annual_income: null,
        address: "",
        city: "",
        state: "",
        bank_name: "",
        bank_account_number: "",
        id_proof_type_id: "",
        id_number: "",
        notes: "",
      });
      setPhotoPreview(null);
      setPhotoFile(null);
      setPhotoChanged(false);
    }
  }, [member?.id, (member as any)?.photo_document_id, open, form]);

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

  const onSubmit = async (data: FamilyMemberFormData) => {
    const payload = {
      student_id: studentId,
      name: data.name,
      relationship: data.relationship,
      gender: data.gender || null,
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || null,
      occupation: data.occupation || null,
      annual_income: data.annual_income ?? null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      bank_name: data.bank_name || null,
      bank_account_number: data.bank_account_number || null,
      id_proof_type_id: data.id_proof_type_id || null,
      id_proof_number: data.id_number || null,
      notes: data.notes || null,
    };

    let memberId: string;
    let photoDocumentId: number;

    if (isEditing && member) {
      await updateMember.mutateAsync({ id: member.id, studentId, ...payload });
      memberId = member.id;
    } else {
      const result = await createMember.mutateAsync(payload);
      memberId = result.familyMemberId;
    }

    // Upload photo
    if (photoChanged && photoFile && memberId) {
      const result = 
        await uploadDocument.mutateAsync({
          file: photoFile,
          referenceType: "FamilyMemberPhoto",
          referenceId: parseInt(memberId),
          name: "Profile Photo",
          documentType: "Photo",
          description: "Family member profile photo",
        });
      photoDocumentId = result.documentId;
    }

    if(photoChanged && photoDocumentId && memberId) {
      await updateMemberPhoto.mutateAsync({ memberId, documentId: photoDocumentId });
    }

    onOpenChange(false);
  };

  const isSubmitting = createMember.isPending || updateMember.isPending || uploadDocument.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Family Member" : "Add Family Member"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update family member details for ${studentName}`
              : `Add a parent or guardian for ${studentName}`}
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
                      className="relative w-20 h-20 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={photoPreview} />
                          <AvatarFallback className="bg-muted text-sm">
                            {member?.name?.charAt(0)?.toUpperCase() || "?"}
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
                              <Input placeholder="Enter name" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RELATIONSHIPS.map((rel) => (
                                <SelectItem key={rel} value={rel}>
                                  {rel}
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Teacher" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Contact & Location</h3>
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

            {/* Financial Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Financial & Identification</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-4 gap-3">
                  <FormField
                    control={form.control}
                    name="annual_income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Income (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bank name" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bank_account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account No.</FormLabel>
                        <FormControl>
                          <Input placeholder="Account number" {...field} className="h-9" />
                        </FormControl>
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

                  <div className="col-span-3">
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Add"} Family Member
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}