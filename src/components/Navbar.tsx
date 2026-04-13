import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Menu, X } from "lucide-react";
import crownLogo from "@/assets/crown-logo.png";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import NotificationBell from "@/components/notifications/NotificationBell";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={crownLogo} alt="Crowninvext" className="h-8 w-8" />
          <span className="font-display text-xl font-bold text-foreground">Crowninvext</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/properties" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Properties
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/wallet" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Wallet
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Admin
                </Link>
              )}
              <NotificationBell />
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                <LogIn className="h-4 w-4 mr-1" /> Log In
              </Button>
              <Button variant="gold" size="sm" onClick={() => navigate("/signup")}>
                <UserPlus className="h-4 w-4 mr-1" /> Sign Up
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-border px-4 py-4 space-y-3">
          <Link to="/properties" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Properties</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/wallet" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Wallet</Link>
              {isAdmin && (
                <Link to="/admin" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Admin</Link>
              )}
              <div className="flex items-center gap-2">
                <NotificationBell />
                <span className="text-sm text-muted-foreground">Notifications</span>
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { signOut(); setMobileOpen(false); }}>Sign Out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Log In</Button>
              <Button variant="gold" size="sm" className="w-full" onClick={() => { navigate("/signup"); setMobileOpen(false); }}>Sign Up</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
