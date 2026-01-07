import { useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateTeacherAssignment,
  useUpdateTeacherAssignment,
  useClusters,
  usePrograms,
  useAcademicYears,
  TeacherAssignment,
} from "@/hooks/useTeachers";

const assignmentSchema = z.object({
  cluster_id: z.string().min(1, "Cluster is required"),
  program_id: z.string().min(1, "Program is required"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  role: z.enum(["main", "backup"]),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface TeacherAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  assignment?: TeacherAssignment | null;
}

export function TeacherAssignmentDialog({
  open,
  onOpenChange,
  teacherId,
  assignment,
}: TeacherAssignmentDialogProps) {
  const { data: clusters } = useClusters();
  const { data: programs } = usePrograms();
  const { data: academicYears } = useAcademicYears();
  const createAssignment = useCreateTeacherAssignment();
  const updateAssignment = useUpdateTeacherAssignment();

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      cluster_id: "",
      program_id: "",
      academic_year_id: "",
      role: "backup",
    },
  });

  useEffect(() => {
    if (assignment) {
      form.reset({
        cluster_id: assignment.cluster_id,
        program_id: assignment.program_id,
        academic_year_id: assignment.academic_year_id,
        role: assignment.role === "main" ? "main" : "backup",
      });
    } else {
      const currentYear = academicYears?.find((y) => y.is_current);
      form.reset({
        cluster_id: "",
        program_id: "",
        academic_year_id: currentYear?.id || "",
        role: "backup",
      });
    }
  }, [assignment, academicYears, form]);

  const onSubmit = async (values: AssignmentFormValues) => {
    if (assignment) {
      await updateAssignment.mutateAsync({
        id: assignment.id,
        cluster_id: values.cluster_id,
        program_id: values.program_id,
        academic_year_id: values.academic_year_id,
        role: values.role,
      });
    } else {
      await createAssignment.mutateAsync({
        cluster_id: values.cluster_id,
        program_id: values.program_id,
        academic_year_id: values.academic_year_id,
        role: values.role,
        teacher_id: teacherId,
        is_active: true,
        ...values,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {assignment ? "Edit Assignment" : "Add Assignment"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="academic_year_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears?.map((year) => (
                        <SelectItem key={year.id} value={String(year.id)}>
                          {year.name} {year.is_current && "(Current)"}
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
              name="cluster_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cluster *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cluster" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clusters?.map((cluster) => (
                        <SelectItem key={cluster.id} value={String(cluster.id)}>
                          {cluster.name}
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
              name="program_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programs?.map((program) => (
                        <SelectItem key={program.id} value={String(program.id)}>
                          {program.name}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="main">Main Teacher</SelectItem>
                      <SelectItem value="backup">Backup Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createAssignment.isPending || updateAssignment.isPending
                }
              >
                {assignment ? "Update" : "Create"} Assignment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
