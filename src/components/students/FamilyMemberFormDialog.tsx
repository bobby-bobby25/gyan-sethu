import { useEffect } from "react";
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
import { useIdProofTypes } from "@/hooks/useStudents";
import { useCreateFamilyMember, useUpdateFamilyMember, type FamilyMemberWithDetails } from "@/hooks/useFamilyMembers";
import { Loader2 } from "lucide-react";

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
  const { data: idProofTypes } = useIdProofTypes();

  const form = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      name: "",
      relationship: "",
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
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name || "",
        relationship: member.relationship || "",
        phone: (member as any).phone || "",
        date_of_birth: (member as any).date_of_birth || "",
        occupation: (member as any).occupation || "",
        annual_income: (member as any).annual_income,
        address: (member as any).address || "",
        city: (member as any).city || "",
        state: (member as any).state || "",
        bank_name: (member as any).bank_name || "",
        bank_account_number: (member as any).bank_account_number || "",
        id_proof_type_id: member.id_proof_type_id ? String(member.id_proof_type_id) : "",
        id_number: (member as any).id_proof_number || "",
      });
    } else {
      form.reset({
        name: "",
        relationship: "",
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
      });
    }
  }, [member, form]);

  const onSubmit = async (data: FamilyMemberFormData) => {
    const payload = {
      student_id: studentId,
      name: data.name,
      relationship: data.relationship,
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
      IDNumber: data.id_number || null,
    };

    if (isEditing && member) {
      await updateMember.mutateAsync({ id: member.id, studentId, ...payload });
    } else {
      await createMember.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createMember.isPending || updateMember.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
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
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      <Input placeholder="e.g., Teacher, Farmer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="annual_income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Income (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Enter annual income"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter address"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter state" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank name" {...field} />
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
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id_proof_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Proof Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {idProofTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
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
                      <Input placeholder="Enter ID number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Add"} Member
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
