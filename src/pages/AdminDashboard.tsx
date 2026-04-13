import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, ShieldAlert } from "lucide-react";
import PropertyManager from "@/components/admin/PropertyManager";
import InvestorManager from "@/components/admin/InvestorManager";
import AdminStats from "@/components/admin/AdminStats";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  // Non-admin users get redirected to investor dashboard
  if (!isAdmin) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            <Badge className="gradient-gold text-primary-foreground">Admin</Badge>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
              <TabsTrigger value="properties" className="gap-2"><Building2 className="h-4 w-4" /> Properties</TabsTrigger>
              <TabsTrigger value="investors" className="gap-2"><Users className="h-4 w-4" /> Investors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><AdminStats /></TabsContent>
            <TabsContent value="properties"><PropertyManager /></TabsContent>
            <TabsContent value="investors"><InvestorManager /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
