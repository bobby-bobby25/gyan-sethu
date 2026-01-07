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
import {
  useCreateDonation,
  useUpdateDonation,
  usePaymentModes,
  Donation,
} from "@/hooks/useDonors";

const donationSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  donation_date: z.string().min(1, "Date is required"),
  payment_mode_id: z.string().optional(),
  reference_number: z.string().optional(),
  currency: z.string().default("INR"),
  remarks: z.string().optional(),
});

type DonationFormValues = z.infer<typeof donationSchema>;

interface DonationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donorId: number;
  donation?: Donation | null;
}

export function DonationFormDialog({
  open,
  onOpenChange,
  donorId,
  donation,
}: DonationFormDialogProps) {
  const { data: paymentModes } = usePaymentModes();
  const createDonation = useCreateDonation();
  const updateDonation = useUpdateDonation();

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: "",
      donation_date: new Date().toISOString().split("T")[0],
      payment_mode_id: "",
      reference_number: "",
      currency: "INR",
      remarks: "",
    },
  });

  useEffect(() => {
    if (donation) {
      form.reset({
        amount: donation.amount.toString(),
        donation_date: donation.donationDate,
        payment_mode_id: donation.paymentModeID || "",
        reference_number: donation.referenceNumber || "",
        currency: donation.currency || "INR",
        remarks: donation.remarks || "",
      });
    } else {
      form.reset({
        amount: "",
        donation_date: new Date().toISOString().split("T")[0],
        payment_mode_id: "",
        reference_number: "",
        currency: "INR",
        remarks: "",
      });
    }
  }, [donation, form]);

  const onSubmit = async (values: DonationFormValues) => {
    const donationData = {
      donorId: donorId,
      amount: parseFloat(values.amount),
      donationDate: values.donation_date,
      paymentModeID: values.payment_mode_id || null,
      referenceNumber: values.reference_number || null,
      currency: values.currency,
      remarks: values.remarks || null,
    };

    if (donation) {
      await updateDonation.mutateAsync({ id: donation.id, ...donationData });
    } else {
      await createDonation.mutateAsync(donationData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {donation ? "Edit Donation" : "Record Donation"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="donation_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donation Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_mode_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentModes?.map((mode) => (
                        <SelectItem key={mode.id} value={String(mode.id)}>
                          {mode.name}
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
              name="reference_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction reference" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDonation.isPending || updateDonation.isPending}
              >
                {donation ? "Update" : "Record"} Donation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
