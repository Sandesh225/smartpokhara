"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for missing default Leaflet marker icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Accurate Center Points for Pokhara Metropolitan City Wards (1-33)
const POKHARA_WARD_CENTERS: Record<number, [number, number]> = {
  1: [28.2396, 83.9926], // Bagar
  2: [28.2435, 83.984], // Miruwa
  3: [28.228, 83.986], // Nadipur
  4: [28.222, 83.991], // Gairapatan
  5: [28.2225, 83.974], // Malepatan
  6: [28.209, 83.957], // Lake Side (Central)
  7: [28.2085, 83.9775], // Ratnapark
  8: [28.214, 83.988], // Simalchaur
  9: [28.21, 83.996], // Mahendrapul
  10: [28.204, 84.004], // Ramghat
  11: [28.203, 84.018], // Phoolbari
  12: [28.205, 84.025], // Matepani
  13: [28.2, 84.03], // Miyapatan
  14: [28.2, 84.045], // Chauthe
  15: [28.188, 84.015], // Nayagaun
  16: [28.254, 83.985], // Batulechaur
  17: [28.188, 83.99], // Birauta
  18: [28.24, 83.95], // Sarangkot
  19: [28.26, 83.97], // Lamachaur
  20: [28.255, 84.01], // Bhalam
  21: [28.17, 84.0], // Kristine
  22: [28.18, 83.93], // Pumdi Bhumdi
  23: [28.19, 83.92], // Harpankot
  24: [28.21, 83.91], // Kaskikot
  25: [28.24, 83.92], // Hemja
  26: [28.17, 84.06], // Budhibazar
  27: [28.16, 84.08], // Talchowk
  28: [28.15, 84.05], // Majhthana
  29: [28.19, 84.08], // Bhandardhik
  30: [28.18, 84.1], // Khudi
  31: [28.2, 84.12], // Begnas
  32: [28.22, 84.1], // Raja ko Chautara
  33: [28.14, 84.02], // Bharat Pokhari
};

// Internal Controller to handle map animation
function MapController({
  onLocationSelect,
  selectedWard,
}: {
  onLocationSelect: (loc: { lat: number; lng: number }) => void;
  selectedWard?: number;
}) {
  const map = useMap();

  // Watch for Ward Selection Changes
  useEffect(() => {
    if (selectedWard && POKHARA_WARD_CENTERS[selectedWard]) {
      const [lat, lng] = POKHARA_WARD_CENTERS[selectedWard];
      // Fly to the specific Ward coordinates with high zoom for precision
      map.flyTo([lat, lng], 16, {
        duration: 2.0, // Smooth 2-second flight
        easeLinearity: 0.25,
      });
    }
  }, [selectedWard, map]);

  // Handle User Clicks to set Pin
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
      // Center map on the clicked point
      map.flyTo(e.latlng, map.getZoom(), { duration: 0.5 });
    },
  });

  return null;
}

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  selectedWard?: number;
}

export default function MapPicker({
  onLocationSelect,
  selectedWard,
}: MapPickerProps) {
  const [markerPos, setMarkerPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleSelect = (loc: { lat: number; lng: number }) => {
    setMarkerPos(loc);
    onLocationSelect(loc);
  };

  // Initial Center: Pokhara Core Area
  const defaultCenter: [number, number] = [28.2096, 83.9856];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true} // Allow zooming for precision
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        onLocationSelect={handleSelect}
        selectedWard={selectedWard}
      />

      {markerPos && <Marker position={markerPos} icon={icon} />}
    </MapContainer>
  );
}
