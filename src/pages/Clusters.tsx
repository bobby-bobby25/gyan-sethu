import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Plus,
  MapPin,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClustersWithStats, ClusterWithStats } from "@/hooks/useClusters";
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

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clusters..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="hero" className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Cluster
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/15 hover:bg-primary/15">
                <TableHead className="font-bold text-foreground">Cluster Name</TableHead>
                <TableHead className="font-bold text-foreground">Location</TableHead>
                <TableHead className="font-bold text-center text-foreground">Students</TableHead>
                <TableHead className="font-bold text-center text-foreground">Teachers</TableHead>
                <TableHead className="font-bold text-center text-foreground">Learning Centres</TableHead>
                <TableHead className="font-bold text-foreground">Programs</TableHead>
                <TableHead className="font-bold text-center text-foreground">Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                  </TableRow>
                ))
              ) : filteredClusters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40">
                    <div className="text-center">
                      <MapPin className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      <h3 className="text-base font-medium">No clusters found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery
                          ? "Try adjusting your search query"
                          : "Get started by adding your first cluster"}
                      </p>
                      {!searchQuery && (
                        <Button variant="hero" size="sm" className="mt-3 gap-2" onClick={handleAdd}>
                          <Plus className="h-4 w-4" />
                          Add Cluster
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClusters.map((cluster) => (
                  <TableRow
                    key={cluster.id}
                    className={!cluster.is_active ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            cluster.is_active ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <MapPin
                            className={`h-4 w-4 ${
                              cluster.is_active ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                        </div> */}
                        <span className="font-medium">{cluster.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {[cluster.city, cluster.state].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {cluster.student_count}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {cluster.teacher_count}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {cluster.learning_centre_count || 0}
                    </TableCell>
                    <TableCell>
                        {Array.isArray(cluster.programs) && cluster.programs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cluster.programs.slice(0, 2).map((program) => (
                            <Badge key={program} variant="secondary" className="text-xs">
                              {program}
                            </Badge>
                          ))}
                          {cluster.programs.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{cluster.programs.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={cluster.is_active ? "success" : "secondary"}>
                        {cluster.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
