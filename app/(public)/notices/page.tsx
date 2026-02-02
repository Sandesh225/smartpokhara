// app/notices/page.tsx
import React from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { 
  Bell,
  AlertTriangle,
  Info,
  FileText,
  Calendar,
  Download,
  ExternalLink,
  Pin,
  Clock,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";

const NOTICE_TYPES = {
  alert: { label: "Alert", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: AlertTriangle },
  announcement: { label: "Announcement", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Bell },
  tender: { label: "Tender", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", icon: FileText },
  event: { label: "Event", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", icon: Calendar },
  info: { label: "Information", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", icon: Info },
};

const NOTICES = [
  {
    id: 1,
    type: "alert",
    title: "Road Closure Notice - Mahendra Pool Area",
    description: "The road from Mahendra Pool to Prithvi Chowk will be closed for emergency water pipeline repair work from March 15-18, 2024.",
    date: "2024-03-10",
    isPinned: true,
    department: "Infrastructure Department",
    contact: "+977-61-521106",
    attachments: ["closure-map.pdf"],
  },
  {
    id: 2,
    type: "tender",
    title: "Tender Notice: Construction of Community Hall in Ward 12",
    description: "Sealed tenders are invited from registered contractors for construction of a community hall with a capacity of 500 persons. Last date for submission: March 25, 2024.",
    date: "2024-03-08",
    isPinned: true,
    department: "Procurement Department",
    budget: "NPR 15 Million",
    deadline: "2024-03-25",
    attachments: ["tender-document.pdf", "technical-specifications.pdf"],
  },
  {
    id: 3,
    type: "announcement",
    title: "Property Tax Payment Deadline Extended",
    description: "The deadline for property tax payment for fiscal year 2023/24 has been extended to April 15, 2024. Online payment facility is available.",
    date: "2024-03-05",
    isPinned: false,
    department: "Revenue Department",
    contact: "+977-61-521107",
  },
  {
    id: 4,
    type: "event",
    title: "Public Hearing on Urban Development Master Plan",
    description: "A public hearing will be conducted on the proposed Urban Development Master Plan 2025-2035. All citizens are invited to participate and provide feedback.",
    date: "2024-03-01",
    isPinned: false,
    department: "Planning Department",
    eventDate: "2024-03-20",
    eventTime: "10:00 AM",
    venue: "Municipal Assembly Hall",
  },
  {
    id: 5,
    type: "announcement",
    title: "New Business License Online Application System Launched",
    description: "The municipality has launched a new online system for business license applications and renewals. Citizens can now apply from home.",
    date: "2024-02-28",
    isPinned: false,
    department: "Business Registration",
    link: "https://license.pokharamun.gov.np",
  },
  {
    id: 6,
    type: "tender",
    title: "Supply of LED Street Lights - Ward 15 to 20",
    description: "Quotations invited for supply and installation of 500 LED street lights with smart controllers. Technical and financial proposals required.",
    date: "2024-02-25",
    isPinned: false,
    department: "Procurement Department",
    budget: "NPR 8 Million",
    deadline: "2024-03-15",
    attachments: ["specifications.pdf"],
  },
  {
    id: 7,
    type: "info",
    title: "Waste Collection Schedule Updated",
    description: "Updated waste collection schedules for all wards are now available. Please check your ward office notice board or website for details.",
    date: "2024-02-20",
    isPinned: false,
    department: "Sanitation Department",
  },
  {
    id: 8,
    type: "alert",
    title: "Water Supply Disruption Notice - Ward 8 and 9",
    description: "Water supply will be temporarily disrupted in Ward 8 and 9 on March 12, 2024 from 6:00 AM to 2:00 PM due to maintenance work.",
    date: "2024-02-18",
    isPinned: false,
    department: "Water Supply Department",
    contact: "+977-61-521108",
  },
];

const CATEGORIES = [
  { name: "All Notices", count: NOTICES.length },
  { name: "Alerts", count: NOTICES.filter(n => n.type === "alert").length },
  { name: "Tenders", count: NOTICES.filter(n => n.type === "tender").length },
  { name: "Events", count: NOTICES.filter(n => n.type === "event").length },
  { name: "Announcements", count: NOTICES.filter(n => n.type === "announcement").length },
];

export default function NoticesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-br from-primary to-secondary text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,255,255,0.1)_0deg,transparent_60deg,transparent_300deg,rgba(255,255,255,0.1)_360deg)]" />
          </div>

          <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Bell className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-semibold">Stay Informed</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Official Notices & Announcements
              </h1>
              
              <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8">
                Get the latest updates, alerts, tender notices, and official announcements from Pokhara Metropolitan City.
              </p>

              {/* Search Box */}
              <div className="relative max-w-xl">
                <input
                  type="text"
                  placeholder="Search notices by title or keyword..."
                  className="w-full px-6 py-4 pl-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/60" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-muted/30 dark:bg-muted/10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((category, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    idx === 0
                      ? "bg-primary dark:bg-primary/90 text-primary-foreground"
                      : "bg-card dark:bg-card/80 border border-border dark:border-border/50 text-foreground hover:bg-accent dark:hover:bg-accent/80"
                  }`}
                >
                  {category.name}
                  <span className="ml-2 px-2 py-0.5 bg-white/20 dark:bg-black/20 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notices List */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-foreground/95 mb-2">
                  All Notices
                </h2>
                <p className="text-sm text-muted-foreground">
                  Showing {NOTICES.length} notices
                </p>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-muted dark:bg-muted/80 hover:bg-accent dark:hover:bg-accent/80 text-foreground font-semibold rounded-lg transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            <div className="space-y-6">
              {NOTICES.map((notice) => {
                const typeConfig = NOTICE_TYPES[notice.type as keyof typeof NOTICE_TYPES];
                const TypeIcon = typeConfig.icon;

                return (
                  <article
                    key={notice.id}
                    className={`group bg-card dark:bg-card/80 border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 ${
                      notice.isPinned 
                        ? "border-primary dark:border-primary/50 ring-2 ring-primary/20" 
                        : "border-border dark:border-border/50"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Icon */}
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.color}`}>
                            <TypeIcon className="w-6 h-6" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {notice.isPinned && (
                                <Pin className="w-4 h-4 text-primary dark:text-primary/90" />
                              )}
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-xs font-bold ${typeConfig.color}`}>
                                {typeConfig.label}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(notice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-foreground dark:text-foreground/95 mb-2 group-hover:text-primary dark:group-hover:text-primary/90 transition-colors">
                              {notice.title}
                            </h3>

                            <p className="text-sm text-muted-foreground dark:text-muted-foreground/90 leading-relaxed mb-4">
                              {notice.description}
                            </p>

                            {/* Additional Info */}
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5" />
                                <span>{notice.department}</span>
                              </div>
                              
                              {notice.contact && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  <a href={`tel:${notice.contact}`} className="hover:text-primary transition-colors">
                                    {notice.contact}
                                  </a>
                                </div>
                              )}

                              {notice.budget && (
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Budget: {notice.budget}</span>
                                </div>
                              )}

                              {notice.deadline && (
                                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Deadline: {new Date(notice.deadline).toLocaleDateString()}</span>
                                </div>
                              )}

                              {notice.eventDate && (
                                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{new Date(notice.eventDate).toLocaleDateString()} at {notice.eventTime}</span>
                                </div>
                              )}
                            </div>

                            {/* Attachments */}
                            {notice.attachments && notice.attachments.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-border dark:border-border/50">
                                <p className="text-xs font-semibold text-foreground dark:text-foreground/95 mb-2">
                                  Attachments:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {notice.attachments.map((file, idx) => (
                                    <a
                                      key={idx}
                                      href="#"
                                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 dark:bg-muted/30 hover:bg-muted dark:hover:bg-muted/50 border border-border dark:border-border/50 rounded-lg text-xs font-medium text-foreground transition-all"
                                    >
                                      <Download className="w-3 h-3" />
                                      {file}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Link */}
                            {notice.link && (
                              <div className="mt-4">
                                <a
                                  href={notice.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm text-primary dark:text-primary/90 hover:underline font-semibold"
                                >
                                  Visit Website
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <button className="shrink-0 ml-4 inline-flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primary/90 text-primary-foreground font-bold rounded-lg hover:bg-primary/90 dark:hover:bg-primary transition-all hover:scale-105 text-sm">
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-muted dark:bg-muted/80 hover:bg-accent dark:hover:bg-accent/80 text-foreground font-semibold rounded-full transition-all hover:scale-105 shadow-sm">
                Load More Notices
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Subscription CTA */}
        <section className="py-16 bg-muted/30 dark:bg-muted/10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 sm:p-12 text-center text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.3),transparent_50%)]" />
              </div>

              <div className="relative z-10 max-w-2xl mx-auto">
                <Bell className="w-16 h-16 mx-auto mb-6 animate-pulse" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Never Miss an Important Notice
                </h2>
                <p className="text-primary-foreground/90 mb-8">
                  Subscribe to get email notifications for new notices, alerts, and announcements directly in your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="px-6 py-3 bg-background text-primary font-bold rounded-full hover:bg-background/90 transition-all hover:scale-105 shadow-lg whitespace-nowrap">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

   
    </div>
  );
}