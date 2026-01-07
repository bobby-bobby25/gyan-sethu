import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  MapPin,
  UserCheck,
  BookOpen,
  Calendar,
  Heart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SidebarProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "management"] },
  { name: "Students", href: "/students", icon: Users, roles: ["admin", "management"] },
  { name: "Teachers", href: "/teachers", icon: UserCheck, roles: ["admin", "management"] },
  { name: "Clusters", href: "/clusters", icon: MapPin, roles: ["admin", "management"] },
  { name: "Programs", href: "/programs", icon: BookOpen, roles: ["admin", "management"] },
  { name: "Attendance", href: "/attendance", icon: Calendar, roles: ["admin", "management", "teacher"] },
  { name: "Donors", href: "/donors", icon: Heart, roles: ["admin", "management"] },
];

const secondaryNav = [
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
];

export const DashboardLayout = ({ children, pageTitle, pageSubtitle }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, userRole, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const filteredNavigation = navigation.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  const filteredSecondaryNav = secondaryNav.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  const NavLink = ({
    item,
  }: {
    item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> };
  }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <Link to={item.href} onClick={() => setMobileOpen(false)}>
        <Button
          variant={isActive ? "sidebar-active" : "sidebar"}
          size="default"
          className={cn(
            "w-full justify-start gap-3",
            collapsed && "justify-center px-2"
          )}
        >
          <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
          {!collapsed && <span>{item.name}</span>}
        </Button>
      </Link>
    );
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "admin":
        return "default";
      case "management":
        return "info";
      default:
        return "secondary";
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 h-16 px-4 border-b border-sidebar-border",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-display font-bold text-sidebar-accent-foreground">
                GyanSethu
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>

        {/* Secondary nav & collapse */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {filteredSecondaryNav.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
          
          <Button
            variant="sidebar"
            size="default"
            className={cn(
              "w-full justify-start gap-3",
              collapsed && "justify-center px-2"
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          collapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {pageTitle && (
              <div className="hidden sm:flex items-baseline gap-2">
                <h1 className="text-xl lg:text-2xl font-display font-bold">
                  {pageTitle}
                </h1>
                {pageSubtitle && (
                  <span className="text-muted-foreground text-sm">
                    — {pageSubtitle}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-muted flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {getInitials(profile?.full_name)}
                </span>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                  <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs capitalize">
                    {userRole || "user"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
