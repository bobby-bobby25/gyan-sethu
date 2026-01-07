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
  useCreateDonor,
  useUpdateDonor,
  useIdProofTypes,
  DonorWithDonations,
} from "@/hooks/useDonors";

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
        donor_type: (donor as any).donorType || "adhoc",
        email: (donor as any).email || "",
        phone: (donor as any).phone || "",
        company: (donor as any).company || "",
        address: (donor as any).address || "",
        city: (donor as any).city || "",
        state: (donor as any).state || "",
        date_of_birth: (donor as any).date_of_birth || "",
        id_proof_type_id: (donor as any).id_proof_type_id ? String((donor as any).id_proof_type_id) : "",
        id_number: (donor as any).id_number || "",
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
  }, [donor, form]);

  const onSubmit = async (values: DonorFormValues) => {
    const donorData: any = {
      Name: values.name,
      DateOfBirth: values.date_of_birth || null,
      Email: values.email || null,
      Phone: values.phone || null,
      Address: values.address || null,
      City: values.city || null,
      State: values.state || null,
      Company: values.company || null,
      DonorType: values.donor_type || null,
    };

    if (values.id_proof_type_id) donorData.IDProofTypeID = parseInt(values.id_proof_type_id, 10);
    if (values.id_number) donorData.IDNumber = values.id_number;

    if (donor) {
      await updateDonor.mutateAsync({ id: donor.id, ...donorData });
    } else {
      await createDonor.mutateAsync(donorData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{donor ? "Edit Donor" : "Add New Donor"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="donor_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
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
                      <Input placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter address" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
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
                      <Input placeholder="Enter state" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id_proof_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Proof Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                      <Input placeholder="Enter ID number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                disabled={createDonor.isPending || updateDonor.isPending}
              >
                {donor ? "Update" : "Create"} Donor
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
