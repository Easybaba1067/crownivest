import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Investment {
  id: string;
  investor: string;
  property: string;
  amount: number;
  date: string;
  returnAmount: number;
  paidOut: number;
  status: "active" | "matured" | "pending_payout";
  nextPayout: string;
}

const mockInvestments: Investment[] = [
  { id: "1", investor: "Jane Smith", property: "Sunset Heights Luxury Apartments", amount: 50000, date: "2025-07-15", returnAmount: 6250, paidOut: 3125, status: "active", nextPayout: "2026-04-15" },
  { id: "2", investor: "John Doe", property: "Downtown Commerce Tower", amount: 25000, date: "2025-09-01", returnAmount: 2450, paidOut: 2450, status: "matured", nextPayout: "-" },
  { id: "3", investor: "Alice Williams", property: "Oceanview Retail Plaza", amount: 30000, date: "2025-11-20", returnAmount: 4260, paidOut: 0, status: "active", nextPayout: "2026-05-20" },
  { id: "4", investor: "Bob Johnson", property: "Green Valley Townhomes", amount: 5000, date: "2026-01-10", returnAmount: 550, paidOut: 550, status: "pending_payout", nextPayout: "2026-03-10" },
  { id: "5", investor: "Jane Smith", property: "Harborfront Mixed-Use Complex", amount: 75000, date: "2025-12-01", returnAmount: 10275, paidOut: 2568, status: "active", nextPayout: "2026-06-01" },
];

const InvestmentTracker = () => {
  const totalInvested = mockInvestments.reduce((s, i) => s + i.amount, 0);
  const totalReturns = mockInvestments.reduce((s, i) => s + i.returnAmount, 0);
  const totalPaid = mockInvestments.reduce((s, i) => s + i.paidOut, 0);
  const pendingPayouts = mockInvestments.filter((i) => i.status === "pending_payout").length;

  const statusIcon = (s: string) =>
    s === "active" ? <Clock className="h-4 w-4 text-primary" /> :
    s === "matured" ? <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" /> :
    <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Invested", value: `$${totalInvested.toLocaleString()}`, icon: DollarSign },
          { label: "Expected Returns", value: `$${totalReturns.toLocaleString()}`, icon: DollarSign },
          { label: "Paid Out", value: `$${totalPaid.toLocaleString()}`, icon: CheckCircle },
          { label: "Pending Payouts", value: pendingPayouts.toString(), icon: AlertTriangle },
        ].map((s) => (
          <Card key={s.label} className="glass border-border/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Investment Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-display">All Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-muted-foreground font-medium">Investor</th>
                  <th className="pb-3 text-muted-foreground font-medium hidden sm:table-cell">Property</th>
                  <th className="pb-3 text-muted-foreground font-medium">Amount</th>
                  <th className="pb-3 text-muted-foreground font-medium hidden md:table-cell">Payout Progress</th>
                  <th className="pb-3 text-muted-foreground font-medium">Status</th>
                  <th className="pb-3 text-muted-foreground font-medium text-right hidden md:table-cell">Next Payout</th>
                  <th className="pb-3 text-muted-foreground font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockInvestments.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 font-medium">{inv.investor}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell max-w-[200px] truncate">{inv.property}</td>
                    <td className="py-3">${inv.amount.toLocaleString()}</td>
                    <td className="py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={(inv.paidOut / inv.returnAmount) * 100} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          ${inv.paidOut.toLocaleString()} / ${inv.returnAmount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(inv.status)}
                        <Badge variant={inv.status === "active" ? "default" : inv.status === "matured" ? "secondary" : "outline"}>
                          {inv.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 text-right text-muted-foreground hidden md:table-cell">{inv.nextPayout}</td>
                    <td className="py-3 text-right">
                      {inv.status === "pending_payout" ? (
                        <Button size="sm" className="gradient-gold text-primary-foreground" onClick={() => toast({ title: "Payout processed", description: `$${inv.paidOut} sent to ${inv.investor}` })}>
                          Process
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => toast({ title: "Details", description: `Investment #${inv.id}` })}>View</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentTracker;
