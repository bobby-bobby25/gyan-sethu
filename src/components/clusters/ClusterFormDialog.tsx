import { useEffect, useState } from "react";
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
  useCreateCluster,
  useUpdateCluster,
  Cluster,
} from "@/hooks/useClusters";
import { MapPin, Navigation } from "lucide-react";

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
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const createCluster = useCreateCluster();
  const updateCluster = useUpdateCluster();

  const isEditing = !!cluster;

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Cluster" : "Add New Cluster"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Cluster Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Mumbai Central"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                placeholder="State"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Geo-Location Settings
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isGettingLocation ? "Getting..." : "Use Current Location"}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
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
                />
              </div>
              <div className="space-y-2">
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="geo_radius_meters">Radius (m)</Label>
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
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Geo-fence radius defines the allowed distance for attendance marking
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Cluster"
                : "Create Cluster"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClusterFormDialog;
