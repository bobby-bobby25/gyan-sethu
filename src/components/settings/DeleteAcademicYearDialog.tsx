import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAcademicYear, AcademicYear } from "@/hooks/useAcademicYears";

interface DeleteAcademicYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYear: AcademicYear | null;
}

const DeleteAcademicYearDialog = ({
  open,
  onOpenChange,
  academicYear,
}: DeleteAcademicYearDialogProps) => {
  const deleteYear = useDeleteAcademicYear();

  const handleDelete = async () => {
    if (!academicYear) return;

    try {
      await deleteYear.mutateAsync(academicYear.id);
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!academicYear) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Academic Year</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{academicYear.name}"? This action
            will mark the academic year as inactive. Existing records will be
            preserved but no new data can be associated with this year.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteYear.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAcademicYearDialog;
