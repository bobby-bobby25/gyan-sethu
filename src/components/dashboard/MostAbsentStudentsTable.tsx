import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserMinus, Download } from "lucide-react";
import { AbsentStudent } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

interface MostAbsentStudentsTableProps {
  data: AbsentStudent[] | undefined;
  isLoading: boolean;
  onExport: () => void;
  onStudentClick?: (studentId: string) => void;
}

export function MostAbsentStudentsTable({ 
  data, 
  isLoading, 
  onExport,
  onStudentClick 
}: MostAbsentStudentsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserMinus className="h-4 w-4" />
            Most Absent Students (Top 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getAbsentColorClass = (absentCount: number): string => {
    if (!data || data.length === 0) return '';
    const maxAbsent = Math.max(...data.map(d => d.absentCount));
    const ratio = absentCount / maxAbsent;
    
    if (ratio >= 0.7) return 'text-destructive';
    if (ratio >= 0.4) return 'text-warning';
    return 'text-success';
  };

  const getAbsentBgColorClass = (absentCount: number): string => {
    if (!data || data.length === 0) return '';
    const maxAbsent = Math.max(...data.map(d => d.absentCount));
    const ratio = absentCount / maxAbsent;
    
    if (ratio >= 0.7) return 'bg-destructive/10';
    if (ratio >= 0.4) return 'bg-warning/10';
    return 'bg-success/10';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="px-3 py-2 flex flex-row items-center justify-between border-b shrink-0">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <UserMinus className="h-4 w-4 text-destructive" />
          Most Absent Students
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onExport} className="h-6 text-[10px] text-muted-foreground">
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="px-0 py-0 flex-1 overflow-auto">
        {!data || data.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No absence data for this period
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] h-7 px-2 font-semibold">Student</TableHead>
                <TableHead className="text-[10px] h-7 px-2 font-semibold">Program</TableHead>
                <TableHead className="text-[10px] h-7 px-2 font-semibold">Cluster</TableHead>
                <TableHead className="text-[10px] h-7 px-2 text-right font-semibold">P</TableHead>
                <TableHead className="text-[10px] h-7 px-2 text-right font-semibold">A</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} className="even:bg-muted/30">
                  <TableCell 
                    className={`text-[11px] py-1.5 px-2 font-medium ${onStudentClick ? 'cursor-pointer hover:text-primary hover:underline' : ''}`}
                    onClick={() => onStudentClick?.(row.id)}
                  >
                    {row.name}
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 px-2">{row.programName}</TableCell>
                  <TableCell className="text-[11px] py-1.5 px-2">{row.clusterName}</TableCell>
                  <TableCell className="text-[11px] py-1.5 px-2 text-right">
                    <span className="text-success font-semibold">{row.presentCount}</span>
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 px-2 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getAbsentColorClass(row.absentCount)} ${getAbsentBgColorClass(row.absentCount)}`}>
                      {row.absentCount}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
