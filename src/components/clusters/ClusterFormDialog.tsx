import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateCluster,
  useUpdateCluster,
  Cluster,
} from "@/hooks/useClusters";
import { useCities } from "@/hooks/useMasterData";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface ClusterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cluster?: Cluster | null;
}

const ClusterFormDialog = ({
  open,
  onOpenChange,
  cluster,
}: ClusterFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    geo_radius_meters: "200",
    notes: "",
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const createCluster = useCreateCluster();
  const updateCluster = useUpdateCluster();
  const { data: cities } = useCities();

  const isEditing = !!cluster;

  const states = useMemo(() => {
    if (!cities) return [];
    const uniqueStates = [...new Set(cities.map((c) => c.state))];
    return uniqueStates.sort();
  }, [cities]);

  const filteredCities = useMemo(() => {
    if (!cities || !formData.state) return cities || [];
    return cities.filter((c) => c.state === formData.state);
  }, [cities, formData.state]);

  useEffect(() => {
    if (cluster) {
      setFormData({
        name: cluster.name || "",
        address: cluster.address || "",
        city: cluster.city || "",
        state: cluster.state || "",
        latitude: cluster.latitude?.toString() || "",
        longitude: cluster.longitude?.toString() || "",
        geo_radius_meters: cluster.geo_radius_meters?.toString() || "200",
        notes: (cluster as any).notes || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        latitude: "",
        longitude: "",
        geo_radius_meters: "200",
        notes: "",
      });
    }
  }, [cluster, open]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setIsGettingLocation(false);
      },
      (error) => {
        alert("Error getting location: " + error.message);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      geo_radius_meters: formData.geo_radius_meters
        ? parseInt(formData.geo_radius_meters)
        : 200,
      notes: formData.notes || null,
    };

    try {
      if (isEditing) {
        await updateCluster.mutateAsync({ id: cluster.id, ...payload });
      } else {
        await createCluster.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createCluster.isPending || updateCluster.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Cluster" : "Add New Cluster"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info Section */}
          <div className="rounded-lg border border-primary/10 overflow-hidden">
            <div className="bg-primary/15 px-4 py-2.5">
              <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Basic Information</h3>
            </div>
            <div className="bg-primary/5 p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1">
                  <Label htmlFor="name">Cluster Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Mumbai Central"
                    required
                    className="h-9 mt-1.5"
                  />
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Street address"
                    className="h-9 mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, state: value, city: "" }));
                    }}
                  >
                    <SelectTrigger className="h-9 mt-1.5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, city: value }))
                    }
                  >
                    <SelectTrigger className="h-9 mt-1.5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCities.map((city) => (
                        <SelectItem key={city.id} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Optional notes"
                    className="h-9 mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Geo-Location Section */}
          <div className="rounded-lg border border-primary/10 overflow-hidden">
            <div className="bg-primary/15 px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Geo-Location Settings
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="h-7 text-xs"
              >
                <Navigation className="h-3 w-3 mr-1" />
                {isGettingLocation ? "Getting..." : "Use Current"}
              </Button>
            </div>
            <div className="bg-primary/5 p-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        latitude: e.target.value,
                      }))
                    }
                    placeholder="0.000000"
                    className="h-9 mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        longitude: e.target.value,
                      }))
                    }
                    placeholder="0.000000"
                    className="h-9 mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="geo_radius_meters">Radius (meters)</Label>
                  <Input
                    id="geo_radius_meters"
                    type="number"
                    value={formData.geo_radius_meters}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        geo_radius_meters: e.target.value,
                      }))
                    }
                    placeholder="200"
                    className="h-9 mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Geo-fence for attendance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Cluster" : "Create Cluster"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClusterFormDialog;