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
import { useCreateStudent, useUpdateStudent, useCasteCategories, useIdProofTypes } from "@/hooks/useStudents";
import type { Student } from "@/hooks/useStudents";
import { Loader2 } from "lucide-react";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  date_of_birth: z.string().optional(),
  address: z.string().max(500, "Address must be less than 500 characters").optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  state: z.string().max(100, "State must be less than 100 characters").optional(),
  caste_id: z.string().optional(),
  id_proof_type_id: z.string().optional(),
  id_number: z.string().max(50, "ID number must be less than 50 characters").optional(),
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
  const { data: casteCategories } = useCasteCategories();
  const { data: idProofTypes } = useIdProofTypes();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      date_of_birth: "",
      address: "",
      city: "",
      state: "",
      caste_id: "",
      id_proof_type_id: "",
      id_number: "",
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        name: student.name || "",
        date_of_birth: (student as any).dob || "",
        address: student.address || "",
        city: (student as any).city || "",
        state: (student as any).state || "",
        caste_id: (student as any).caste_category_id ? String((student as any).caste_category_id) : "",
        id_proof_type_id: student.id_proof_type_id ? String(student.id_proof_type_id) : "",
        id_number: (student as any).id_proof_number || "",
      });
    } else {
      form.reset({
        name: "",
        date_of_birth: "",
        address: "",
        city: "",
        state: "",
        caste_id: "",
        id_proof_type_id: "",
        id_number: "",
      });
    }
  }, [student, form]);

  const onSubmit = async (data: StudentFormData) => {
    console.log("Submitting student data:", data);
    const payload = {
      name: data.name,
      dateOfBirth: data.date_of_birth || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      casteID: data.caste_id || null,
      IDProofTypeID: data.id_proof_type_id || null,
      IDNumber: data.id_number || null,
      student_code: (student as any)?.student_code || "",
    };

    if (isEditing && student) {
      await updateStudent.mutateAsync({ id: student.id, ...payload });
    } else {
      await createStudent.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createStudent.isPending || updateStudent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update student information below." : "Enter the student details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student name" {...field} />
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
                name="caste_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caste Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
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
                      <Input placeholder="Enter ID number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isEditing ? "Update" : "Create"} Student
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
