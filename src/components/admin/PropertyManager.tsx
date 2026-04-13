import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Database } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { toast } from "sonner";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import { generateSeedProperties } from "@/data/seedProperties";

interface PropertyForm {
  id?: string;
  title: string;
  location: string;
  image_url: string;
  target_amount: number;
  raised_amount: number;
  roi: number;
  investors_count: number;
  status: string;
  property_type: string;
  min_investment: number;
  description: string;
}

const emptyProperty: PropertyForm = {
  title: "",
  location: "",
  image_url: "",
  target_amount: 0,
  raised_amount: 0,
  roi: 0,
  investors_count: 0,
  status: "funding",
  property_type: "Residential",
  min_investment: 0,
  description: "",
};

const PropertyManager = () => {
  const [properties, setProperties] = useState<
    (PropertyForm & { id: string })[]
  >([]);
  const [editing, setEditing] = useState<PropertyForm | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "properties"),
      orderBy("created_at", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setProperties(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as any));
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!editing?.title || !editing.location) {
      toast.error("Title and location are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...data } = editing;
        await updateDoc(doc(db, "properties", id), {
          ...data,
          updated_at: serverTimestamp(),
        });
        toast.success("Property updated");
      } else {
        await addDoc(collection(db, "properties"), {
          ...editing,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        toast.success("Property created");
      }
      setIsOpen(false);
      setEditing(null);
    } catch (error: any) {
      toast.error(getFirebaseErrorMessage(error));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "properties", id));
    toast.success("Property deleted");
  };

  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const seedData = generateSeedProperties();
      let count = 0;
      for (const prop of seedData) {
        await addDoc(collection(db, "properties"), {
          ...(prop as object),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        count++;
      }
      toast.success(`${count} properties seeded successfully!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Seeding failed: " + error.message);
      } else {
        toast.error("Seeding failed: " + String(error));
      }
    }
  };

  const openCreate = () => {
    setEditing({ ...emptyProperty });
    setIsOpen(true);
  };
  const openEdit = (p: PropertyForm & { id: string }) => {
    setEditing({ ...p });
    setIsOpen(true);
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">Property Management</CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={handleSeed}
            disabled={seeding}
            variant="outline"
            className="gap-2"
          >
            <Database className="h-4 w-4" />{" "}
            {seeding ? "Seeding..." : "Seed 50 Properties"}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreate}
                className="gradient-gold text-primary-foreground gap-2"
              >
                <Plus className="h-4 w-4" /> Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editing?.id ? "Edit Property" : "New Property"}
                </DialogTitle>
              </DialogHeader>
              {editing && (
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={editing.title}
                        onChange={(e) =>
                          setEditing({ ...editing, title: e.target.value })
                        }
                        placeholder="Property name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={editing.location}
                        onChange={(e) =>
                          setEditing({ ...editing, location: e.target.value })
                        }
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Target Amount ($)</Label>
                      <Input
                        type="number"
                        value={editing.target_amount || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            target_amount: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ROI (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editing.roi || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            roi: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Min Investment ($)</Label>
                      <Input
                        type="number"
                        value={editing.min_investment || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            min_investment: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Raised Amount ($)</Label>
                      <Input
                        type="number"
                        value={editing.raised_amount || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            raised_amount: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Investors Count</Label>
                      <Input
                        type="number"
                        value={editing.investors_count || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            investors_count: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Property Type</Label>
                      <Select
                        value={editing.property_type}
                        onValueChange={(v) =>
                          setEditing({ ...editing, property_type: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Residential",
                            "Commercial",
                            "Retail",
                            "Mixed-Use",
                            "Industrial",
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={editing.status}
                        onValueChange={(v) =>
                          setEditing({ ...editing, status: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["funding", "funded", "completed"].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={editing.image_url}
                      onChange={(e) =>
                        setEditing({ ...editing, image_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={editing.description}
                      onChange={(e) =>
                        setEditing({ ...editing, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="gradient-gold text-primary-foreground"
                    >
                      {saving ? "Saving..." : "Save Property"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-muted-foreground font-medium">
                  Property
                </th>
                <th className="pb-3 text-muted-foreground font-medium hidden sm:table-cell">
                  Location
                </th>
                <th className="pb-3 text-muted-foreground font-medium">
                  Target
                </th>
                <th className="pb-3 text-muted-foreground font-medium hidden md:table-cell">
                  Raised
                </th>
                <th className="pb-3 text-muted-foreground font-medium hidden md:table-cell">
                  ROI
                </th>
                <th className="pb-3 text-muted-foreground font-medium">
                  Status
                </th>
                <th className="pb-3 text-muted-foreground font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 font-medium">{p.title}</td>
                  <td className="py-3 text-muted-foreground hidden sm:table-cell">
                    {p.location}
                  </td>
                  <td className="py-3">
                    ${(p.target_amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    ${(p.raised_amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 hidden md:table-cell text-primary">
                    {p.roi}%
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={
                        p.status === "funding"
                          ? "default"
                          : p.status === "funded"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No properties yet. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyManager;
