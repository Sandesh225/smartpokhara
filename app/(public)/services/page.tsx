import React from "react";
import { 
  FileText, 
  CreditCard, 
  Home, 
  Briefcase, 
  Users, 
  FileCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

// Official Pokhara Metropolitan City Service Data
const SERVICES = [
  {
    category: "Vital Registration",
    icon: Users,
    color: "from-blue-600 to-cyan-500",
    services: [
      {
        title: "Birth Registration",
        description: "Official registration of new births within the metropolitan area.",
        icon: FileText,
        status: "online",
        processing: "Same Day",
        fee: "Free (within 35 days) / NPR 50 (after)",
        documents: ["Hospital discharge slip", "Parents' citizenship copies", "Marriage certificate"],
      },
      {
        title: "Marriage Registration",
        description: "Legal registration of marriage at your respective ward office.",
        icon: FileCheck,
        status: "office",
        processing: "Same Day",
        fee: "NPR 500",
        documents: ["Citizenship of bride & groom", "Passport photos", "Witness identification"],
      },
      {
        title: "Business Registration",
        description: "New business registration for local entrepreneurs and entities.",
        icon: Briefcase,
        status: "online",
        processing: "1-3 Days",
        fee: "Based on Capital",
        documents: ["Application form", "Citizenship copy", "House rent agreement", "Photos"],
      },
    ],
  },
  {
    category: "Property & Construction",
    icon: Home,
    color: "from-purple-600 to-pink-500",
    services: [
      {
        title: "Building Permit (Type C)",
        description: "Approval for buildings with plinth area less than 1000 sq. ft.",
        icon: Home,
        status: "online",
        processing: "7-15 Days",
        fee: "As per Bylaws 2081",
        documents: ["Lalpurja (Land Deed)", "Blueprints", "Tax clearance certificate"],
      },
      {
        title: "Property Tax Payment",
        description: "Annual integrated property tax payment portal.",
        icon: CreditCard,
        status: "online",
        processing: "Instant",
        fee: "Based on Valuation",
        documents: ["CID Number", "Previous tax receipt"],
      },
      {
        title: "Land Classification",
        description: "Application for land use and agricultural/non-agricultural zoning.",
        icon: MapPin,
        status: "office",
        processing: "15-30 Days",
        fee: "NPR 1,000",
        documents: ["Napi Map", "Lalpurja", "Ward recommendation"],
      },
    ],
  },
];

const QUICK_CONTACT = {
  phone: "+977-61-521105",
  email: "info@pokharamun.gov.np",
  hours: "Sun-Thu: 10AM-5PM, Fri: 10AM-3PM",
  emergency: "1181 (Hello Mayor)",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 w-full">
        {/* Hero Section - Tightened Padding */}
        <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary-brand-dark to-primary-brand text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center md:text-left">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span className="text-sm font-semibold uppercase tracking-wider">Official Citizen Charter</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Public Services
              </h1>
              
              <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                Empowering the citizens of Pokhara with digital access to municipal documentation, tax portals, and permit applications.
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-background text-primary-brand font-bold rounded-full hover:bg-background/90 transition-all hover:scale-105 shadow-xl">
                  Digital Portal
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 border border-white/20 text-primary-foreground font-bold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm">
                  Service Forms
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid - py-8 to py-16 */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {SERVICES.map((category, idx) => (
              <div key={idx} className="mb-12 last:mb-0">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {category.category}
                    </h2>
                    <div className="h-1 w-12 bg-primary-brand rounded-full mt-1.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.services.map((service, sIdx) => (
                    <article
                      key={sIdx}
                      className="group relative bg-card border border-border dark:border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Online/Offline Badge */}
                      <div className="absolute top-6 right-6">
                        {service.status === "online" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            Digital
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                            <AlertCircle className="w-3 h-3" />
                            Office
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-2 pr-12">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-5 py-3 border-y border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary-brand" />
                          <span>{service.processing}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <CreditCard className="w-3.5 h-3.5 text-primary-brand" />
                          <span>{service.fee}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">Requirements:</p>
                        <ul className="space-y-1.5">
                          {service.documents.map((doc, dIdx) => (
                            <li key={dIdx} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="h-1 w-1 rounded-full bg-primary-brand mt-1.5 shrink-0" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button className="w-full py-2.5 bg-primary-brand text-white text-sm font-bold rounded-xl hover:bg-primary-brand-light transition-colors flex items-center justify-center gap-2">
                        {service.status === "online" ? "Apply Now" : "Ward Directory"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support Footer - py-12 */}
        <section className="py-12 bg-muted/30">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary-brand/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-brand" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Call Support</p>
                  <p className="text-sm font-bold">{QUICK_CONTACT.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary-brand/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-brand" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Email Query</p>
                  <p className="text-sm font-bold">{QUICK_CONTACT.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Office Hours</p>
                  <p className="text-sm font-bold">Sun-Fri Charter</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-tighter">Emergency (Hello Mayor)</p>
                  <p className="text-sm font-bold text-red-600">{QUICK_CONTACT.emergency}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}