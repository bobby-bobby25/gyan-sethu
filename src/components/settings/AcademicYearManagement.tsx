import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  Star,
} from "lucide-react";
import {
  useAcademicYears,
  useSetCurrentAcademicYear,
  AcademicYear,
} from "@/hooks/useAcademicYears";
import AcademicYearFormDialog from "./AcademicYearFormDialog";
import DeleteAcademicYearDialog from "./DeleteAcademicYearDialog";
import { format } from "date-fns";

const AcademicYearManagement = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);

  const { data: years, isLoading } = useAcademicYears();
  const setCurrentYear = useSetCurrentAcademicYear();

  const activeYears = years?.filter((y) => y.is_active) || [];

  const handleEdit = (year: AcademicYear) => {
    setSelectedYear(year);
    setFormOpen(true);
  };

  const handleDelete = (year: AcademicYear) => {
    setSelectedYear(year);
    setDeleteOpen(true);
  };

  const handleAdd = () => {
    setSelectedYear(null);
    setFormOpen(true);
  };

  const handleSetCurrent = async (year: AcademicYear) => {
    await setCurrentYear.mutateAsync(year.id);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Academic Years
            </CardTitle>
            <CardDescription>
              Manage academic years and set the current active year
            </CardDescription>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Year
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : activeYears.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No academic years configured</p>
              <Button variant="outline" className="mt-3 gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add Academic Year
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeYears.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{year.name}</span>
                          {year.is_current && (
                            <Badge variant="success" className="gap-1">
                              <Star className="h-3 w-3" />
                              Current
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(year.start_date)}</TableCell>
                      <TableCell>{formatDate(year.end_date)}</TableCell>
                      <TableCell>
                        <Badge variant={year.is_active ? "secondary" : "outline"}>
                          {year.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!year.is_current && (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleSetCurrent(year)}
                                disabled={setCurrentYear.isPending}
                              >
                                <Check className="h-4 w-4" />
                                Set as Current
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleEdit(year)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => handleDelete(year)}
                              disabled={year.is_current}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
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

      <AcademicYearFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        academicYear={selectedYear}
      />

      <DeleteAcademicYearDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        academicYear={selectedYear}
      />
    </>
  );
};

export default AcademicYearManagement;
