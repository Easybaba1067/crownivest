import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PropertyData } from "@/components/PropertyCard";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Approximate coordinates for mock data locations
const locationCoords: Record<string, [number, number]> = {
  "Miami, FL": [25.7617, -80.1918],
  "New York, NY": [40.7128, -74.006],
  "San Diego, CA": [32.7157, -117.1611],
  "Austin, TX": [30.2672, -97.7431],
  "San Francisco, CA": [37.7749, -122.4194],
  "Seattle, WA": [47.6062, -122.3321],
};

interface PropertyMapProps {
  properties: PropertyData[];
  onPropertyClick?: (id: string) => void;
  className?: string;
}

const PropertyMap = ({ properties, onPropertyClick, className = "" }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
    }).setView([37.5, -96], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const bounds: L.LatLngExpression[] = [];

    properties.forEach((p) => {
      const coords = locationCoords[p.location];
      if (!coords) return;

      bounds.push(coords);
      const progress = ((p.raised_amount / p.target_amount) * 100).toFixed(0);

      const marker = L.marker(coords).addTo(map);
      marker.bindPopup(`
        <div style="min-width:200px;font-family:Inter,sans-serif;">
          <img src="${p.image_url}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />
          <strong style="font-size:14px;">${p.title}</strong>
          <p style="color:#888;font-size:12px;margin:4px 0;">${p.location}</p>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px;">
            <span style="color:#d4a017;font-weight:600;">${p.roi}% ROI</span>
            <span>${progress}% funded</span>
          </div>
          <p style="font-size:12px;margin-top:4px;">$${p.target_amount.toLocaleString()} target</p>
        </div>
      `);

      marker.on("click", () => {
        if (onPropertyClick) onPropertyClick(p.id);
      });
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40] });
    }
  }, [properties, onPropertyClick]);

  return (
    <div
      ref={mapRef}
      className={`rounded-lg overflow-hidden border border-border ${className}`}
      style={{ height: "400px", width: "100%" }}
    />
  );
};

export default PropertyMap;
