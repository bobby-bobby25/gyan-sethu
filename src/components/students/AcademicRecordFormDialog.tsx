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
import { useCreateAcademicRecord, useUpdateAcademicRecord, type AcademicRecordWithDetails } from "@/hooks/useAcademicRecords";
import { Loader2 } from "lucide-react";

const academicRecordSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  clusterId: z.string().min(1, "Cluster is required"),
  programId: z.string().min(1, "Program is required"),
  classGrade: z.string().max(20, "Class must be less than 20 characters").optional(),
  schoolName: z.string().max(200, "School name must be less than 200 characters").optional(),
  attendancePercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  resultPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  yearlyFees: z.coerce.number().min(0).optional().nullable(),
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

  const form = useForm<AcademicRecordFormData>({
    resolver: zodResolver(academicRecordSchema),
    defaultValues: {
      academicYearId: "",
      clusterId: "",
      programId: "",
      classGrade: "",
      schoolName: "",
      attendancePercentage: null,
      resultPercentage: null,
      yearlyFees: null,
      remarks: "",
    },
  });

  useEffect(() => {
    if (record) {
      form.reset({
        academicYearId: record.academicYearId || "",
        clusterId: record.clusterId || "",
        programId: record.programId || "",
        classGrade: record.classGrade || "",
        schoolName: record.schoolName || "",
        attendancePercentage: record.attendancePercentage,
        resultPercentage: record.resultPercentage,
        yearlyFees: record.yearlyFees,
        remarks: record.remarks || "",
      });
    } else {
      // Default to current academic year
      const currentYear = academicYears?.find(y => y.is_current);
      form.reset({
        academicYearId: currentYear?.id || "",
        clusterId: "",
        programId: "",
        classGrade: "",
        schoolName: "",
        attendancePercentage: null,
        resultPercentage: null,
        yearlyFees: null,
        remarks: "",
      });
    }
  }, [record, academicYears, form]);

  const onSubmit = async (data: AcademicRecordFormData) => {
    const payload = {
      studentId: studentId,
      academicYearId: data.academicYearId,
      clusterId: data.clusterId,
      programId: data.programId,
      classGrade: data.classGrade || null,
      schoolName: data.schoolName || null,
      attendancePercentage: data.attendancePercentage ?? null,
      resultPercentage: data.resultPercentage ?? null,
      yearlyFees: data.yearlyFees ?? null,
      remarks: data.remarks || null,
      isActive:true,
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
              name="academicYearId"
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
                name="clusterId"
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
                name="programId"
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
                name="classGrade"
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
                name="schoolName"
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
                name="attendancePercentage"
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
                name="resultPercentage"
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
                name="yearlyFees"
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
