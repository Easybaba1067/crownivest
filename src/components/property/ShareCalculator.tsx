import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DollarSign, PieChart, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  runTransaction,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

interface ShareCalculatorProps {
  propertyId: string;
  title: string;
  targetAmount: number;
  raisedAmount: number;
  minInvestment: number;
  status: string;
  investorsCount: number;
}

const ShareCalculator = ({
  propertyId,
  title,
  targetAmount,
  raisedAmount,
  minInvestment,
  status,
  investorsCount,
}: ShareCalculatorProps) => {
  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const progress = (raisedAmount / targetAmount) * 100;
  const remaining = targetAmount - raisedAmount;
  const sharePrice = minInvestment;
  const totalShares = Math.floor(targetAmount / sharePrice);
  const soldShares = Math.floor(raisedAmount / sharePrice);
  const availableShares = totalShares - soldShares;
  const numAmount = parseFloat(amount) || 0;
  const sharesForAmount = Math.floor(numAmount / sharePrice);
  const ownershipPercent = ((numAmount / targetAmount) * 100).toFixed(2);

  // Fetch wallet balance
  useEffect(() => {
    if (!user) return;
    const fetchBalance = async () => {
      const walletSnap = await getDoc(doc(db, "wallets", user.uid));
      if (walletSnap.exists()) {
        setWalletBalance(walletSnap.data().balance || 0);
      } else {
        setWalletBalance(0);
      }
    };
    fetchBalance();
  }, [user]);

  const handleInvestClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (numAmount < minInvestment) {
      toast.error(`Minimum investment is $${minInvestment.toLocaleString()}`);
      return;
    }
    if (numAmount > remaining) {
      toast.error(
        `Maximum available investment is $${remaining.toLocaleString()}`,
      );
      return;
    }
    if (walletBalance !== null && numAmount > walletBalance) {
      toast.error(
        `Insufficient wallet balance. You have $${walletBalance.toLocaleString()}`,
      );
      return;
    }
    setShowConfirm(true);
  };

  const confirmInvestment = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      const walletRef = doc(db, "wallets", user.uid);
      const propertyRef = doc(db, "properties", propertyId);

      await runTransaction(db, async (transaction) => {
        const walletSnap = await transaction.get(walletRef);
        const propertySnap = await transaction.get(propertyRef);

        if (!walletSnap.exists()) throw new Error("Wallet not found");
        if (!propertySnap.exists()) throw new Error("Property not found");

        const currentBalance = walletSnap.data().balance || 0;
        if (currentBalance < numAmount) throw new Error("Insufficient balance");

        const currentRaised = propertySnap.data().raised_amount || 0;
        const currentInvestors = propertySnap.data().investors_count || 0;

        // Deduct from wallet
        transaction.update(walletRef, { balance: currentBalance - numAmount });

        // Update property raised amount and investor count
        transaction.update(propertyRef, {
          raised_amount: currentRaised + numAmount,
          investors_count: currentInvestors + 1,
        });
      });

      // Create investment record
      await addDoc(collection(db, "investments"), {
        user_id: user.uid,
        property_id: propertyId,
        property_title: title,
        amount: numAmount,
        shares: sharesForAmount,
        ownership_percent: parseFloat(ownershipPercent),
        status: "active",
        invested_at: serverTimestamp(),
      });

      // Create transaction record
      await addDoc(collection(db, "transactions"), {
        user_id: user.uid,
        type: "investment",
        amount: -numAmount,
        description: `Investment in ${title} (${sharesForAmount} shares)`,
        created_at: serverTimestamp(),
      });

      setWalletBalance((prev) => (prev !== null ? prev - numAmount : prev));
      toast.success(
        `Successfully invested $${numAmount.toLocaleString()} in ${sharesForAmount} shares of ${title}`,
      );
      setAmount("");
      setShowConfirm(false);
    } catch (error: any) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Card className="glow-gold sticky top-24">
        <CardHeader>
          <CardTitle className="font-display">Invest Now</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Funding Progress</span>
              <span className="font-semibold text-primary">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${raisedAmount.toLocaleString()} raised</span>
              <span>${targetAmount.toLocaleString()} goal</span>
            </div>
          </div>

          {/* Share Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Share Price</p>
              <p className="font-display font-bold text-sm">
                ${sharePrice.toLocaleString()}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Available</p>
              <p className="font-display font-bold text-sm">
                {availableShares.toLocaleString()} shares
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Shares</p>
              <p className="font-display font-bold text-sm">
                {totalShares.toLocaleString()}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Investors</p>
              <p className="font-display font-bold text-sm">{investorsCount}</p>
            </div>
          </div>

          {/* Wallet Balance */}
          {user && walletBalance !== null && (
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Your Wallet Balance
              </p>
              <p className="font-display font-bold text-sm text-primary">
                ${walletBalance.toLocaleString()}
              </p>
            </div>
          )}

          {/* Investment Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Investment Amount ($)</label>
            <Input
              type="number"
              placeholder={`Min. $${minInvestment}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {numAmount >= minInvestment && (
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <PieChart className="h-3 w-3" /> Shares
                  </span>
                  <span className="font-medium">{sharesForAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ownership</span>
                  <span className="font-medium text-primary">
                    {ownershipPercent}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="gold"
            className="w-full"
            onClick={handleInvestClick}
            disabled={status !== "funding"}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            {status === "funding" ? "Buy Shares" : "Fully Funded"}
          </Button>

          <Button variant="outline" className="w-full">
            Withdraw
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Expected returns in 12-18 months
            </p>
            <p>Min. investment: ${minInvestment.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Investment</DialogTitle>
            <DialogDescription>
              Please review your investment details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Property</span>
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">${numAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shares</span>
              <span className="font-medium">{sharesForAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ownership</span>
              <span className="font-medium text-primary">
                {ownershipPercent}%
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">
                Wallet Balance After
              </span>
              <span className="font-bold">
                ${((walletBalance || 0) - numAmount).toLocaleString()}
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={confirmInvestment}
              disabled={processing}
            >
              {processing ? "Processing..." : "Confirm Investment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareCalculator;
