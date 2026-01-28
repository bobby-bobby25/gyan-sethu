import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  useIdProofTypes,
  useCreateIdProofType,
  useUpdateIdProofType,
  useDeleteIdProofType,
  useCasteCategories,
  useCreateCasteCategory,
  useUpdateCasteCategory,
  useDeleteCasteCategory,
  useAttendanceStatusTypes,
  useCreateAttendanceStatusType,
  useUpdateAttendanceStatusType,
  useDeleteAttendanceStatusType,
  usePaymentModes,
  useCreatePaymentMode,
  useUpdatePaymentMode,
  useDeletePaymentMode,
  useAmbitions,
  useCreateAmbition,
  useUpdateAmbition,
  useDeleteAmbition,
  useHobbies,
  useCreateHobby,
  useUpdateHobby,
  useDeleteHobby,
  useCities,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
} from "@/hooks/useMasterData";

type MasterDataItem = {
  id: string;
  name: string;
  code?: string;
};

interface MasterDataCardProps {
  title: string;
  description: string;
  items: MasterDataItem[] | undefined;
  isLoading: boolean;
  hasCode?: boolean;
  codeLabel?: string;
  onCreate: (name: string, code?: string) => Promise<void>;
  onUpdate: (id: string, name: string, code?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const MasterDataCard = ({
  title,
  description,
  items,
  isLoading,
  hasCode = false,
  codeLabel = "Code",
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
}: MasterDataCardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await onCreate(newName.trim(), hasCode ? newCode.trim() : undefined);
      setNewName("");
      setNewCode("");
      setIsAdding(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await onUpdate(id, editName.trim(), hasCode ? editCode.trim() : undefined);
      setEditingId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const startEditing = (item: MasterDataItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCode(item.code || "");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ) : (
          <>
            {/* Add new item form */}
            {isAdding && (
              <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name"
                  className="h-8 flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") {
                      setIsAdding(false);
                      setNewName("");
                      setNewCode("");
                    }
                  }}
                />
                {hasCode && (
                  <Input
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder={codeLabel}
                    className="h-8 w-24"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                      if (e.key === "Escape") {
                        setIsAdding(false);
                        setNewName("");
                        setNewCode("");
                      }
                    }}
                  />
                )}
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleAdd}
                  disabled={isCreating || !newName.trim()}
                >
                  <Check className="h-4 w-4 text-success" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setNewName("");
                    setNewCode("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Items list */}
            <div className="flex flex-wrap gap-2">
              {items?.map((item) =>
                editingId === item.id ? (
                  <div
                    key={item.id}
                    className="flex items-center gap-1 p-1 rounded-lg border bg-muted/30"
                  >
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-6 w-24 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(item.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    {hasCode && (
                      <Input
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="h-6 w-16 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(item.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleUpdate(item.id)}
                      disabled={isUpdating}
                    >
                      <Check className="h-3 w-3 text-success" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="gap-1 pr-1 group"
                  >
                    {item.name}
                    {hasCode && item.code && (
                      <span className="text-muted-foreground ml-1">({item.code})</span>
                    )}
                    <button
                      className="ml-1 p-0.5 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => startEditing(item)}
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      className="p-0.5 hover:bg-destructive/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </Badge>
                )
              )}
              {items?.length === 0 && !isAdding && (
                <p className="text-sm text-muted-foreground">No items configured</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const MasterDataManagement = () => {
  // ID Proof Types
  const { data: idProofTypes, isLoading: loadingIdProof } = useIdProofTypes();
  const createIdProof = useCreateIdProofType();
  const updateIdProof = useUpdateIdProofType();
  const deleteIdProof = useDeleteIdProofType();

  // Caste Categories
  const { data: casteCategories, isLoading: loadingCaste } = useCasteCategories();
  const createCaste = useCreateCasteCategory();
  const updateCaste = useUpdateCasteCategory();
  const deleteCaste = useDeleteCasteCategory();

  // Attendance Status Types
  const { data: attendanceStatuses, isLoading: loadingAttendance } = useAttendanceStatusTypes();
  const createAttendance = useCreateAttendanceStatusType();
  const updateAttendance = useUpdateAttendanceStatusType();
  const deleteAttendance = useDeleteAttendanceStatusType();

  // Payment Modes
  const { data: paymentModes, isLoading: loadingPayment } = usePaymentModes();
  const createPayment = useCreatePaymentMode();
  const updatePayment = useUpdatePaymentMode();
  const deletePayment = useDeletePaymentMode();

  // Ambitions
  const { data: ambitions, isLoading: loadingAmbitions } = useAmbitions();
  const createAmbition = useCreateAmbition();
  const updateAmbition = useUpdateAmbition();
  const deleteAmbition = useDeleteAmbition();

  // Hobbies
  const { data: hobbies, isLoading: loadingHobbies } = useHobbies();
  const createHobby = useCreateHobby();
  const updateHobby = useUpdateHobby();
  const deleteHobby = useDeleteHobby();

  // Cities
  const { data: cities, isLoading: loadingCities } = useCities();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();

  // Transform cities to include state as code for display
  const citiesWithState = cities?.map(city => ({
    id: city.id,
    name: city.name,
    code: city.state,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MasterDataCard
        title="Attendance Status Types"
        description="Manage attendance marking options"
        items={attendanceStatuses}
        isLoading={loadingAttendance}
        hasCode={true}
        onCreate={async (name, code) => {
          await createAttendance.mutateAsync({ name, code: code || name.toUpperCase().slice(0, 3) });
        }}
        onUpdate={async (id, name, code) => {
          await updateAttendance.mutateAsync({ id, name, code: code || name.toUpperCase().slice(0, 3) });
        }}
        onDelete={async (id) => {
          await deleteAttendance.mutateAsync(id);
        }}
        isCreating={createAttendance.isPending}
        isUpdating={updateAttendance.isPending}
        isDeleting={deleteAttendance.isPending}
      />

      <MasterDataCard
        title="Caste Categories"
        description="Student caste classification"
        items={casteCategories}
        isLoading={loadingCaste}
        hasCode={true}
        onCreate={async (name, code) => {
          await createCaste.mutateAsync({ name, code: code || name.toUpperCase().slice(0, 3) });
        }}
        onUpdate={async (id, name, code) => {
          await updateCaste.mutateAsync({ id, name, code: code || name.toUpperCase().slice(0, 3) });
        }}
        onDelete={async (id) => {
          await deleteCaste.mutateAsync(id);
        }}
        isCreating={createCaste.isPending}
        isUpdating={updateCaste.isPending}
        isDeleting={deleteCaste.isPending}
      />

      <MasterDataCard
        title="ID Proof Types"
        description="Accepted identity documents"
        items={idProofTypes}
        isLoading={loadingIdProof}
        hasCode={false}
        onCreate={async (name) => {
          await createIdProof.mutateAsync(name);
        }}
        onUpdate={async (id, name) => {
          await updateIdProof.mutateAsync({ id, name });
        }}
        onDelete={async (id) => {
          await deleteIdProof.mutateAsync(id);
        }}
        isCreating={createIdProof.isPending}
        isUpdating={updateIdProof.isPending}
        isDeleting={deleteIdProof.isPending}
      />

      <MasterDataCard
        title="Payment Modes"
        description="Donation payment methods"
        items={paymentModes}
        isLoading={loadingPayment}
        hasCode={false}
        onCreate={async (name) => {
          await createPayment.mutateAsync(name);
        }}
        onUpdate={async (id, name) => {
          await updatePayment.mutateAsync({ id, name });
        }}
        onDelete={async (id) => {
          await deletePayment.mutateAsync(id);
        }}
        isCreating={createPayment.isPending}
        isUpdating={updatePayment.isPending}
        isDeleting={deletePayment.isPending}
      />

      <MasterDataCard
        title="Ambitions"
        description="Student career aspirations"
        items={ambitions}
        isLoading={loadingAmbitions}
        hasCode={false}
        onCreate={async (name) => {
          await createAmbition.mutateAsync(name);
        }}
        onUpdate={async (id, name) => {
          await updateAmbition.mutateAsync({ id, name });
        }}
        onDelete={async (id) => {
          await deleteAmbition.mutateAsync(id);
        }}
        isCreating={createAmbition.isPending}
        isUpdating={updateAmbition.isPending}
        isDeleting={deleteAmbition.isPending}
      />

      <MasterDataCard
        title="Hobbies"
        description="Student interests and activities"
        items={hobbies}
        isLoading={loadingHobbies}
        hasCode={false}
        onCreate={async (name) => {
          await createHobby.mutateAsync(name);
        }}
        onUpdate={async (id, name) => {
          await updateHobby.mutateAsync({ id, name });
        }}
        onDelete={async (id) => {
          await deleteHobby.mutateAsync(id);
        }}
        isCreating={createHobby.isPending}
        isUpdating={updateHobby.isPending}
        isDeleting={deleteHobby.isPending}
      />

      <MasterDataCard
        title="Cities"
        description="City and state for address autocomplete"
        items={citiesWithState}
        isLoading={loadingCities}
        hasCode={true}
        codeLabel="State"
        onCreate={async (name, state) => {
          await createCity.mutateAsync({ name, state: state || "" });
        }}
        onUpdate={async (id, name, state) => {
          await updateCity.mutateAsync({ id, name, state: state || "" });
        }}
        onDelete={async (id) => {
          await deleteCity.mutateAsync(id);
        }}
        isCreating={createCity.isPending}
        isUpdating={updateCity.isPending}
        isDeleting={deleteCity.isPending}
      />
    </div>
  );
};

export default MasterDataManagement;
