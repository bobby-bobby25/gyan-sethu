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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateLearningCentre,
  useUpdateLearningCentre,
  LearningCentre,
} from "@/hooks/useLearningCentres";
import { useClusters } from "@/hooks/useClusters";
import { useCities } from "@/hooks/useMasterData";
import { MapPin, Loader2, Navigation, School } from "lucide-react";

interface LearningCentreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learningCentre?: LearningCentre | null;
}

const LearningCentreFormDialog = ({
  open,
  onOpenChange,
  learningCentre,
}: LearningCentreFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    cluster_id: "",
    latitude: "",
    longitude: "",
    geo_radius_meters: "200",
    notes: "",
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const createLearningCentre = useCreateLearningCentre();
  const updateLearningCentre = useUpdateLearningCentre();
  const { data: clusters } = useClusters();
  const { data: cities } = useCities();

  const isEditing = !!learningCentre;

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
    if (learningCentre) {
      setFormData({
        name: learningCentre.name || "",
        address: learningCentre.address || "",
        city: learningCentre.city || "",
        state: learningCentre.state || "",
        cluster_id: learningCentre.cluster_id?.toString() || "",
        latitude: learningCentre.latitude?.toString() || "",
        longitude: learningCentre.longitude?.toString() || "",
        geo_radius_meters: learningCentre.geo_radius_meters?.toString() || "200",
        notes: (learningCentre as any).notes || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        cluster_id: "",
        latitude: "",
        longitude: "",
        geo_radius_meters: "200",
        notes: "",
      });
    }
  }, [learningCentre, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
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
        toast.success("Location captured successfully");
        setIsGettingLocation(false);
      },
      (error) => {
        toast.error("Failed to get location: " + error.message);
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Learning Centre name is required");
      return;
    }

    if (!formData.cluster_id) {
      toast.error("Cluster selection is required");
      return;
    }

    const payload = {
      name: formData.name,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      cluster_id: parseInt(formData.cluster_id),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      geo_radius_meters: formData.geo_radius_meters ? parseInt(formData.geo_radius_meters) : null,
      notes: formData.notes || null,
    };

    try {
      if (isEditing && learningCentre) {
        await updateLearningCentre.mutateAsync({
          id: learningCentre.id,
          ...payload,
        });
      } else {
        await createLearningCentre.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const isSubmitting = createLearningCentre.isPending || updateLearningCentre.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            {isEditing ? "Edit Learning Centre" : "Create Learning Centre"}
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

                <div className="col-span-3 sm:col-span-2">
                  <Label htmlFor="name">Centre Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., East Branch"
                    required
                    className="h-9 mt-1.5"
                  />
                </div>

                <div className="col-span-3 sm:col-span-1">
                  <Label htmlFor="cluster_id">Cluster *</Label>
                  <Select
                    value={formData.cluster_id}
                    onValueChange={(value) => handleSelectChange("cluster_id", value)}
                    disabled={isEditing}
                  >
                    <SelectTrigger id="cluster_id" className="h-9 mt-1.5">
                      <SelectValue placeholder="Select cluster" />
                    </SelectTrigger>
                    <SelectContent>
                      {clusters?.map((cluster) => (
                        <SelectItem key={cluster.id} value={String(cluster.id)}>
                          {cluster.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Cannot be changed after creation
                    </p>
                  )}
                </div>

                <div className="col-span-3">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="h-9 mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => {
                      handleSelectChange("state", value);
                    }}
                  >
                    <SelectTrigger id="state" className="h-9 mt-1.5">
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
                      handleSelectChange("city", value)
                    }
                    disabled={!formData.state}
                  >
                    <SelectTrigger id="city" className="h-9 mt-1.5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCities?.map((city) => (
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
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
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
                onClick={handleGetLocation}
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
                      handleSelectChange("latitude", e.target.value)
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
                      handleSelectChange("longitude", e.target.value)
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
                      handleSelectChange("geo_radius_meters", e.target.value)
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Create"} Centre
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { toast } from "sonner";

export default LearningCentreFormDialog;
