import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

interface LearningCentrePerformance {
  learningCentreName: string;
  attendancePercentage: number;
}

interface LearningCentrePerformanceChartsProps {
  bestLearningCentres: LearningCentrePerformance[] | undefined;
  worstLearningCentres: LearningCentrePerformance[] | undefined;
  isLoading: boolean;
}

export function LearningCentrePerformanceCharts({
  bestLearningCentres,
  worstLearningCentres,
  isLoading,
}: LearningCentrePerformanceChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasBestData = bestLearningCentres && bestLearningCentres.length > 0;
  const hasWorstData = worstLearningCentres && worstLearningCentres.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {/* Best Performing Clusters */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-success">
            <TrendingUp className="h-4 w-4" />
            Best Performing Learning Centres
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          {hasBestData ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                layout="vertical"
                data={bestLearningCentres}
                margin={{ top: 0, right: 30, left: 5, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="learningCentreName"
                  tick={{ fontSize: 10, fill: "hsl(var(--foreground))", fontWeight: 500 }}
                  width={110}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "4px",
                    fontSize: "11px",
                    padding: "4px 8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Attendance"]}
                />
                <Bar dataKey="attendancePercentage" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {bestLearningCentres?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--success))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-24 flex items-center justify-center text-muted-foreground text-xs">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clusters Needing Improvement */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
            <TrendingDown className="h-4 w-4" />
            Learning Centres Needing Improvement
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          {hasWorstData ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                layout="vertical"
                data={worstLearningCentres}
                margin={{ top: 0, right: 30, left: 5, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="learningCentreName"
                  tick={{ fontSize: 10, fill: "hsl(var(--foreground))", fontWeight: 500 }}
                  width={110}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "4px",
                    fontSize: "11px",
                    padding: "4px 8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Attendance"]}
                />
                <Bar dataKey="attendancePercentage" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {worstLearningCentres?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.attendancePercentage < 70 ? "hsl(var(--destructive))" : "hsl(var(--warning))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-24 flex items-center justify-center text-muted-foreground text-xs">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
