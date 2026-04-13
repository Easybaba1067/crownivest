import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { MapPin, TrendingUp, Users, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import ShareCalculator from "@/components/property/ShareCalculator";
import ROICalculator from "@/components/property/ROICalculator";
import type { PropertyData } from "@/components/PropertyCard";

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, "properties", id), (snap) => {
      if (snap.exists()) {
        setProperty({ id: snap.id, ...snap.data() } as PropertyData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Property not found.</p>
      </div>
    );
  }

  const images = property.images || [property.image_url];
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden h-64 md:h-96">
                  <img src={images[currentImage]} alt={property.title} className="w-full h-full object-cover transition-opacity duration-300" />
                  <Badge className="absolute top-4 left-4 gradient-gold text-primary-foreground">{property.property_type}</Badge>
                  {images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? "bg-primary" : "bg-foreground/40"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h1 className="font-display text-3xl font-bold">{property.title}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-2">
                  <MapPin className="h-4 w-4" /> {property.location}
                </p>
              </div>

              <Card>
                <CardHeader><CardTitle className="font-display">Investment Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="font-semibold">${property.target_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Raised</p>
                    <p className="font-semibold">${property.raised_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Est. ROI</p>
                    <p className="font-semibold text-primary">{property.roi}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Investors</p>
                    <p className="font-semibold">{property.investors_count}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="font-display">About This Property</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {property.description || `This ${property.property_type.toLowerCase()} property in ${property.location} represents an excellent crowdfunding opportunity.`}
                  </p>
                </CardContent>
              </Card>

              <ROICalculator defaultRoi={property.roi} minInvestment={property.min_investment} />

              <Card>
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden h-64 bg-muted">
                    <iframe
                      title="Property Location"
                      width="100%" height="100%"
                      style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <ShareCalculator
                propertyId={property.id}
                title={property.title}
                targetAmount={property.target_amount}
                raisedAmount={property.raised_amount}
                minInvestment={property.min_investment}
                status={property.status}
                investorsCount={property.investors_count}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
