import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const revenueData = [
  { month: "Sep", revenue: 120000, investments: 85000 },
  { month: "Oct", revenue: 180000, investments: 142000 },
  { month: "Nov", revenue: 150000, investments: 98000 },
  { month: "Dec", revenue: 220000, investments: 175000 },
  { month: "Jan", revenue: 280000, investments: 210000 },
  { month: "Feb", revenue: 310000, investments: 260000 },
  { month: "Mar", revenue: 350000, investments: 290000 },
];

const trafficData = [
  { day: "Mon", visitors: 1200, signups: 45 },
  { day: "Tue", visitors: 1800, signups: 62 },
  { day: "Wed", visitors: 1500, signups: 55 },
  { day: "Thu", visitors: 2100, signups: 78 },
  { day: "Fri", visitors: 2400, signups: 92 },
  { day: "Sat", visitors: 1900, signups: 68 },
  { day: "Sun", visitors: 1100, signups: 38 },
];

const propertyTypeData = [
  { name: "Residential", value: 42, color: "hsl(43, 74%, 49%)" },
  { name: "Commercial", value: 28, color: "hsl(43, 80%, 62%)" },
  { name: "Retail", value: 15, color: "hsl(43, 70%, 38%)" },
  { name: "Mixed-Use", value: 15, color: "hsl(220, 14%, 40%)" },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(43, 74%, 49%)" },
  investments: { label: "Investments", color: "hsl(43, 80%, 62%)" },
  visitors: { label: "Visitors", color: "hsl(43, 74%, 49%)" },
  signups: { label: "Sign-ups", color: "hsl(142, 71%, 45%)" },
};

const AnalyticsDashboard = () => {
  return (
    <div className="grid gap-6">
      {/* Revenue & Investments Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Revenue & Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(43, 74%, 49%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="investments" fill="hsl(43, 80%, 62%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Traffic & Sign-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="day" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="visitors" stroke="hsl(43, 74%, 49%)" strokeWidth={2} dot={{ fill: "hsl(43, 74%, 49%)" }} />
                <Line type="monotone" dataKey="signups" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)" }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Investment by Type & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Investment by Property Type</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
              <ChartContainer config={chartConfig} className="h-[220px] w-[220px] !aspect-square">
                <PieChart>
                  <Pie data={propertyTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                    {propertyTypeData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="flex flex-col gap-3">
                {propertyTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Top Performing Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Oceanview Retail Plaza", roi: 14.2, raised: "$720K", trend: "up" },
                { name: "Harborfront Mixed-Use", roi: 13.7, raised: "$1.35M", trend: "up" },
                { name: "Sunset Heights Apartments", roi: 12.5, raised: "$1.88M", trend: "stable" },
                { name: "Green Valley Townhomes", roi: 11.0, raised: "$2.88M", trend: "up" },
              ].map((prop, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{prop.name}</p>
                    <p className="text-xs text-muted-foreground">Raised: {prop.raised}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{prop.roi}%</p>
                    <p className="text-xs text-[hsl(var(--success))]">ROI</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
