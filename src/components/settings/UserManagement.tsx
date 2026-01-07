import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Shield,
  User,
  UserCog,
} from "lucide-react";
import { useUsers, UserWithRole } from "@/hooks/useUsers";
import UserFormDialog from "./UserFormDialog";
import UserRoleDialog from "./UserRoleDialog";
import { format } from "date-fns";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const { data: users, isLoading } = useUsers();

  const filteredUsers = (users || []).filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsInviting(false);
    setFormOpen(true);
  };

  const handleChangeRole = (user: UserWithRole) => {
    setSelectedUser(user);
    setRoleOpen(true);
  };

  const handleInvite = () => {
    setSelectedUser(null);
    setIsInviting(true);
    setFormOpen(true);
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "admin":
        return "default";
      case "management":
        return "info";
      case "teacher":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "management":
        return <UserCog className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const formatRole = (role: string | null) => {
    if (!role) return "No Role";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and assign roles</CardDescription>
          </div>
          <Button onClick={handleInvite} className="gap-2">
            <Plus className="h-4 w-4" />
            Invite User
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>{searchQuery ? "No users found" : "No users in the system"}</p>
              {!searchQuery && (
                <Button variant="outline" className="mt-3 gap-2" onClick={handleInvite}>
                  <Plus className="h-4 w-4" />
                  Invite User
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-muted flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {user.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.full_name || "Unnamed User"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          className="gap-1"
                        >
                          {getRoleIcon(user.role)}
                          {formatRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleChangeRole(user)}
                            >
                              <Shield className="h-4 w-4" />
                              Change Role
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
        </CardContent>
      </Card>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={selectedUser}
        isInviting={isInviting}
      />

      <UserRoleDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        user={selectedUser}
      />
    </>
  );
};

export default UserManagement;
