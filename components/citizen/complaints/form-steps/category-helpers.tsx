import React from "react";
import {
  Construction,
  Trash2,
  Lightbulb,
  Droplets,
  Trees,
  Building2,
  Car,
  HeartPulse,
  Zap,
  BusFront,
  Volume2,
  Wind,
  HelpCircle,
  Waves,
  FileText,
} from "lucide-react";

/**
 * Formats a slug-like category name into a readable string.
 * e.g., "pothole-repair" -> "Pothole Repair"
 */
export const formatCategoryName = (name: string) => {
  if (!name) return "";
  if (name.includes("-")) {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Returns a specific Lucide icon based on keywords in the category name.
 */
export const getCategoryIcon = (name: string) => {
  const lowerName = name?.toLowerCase() || "";

  if (lowerName.includes("road") || lowerName.includes("pothole"))
    return <Construction className="h-6 w-6" />;
  if (lowerName.includes("drain") || lowerName.includes("sewer"))
    return <Waves className="h-6 w-6" />;
  if (lowerName.includes("waste") || lowerName.includes("garbage") || lowerName.includes("trash"))
    return <Trash2 className="h-6 w-6" />;
  if (lowerName.includes("light") || lowerName.includes("lamp"))
    return <Lightbulb className="h-6 w-6" />;
  if (lowerName.includes("water") || lowerName.includes("leak"))
    return <Droplets className="h-6 w-6" />;
  if (lowerName.includes("park") || lowerName.includes("tree"))
    return <Trees className="h-6 w-6" />;
  if (lowerName.includes("building") || lowerName.includes("construction"))
    return <Building2 className="h-6 w-6" />;
  if (lowerName.includes("traffic") || lowerName.includes("parking"))
    return <Car className="h-6 w-6" />;
  if (lowerName.includes("health") || lowerName.includes("hospital"))
    return <HeartPulse className="h-6 w-6" />;
  if (lowerName.includes("electric") || lowerName.includes("power"))
    return <Zap className="h-6 w-6" />;
  if (lowerName.includes("transport") || lowerName.includes("bus"))
    return <BusFront className="h-6 w-6" />;
  if (lowerName.includes("noise"))
    return <Volume2 className="h-6 w-6" />;
  if (lowerName.includes("air") || lowerName.includes("pollution"))
    return <Wind className="h-6 w-6" />;
  
  // Default icon
  return <FileText className="h-6 w-6" />;
};