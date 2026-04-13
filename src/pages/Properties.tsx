import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyMap from "@/components/map/PropertyMap";
import { useProperties } from "@/hooks/useProperties";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, Map, LayoutGrid } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const Properties = () => {
  const { properties, loading } = useProperties();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [minRoi, setMinRoi] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || p.property_type === typeFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchPrice =
        p.target_amount >= priceRange[0] && p.target_amount <= priceRange[1];
      const matchRoi = p.roi >= minRoi;
      return matchSearch && matchType && matchStatus && matchPrice && matchRoi;
    });
  }, [properties, search, typeFilter, statusFilter, priceRange, minRoi]);

  const handleMapPropertyClick = useCallback(
    (id: string) => {
      navigate(`/property/${id}`);
    },
    [navigate],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-4xl font-bold">
              Investment Properties
            </h1>
            <div className="flex gap-1 bg-secondary rounded-lg p-1">
              <Button
                variant={!showMap ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowMap(false)}
                className="gap-1"
              >
                <LayoutGrid className="h-4 w-4" /> Grid
              </Button>
              <Button
                variant={showMap ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowMap(true)}
                className="gap-1"
              >
                <Map className="h-4 w-4" /> Map
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mb-8">
            Discover high-yield real estate opportunities
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="funding">Open</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col md:flex-row gap-6 bg-card border border-border rounded-lg p-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Range</span>
                  <span className="font-medium">
                    ${(priceRange[0] / 1000000).toFixed(1)}M – $
                    {(priceRange[1] / 1000000).toFixed(1)}M
                  </span>
                </div>
                <Slider
                  min={0}
                  max={10000000}
                  step={500000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="w-full"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum ROI</span>
                  <span className="font-medium">{minRoi}%+</span>
                </div>
                <Slider
                  min={0}
                  max={20}
                  step={0.5}
                  value={[minRoi]}
                  onValueChange={([v]) => setMinRoi(v)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-20">
              Loading properties...
            </p>
          ) : showMap ? (
            <div className="space-y-6">
              <PropertyMap
                properties={filtered}
                onPropertyClick={handleMapPropertyClick}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-20">
              No properties found matching your criteria.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Properties;
