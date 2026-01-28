import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Heart } from "lucide-react";
import { SummaryStats } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  stats: SummaryStats | undefined;
  isLoading: boolean;
}

export function SummaryCards({ stats, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="py-3">
            <CardContent className="px-4 py-0">
              <Skeleton className="h-5 w-28 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {/* Active Students Card - Teal tint */}
      <Card className="bg-teal-50/90 dark:bg-teal-950/50 border-teal-300/70 dark:border-teal-700/70 shadow-sm">
        <CardContent className="p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-teal-800 dark:text-teal-200">Active Students</h3>
              </div>
              <span className="text-3xl font-extrabold text-teal-700 dark:text-teal-300 block mb-1">{stats?.activeStudents || 0}</span>
            </div>
            {/* Program-wise breakdown */}
            <div className="grid grid-cols-1 gap-1 min-w-[120px]">
              {stats?.programWiseStudents.map((p) => (
                <div key={p.program} className="flex items-center justify-between gap-3 px-2 py-1 bg-teal-100/60 dark:bg-teal-900/40 rounded">
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-300">{p.program}</span>
                  <span className="text-base font-bold text-teal-800 dark:text-teal-200">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Card - Amber tint */}
      <Card className="bg-amber-50/90 dark:bg-amber-950/50 border-amber-300/70 dark:border-amber-700/70 shadow-sm">
        <CardContent className="p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <UserCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-amber-800 dark:text-amber-200">Teachers</h3>
              </div>
              <span className="text-3xl font-extrabold text-amber-700 dark:text-amber-300 block mb-1">{stats?.totalTeachers || 0}</span>
            </div>
            {/* Main/Backup breakdown */}
            <div className="grid grid-cols-2 gap-1.5 min-w-[110px]">
              <div className="text-center px-2 py-1.5 bg-amber-100/60 dark:bg-amber-900/40 rounded">
                <div className="text-xl font-bold text-amber-800 dark:text-amber-200">{stats?.mainTeachers || 0}</div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Main</div>
              </div>
              <div className="text-center px-2 py-1.5 bg-amber-100/60 dark:bg-amber-900/40 rounded">
                <div className="text-xl font-bold text-amber-800 dark:text-amber-200">{stats?.backupTeachers || 0}</div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Backup</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Card - Slate tint */}
      <Card className="bg-slate-100/90 dark:bg-slate-900/70 border-slate-300/70 dark:border-slate-600/70 shadow-sm">
        <CardContent className="p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Heart className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Volunteers</h3>
              </div>
              <span className="text-3xl font-extrabold text-slate-600 dark:text-slate-300">{stats?.volunteers || 0}</span>
            </div>
            <div className="flex items-center justify-center min-w-[90px] h-full">
              <span className="text-[10px] text-slate-500 italic bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded">Coming soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
