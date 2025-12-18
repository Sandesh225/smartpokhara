"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Navigation, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface MapPickerProps {
  initialLocation?: { lat: number; lng: number }
  onLocationSelect: (location: { lat: number; lng: number }) => void
  height?: string
  showCurrentLocation?: boolean
  className?: string
}

export default function MapPicker({
  initialLocation,
  onLocationSelect,
  height = "320px",
  showCurrentLocation = true,
  className,
}: MapPickerProps) {
  const defaultLocation = { lat: 27.7172, lng: 85.324 } // Kathmandu
  
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    initialLocation || defaultLocation
  )
  const [isLocating, setIsLocating] = useState(false)
  const [zoom, setZoom] = useState(15)

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        const newPosition = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude,
        }
        setPosition(newPosition)
        onLocationSelect(newPosition)
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }, [onLocationSelect])

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.01
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.01

    const newPos = {
      lat: position.lat + y,
      lng: position.lng + x,
    }
    setPosition(newPos)
    onLocationSelect(newPos)
  }, [position, onLocationSelect])

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="relative rounded-xl overflow-hidden border border-border bg-muted cursor-crosshair group"
        style={{ height }}
        onClick={handleMapClick}
        role="application"
        aria-label="Interactive map for selecting location"
      >
        {/* Map placeholder with grid pattern */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/10">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          {/* Simulated map elements */}
          <div className="absolute top-1/4 left-1/3 w-32 h-2 bg-muted-foreground/20 rounded-full transform -rotate-12" />
          <div className="absolute top-1/2 left-1/4 w-48 h-2 bg-muted-foreground/20 rounded-full transform rotate-6" />
          <div className="absolute bottom-1/3 right-1/4 w-40 h-2 bg-muted-foreground/20 rounded-full transform -rotate-3" />
        </div>

        {/* Location marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200"
          style={{
            left: "50%",
            top: "50%",
          }}
        >
          <div className="relative">
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/30 rounded-full animate-ping" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/50 rounded-full" />
            <MapPin
              className="h-8 w-8 text-primary drop-shadow-lg"
              fill="currentColor"
            />
          </div>
        </div>

        {/* Coordinates display */}
        <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-border">
          <div className="text-xs font-medium text-foreground">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Lat:</span>
                <span className="font-mono">{position.lat.toFixed(6)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Lng:</span>
                <span className="font-mono">{position.lng.toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(z + 1, 20));
            }}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.max(z - 1, 10));
            }}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Click hint overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-foreground/80 text-background text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            Click to place marker
          </div>
        </div>
      </div>

      {showCurrentLocation && (
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="w-full bg-transparent"
        >
          {isLocating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Detecting location...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Use my current location
            </>
          )}
        </Button>
      )}
    </div>
  );
}