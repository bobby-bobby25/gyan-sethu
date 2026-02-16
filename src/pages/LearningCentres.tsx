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
  School,
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
import { useLearningCentresWithDetails, LearningCentreWithDetails } from "@/hooks/useLearningCentres";
import LearningCentreFormDialog from "@/components/learning-centres/LearningCentreFormDialog";
import LearningCentreDetailDialog from "@/components/learning-centres/LearningCentreDetailDialog";
import DeleteLearningCentreDialog from "@/components/learning-centres/DeleteLearningCentreDialog";

const LearningCentres = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLearningCentre, setSelectedLearningCentre] = useState<LearningCentreWithDetails | null>(null);

  const { data: learningCentres, isLoading } = useLearningCentresWithDetails();

  const filteredLearningCentres = (learningCentres || []).filter(
    (centre) =>
      centre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      centre.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      centre.cluster_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (centre: LearningCentreWithDetails) => {
    setSelectedLearningCentre(centre);
    setFormOpen(true);
  };

  const handleView = (centre: LearningCentreWithDetails) => {
    setSelectedLearningCentre(centre);
    setDetailOpen(true);
  };

  const handleDelete = (centre: LearningCentreWithDetails) => {
    setSelectedLearningCentre(centre);
    setDeleteOpen(true);
  };

  const handleAdd = () => {
    setSelectedLearningCentre(null);
    setFormOpen(true);
  };

  return (
    <DashboardLayout pageTitle="Learning Centres" pageSubtitle="Manage learning centres within your clusters">
      <div className="space-y-6">
        {/* Mobile title */}
        <h1 className="text-2xl font-display font-bold sm:hidden">Learning Centres</h1>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search centres..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="hero" className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Centre
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/15 hover:bg-primary/15">
                <TableHead className="font-bold text-foreground">Centre Name</TableHead>
                <TableHead className="font-bold text-foreground">Cluster</TableHead>
                <TableHead className="font-bold text-foreground">Location</TableHead>
                <TableHead className="font-bold text-center text-foreground">Students</TableHead>
                <TableHead className="font-bold text-foreground">Geo-fence</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLearningCentres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40">
                    <div className="text-center">
                      <School className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      <h3 className="text-base font-medium">No learning centres found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery
                          ? "Try adjusting your search query"
                          : "Get started by adding your first learning centre"}
                      </p>
                      {!searchQuery && (
                        <Button variant="hero" size="sm" className="mt-3 gap-2" onClick={handleAdd}>
                          <Plus className="h-4 w-4" />
                          Add Centre
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLearningCentres.map((centre) => (
                  <TableRow
                    key={centre.id}
                    className={!centre.is_active ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            centre.is_active ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          {/* <MapPin
                            className={`h-4 w-4 ${
                              centre.is_active ? "text-primary" : "text-muted-foreground"
                            }`}
                          /> */}

                          <School 
                            className={`h-4 w-4  ${
                              centre.is_active ? "text-primary" : "text-muted-foreground"
                            }`} 
                           />

                        </div>
                        <span className="font-medium">{centre.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {centre.cluster_name || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {[centre.city, centre.state].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {centre.student_count}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Navigation className="h-3.5 w-3.5" />
                        {centre.latitude && centre.longitude
                          ? `${centre.geo_radius_meters || 200}m`
                          : "Not set"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={centre.is_active ? "success" : "secondary"}>
                        {centre.is_active ? "Active" : "Inactive"}
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
                            onClick={() => handleView(centre)}
                          >
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleEdit(centre)}
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDelete(centre)}
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

      {/* Dialogs */}
      <LearningCentreFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        learningCentre={selectedLearningCentre}
      />

      <LearningCentreDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        learningCentreId={selectedLearningCentre?.id || null}
      />

      <DeleteLearningCentreDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        learningCentre={selectedLearningCentre}
      />
    </DashboardLayout>
  );
};

export default LearningCentres;
