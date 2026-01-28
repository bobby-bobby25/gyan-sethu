import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUpdateUserRole, UserWithRole } from "@/hooks/useUsers";
import { Shield, User, UserCog, AlertTriangle } from "lucide-react";
import { AppRole } from "@/contexts/AuthContext";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRole | null;
}

const UserRoleDialog = ({ open, onOpenChange, user }: UserRoleDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<AppRole>("teacher");
  const updateRole = useUpdateUserRole();

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      await updateRole.mutateAsync({
        userId: user.id,
        role: selectedRole,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!user) return null;

  const roleChanged = selectedRole !== user.role;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            value={selectedRole}
            onValueChange={(value: AppRole) => setSelectedRole(value)}
            className="space-y-3"
          >
            <div
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedRole === "admin"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedRole("admin")}
            >
              <RadioGroupItem value="admin" id="admin" className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor="admin"
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Shield className="h-4 w-4 text-primary" />
                  Admin
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Full access to all features, settings, and user management
                </p>
              </div>
            </div>

            <div
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedRole === "management"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedRole("management")}
            >
              <RadioGroupItem value="management" id="management" className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor="management"
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <UserCog className="h-4 w-4 text-info" />
                  Management
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Read-only access to dashboards, reports, and analytics
                </p>
              </div>
            </div>

            <div
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedRole === "teacher"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedRole("teacher")}
            >
              <RadioGroupItem value="teacher" id="teacher" className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor="teacher"
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <User className="h-4 w-4" />
                  Teacher
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Can mark attendance for assigned clusters and programs
                </p>
              </div>
            </div>
          </RadioGroup>

          {roleChanged && selectedRole === "admin" && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Elevated Privileges</p>
                <p className="text-muted-foreground mt-0.5">
                  Admin users have full access to modify all data and settings.
                  Only grant this role to trusted users.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRole.isPending || !roleChanged}>
              {updateRole.isPending ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserRoleDialog;
