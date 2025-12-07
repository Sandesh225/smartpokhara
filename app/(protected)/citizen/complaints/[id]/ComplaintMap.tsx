"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default Leaflet marker icons in Next.js
const icon = L.icon({
  iconUrl: "/images/marker-icon.png", // Ensure you have these images in public/images or use CDN
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Fallback if local images missing, use CDN
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface ComplaintMapProps {
  center: [number, number];
  zoom: number;
  markerPosition: [number, number];
}

export default function ComplaintMap({ center, zoom, markerPosition }: ComplaintMapProps) {
  // Fix Leaflet icon issue
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: defaultIcon.options.iconUrl,
      shadowUrl: defaultIcon.options.shadowUrl,
    });
  }, []);

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={false} 
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={markerPosition} icon={defaultIcon}>
        <Popup>Complaint Location</Popup>
      </Marker>
    </MapContainer>
  );
}