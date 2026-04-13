import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Users, Building2, DollarSign, TrendingUp } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const chartConfig = {
  amount: { label: "Amount", color: "hsl(220, 72%, 45%)" },
  count: { label: "Count", color: "hsl(220, 60%, 60%)" },
  deposits: { label: "Deposits", color: "hsl(152, 60%, 45%)" },
  withdrawals: { label: "Withdrawals", color: "hsl(0, 65%, 55%)" },
};

const COLORS = [
  "hsl(220, 72%, 45%)",
  "hsl(220, 60%, 60%)",
  "hsl(152, 60%, 45%)",
  "hsl(35, 80%, 55%)",
  "hsl(280, 60%, 55%)",
];

const AdminStats = () => {
  const { properties } = useProperties();
  const [userCount, setUserCount] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "users"), (snap) =>
      setUserCount(snap.size),
    );
    const unsub2 = onSnapshot(
      query(collection(db, "transactions"), orderBy("created_at", "desc")),
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    const unsub3 = onSnapshot(collection(db, "wallets"), (snap) => {
      setWallets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsub4 = onSnapshot(collection(db, "investments"), (snap) => {
      setInvestments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  const totalProperties = properties.length;
  const totalRaised = properties.reduce(
    (s, p) => s + (p.raised_amount || 0),
    0,
  );
  const avgRoi =
    totalProperties > 0
      ? properties.reduce((s, p) => s + (p.roi || 0), 0) / totalProperties
      : 0;
  const totalWalletBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0);
  const totalInvested = investments.reduce((s, i) => s + (i.amount || 0), 0);
  const activeInvestments = investments.filter(
    (i) => i.status === "active",
  ).length;

  const stats = [
    {
      label: "Total Users",
      value: userCount.toLocaleString(),
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Properties",
      value: totalProperties.toString(),
      icon: Building2,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Total Invested",
      value: `$${(totalInvested / 1e6).toFixed(1)}M`,
      icon: DollarSign,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Avg ROI",
      value: `${avgRoi.toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // Property type distribution for pie chart
  const typeCounts: Record<string, number> = {};
  properties.forEach((p) => {
    const t = p.property_type || "other";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
  }));

  // Monthly transaction data
  const monthlyData: Record<string, { deposits: number; withdrawals: number }> =
    {};
  transactions.forEach((tx) => {
    const date = tx.created_at?.toDate ? tx.created_at.toDate() : new Date();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyData[key]) monthlyData[key] = { deposits: 0, withdrawals: 0 };
    if (tx.amount > 0) monthlyData[key].deposits += tx.amount;
    else monthlyData[key].withdrawals += Math.abs(tx.amount);
  });
  const barData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleString("default", {
        month: "short",
      }),
      deposits: data.deposits,
      withdrawals: data.withdrawals,
    }));

  // Wallet balance distribution for line chart
  const balanceRanges = [
    { range: "$0", count: 0 },
    { range: "$1-1K", count: 0 },
    { range: "$1K-10K", count: 0 },
    { range: "$10K-50K", count: 0 },
    { range: "$50K+", count: 0 },
  ];
  wallets.forEach((w) => {
    const b = w.balance || 0;
    if (b === 0) balanceRanges[0].count++;
    else if (b <= 1000) balanceRanges[1].count++;
    else if (b <= 10000) balanceRanges[2].count++;
    else if (b <= 50000) balanceRanges[3].count++;
    else balanceRanges[4].count++;
  });

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Bar Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Monthly Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={barData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 14%, 90%)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(220, 10%, 55%)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(220, 10%, 55%)"
                    fontSize={12}
                    tickFormatter={(v) =>
                      `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="deposits"
                    fill="hsl(152, 60%, 45%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="withdrawals"
                    fill="hsl(0, 65%, 55%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                No transaction data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Type Pie Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Property Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ChartContainer
                  config={chartConfig}
                  className="h-[220px] w-[220px] !aspect-square"
                >
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-2">
                  {pieData.map((item, i) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-muted-foreground capitalize">
                        {item.name}
                      </span>
                      <span className="font-medium ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No properties yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Wallet Balance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={balanceRanges}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 14%, 90%)"
                />
                <XAxis
                  dataKey="range"
                  stroke="hsl(220, 10%, 55%)"
                  fontSize={11}
                />
                <YAxis
                  stroke="hsl(220, 10%, 55%)"
                  fontSize={12}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="hsl(220, 72%, 45%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Platform Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "Total Wallet Balances",
                value: `$${totalWalletBalance.toLocaleString()}`,
              },
              {
                label: "Total Invested",
                value: `$${totalInvested.toLocaleString()}`,
              },
              {
                label: "Active Investments",
                value: activeInvestments.toString(),
              },
              {
                label: "Total Transactions",
                value: transactions.length.toString(),
              },
              {
                label: "Total Deposits",
                value: `$${transactions
                  .filter((t) => t.amount > 0)
                  .reduce((s, t) => s + t.amount, 0)
                  .toLocaleString()}`,
              },
              {
                label: "Total Raised",
                value: `$${totalRaised.toLocaleString()}`,
              },
              {
                label: "Active Properties",
                value: properties
                  .filter((p) => p.status === "funding")
                  .length.toString(),
              },
              {
                label: "Funded Properties",
                value: properties
                  .filter((p) => p.status === "funded")
                  .length.toString(),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
