import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Heart,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  useDonorDashboardStats,
  useDonorYearComparison,
  useMonthlyDonationTrends,
} from "@/hooks/useUnifiedDashboard";

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString()}`;
};

export function DonorDashboard() {
  const now = new Date();
  const currentFY = now.getMonth() >= 3 
    ? `${now.getFullYear()}-${now.getFullYear() + 1}`
    : `${now.getFullYear() - 1}-${now.getFullYear()}`;
  
  const [selectedFY] = useState<string>(currentFY);

  const { data: stats, isLoading: statsLoading } = useDonorDashboardStats(selectedFY);
  const { data: yearComparison, isLoading: comparisonLoading } = useDonorYearComparison();
  const { data: monthlyTrends, isLoading: trendsLoading } = useMonthlyDonationTrends();

  const isLoading = statsLoading || comparisonLoading || trendsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Financial Year:</span>
          <Select value={selectedFY}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select FY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={currentFY}>{currentFY}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="stat" className="border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {stats?.totalDonors || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Donors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-muted flex items-center justify-center">
                <Heart className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {stats?.regularDonors || 0}
                </p>
                <p className="text-xs text-muted-foreground">Regular Donors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info-muted flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {stats?.newDonorsThisYear || 0}
                </p>
                <p className="text-xs text-muted-foreground">New Donors This Year</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {stats?.adhocDonors || 0}
                </p>
                <p className="text-xs text-muted-foreground">Adhoc Donors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Regular Donors: Year-over-Year Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Last Year Donations</p>
              <p className="text-2xl font-display font-bold">
                {formatCurrency(yearComparison?.lastYearTotal || 0)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">This Year Donations</p>
              <p className="text-2xl font-display font-bold text-primary">
                {formatCurrency(yearComparison?.thisYearTotal || 0)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Change</p>
              <div className="flex items-center justify-center gap-2">
                {(yearComparison?.percentageChange || 0) >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <p className={`text-2xl font-display font-bold ${
                  (yearComparison?.percentageChange || 0) >= 0 ? "text-success" : "text-destructive"
                }`}>
                  {(yearComparison?.percentageChange || 0) >= 0 ? "+" : ""}
                  {yearComparison?.percentageChange || 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Donation Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Donation Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {monthlyTrends && monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "currentYear" ? "Current Year" : "Previous Year",
                    ]}
                  />
                  <Legend 
                    formatter={(value) => value === "currentYear" ? "Current Year" : "Previous Year"}
                  />
                  <Line
                    type="monotone"
                    dataKey="currentYear"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="previousYear"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No donation data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
