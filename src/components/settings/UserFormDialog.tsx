import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateUser, useInviteUser, UserWithRole, AppRole } from "@/hooks/useUsers";
import { Shield, User, UserCog } from "lucide-react";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserWithRole | null;
  isInviting?: boolean;
}

const UserFormDialog = ({
  open,
  onOpenChange,
  user,
  isInviting = false,
}: UserFormDialogProps) => {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    role: "teacher" as AppRole,
  });

  const updateUser = useUpdateUser();
  const inviteUser = useInviteUser();

  const isEditing = !!user && !isInviting;

  useEffect(() => {
    if (user && !isInviting) {
      setFormData({
        email: user.email || "",
        full_name: user.full_name || "",
        phone: user.phone || "",
        role: user.role || "teacher",
      });
    } else {
      setFormData({
        email: "",
        full_name: "",
        phone: "",
        role: "teacher",
      });
    }
  }, [user, isInviting, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && user) {
        await updateUser.mutateAsync({
          id: user.id,
          profile: {
            full_name: formData.full_name || null,
            phone: formData.phone || null,
          },
          role: formData.role,
        });
      } else if (isInviting) {
        await inviteUser.mutateAsync({
          email: formData.email,
          fullName: formData.full_name,
          role: formData.role,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = updateUser.isPending || inviteUser.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isInviting ? "Invite New User" : "Edit User Profile"}
          </DialogTitle>
          {isInviting && (
            <DialogDescription>
              The user will receive an email invitation to set their password.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isInviting && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: AppRole) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin - Full system access
                  </div>
                </SelectItem>
                <SelectItem value="management">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    Management - Read-only dashboards
                  </div>
                </SelectItem>
                <SelectItem value="teacher">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Teacher - Attendance marking
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.role === "admin" && "Full access to all features and settings"}
              {formData.role === "management" && "Read-only access to dashboards and reports"}
              {formData.role === "teacher" && "Can mark attendance for assigned clusters"}
            </p>
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
                : isInviting
                ? "Send Invitation"
                : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
