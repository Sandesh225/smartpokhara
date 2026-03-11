"use client";

import { useState, useMemo } from "react";
import {
  Search,
  FileText,
  Home,
  Wrench,
  HeartPulse,
  Landmark,
  Users,
  Building2,
  ScrollText,
  ShieldCheck,
  Droplets,
  Zap,
  TreePine,
  Baby,
  Stamp,
  Receipt,
  Scale,
  BriefcaseMedical,
  TrafficCone,
  Recycle,
  BookOpen,
  HandHeart,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ServiceCard } from "./_components/ServiceCard";

const SERVICE_CATEGORIES = [
  {
    id: "documents",
    title: "Documents & Certificates",
    description: "Civil registration, identity, and official document services",
    icon: FileText,
    services: [
      {
        title: "Birth Certificate",
        description: "Register a birth or request a certified copy of a birth record",
        icon: Baby,
        href: "/citizen/services/birth-certificate",
        available: true,
      },
      {
        title: "Citizenship Recommendation",
        description: "Request a citizenship recommendation letter from your ward office",
        icon: ShieldCheck,
        href: "/citizen/services/citizenship",
        available: true,
      },
      {
        title: "Relationship Certificate",
        description: "Obtain a certified relationship verification document",
        icon: ScrollText,
        href: "/citizen/services/relationship",
        available: true,
      },
      {
        title: "Migration Certificate",
        description: "Apply for a migration certificate for ward or municipality transfer",
        icon: MapPin,
        href: "/citizen/services/migration",
        available: false,
      },
    ],
  },
  {
    id: "property",
    title: "Property & Tax",
    description: "Property registration, tax calculation, and land records",
    icon: Home,
    services: [
      {
        title: "Property Tax Payment",
        description: "Calculate and pay annual property tax, view outstanding dues",
        icon: Receipt,
        href: "/citizen/payments",
        available: true,
      },
      {
        title: "Land Revenue",
        description: "View land ownership records and pay land revenue",
        icon: Landmark,
        href: "/citizen/services/land-revenue",
        available: true,
      },
      {
        title: "Property Valuation",
        description: "Request an official property valuation for transactions",
        icon: Scale,
        href: "/citizen/services/property-valuation",
        available: false,
      },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure & Utilities",
    description: "Roads, water supply, electricity, and public infrastructure",
    icon: Wrench,
    services: [
      {
        title: "Water Supply",
        description: "Apply for a new connection or report water supply issues",
        icon: Droplets,
        href: "/citizen/services/water-supply",
        available: true,
      },
      {
        title: "Electricity",
        description: "NEA service requests and power outage reporting",
        icon: Zap,
        href: "/citizen/services/electricity",
        available: true,
      },
      {
        title: "Road & Drainage",
        description: "Report road damage, blocked drains, or construction hazards",
        icon: TrafficCone,
        href: "/citizen/complaints/new",
        available: true,
      },
      {
        title: "Waste Management",
        description: "Solid waste collection schedule and recycling information",
        icon: Recycle,
        href: "/citizen/services/waste-management",
        available: false,
      },
    ],
  },
  {
    id: "health",
    title: "Health & Sanitation",
    description: "Public health services, vaccinations, and sanitation programs",
    icon: HeartPulse,
    services: [
      {
        title: "Health Post Locator",
        description: "Find the nearest government health post or hospital",
        icon: BriefcaseMedical,
        href: "/citizen/services/health-posts",
        available: true,
      },
      {
        title: "Vaccination Records",
        description: "View and download your vaccination history",
        icon: ShieldCheck,
        href: "/citizen/services/vaccinations",
        available: false,
      },
      {
        title: "Sanitation Complaint",
        description: "Report sanitation issues in public areas",
        icon: Droplets,
        href: "/citizen/complaints/new",
        available: true,
      },
    ],
  },
  {
    id: "permits",
    title: "Permits & Licenses",
    description: "Business permits, construction approvals, and trade licenses",
    icon: Stamp,
    services: [
      {
        title: "Building Permit",
        description: "Apply for construction or renovation approval",
        icon: Building2,
        href: "/citizen/services/building-permit",
        available: true,
      },
      {
        title: "Business Registration",
        description: "Register a new business or renew an existing license",
        icon: Landmark,
        href: "/citizen/services/business-registration",
        available: true,
      },
      {
        title: "Trade License",
        description: "Obtain or renew a trade license for your business",
        icon: Stamp,
        href: "/citizen/services/trade-license",
        available: false,
      },
    ],
  },
  {
    id: "community",
    title: "Community & Welfare",
    description: "Social programs, education, environment, and community services",
    icon: Users,
    services: [
      {
        title: "Participatory Budgeting",
        description: "Submit and vote on community project proposals",
        icon: HandHeart,
        href: "/citizen/participatory-budgeting",
        available: true,
      },
      {
        title: "Scholarship Programs",
        description: "Apply for municipal scholarship and education grants",
        icon: GraduationCap,
        href: "/citizen/services/scholarships",
        available: false,
      },
      {
        title: "Environment",
        description: "Tree planting programs and green initiative registration",
        icon: TreePine,
        href: "/citizen/services/environment",
        available: false,
      },
      {
        title: "Public Library",
        description: "Access digital resources and library membership",
        icon: BookOpen,
        href: "/citizen/services/library",
        available: false,
      },
    ],
  },
];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SERVICE_CATEGORIES;

    return SERVICE_CATEGORIES.map((category) => ({
      ...category,
      services: category.services.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      ),
    })).filter((category) => category.services.length > 0);
  }, [searchQuery]);

  const totalAvailable = SERVICE_CATEGORIES.reduce(
    (sum, cat) => sum + cat.services.filter((s) => s.available).length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Header */}
        <header className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Municipal Services
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              City Services
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mt-2 max-w-2xl">
              Access all Pokhara Metropolitan City services. Apply for documents,
              pay taxes, request permits, and more — all from one place.
            </p>
          </div>

          {/* Search + Stats */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-10 h-11 rounded-xl border-border bg-card focus-visible:ring-ring shadow-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-nature" />
                {totalAvailable} available
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                {SERVICE_CATEGORIES.reduce(
                  (sum, cat) =>
                    sum + cat.services.filter((s) => !s.available).length,
                  0
                )}{" "}
                coming soon
              </span>
            </div>
          </div>
        </header>

        {/* Categories */}
        <div className="space-y-12">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground">
                No services found
              </h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search query.
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <section key={category.id} className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <CategoryIcon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {category.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {category.services.map((service) => (
                      <ServiceCard key={service.title} {...service} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <footer className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Some services require in-person verification at your ward office.
            Contact your ward secretary for assistance.
          </p>
        </footer>
      </div>
    </div>
  );
}
