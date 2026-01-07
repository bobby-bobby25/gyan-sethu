import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Heart,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UnifiedDashboard } from "@/components/dashboard/UnifiedDashboard";
import { DonorDashboard } from "@/components/dashboard/DonorDashboard";
import { useAcademicYears } from "@/hooks/useAcademicYears";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: academicYears } = useAcademicYears();
  const currentYear = academicYears?.find((y) => y.is_current);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const effectiveYearId = selectedYear || currentYear?.id;

  return (
    <DashboardLayout pageTitle="Dashboard" pageSubtitle="Overview of your organization's performance">
      <div className="space-y-4">
        {/* Mobile title */}
        <h1 className="text-2xl font-display font-bold sm:hidden">Dashboard</h1>

        {/* Tabs with Academic Year Filter */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <TabsList className="w-full sm:w-auto sm:inline-grid sm:grid-cols-2">
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="donors" className="gap-2">
                <Heart className="h-4 w-4" />
                Donors
              </TabsTrigger>
            </TabsList>

            {activeTab === "dashboard" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Academic Year:</span>
                <Select
                  value={effectiveYearId || ""}
                  onValueChange={(value) => setSelectedYear(value || undefined)}
                >
                  <SelectTrigger className="w-[160px] h-8 text-sm text-info font-medium border-info/30">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.is_current && "(Current)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <TabsContent value="dashboard" className="mt-4">
            <UnifiedDashboard selectedYearId={effectiveYearId} />
          </TabsContent>

          <TabsContent value="donors" className="mt-4">
            <DonorDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
