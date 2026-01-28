import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Calendar,
} from "lucide-react";
import {
  DonorWithDonations,
  Donation,
  useDeleteDonation,
} from "@/hooks/useDonors";
import { DonationFormDialog } from "./DonationFormDialog";
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

interface DonorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: DonorWithDonations | null;
}

const formatCurrency = (amount: number, currency: string = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  if (amount >= 10000000) {
    return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `${symbol}${(amount / 100000).toFixed(1)}L`;
  }
  return `${symbol}${amount.toLocaleString()}`;
};

export function DonorDetailDialog({
  open,
  onOpenChange,
  donor,
}: DonorDetailDialogProps) {
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<Donation | null>(
    null
  );

  const deleteDonation = useDeleteDonation();

  if (!donor) return null;

  const donations = donor.donations || [];
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

  const handleEditDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setDonationDialogOpen(true);
  };

  const handleDeleteDonation = (donation: Donation) => {
    setDonationToDelete(donation);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (donationToDelete) {
      await deleteDonation.mutateAsync(donationToDelete.id);
      setDeleteDialogOpen(false);
      setDonationToDelete(null);
    }
  };

  const getDonorTypeBadge = (type: string | null) => {
    switch (type) {
      case "csr":
        return <Badge variant="accent">CSR</Badge>;
      case "regular":
        return <Badge variant="default">Regular</Badge>;
      default:
        return <Badge variant="info">Adhoc</Badge>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{donor.name}</DialogTitle>
              {getDonorTypeBadge(donor.donor_type)}
            </div>
            {donor.donor_code && (
              <p className="text-sm text-muted-foreground font-mono">
                {donor.donor_code}
              </p>
            )}
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="donations">
                Donations ({donations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">
                            {donor.email || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">
                            {donor.phone || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Company
                          </p>
                          <p className="font-medium">
                            {donor.company || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Address
                          </p>
                          <p className="font-medium">
                            {donor.address || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Date of Birth
                          </p>
                          <p className="font-medium">
                            {donor.date_of_birth || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            ID Proof
                          </p>
                          <p className="font-medium">
                            {donor.id_proof_types?.name || "Not provided"}
                            {donor.id_number && ` - ${donor.id_number}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Donations
                        </p>
                        <p className="text-2xl font-display font-bold">
                          {formatCurrency(totalDonations)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Donation Count
                        </p>
                        <p className="text-2xl font-display font-bold">
                          {donations.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="donations" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedDonation(null);
                    setDonationDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record Donation
                </Button>
              </div>

              {donations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No donations recorded yet.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations
                        .sort(
                          (a, b) =>
                            new Date(b.donation_date).getTime() -
                            new Date(a.donation_date).getTime()
                        )
                        .map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell>{donation.donation_date}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(
                                donation.amount,
                                donation.currency || "INR"
                              )}
                            </TableCell>
                            <TableCell>
                              {donation.payment_modes?.name || "-"}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {donation.reference_number || "-"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onClick={() => handleEditDonation(donation)}
                                  >
                                    <Edit className="h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2 text-destructive"
                                    onClick={() =>
                                      handleDeleteDonation(donation)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DonationFormDialog
        open={donationDialogOpen}
        onOpenChange={setDonationDialogOpen}
        donorId={String(donor.id)}
        donation={selectedDonation}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Donation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this donation? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
