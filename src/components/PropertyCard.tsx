import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

export interface PropertyData {
  id: string;
  title: string;
  location: string;
  image_url: string;
  images?: string[];
  target_amount: number;
  raised_amount: number;
  roi: number;
  investors_count: number;
  status: "funding" | "funded" | "completed";
  property_type: string;
  min_investment: number;
  description?: string;
  documents?: { name: string; url: string }[];
}

const PropertyCard = ({ property }: { property: PropertyData }) => {
  const progress = (property.raised_amount / property.target_amount) * 100;

  return (
    <Card className="overflow-hidden border-border bg-card hover:border-primary/30 transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image_url}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <Badge
          className={`absolute top-3 right-3 ${
            property.status === "funding"
              ? "gradient-gold text-primary-foreground"
              : property.status === "funded"
              ? "bg-success text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {property.status === "funding" ? "Open" : property.status === "funded" ? "Funded" : "Completed"}
        </Badge>
        <Badge variant="secondary" className="absolute top-3 left-3">
          {property.property_type}
        </Badge>
      </div>
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{property.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" /> {property.location}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Raised</span>
            <span className="font-medium">${property.raised_amount.toLocaleString()} / ${property.target_amount.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1 text-primary">
            <TrendingUp className="h-3 w-3" />
            <span className="font-semibold">{property.roi}% ROI</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{property.investors_count} investors</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Min. ${property.min_investment.toLocaleString()}
          </span>
          <Button variant="gold" size="sm" asChild>
            <Link to={`/property/${property.id}`}>Invest Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
