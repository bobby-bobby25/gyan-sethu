import { useState } from "react";
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
import { UserX, Download, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { TeacherUnavailable, getColorClass, getBgColorClass } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

interface TeachersUnavailableTableProps {
  data: TeacherUnavailable[] | undefined;
  isLoading: boolean;
  onExport: () => void;
}

type SortField = "mainTeacherName" | "programName" | "clusterName" | "missedDays";
type SortOrder = "asc" | "desc";

export function TeachersUnavailableTable({ data, isLoading, onExport }: TeachersUnavailableTableProps) {
  const [sortField, setSortField] = useState<SortField>("missedDays");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortOrder === "asc" ? 1 : -1;
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * modifier;
    }
    return ((aVal as number) - (bVal as number)) * modifier;
  });

  const paginatedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sortedData.length / pageSize);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Teachers Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 py-2 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <UserX className="h-4 w-4 text-destructive" />
          Teachers Unavailable
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onExport} className="h-6 text-xs text-muted-foreground">
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {!data || data.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs">
            No unavailable teachers
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-xs h-8 px-3"
                    onClick={() => handleSort("mainTeacherName")}
                  >
                    <div className="flex items-center gap-1">
                      Teacher
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-xs h-8 px-3"
                    onClick={() => handleSort("programName")}
                  >
                    <div className="flex items-center gap-1">
                      Program
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-xs h-8 px-3"
                    onClick={() => handleSort("clusterName")}
                  >
                    <div className="flex items-center gap-1">
                      Cluster
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-xs h-8 px-3">Backup</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-xs h-8 px-3 text-right"
                    onClick={() => handleSort("missedDays")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Missed
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, idx) => (
                  <TableRow key={idx} className="even:bg-muted/30">
                    <TableCell className="text-xs py-2 px-3 font-medium">{row.mainTeacherName}</TableCell>
                    <TableCell className="text-xs py-2 px-3">{row.programName}</TableCell>
                    <TableCell className="text-xs py-2 px-3">{row.clusterName}</TableCell>
                    <TableCell className="text-xs py-2 px-3">{row.backupTeacherName}</TableCell>
                    <TableCell className="text-xs py-2 px-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getColorClass('missed', row.missedDays)} ${getBgColorClass('missed', row.missedDays)}`}>
                        {row.missedDays}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2 border-t">
                <span className="text-[10px] text-muted-foreground">
                  {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sortedData.length)} of {sortedData.length}
                </span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="h-5 w-5 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="h-5 w-5 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
