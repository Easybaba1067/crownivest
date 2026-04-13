import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const WalletPage = () => {
  const { user, loading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const walletUnsub = onSnapshot(doc(db, "wallets", user.uid), (snap) => {
      if (snap.exists()) setBalance(snap.data().balance || 0);
    });

    const txQuery = query(
      collection(db, "transactions"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc"),
    );
    const txUnsub = onSnapshot(txQuery, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      walletUnsub();
      txUnsub();
    };
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-8">Wallet</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glow-gold">
              <CardContent className="pt-6 text-center">
                <WalletIcon className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Available Balance
                </p>
                <p className="text-4xl font-display font-bold mt-1">
                  ${balance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Managed by admin
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Clock className="h-5 w-5" /> Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No transactions yet
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
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
                            {tx.created_at?.toDate?.()?.toLocaleDateString() ||
                              ""}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold ${tx.amount > 0 ? "text-success" : "text-destructive"}`}
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
      </div>
    </div>
  );
};

export default WalletPage;
