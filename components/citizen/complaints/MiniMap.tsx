// components/citizen/complaints/MiniMap.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

interface MiniMapProps {
  coordinates: { lat: number; lng: number };
  height?: string;
  interactive?: boolean;
  showMarker?: boolean;
  zoom?: number;
}

export default function MiniMap({
  coordinates,
  height = '200px',
  interactive = false,
  showMarker = true,
  zoom = 15,
}: MiniMapProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height }}>
        <div className="w-full h-full bg-slate-100 animate-pulse"></div>
      </div>
    );
  }

  const customIcon = new L.Icon({
    iconUrl: '/leaflet/images/marker-icon.png',
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height }}>
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showMarker && (
          <Marker position={[coordinates.lat, coordinates.lng]} icon={customIcon} />
        )}
      </MapContainer>
    </div>
  );
}