import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  MapPin,
  UserCheck,
  Heart,
  TrendingUp,
  Calendar,
  ArrowRight,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats, useRecentActivity } from "@/hooks/useDashboard";
import { formatDistanceToNow } from "date-fns";

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString()}`;
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

const StatCard = ({ title, value, icon: Icon, iconColor }: StatCardProps) => (
  <Card variant="default" className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor}`}
        >
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export function OverviewDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents.toLocaleString() || "0"}
          icon={Users}
          iconColor="bg-primary"
        />
        <StatCard
          title="Active Clusters"
          value={stats?.totalClusters.toLocaleString() || "0"}
          icon={MapPin}
          iconColor="bg-accent"
        />
        <StatCard
          title="Active Teachers"
          value={stats?.totalTeachers.toLocaleString() || "0"}
          icon={UserCheck}
          iconColor="bg-info"
        />
        <StatCard
          title="Total Donations"
          value={formatCurrency(stats?.totalDonations || 0)}
          icon={Heart}
          iconColor="bg-success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="stat" className="border-l-primary">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {stats?.totalPrograms || 0}
              </p>
              <p className="text-sm text-muted-foreground">Programs</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat" className="border-l-info">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-info-muted flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {stats?.mainTeachers || 0}
              </p>
              <p className="text-sm text-muted-foreground">Main Teachers</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat" className="border-l-accent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
              <Heart className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {stats?.totalDonors || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Donors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card variant="default">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "attendance"
                          ? "bg-primary"
                          : activity.type === "student"
                          ? "bg-info"
                          : activity.type === "donation"
                          ? "bg-success"
                          : "bg-accent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(activity.time), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/students")}
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm">View Students</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/teachers")}
              >
                <UserCheck className="h-5 w-5 text-info" />
                <span className="text-sm">View Teachers</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/clusters")}
              >
                <MapPin className="h-5 w-5 text-accent" />
                <span className="text-sm">View Clusters</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/donors")}
              >
                <Heart className="h-5 w-5 text-success" />
                <span className="text-sm">View Donors</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
