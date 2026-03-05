// app/wards/page.tsx
import React from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Building2,
  Users,
  Search,
  ArrowRight,
  ExternalLink
} from "lucide-react";

// Ward data (representative sample - expand with all 33 wards)
const WARDS = [
  {
    number: 1,
    name: "Ward 1 - Baidam",
    chairperson: "Ram Prasad Sharma",
    phone: "+977-61-521106",
    email: "ward1@pokharamun.gov.np",
    office: "Baidam, Lakeside Road",
    population: "8,500",
    area: "2.5 sq km",
    landmarks: ["Fewa Lake", "Lakeside Market", "World Peace Pagoda base"],
  },
  {
    number: 2,
    name: "Ward 2 - Parsyang",
    chairperson: "Sita Devi Gurung",
    phone: "+977-61-521107",
    email: "ward2@pokharamun.gov.np",
    office: "Parsyang, Main Road",
    population: "7,200",
    area: "3.1 sq km",
    landmarks: ["Parsyang School", "Community Center", "Health Post"],
  },
  {
    number: 3,
    name: "Ward 3 - Pumdi Bhumdi",
    chairperson: "Hari Bahadur Thapa",
    phone: "+977-61-521108",
    email: "ward3@pokharamun.gov.np",
    office: "Pumdi Bhumdi",
    population: "6,800",
    area: "4.2 sq km",
    landmarks: ["Pumdi School", "Local Market", "Temple"],
  },
  {
    number: 4,
    name: "Ward 4 - Harpan",
    chairperson: "Maya Kumari Poudel",
    phone: "+977-61-521109",
    email: "ward4@pokharamun.gov.np",
    office: "Harpan Chowk",
    population: "9,100",
    area: "2.8 sq km",
    landmarks: ["Bus Park", "Shopping Complex", "Hospital"],
  },
  {
    number: 5,
    name: "Ward 5 - Ramghat",
    chairperson: "Laxman Singh Thakuri",
    phone: "+977-61-521110",
    email: "ward5@pokharamun.gov.np",
    office: "Ramghat Road",
    population: "10,200",
    area: "3.5 sq km",
    landmarks: ["Ramghat", "Bindyabasini Temple", "Museum"],
  },
  {
    number: 6,
    name: "Ward 6 - Bagar",
    chairperson: "Kamala Adhikari",
    phone: "+977-61-521111",
    email: "ward6@pokharamun.gov.np",
    office: "Bagar, Prithvi Chowk",
    population: "11,500",
    area: "2.9 sq km",
    landmarks: ["Airport Road", "Hotels", "Shopping Area"],
  },
  // Add more wards...
];

const WARD_SERVICES = [
  "Birth/Death Registration",
  "Citizenship Recommendation",
  "Local Tax Collection",
  "Infrastructure Complaints",
  "Social Welfare Programs",
  "Community Development",
];

export default function WardsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
    

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-linear-to-br from-primary to-secondary text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          </div>

          <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full mb-6 border border-primary-foreground/20">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-black uppercase tracking-widest">33 Wards</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Ward Directory
              </h1>
              
              <p className="text-lg sm:text-xl text-primary-foreground font-medium mb-8 leading-relaxed">
                Find your ward office, contact representatives, and access local services. Your ward is your first point of contact.
              </p>

              {/* Search Box */}
              <div className="relative max-w-xl group">
                <input
                  type="text"
                  placeholder="Search by ward number, name, or location..."
                  className="w-full px-6 py-4 pl-12 bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 rounded-2xl text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-4 focus:ring-primary-foreground/20 transition-all font-medium"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/60 group-hover:text-primary-foreground transition-colors" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-muted">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  33
                </div>
                <p className="text-sm text-muted-foreground">Total Wards</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  250k+
                </div>
                <p className="text-sm text-muted-foreground">Total Population</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  100+
                </div>
                <p className="text-sm text-muted-foreground">Ward Staff</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ward Grid */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                All Wards
              </h2>
              <p className="text-muted-foreground">
                Browse through all ward offices and contact your local representatives
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WARDS.map((ward) => (
                <article
                  key={ward.number}
                  className="group bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Ward Number Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-black text-lg shadow-lg shadow-primary/20">
                      {ward.number}
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-lg text-xs font-black uppercase tracking-widest">
                        {ward.population}
                      </span>
                    </div>
                  </div>

                  {/* Ward Name */}
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {ward.name}
                  </h3>

                  {/* Chairperson */}
                  <div className="flex items-start gap-4 mb-4 p-4 bg-muted/50 rounded-2xl border border-border/50">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ward Chairperson</p>
                      <p className="text-sm font-semibold text-foreground">
                        {ward.chairperson}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <a
                      href={`tel:${ward.phone}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{ward.phone}</span>
                    </a>
                    <a
                      href={`mailto:${ward.email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{ward.email}</span>
                    </a>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{ward.office}</span>
                    </div>
                  </div>

                  {/* Landmarks */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Key Landmarks:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ward.landmarks.map((landmark, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 bg-accent/5 text-accent font-black uppercase tracking-widest rounded-lg border border-accent/10"
                        >
                          {landmark}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="mt-4 w-full inline-flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary/95 transition-all hover:scale-102 shadow-lg shadow-primary/10 active:scale-95">
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </article>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-muted hover:bg-accent text-foreground font-semibold rounded-full transition-all hover:scale-105 shadow-sm">
                Load More Wards
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Ward Services */}
        <section className="py-16 bg-muted">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Services Available at Ward Offices
              </h2>
              <p className="text-muted-foreground">
                Your local ward office provides these essential services
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WARD_SERVICES.map((service, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">
                    {service}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Interactive Ward Map
                  </h2>
                  <p className="text-muted-foreground">
                    Explore all 33 wards on the map
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary transition-all">
                  View Full Map
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Map Placeholder */}
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive map coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

    
    </div>
  );
}