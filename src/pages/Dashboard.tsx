import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDocs,
} from "firebase/firestore";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [propertyRois, setPropertyRois] = useState<Record<string, number>>({});

  // Fetch all property ROIs for calculating returns
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "properties"), (snap) => {
      const rois: Record<string, number> = {};
      snap.docs.forEach((d) => {
        rois[d.id] = d.data().roi || 0;
      });
      setPropertyRois(rois);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const walletUnsub = onSnapshot(doc(db, "wallets", user.uid), (snap) => {
      if (snap.exists()) setWalletBalance(snap.data().balance || 0);
    });

    const txQuery = query(
      collection(db, "transactions"),
      where("user_id", "==", user.uid),
    );
    const txUnsub = onSnapshot(txQuery, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const invQuery = query(
      collection(db, "investments"),
      where("user_id", "==", user.uid),
    );
    const invUnsub = onSnapshot(invQuery, (snap) => {
      setInvestments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      walletUnsub();
      txUnsub();
      invUnsub();
    };
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (profile?.role === "admin") return <Navigate to="/admin" />;

  const totalInvested = investments.reduce(
    (sum, inv) => sum + (inv.amount || 0),
    0,
  );

  // Calculate expected returns based on each investment's property ROI and time elapsed
  const calculateReturns = () => {
    let total = 0;
    investments.forEach((inv) => {
      const roi = propertyRois[inv.property_id] || inv.roi || 0;
      const investedAt = inv.invested_at?.toDate
        ? inv.invested_at.toDate()
        : new Date();
      const now = new Date();
      const daysElapsed = Math.max(
        0,
        (now.getTime() - investedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      // Annualized ROI prorated by days elapsed
      const annualReturn = (inv.amount || 0) * (roi / 100);
      const earnedReturn = annualReturn * (daysElapsed / 365);
      total += earnedReturn;
    });
    return total;
  };

  const totalReturns = calculateReturns();
  const portfolioValue = totalInvested + totalReturns;

  // Calculate per-investment returns for display
  const getInvestmentReturn = (inv: any) => {
    const roi = propertyRois[inv.property_id] || inv.roi || 0;
    const investedAt = inv.invested_at?.toDate
      ? inv.invested_at.toDate()
      : new Date();
    const now = new Date();
    const daysElapsed = Math.max(
      0,
      (now.getTime() - investedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const annualReturn = (inv.amount || 0) * (roi / 100);
    return annualReturn * (daysElapsed / 365);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">
                Investor Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {profile?.full_name || user.email}
              </p>
            </div>
            <Button variant="gold" size="sm" asChild>
              <Link to="/properties">
                <Building2 className="h-4 w-4 mr-1" /> Browse Properties
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Portfolio Value",
                value: `$${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                icon: PieChart,
                accent: true,
              },
              {
                label: "Expected Returns",
                value: `$${totalReturns.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                icon: TrendingUp,
                success: true,
              },
              {
                label: "Active Investments",
                value: investments
                  .filter((i) => i.status === "active")
                  .length.toString(),
                icon: Building2,
              },
              {
                label: "Wallet Balance",
                value: `$${walletBalance.toLocaleString()}`,
                icon: Wallet,
              },
            ].map((stat) => (
              <Card key={stat.label} className={stat.accent ? "glow-gold" : ""}>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.accent ? "gradient-gold" : stat.success ? "bg-success/20" : "bg-secondary"}`}
                  >
                    <stat.icon
                      className={`h-6 w-6 ${stat.accent ? "text-primary-foreground" : stat.success ? "text-success" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold font-display">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="wallet" className="space-y-6">
            <TabsList className="bg-secondary w-full sm:w-auto">
              <TabsTrigger value="wallet" className="gap-1.5">
                <Wallet className="h-4 w-4" /> Wallet
              </TabsTrigger>
              <TabsTrigger value="investments" className="gap-1.5">
                <PieChart className="h-4 w-4" /> Investments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glow-gold">
                  <CardContent className="pt-6 text-center">
                    <Wallet className="h-10 w-10 text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Available Balance
                    </p>
                    <p className="text-4xl font-display font-bold mt-1">
                      ${walletBalance.toLocaleString()}
                    </p>
                    <Button
                      variant="gold"
                      size="sm"
                      className="mt-4 w-full"
                      asChild
                    >
                      <Link to="/wallet">Manage Wallet</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" /> Recent Transactions
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/wallet">
                        View All <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No transactions yet
                        </p>
                      ) : (
                        transactions.slice(0, 5).map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-success/20" : "bg-destructive/20"}`}
                              >
                                {tx.amount > 0 ? (
                                  <ArrowDownLeft className="h-4 w-4 text-success" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4 text-destructive" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {tx.description || tx.type}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {tx.created_at
                                    ?.toDate?.()
                                    ?.toLocaleDateString() || ""}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`font-semibold text-sm ${tx.amount > 0 ? "text-success" : "text-destructive"}`}
                            >
                              {tx.amount > 0 ? "+" : ""}$
                              {Math.abs(tx.amount).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="investments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">
                    Your Investments
                  </CardTitle>
                  <CardDescription>
                    {investments.length} total investments · $
                    {totalInvested.toLocaleString()} invested · $
                    {totalReturns.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    returns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {investments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No investments yet. Browse properties to start investing.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {investments.map((inv) => {
                        const returnAmount = getInvestmentReturn(inv);
                        const roi = propertyRois[inv.property_id] || 0;
                        return (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {inv.property_title || "Property Investment"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {inv.invested_at
                                  ?.toDate?.()
                                  ?.toLocaleDateString() || ""}{" "}
                                · ROI: {roi}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                ${(inv.amount || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-success font-medium">
                                +$
                                {returnAmount.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}{" "}
                                earned
                              </p>
                              <Badge variant="secondary">
                                {inv.status || "active"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
