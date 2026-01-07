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
import { useDeleteProgram, Program } from "@/hooks/usePrograms";

interface DeleteProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: Program | null;
}

const DeleteProgramDialog = ({
  open,
  onOpenChange,
  program,
}: DeleteProgramDialogProps) => {
  const deleteProgram = useDeleteProgram();

  const handleDelete = async () => {
    if (!program) return;

    try {
      await deleteProgram.mutateAsync(program.id);
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!program) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Program</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{program.name}"? This action will
            mark the program as inactive and it will no longer appear in the
            system. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteProgram.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProgramDialog;
