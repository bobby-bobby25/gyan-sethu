import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Download } from "lucide-react";
import { AttendanceStats, getColorClass } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface AttendanceSectionProps {
  stats: AttendanceStats | undefined;
  isLoading: boolean;
  onExport: () => void;
  onDrillDown?: () => void;
}

export function AttendanceSection({ stats, isLoading, onExport, onDrillDown }: AttendanceSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-1 pt-2 px-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="flex gap-3">
            <Skeleton className="h-16 w-20" />
            <Skeleton className="h-[130px] flex-1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = stats?.attendancePercentage || 0;
  const colorClass = getColorClass('attendance', percentage);
  const hasTrendData = stats?.trendData && stats.trendData.length > 0;

  return (
    <Card className="bg-gradient-to-br from-primary/8 via-background to-primary/5 border-primary/30 shadow-sm h-full">
      <CardHeader className="pb-1 pt-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Attendance Overview
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExport} 
            className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2">
        <div className="flex gap-3">
          {/* KPI Section - Left side */}
          <div 
            className="flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity min-w-[80px]" 
            onClick={onDrillDown}
            role="button"
            tabIndex={0}
          >
            <span className={`text-4xl font-extrabold ${colorClass}`}>
              {percentage}%
            </span>
            <div className="text-center mt-1">
              <span className="text-xs font-semibold text-foreground">
                {stats?.totalPresent || 0}/{stats?.totalExpected || 0}
              </span>
              <div className="text-[10px] text-muted-foreground">present</div>
            </div>
          </div>

          {/* Chart Section - Right side, fills remaining space */}
          <div className="flex-1 h-[130px]">
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData} onClick={onDrillDown}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    label={{ value: "Date", position: "insideBottom", offset: -2, fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    width={32}
                    label={{ value: "%", position: "insideTop", offset: 5, fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px",
                      padding: "4px 8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Attendance"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#attendanceGradient)"
                    activeDot={{ r: 3, fill: "hsl(var(--primary))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs bg-muted/20 rounded">
                No data for period
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
