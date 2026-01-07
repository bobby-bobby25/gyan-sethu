import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  User,
  TrendingUp,
  Calendar,
  Loader2,
  Building2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useDonorStats } from "@/hooks/useDashboard";
import { formatDistanceToNow } from "date-fns";

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString()}`;
};

export function DonorsDashboard() {
  const { data: stats, isLoading } = useDonorStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="stat" className="border-l-success">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success-muted flex items-center justify-center">
              <Heart className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {formatCurrency(stats?.totalAmount || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Donations</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-primary">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-muted flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {stats?.totalDonors || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Donors</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-accent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-muted flex items-center justify-center">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {stats?.donorsByType.find((t) => t.name === "CSR")?.value || 0}
              </p>
              <p className="text-sm text-muted-foreground">CSR Donors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donor Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Donor Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {stats?.donorsByType && stats.donorsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.donorsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {stats.donorsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentDonations && stats.recentDonations.length > 0 ? (
              <div className="space-y-4">
                {stats.recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{donation.donor_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(donation.date), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Badge variant="success" className="text-sm">
                      {formatCurrency(donation.amount)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent donations
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
