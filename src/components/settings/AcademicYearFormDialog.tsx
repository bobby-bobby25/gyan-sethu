import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useCreateAcademicYear,
  useUpdateAcademicYear,
  AcademicYear,
} from "@/hooks/useAcademicYears";

interface AcademicYearFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYear?: AcademicYear | null;
}

const AcademicYearFormDialog = ({
  open,
  onOpenChange,
  academicYear,
}: AcademicYearFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });

  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear();

  const isEditing = !!academicYear;

  useEffect(() => {
    if (academicYear) {
      setFormData({
        name: academicYear.name || "",
        start_date: academicYear.start_date || "",
        end_date: academicYear.end_date || "",
        is_current: academicYear.is_current || false,
      });
    } else {
      // Default to current year range
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      setFormData({
        name: `${currentYear}-${String(nextYear).slice(-2)}`,
        start_date: `${currentYear}-04-01`,
        end_date: `${nextYear}-03-31`,
        is_current: false,
      });
    }
  }, [academicYear, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_current: formData.is_current,
    };

    try {
      if (isEditing) {
        await updateYear.mutateAsync({ id: academicYear.id, ...payload });
      } else {
        await createYear.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createYear.isPending || updateYear.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Academic Year" : "Add Academic Year"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Year Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., 2024-25"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label htmlFor="is_current">Set as Current Year</Label>
              <p className="text-sm text-muted-foreground">
                This will be used as the default academic year
              </p>
            </div>
            <Switch
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_current: checked }))
              }
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
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Year"
                : "Create Year"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AcademicYearFormDialog;
