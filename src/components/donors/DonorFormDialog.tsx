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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateDonor,
  useUpdateDonor,
  useIdProofTypes,
  DonorWithDonations,
} from "@/hooks/useDonors";
import { Loader2 } from "lucide-react";

const donorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  donor_type: z.string().min(1, "Donor type is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  state: z.string().max(100, "State must be less than 100 characters").optional(),
  date_of_birth: z.string().optional(),
  id_proof_type_id: z.string().optional(),
  id_number: z.string().optional(),
});

type DonorFormValues = z.infer<typeof donorSchema>;

interface DonorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor?: DonorWithDonations | null;
}

export function DonorFormDialog({
  open,
  onOpenChange,
  donor,
}: DonorFormDialogProps) {
  const { data: idProofTypes } = useIdProofTypes();
  const createDonor = useCreateDonor();
  const updateDonor = useUpdateDonor();

  const form = useForm<DonorFormValues>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      name: "",
      donor_type: "adhoc",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      date_of_birth: "",
      id_proof_type_id: "",
      id_number: "",
    },
  });

  useEffect(() => {
    if (donor) {
      form.reset({
        name: donor.name,
        donor_type: donor.donor_type || "adhoc",
        email: donor.email || "",
        phone: donor.phone || "",
        company: donor.company || "",
        address: donor.address || "",
        city: (donor as any).city || "",
        state: (donor as any).state || "",
        date_of_birth: donor.date_of_birth || "",
        id_proof_type_id: donor.id_proof_type_id || "",
        id_number: donor.id_number || "",
      });
    } else {
      form.reset({
        name: "",
        donor_type: "adhoc",
        email: "",
        phone: "",
        company: "",
        address: "",
        city: "",
        state: "",
        date_of_birth: "",
        id_proof_type_id: "",
        id_number: "",
      });
    }
  }, [donor, form, open]);

  const onSubmit = async (values: DonorFormValues) => {
    const donorData = {
      name: values.name,
      donor_type: values.donor_type,
      email: values.email || null,
      phone: values.phone || null,
      company: values.company || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      date_of_birth: values.date_of_birth || null,
      id_proof_type_id: values.id_proof_type_id || null,
      id_number: values.id_number || null,
    };

    if (donor) {
      await updateDonor.mutateAsync({ id: String(donor.id), ...donorData });
    } else {
      await createDonor.mutateAsync(donorData);
    }

    onOpenChange(false);
  };

  const isLoading = createDonor.isPending || updateDonor.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{donor ? "Edit Donor" : "Add New Donor"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Basic Information</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter name" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="donor_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="csr">CSR</SelectItem>
                            <SelectItem value="adhoc">Adhoc</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Company name" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Address</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* ID Section */}
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <div className="bg-primary/15 px-4 py-2.5">
                <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Identification</h3>
              </div>
              <div className="bg-primary/5 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="id_proof_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Proof Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {idProofTypes?.map((type) => (
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
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ID number" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t sticky bottom-0 bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {donor ? "Update" : "Create"} Donor
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}