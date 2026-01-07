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
import { useDeleteCluster, Cluster } from "@/hooks/useClusters";

interface DeleteClusterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cluster: Cluster | null;
}

const DeleteClusterDialog = ({
  open,
  onOpenChange,
  cluster,
}: DeleteClusterDialogProps) => {
  const deleteCluster = useDeleteCluster();

  const handleDelete = async () => {
    if (!cluster) return;

    try {
      await deleteCluster.mutateAsync(cluster.id);
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!cluster) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Cluster</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{cluster.name}"? This action will
            mark the cluster as inactive and it will no longer appear in the
            system. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCluster.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteClusterDialog;
