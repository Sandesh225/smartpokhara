// app/projects/page.tsx
import React from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { 
  Construction,
  Building2,
  TreePine,
  Droplet,
  Lightbulb,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  FileText,
  ArrowRight
} from "lucide-react";

const PROJECT_STATUS = {
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", icon: CheckCircle2 },
  ongoing: { label: "Ongoing", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Clock },
  planned: { label: "Planned", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", icon: AlertCircle },
};

const PROJECTS = [
  {
    id: 1,
    title: "Fewa Lake Waterfront Development",
    description: "Modernization of the lakeside promenade with improved walkways, lighting, and recreational facilities",
    category: "Infrastructure",
    icon: Droplet,
    status: "ongoing",
    budget: "NPR 120 Million",
    startDate: "Jan 2024",
    endDate: "Dec 2024",
    progress: 65,
    location: "Fewa Lake, Ward 1-3",
    beneficiaries: "50,000+ citizens",
    contractor: "ABC Construction Ltd.",
    highlights: [
      "2km extended walkway",
      "100 new solar lights",
      "3 new boat docks",
      "Green spaces and benches"
    ]
  },
  {
    id: 2,
    title: "Smart Street Lighting Project",
    description: "Installation of energy-efficient LED street lights with IoT sensors across all 33 wards",
    category: "Smart City",
    icon: Lightbulb,
    status: "ongoing",
    budget: "NPR 85 Million",
    startDate: "Mar 2024",
    endDate: "Sep 2024",
    progress: 45,
    location: "All 33 Wards",
    beneficiaries: "250,000+ citizens",
    contractor: "Smart Tech Nepal",
    highlights: [
      "5,000 LED lights",
      "60% energy savings",
      "IoT-enabled monitoring",
      "Reduced carbon footprint"
    ]
  },
  {
    id: 3,
    title: "Affordable Housing Complex",
    description: "Construction of 200 affordable housing units for low-income families",
    category: "Housing",
    icon: Building2,
    status: "ongoing",
    budget: "NPR 500 Million",
    startDate: "Aug 2023",
    endDate: "Dec 2025",
    progress: 35,
    location: "Ward 15",
    beneficiaries: "200 families",
    contractor: "Housing Development Board",
    highlights: [
      "200 2-bedroom units",
      "Community center",
      "Children's playground",
      "Solar-powered common areas"
    ]
  },
  {
    id: 4,
    title: "Urban Forest Park Development",
    description: "Creation of a 50-acre urban forest park with walking trails, bird watching areas, and picnic spots",
    category: "Environment",
    icon: TreePine,
    status: "planned",
    budget: "NPR 45 Million",
    startDate: "Oct 2024",
    endDate: "Mar 2025",
    progress: 10,
    location: "Ward 22",
    beneficiaries: "100,000+ citizens",
    contractor: "TBD - Under Tender",
    highlights: [
      "50-acre green space",
      "5km walking trails",
      "Bird sanctuary",
      "Outdoor fitness area"
    ]
  },
  {
    id: 5,
    title: "Sewage Treatment Plant Upgrade",
    description: "Modernization and capacity expansion of the city's main sewage treatment facility",
    category: "Sanitation",
    icon: Droplet,
    status: "ongoing",
    budget: "NPR 200 Million",
    startDate: "May 2024",
    endDate: "May 2025",
    progress: 25,
    location: "Ward 8",
    beneficiaries: "All citizens",
    contractor: "Environmental Solutions Pvt. Ltd.",
    highlights: [
      "Double treatment capacity",
      "Advanced filtration",
      "Reduced water pollution",
      "Bio-gas generation"
    ]
  },
  {
    id: 6,
    title: "New Bus Terminal Complex",
    description: "Modern bus terminal with 50 bus bays, waiting areas, shops, and digital information systems",
    category: "Transportation",
    icon: Construction,
    status: "completed",
    budget: "NPR 150 Million",
    startDate: "Jan 2023",
    endDate: "Dec 2023",
    progress: 100,
    location: "Ward 11",
    beneficiaries: "150,000+ daily commuters",
    contractor: "Metro Infrastructure Ltd.",
    highlights: [
      "50 bus bays",
      "Digital ticketing",
      "Passenger amenities",
      "Commercial spaces"
    ]
  },
];

const STATS = [
  { label: "Active Projects", value: "15", icon: Construction },
  { label: "Total Budget", value: "NPR 1.2B", icon: DollarSign },
  { label: "Completed", value: "28", icon: CheckCircle2 },
  { label: "Beneficiaries", value: "250k+", icon: Users },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-br from-primary to-secondary text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1)),linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1))] bg-[size:60px_60px] bg-[position:0_0,30px_30px]" />
          </div>

          <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Construction className="w-4 h-4" />
                <span className="text-sm font-semibold">Building Tomorrow, Today</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                City Development Projects
              </h1>
              
              <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8">
                Track ongoing infrastructure projects, view completed works, and explore planned developments. Transparency in every step.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-background text-primary font-bold rounded-full hover:bg-background/90 transition-all hover:scale-105 shadow-lg">
                  View All Projects
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border-2 border-white/30 text-primary-foreground font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-sm">
                  <FileText className="w-5 h-5" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-muted/30 dark:bg-muted/10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((stat, idx) => (
                <div key={idx} className="bg-card dark:bg-card/80 border border-border dark:border-border/50 rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary dark:text-primary/90 mb-2">
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="py-8 border-b border-border dark:border-border/50">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-primary dark:bg-primary/90 text-primary-foreground font-semibold rounded-full text-sm">
                All Projects
              </button>
              <button className="px-4 py-2 bg-muted dark:bg-muted/80 hover:bg-accent dark:hover:bg-accent/80 text-foreground font-semibold rounded-full text-sm transition-colors">
                Ongoing
              </button>
              <button className="px-4 py-2 bg-muted dark:bg-muted/80 hover:bg-accent dark:hover:bg-accent/80 text-foreground font-semibold rounded-full text-sm transition-colors">
                Completed
              </button>
              <button className="px-4 py-2 bg-muted dark:bg-muted/80 hover:bg-accent dark:hover:bg-accent/80 text-foreground font-semibold rounded-full text-sm transition-colors">
                Planned
              </button>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {PROJECTS.map((project) => {
                const statusConfig = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS];
                const StatusIcon = statusConfig.icon;

                return (
                  <article
                    key={project.id}
                    className="group bg-card dark:bg-card/80 border border-border dark:border-border/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                            <project.icon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {project.category}
                            </span>
                            <h3 className="text-xl font-bold text-foreground dark:text-foreground/95 mt-1">
                              {project.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground dark:text-muted-foreground/90 mb-4 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Status Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold mb-4">
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className={statusConfig.color}>{statusConfig.label}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-foreground dark:text-foreground/95">Progress</span>
                          <span className="text-xs font-bold text-primary dark:text-primary/90">{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted dark:bg-muted/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Project Info Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Budget</p>
                            <p className="text-sm font-semibold text-foreground dark:text-foreground/95">{project.budget}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Timeline</p>
                            <p className="text-sm font-semibold text-foreground dark:text-foreground/95">
                              {project.startDate} - {project.endDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-semibold text-foreground dark:text-foreground/95">{project.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Beneficiaries</p>
                            <p className="text-sm font-semibold text-foreground dark:text-foreground/95">{project.beneficiaries}</p>
                          </div>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="pt-4 border-t border-border dark:border-border/50">
                        <p className="text-xs font-semibold text-foreground dark:text-foreground/95 mb-2">Key Highlights:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {project.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <TrendingUp className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                              <span className="text-xs text-muted-foreground">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-muted/30 dark:bg-muted/10 border-t border-border dark:border-border/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Contractor</p>
                          <p className="text-sm font-semibold text-foreground dark:text-foreground/95">{project.contractor}</p>
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primary/90 text-primary-foreground font-bold rounded-lg hover:bg-primary/90 dark:hover:bg-primary transition-all hover:scale-105 text-sm">
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30 dark:bg-muted/10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 sm:p-12 text-center text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
              </div>

              <div className="relative z-10 max-w-2xl mx-auto">
                <Construction className="w-16 h-16 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Have a Project Suggestion?
                </h2>
                <p className="text-primary-foreground/90 mb-8">
                  We value citizen input in our development planning. Share your ideas for projects that can benefit the community.
                </p>
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-background text-primary font-bold rounded-full hover:bg-background/90 transition-all hover:scale-105 shadow-lg">
                  Submit Suggestion
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

  
    </div>
  );
}