import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  MapPin,
  Users,
  UserCheck,
  MoreHorizontal,
  Edit,
  Eye,
  Navigation,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClustersWithStats, Cluster, ClusterWithStats } from "@/hooks/useClusters";
import ClusterFormDialog from "@/components/clusters/ClusterFormDialog";
import ClusterDetailDialog from "@/components/clusters/ClusterDetailDialog";
import DeleteClusterDialog from "@/components/clusters/DeleteClusterDialog";

const Clusters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<ClusterWithStats | null>(null);

  const { data: clusters, isLoading } = useClustersWithStats();

  const filteredClusters = (clusters || []).filter(
    (cluster) =>
      cluster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cluster.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cluster.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (cluster: ClusterWithStats) => {
    setSelectedCluster(cluster);
    setFormOpen(true);
  };

  const handleView = (cluster: ClusterWithStats) => {
    setSelectedCluster(cluster);
    setDetailOpen(true);
  };

  const handleDelete = (cluster: ClusterWithStats) => {
    setSelectedCluster(cluster);
    setDeleteOpen(true);
  };

  const handleAdd = () => {
    setSelectedCluster(null);
    setFormOpen(true);
  };

  return (
    <DashboardLayout pageTitle="Clusters" pageSubtitle="Manage teaching centers and their configurations">
      <div className="space-y-6">
        {/* Mobile title */}
        <h1 className="text-2xl font-display font-bold sm:hidden">Clusters</h1>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button variant="hero" className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Cluster
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clusters..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClusters.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No clusters found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by adding your first cluster"}
            </p>
            {!searchQuery && (
              <Button variant="hero" className="mt-4 gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add Cluster
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClusters.map((cluster) => (
              <Card
                key={cluster.id}
                variant="interactive"
                className={!cluster.is_active ? "opacity-70" : ""}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        cluster.is_active ? "bg-primary-muted" : "bg-muted"
                      }`}
                    >
                      <MapPin
                        className={`h-5 w-5 ${
                          cluster.is_active ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{cluster.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {[cluster.city, cluster.state].filter(Boolean).join(", ") ||
                          "No location set"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => handleView(cluster)}
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => handleEdit(cluster)}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => handleDelete(cluster)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{cluster.student_count}</span>
                      <span className="text-muted-foreground">students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{cluster.teacher_count}</span>
                      <span className="text-muted-foreground">teachers</span>
                    </div>
                  </div>

                  {Array.isArray(cluster.programs) && cluster.programs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {cluster.programs.map((program) => (
                        <Badge key={program} variant="secondary" className="text-xs">
                          {program}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          cluster.is_active ? "bg-success" : "bg-muted-foreground"
                        }`}
                      />
                      <span className="text-sm capitalize text-muted-foreground">
                        {cluster.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {cluster.latitude && cluster.longitude
                        ? `${cluster.geo_radius_meters || 200}m radius`
                        : "No geo-fence"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ClusterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        cluster={selectedCluster}
      />

      <ClusterDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        cluster={selectedCluster}
      />

      <DeleteClusterDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        cluster={selectedCluster}
      />
    </DashboardLayout>
  );
};

export default Clusters;
