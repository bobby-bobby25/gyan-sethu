import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Heart,
  TrendingUp,
  Calendar,
  Building2,
  User,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useDonors, DonorWithDonations } from "@/hooks/useDonors";
import { DonorFormDialog } from "@/components/donors/DonorFormDialog";
import { DeleteDonorDialog } from "@/components/donors/DeleteDonorDialog";
import { DonorDetailDialog } from "@/components/donors/DonorDetailDialog";
import { DonationFormDialog } from "@/components/donors/DonationFormDialog";

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString()}`;
};

const Donors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<DonorWithDonations | null>(
    null
  );

  const { data: donors, isLoading } = useDonors();

  const filteredDonors = useMemo(() => {
    if (!donors) return [];
    return donors.filter((donor) => {
      const name = donor.name ? donor.name.toLowerCase() : "";
      const donorCode = donor.donorCode ? donor.donorCode.toLowerCase() : "";
      const email = donor.email ? donor.email.toLowerCase() : "";
      const query = searchQuery ? searchQuery.toLowerCase() : "";
      return (
        name.includes(query) ||
        donorCode.includes(query) ||
        email.includes(query)
      );
    });
  }, [donors, searchQuery]);

  const stats = useMemo(() => {
    if (!donors) return { total: 0, totalDonations: 0, donorsByType: [] };

    let totalDonations = 0;
    const typeCount: Record<string, number> = { regular: 0, csr: 0, adhoc: 0 };

    donors.forEach((donor) => {
      const donations = donor.donations || [];
      totalDonations += donations.reduce((sum, d) => sum + d.amount, 0);
      const type = donor.donorType || "adhoc";
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const donorsByType = [
      { name: "Regular", value: typeCount.regular, color: "hsl(var(--primary))" },
      { name: "CSR", value: typeCount.csr, color: "hsl(var(--accent))" },
      { name: "Adhoc", value: typeCount.adhoc, color: "hsl(var(--info))" },
    ].filter((t) => t.value > 0);

    return { total: donors.length, totalDonations, donorsByType };
  }, [donors]);

  const handleEdit = (donor: DonorWithDonations) => {
    setSelectedDonor(donor);
    setFormDialogOpen(true);
  };

  const handleDelete = (donor: DonorWithDonations) => {
    setSelectedDonor(donor);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (donor: DonorWithDonations) => {
    setSelectedDonor(donor);
    setDetailDialogOpen(true);
  };

  const handleAddDonation = (donor: DonorWithDonations) => {
    setSelectedDonor(donor);
    setDonationDialogOpen(true);
  };

  const getDonorTypeBadge = (type: string | null) => {
    switch (type) {
      case "csr":
        return <Badge variant="accent">CSR</Badge>;
      case "regular":
        return <Badge variant="default">Regular</Badge>;
      default:
        return <Badge variant="info">Adhoc</Badge>;
    }
  };

  const getDonorStats = (donor: DonorWithDonations) => {
    const donations = donor.donations || [];
    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    const lastDonation = donations.sort(
      (a, b) =>
        new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime()
    )[0];
    return { total, count: donations.length, lastDonation };
  };

  return (
    <DashboardLayout pageTitle="Donors" pageSubtitle="Manage donor relationships and track contributions">
      <div className="space-y-6">
        {/* Mobile title */}
        <h1 className="text-2xl font-display font-bold sm:hidden">Donors</h1>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            variant="hero"
            className="gap-2"
            onClick={() => {
              setSelectedDonor(null);
              setFormDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Donor
          </Button>
        </div>

        {/* Stats and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-muted flex items-center justify-center">
                    <Heart className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {formatCurrency(stats.totalDonations)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Donations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {stats.total}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Donors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-accent">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {stats.donorsByType.find((t) => t.name === "Regular")
                        ?.value || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Regular Donors
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donor Type Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Donor Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {stats.donorsByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.donorsByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.donorsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card variant="flat" className="border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search donors by name, ID, or email..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Donors Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Donor Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredDonors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No donors found matching your search."
                  : "No donors found. Add your first donor to get started."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Total Donated</TableHead>
                      <TableHead className="text-center">Donations</TableHead>
                      <TableHead>Last Donation</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonors.map((donor) => {
                      const donorStats = getDonorStats(donor);
                      return (
                        <TableRow key={donor.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {donor.donorCode || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                {donor.donorType === "csr" ? (
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <span className="font-medium">{donor.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getDonorTypeBadge(donor.donorType)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(donorStats.total)}
                          </TableCell>
                          <TableCell className="text-center">
                            {donorStats.count}
                          </TableCell>
                          <TableCell>
                            {donorStats.lastDonation ? (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {donorStats.lastDonation.donationDate}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
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
                                  onClick={() => handleViewDetails(donor)}
                                >
                                  <Eye className="h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleEdit(donor)}
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleAddDonation(donor)}
                                >
                                  <Plus className="h-4 w-4" /> Add Donation
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 text-destructive"
                                  onClick={() => handleDelete(donor)}
                                >
                                  <Trash2 className="h-4 w-4" /> Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DonorFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        donor={selectedDonor}
      />

      <DeleteDonorDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        donor={selectedDonor}
      />

      <DonorDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        donor={selectedDonor}
      />

      {selectedDonor && (
        <DonationFormDialog
          open={donationDialogOpen}
          onOpenChange={setDonationDialogOpen}
          donorId={selectedDonor.id}
          donation={null}
        />
      )}
    </DashboardLayout>
  );
};

export default Donors;
