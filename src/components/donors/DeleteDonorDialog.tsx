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
import { useDeleteDonor, DonorWithDonations } from "@/hooks/useDonors";

interface DeleteDonorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: DonorWithDonations | null;
}

export function DeleteDonorDialog({
  open,
  onOpenChange,
  donor,
}: DeleteDonorDialogProps) {
  const deleteDonor = useDeleteDonor();

  const handleDelete = async () => {
    if (donor) {
      await deleteDonor.mutateAsync(donor.id);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Donor</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold">{donor?.name}</span>? This will
            deactivate the donor record but preserve donation history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
