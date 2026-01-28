import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, X } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface DashboardFiltersProps {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  programs: { id: string; name: string }[];
  clusters: { id: string; name: string }[];
  selectedProgramId?: string;
  selectedClusterId?: string;
  onProgramChange: (programId?: string) => void;
  onClusterChange: (clusterId?: string) => void;
}

export function DashboardFilters({
  dateRange,
  onDateRangeChange,
  programs,
  clusters,
  selectedProgramId,
  selectedClusterId,
  onProgramChange,
  onClusterChange,
}: DashboardFiltersProps) {
  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({ from: range.from, to: range.to });
    } else if (range?.from) {
      onDateRangeChange({ from: range.from, to: range.from });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-auto justify-start text-left font-normal h-9",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() ? (
                <>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                </>
              ) : (
                format(dateRange.from, "MMM d, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Program Filter */}
      <div className="flex items-center gap-2">
        <Select
          value={selectedProgramId || "all"}
          onValueChange={(value) => onProgramChange(value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProgramId && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onProgramChange(undefined)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Cluster Filter */}
      <div className="flex items-center gap-2">
        <Select
          value={selectedClusterId || "all"}
          onValueChange={(value) => onClusterChange(value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="All Clusters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clusters</SelectItem>
            {clusters.map((cluster) => (
              <SelectItem key={cluster.id} value={cluster.id}>
                {cluster.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedClusterId && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onClusterChange(undefined)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
