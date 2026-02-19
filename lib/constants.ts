// ═══════════════════════════════════════════════════════════
// SHARED CONSTANTS - Single source of truth
// ═══════════════════════════════════════════════════════════

import {
  ShieldCheck,
  Users,
  Activity,
  MapPin,
  CreditCard,
  Bell,
  Building2,
  Info,
  CheckCircle2,
  Sparkles,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Smartphone,
  FileText,
  MountainSnow,
  type LucideIcon,
} from "lucide-react";

// Trust Indicators
export const TRUST_INDICATORS = [
  {
    icon: ShieldCheck,
    label: "Gov Verified",
    color: "text-secondary dark:text-secondary/90",
  },
  {
    icon: Users,
    label: "250k+ Citizens",
    color: "text-primary dark:text-primary/90",
  },
  {
    icon: Activity,
    label: "Real-time Data",
    color: "text-secondary dark:text-secondary/90",
  },
] as const;

// Feature Groups
export const FEATURE_GROUPS = [
  {
    title: "Citizen Services",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-500",
    items: [
      {
        icon: MapPin,
        title: "Geo-Tagged Reporting",
        description:
          "Pinpoint exact locations with GPS technology for accurate issue resolution.",
      },
      {
        icon: CreditCard,
        title: "Digital Tax Payment",
        description:
          "Pay taxes securely online with multiple payment options available 24/7.",
      },
      {
        icon: Bell,
        title: "Status Alerts",
        description:
          "Receive instant SMS & email updates on all your service requests.",
      },
    ],
  },
  {
    title: "City Transparency",
    icon: Building2,
    gradient: "from-purple-500 to-pink-500",
    items: [
      {
        icon: Building2,
        title: "Ward Profiles",
        description:
          "Access complete contact details for all ward representatives and offices.",
      },
      {
        icon: Info,
        title: "Public Notices",
        description:
          "Stay informed with official announcements, alerts, and city updates.",
      },
      {
        icon: CheckCircle2,
        title: "Performance Tracker",
        description:
          "Monitor real-time resolution statistics and municipal performance metrics.",
      },
    ],
  },
] as const;

// How It Works Steps
export const HOW_IT_WORKS_STEPS = [
  {
    icon: Smartphone,
    title: "Snap & Report",
    description:
      "Take a photo of the issue and upload it with precise GPS location via our mobile-responsive portal.",
    color: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    number: "01",
  },
  {
    icon: FileText,
    title: "Automatic Routing",
    description:
      "Our system instantly identifies the location and routes your report to the specific Ward Officer.",
    color: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    number: "02",
  },
  {
    icon: CheckCircle2,
    title: "Get Resolved",
    description:
      "Receive real-time SMS and email notifications when the municipal work is completed.",
    color: "bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400",
    number: "03",
  },
] as const;

// Stats
export const STATS = [
  {
    number: "33",
    label: "Wards Connected",
    icon: Building2,
    description: "Complete coverage",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "24h",
    label: "Avg. Response",
    icon: Activity,
    description: "Fast resolution",
    color: "from-green-500 to-emerald-500",
  },
  {
    number: "500+",
    label: "Issues Resolved",
    icon: CheckCircle2,
    description: "And counting",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "100%",
    label: "Verified Citizens",
    icon: ShieldCheck,
    description: "Secure platform",
    color: "from-orange-500 to-red-500",
  },
] as const;

// Testimonials
export const TESTIMONIALS = [
  {
    quote:
      "I reported a pothole near my house in Ward 12 and it was fixed within 48 hours. This platform actually works!",
    author: "Ramesh K.",
    role: "Resident",
    location: "Ward 12",
    rating: 5,
    avatar: "RK",
  },
  {
    quote:
      "Paying my property tax online saved me hours of waiting in line. The process was simple, secure, and instant.",
    author: "Sunita M.",
    role: "Business Owner",
    location: "Lakeside",
    rating: 5,
    avatar: "SM",
  },
  {
    quote:
      "The transparency in tracking complaint status is amazing. I always know exactly what is happening with my request.",
    author: "Bikash T.",
    role: "Ward 7 Resident",
    location: "Ward 7",
    rating: 5,
    avatar: "BT",
  },
] as const;

// Beauty Section Images
export const BEAUTY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1652788608087-e8f766b0a93e?q=80&w=1074&auto=format&fit=crop",
    caption: "Phewa Lake Serenity",
    alt: "Scenic view of Phewa Lake in Pokhara with mountains in background",
  },
  {
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
    caption: "Machhapuchhre Range",
    alt: "Machhapuchhre mountain range with snow-capped peaks",
  },
  {
    src: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop",
    caption: "World Peace Pagoda",
    alt: "World Peace Pagoda overlooking Pokhara valley",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop",
    caption: "Sarangkot Sunrise",
    alt: "Sunrise view from Sarangkot with Himalayan panorama",
  },
  {
    src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1000&auto=format&fit=crop",
    caption: "The Vibrant Valley",
    alt: "Colorful valley landscape of Pokhara with lush greenery",
  },
] as const;

// Navigation
export const NAV_ITEMS = [
  { label: "Home", desc: "Back to starting page" },
  { label: "Public Services", desc: "Civic services & utilities" },
  { label: "Ward Directory", desc: "Find your ward office" },
  { label: "City Projects", desc: "Ongoing developments" },
  { label: "Notices", desc: "Official announcements" },
] as const;

// Footer Links
export const QUICK_LINKS = [
  { label: "Staff Login", href: "/staff", icon: "👤" },
  { label: "Citizen Registration", href: "/register", icon: "📝" },
  { label: "Report Issue", href: "/report", icon: "📢" },
  { label: "Track Status", href: "/track", icon: "🔍" },
] as const;

export const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Data Protection", href: "/data-protection" },
] as const;

export const SOCIAL_LINKS = [
  {
    icon: Facebook,
    href: "https://facebook.com/pokharamun",
    label: "Facebook",
    color: "hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-500",
  },
  {
    icon: Twitter,
    href: "https://twitter.com/pokharamun",
    label: "Twitter",
    color: "hover:bg-sky-500/10 hover:border-sky-500 hover:text-sky-500",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/pokharamun",
    label: "Instagram",
    color: "hover:bg-pink-500/10 hover:border-pink-500 hover:text-pink-500",
  },
  {
    icon: Youtube,
    href: "https://youtube.com/@pokharamun",
    label: "YouTube",
    color: "hover:bg-red-500/10 hover:border-red-500 hover:text-red-500",
  },
] as const;

// Contact Info
export const CONTACT_INFO = {
  address: "New Road, Pokhara-8, Kaski, Nepal",
  phone: "+977-61-521105",
  email: "info@pokharamun.gov.np",
  website: "https://pokharamun.gov.np",
  mapsUrl: "https://maps.google.com/?q=New+Road+Pokhara",
} as const;

// Type exports
export type TrustIndicator = (typeof TRUST_INDICATORS)[number];
export type FeatureGroup = (typeof FEATURE_GROUPS)[number];
export type Step = (typeof HOW_IT_WORKS_STEPS)[number];
export type Stat = (typeof STATS)[number];
export type Testimonial = (typeof TESTIMONIALS)[number];
export type BeautyImage = (typeof BEAUTY_IMAGES)[number];