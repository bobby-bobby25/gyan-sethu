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
import { Loader2 } from "lucide-react";
import { useDeleteLearningCentre, LearningCentre } from "@/hooks/useLearningCentres";

interface DeleteLearningCentreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learningCentre: LearningCentre | null;
}

const DeleteLearningCentreDialog = ({
  open,
  onOpenChange,
  learningCentre,
}: DeleteLearningCentreDialogProps) => {
  const deleteMutation = useDeleteLearningCentre();

  const handleConfirmDelete = async () => {
    if (!learningCentre) return;
    await deleteMutation.mutateAsync(learningCentre.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Learning Centre</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">{learningCentre?.name}</span>?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLearningCentreDialog;
