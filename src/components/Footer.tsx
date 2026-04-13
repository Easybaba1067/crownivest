import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold">Crowninvext</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Democratizing real estate investment through crowdfunding.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Platform</h4>
          <div className="space-y-2">
            <Link to="/properties" className="block text-sm text-muted-foreground hover:text-foreground">Browse Properties</Link>
            <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <div className="space-y-2">
            <span className="block text-sm text-muted-foreground">About</span>
            <span className="block text-sm text-muted-foreground">Contact</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <div className="space-y-2">
            <span className="block text-sm text-muted-foreground">Privacy Policy</span>
            <span className="block text-sm text-muted-foreground">Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 Crowninvext. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
