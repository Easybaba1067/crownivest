import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  UserCog,
  Save,
  UserPlus,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

interface UserDoc {
  id: string;
  full_name: string;
  email: string;
  role: string;
  kyc_status: string;
  phone?: string;
  accredited_investor?: boolean;
}

const InvestorManager = () => {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDoc | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txType, setTxType] = useState<"deposit" | "withdrawal">("deposit");
  const [newBalance, setNewBalance] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable user fields
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [editKyc, setEditKyc] = useState("pending");
  const [editAccredited, setEditAccredited] = useState(false);

  // Create user fields
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("user");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserDoc));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    setEditName(selectedUser.full_name || "");
    setEditEmail(selectedUser.email || "");
    setEditPhone(selectedUser.phone || "");
    setEditRole(selectedUser.role || "user");
    setEditKyc(selectedUser.kyc_status || "pending");
    setEditAccredited(selectedUser.accredited_investor || false);

    const walletUnsub = onSnapshot(
      doc(db, "wallets", selectedUser.id),
      (snap) => {
        if (snap.exists()) {
          const bal = snap.data().balance || 0;
          setWalletBalance(bal);
          setNewBalance(bal.toString());
        } else {
          setWalletBalance(0);
          setNewBalance("0");
        }
      },
    );

    const txQuery = query(
      collection(db, "transactions"),
      where("user_id", "==", selectedUser.id),
      orderBy("created_at", "desc"),
    );
    const txUnsub = onSnapshot(txQuery, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      walletUnsub();
      txUnsub();
    };
  }, [selectedUser]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const handleUpdateProfile = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        full_name: editName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
        kyc_status: editKyc,
        accredited_investor: editAccredited,
        updated_at: serverTimestamp(),
      });
      toast.success("User profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser) return;
    const bal = parseFloat(newBalance);
    if (isNaN(bal) || bal < 0) {
      toast.error("Enter a valid balance");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "wallets", selectedUser.id), {
        balance: bal,
        updated_at: serverTimestamp(),
      });
      toast.success(`Balance updated to $${bal.toLocaleString()}`);
    } catch {
      toast.error("Failed to update balance");
    }
    setSaving(false);
  };

  const handleAddTransaction = async () => {
    if (!selectedUser) return;
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      const finalAmount = txType === "withdrawal" ? -amt : amt;
      await addDoc(collection(db, "transactions"), {
        user_id: selectedUser.id,
        amount: finalAmount,
        type: txType,
        description:
          txDescription ||
          (txType === "deposit" ? "Admin Deposit" : "Admin Withdrawal"),
        created_at: serverTimestamp(),
      });

      const newBal =
        txType === "deposit" ? walletBalance + amt : walletBalance - amt;
      await updateDoc(doc(db, "wallets", selectedUser.id), {
        balance: Math.max(0, newBal),
        updated_at: serverTimestamp(),
      });

      toast.success(`Transaction added for ${selectedUser.full_name}`);
      setTxAmount("");
      setTxDescription("");
    } catch (error: any) {
      toast.error(getFirebaseErrorMessage(error));
    }
    setSaving(false);
  };

  const handleCreateUser = async () => {
    if (!createEmail || !createPassword || !createName) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (createPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setCreating(true);
    try {
      // Save current admin user before creating new account
      const currentUser = auth.currentUser;

      const cred = await createUserWithEmailAndPassword(
        auth,
        createEmail,
        createPassword,
      );
      await updateProfile(cred.user, { displayName: createName });

      // Create user document with specified role
      await setDoc(doc(db, "users", cred.user.uid), {
        full_name: createName,
        email: createEmail,
        role: createRole,
        kyc_status: "pending",
        created_at: serverTimestamp(),
      });

      // Create wallet
      await setDoc(doc(db, "wallets", cred.user.uid), {
        user_id: cred.user.uid,
        balance: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Sign out the newly created user and sign back in as admin
      // Note: Firebase automatically signs in the newly created user
      // We need to sign back in as admin
      await auth.signOut();

      // The admin will need to re-login, but we can use a workaround
      // by storing admin credentials temporarily - instead we just notify
      toast.success(
        `User "${createName}" created with role "${createRole}". You may need to re-login as admin.`,
      );
      setCreateDialogOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("user");
    } catch (error: any) {
      toast.error(getFirebaseErrorMessage(error));
    }
    setCreating(false);
  };

  const openUserDialog = (user: UserDoc) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setTxAmount("");
    setTxDescription("");
    setTxType("deposit");
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="font-display">Investor Management</CardTitle>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setCreateDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4" /> Create User
          </Button>
        </div>
        <div className="relative pt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground mt-1" />
          <Input
            placeholder="Search investors..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-muted-foreground font-medium">Name</th>
                <th className="pb-3 text-muted-foreground font-medium hidden sm:table-cell">
                  Email
                </th>
                <th className="pb-3 text-muted-foreground font-medium">Role</th>
                <th className="pb-3 text-muted-foreground font-medium hidden sm:table-cell">
                  KYC
                </th>
                <th className="pb-3 text-muted-foreground font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 font-medium">{u.full_name || "—"}</td>
                  <td className="py-3 text-muted-foreground hidden sm:table-cell">
                    {u.email}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={
                        u.role === "admin"
                          ? "default"
                          : u.role === "moderator"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <Badge
                      variant={
                        u.kyc_status === "verified" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {u.kyc_status || "pending"}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => openUserDialog(u)}
                    >
                      <UserCog className="h-4 w-4" /> Manage
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">
              Manage: {selectedUser?.full_name || selectedUser?.email}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="profile" className="flex-1 gap-1">
                  <UserCog className="h-3.5 w-3.5" /> Profile
                </TabsTrigger>
                <TabsTrigger value="wallet" className="flex-1 gap-1">
                  <Wallet className="h-3.5 w-3.5" /> Wallet
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex-1 gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5" /> Transactions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Full Name
                    </Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Phone
                    </Label>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Not set"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Role
                    </Label>
                    <Select value={editRole} onValueChange={setEditRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      KYC Status
                    </Label>
                    <Select value={editKyc} onValueChange={setEditKyc}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Accredited Investor
                    </Label>
                    <Select
                      value={editAccredited ? "yes" : "no"}
                      onValueChange={(v) => setEditAccredited(v === "yes")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" /> Save Profile Changes
                </Button>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-4">
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        Current Balance
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        ${walletBalance.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground">
                        Set Custom Balance
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={newBalance}
                          onChange={(e) => setNewBalance(e.target.value)}
                          placeholder="Enter new balance"
                        />
                        <Button onClick={handleUpdateBalance} disabled={saving}>
                          Update
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Plus className="h-4 w-4 text-primary" /> Quick
                      Transaction
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={txType === "deposit" ? "default" : "outline"}
                        onClick={() => setTxType("deposit")}
                      >
                        Deposit
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          txType === "withdrawal" ? "default" : "outline"
                        }
                        onClick={() => setTxType("withdrawal")}
                      >
                        Withdrawal
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Amount ($)</Label>
                        <Input
                          type="number"
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={txDescription}
                          onChange={(e) => setTxDescription(e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddTransaction}
                      disabled={saving}
                      className="w-full"
                    >
                      Add Transaction
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-3">
                <h3 className="font-semibold text-sm">Transaction History</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No transactions yet
                    </p>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {tx.amount > 0 ? (
                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                              <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                              <ArrowUpRight className="h-3.5 w-3.5 text-red-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {tx.description || tx.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.created_at?.toDate
                                ? tx.created_at.toDate().toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={
                            tx.amount > 0
                              ? "text-emerald-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {tx.amount > 0 ? "+" : ""}$
                          {Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Create New User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Full Name *
              </Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email *</Label>
              <Input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Password *
              </Label>
              <Input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select value={createRole} onValueChange={setCreateRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateUser}
              disabled={creating}
              className="w-full gap-2"
            >
              <UserPlus className="h-4 w-4" />{" "}
              {creating ? "Creating..." : "Create User"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Creating a user will briefly sign you out. You'll need to re-login
              as admin.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InvestorManager;
