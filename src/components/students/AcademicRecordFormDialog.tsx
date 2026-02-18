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
import { useClusters, usePrograms, useAcademicYears } from "@/hooks/useStudents";
import { useLearningCentres } from "@/hooks/useLearningCentres";
import { useCreateAcademicRecord, useUpdateAcademicRecord, type AcademicRecordWithDetails } from "@/hooks/useAcademicRecords";
import { useSchoolTypes, useStudentMediums } from "@/hooks/useMasterData";
import { Loader2 } from "lucide-react";

const academicRecordSchema = z.object({
  academic_year_id: z.string().min(1, "Academic year is required"),
  cluster_id: z.string().min(1, "Cluster is required"),
  learning_centre_id: z.string().optional(),
  program_id: z.string().min(1, "Program is required"),
  school_type_id: z.string().optional(),
  medium_id: z.string().optional(),
  class_grade: z.string().max(20, "Class must be less than 20 characters").optional(),
  school_name: z.string().max(200, "School name must be less than 200 characters").optional(),
  attendance_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  result_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  yearly_fees: z.coerce.number().min(0).optional().nullable(),
  remarks: z.string().max(500, "Remarks must be less than 500 characters").optional(),
});

type AcademicRecordFormData = z.infer<typeof academicRecordSchema>;

interface AcademicRecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  record?: AcademicRecordWithDetails | null;
}

export function AcademicRecordFormDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  record,
}: AcademicRecordFormDialogProps) {
  const isEditing = !!record;
  const createRecord = useCreateAcademicRecord();
  const updateRecord = useUpdateAcademicRecord();
  const { data: clusters } = useClusters();
  const { data: programs } = usePrograms();
  const { data: academicYears } = useAcademicYears();
  const { data: schoolTypes } = useSchoolTypes();
  const { data: mediums } = useStudentMediums();

  const form = useForm<AcademicRecordFormData>({
    resolver: zodResolver(academicRecordSchema),
    defaultValues: {
      academic_year_id: "",
      cluster_id: "",
      learning_centre_id: "",
      program_id: "",
      school_type_id: "",
      medium_id: "",
      class_grade: "",
      school_name: "",
      attendance_percentage: null,
      result_percentage: null,
      yearly_fees: null,
      remarks: "",
    },
  });

  const selectedClusterId = form.watch("cluster_id");
  const { data: learningCentres } = useLearningCentres(selectedClusterId ? parseInt(selectedClusterId) : undefined);

  useEffect(() => {
    if (open) {
      if (record) {
        form.reset({
          academic_year_id: record.academic_year_id || "",
          cluster_id: record.cluster_id || "",
          learning_centre_id: (record as any).learning_centre_id || "",
          program_id: record.program_id || "",
          school_type_id: (record as any).school_type_id ? String((record as any).school_type_id) : "",
          medium_id: (record as any).medium_id ? String((record as any).medium_id) : "",
          class_grade: record.class_grade || "",
          school_name: record.school_name || "",
          attendance_percentage: record.attendance_percentage,
          result_percentage: record.result_percentage,
          yearly_fees: record.yearly_fees,
          remarks: record.remarks || "",
        });
      } else {
        // Default to current academic year
        const currentYear = academicYears?.find(y => y.is_current);
        form.reset({
          academic_year_id: currentYear?.id || "",
          cluster_id: "",
          learning_centre_id: "",
          program_id: "",
          school_type_id: "",
          medium_id: "",
          class_grade: "",
          school_name: "",
          attendance_percentage: null,
          result_percentage: null,
          yearly_fees: null,
          remarks: "",
        });
      }
    }
  }, [record, academicYears, form, open]);

  const onSubmit = async (data: AcademicRecordFormData) => {
    const payload = {
      student_id: studentId,
      academic_year_id: data.academic_year_id,
      cluster_id: data.cluster_id,
      learning_centre_id: data.learning_centre_id || null,
      program_id: data.program_id,
      school_type_id: data.school_type_id ? parseInt(data.school_type_id) : null,
      medium_id: data.medium_id ? parseInt(data.medium_id) : null,
      class_grade: data.class_grade || null,
      school_name: data.school_name || null,
      attendance_percentage: data.attendance_percentage ?? null,
      result_percentage: data.result_percentage ?? null,
      yearly_fees: data.yearly_fees ?? null,
      remarks: data.remarks || null,
    };

    if (isEditing && record) {
      await updateRecord.mutateAsync({ id: record.id, studentId, ...payload });
    } else {
      await createRecord.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createRecord.isPending || updateRecord.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Academic Record" : "Add Academic Record"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update academic record for ${studentName}`
              : `Assign ${studentName} to a cluster and program`}
          </DialogDescription>
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="learning_centre_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Centre *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger disabled={!learningCentres || learningCentres.length === 0}>
                          <SelectValue placeholder="Select learning centre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {learningCentres && learningCentres.length > 0 ? (
                          learningCentres.map((centre) => (
                            <SelectItem key={centre.id} value={String(centre.id)}>
                              {centre.name}
                            </SelectItem>
                          ))
                        ) : null}
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
                name="school_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select school type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schoolTypes?.map((type) => (
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
                name="medium_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medium</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mediums?.map((medium) => (
                          <SelectItem key={medium.id} value={String(medium.id)}>
                            {medium.name}
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
                name="class_grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class/Grade</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Grade 8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="school_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter school name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="attendance_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendance %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        placeholder="0-100"
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
                name="result_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        placeholder="0-100"
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
                name="yearly_fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yearly Fees (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Amount"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isEditing ? "Update" : "Create"} Record
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
