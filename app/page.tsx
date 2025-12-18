import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";
import {
  MapPin,
  CheckCircle2,
  ArrowRight,
  FileText,
  CreditCard,
  Bell,
  Info,
  Building2,
  Users,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Globe,
  MountainSnow,
  Sparkles,
  Zap,
  Heart,
  TrendingUp,
  Menu, // Added for potential mobile menu icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function LandingPage() {
  const user = await getCurrentUserWithRoles();

  if (user) {
    const dashboardPath = getDefaultDashboardPath(user);
    redirect(dashboardPath);
  }

  return (
    <div className="min-h-screen font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Global Background with Grain Texture */}
      <div className="fixed inset-0 -z-10 bg-blue-50">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-blue-50"></div>
        {/* Subtle grain overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Top Trust Bar */}
      <div className="relative z-50 bg-blue-900 text-blue-200 text-[11px] sm:text-xs py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium tracking-wide">
              Official Digital Platform of Pokhara Metropolitan City
            </span>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="#" className="hover:text-white transition-colors">
              Support
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Emergency Contacts
            </Link>
            <span className="text-blue-700 hidden sm:inline">|</span>
            <button className="hover:text-white transition-colors font-medium flex items-center gap-1">
              <Globe className="w-3 h-3" /> EN
            </button>
          </nav>
        </div>
      </div>

      <Header />

      <main className="relative z-0">
        <HeroSection />
        <BeautySection />
        <HowItWorksSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-blue-100 supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
            aria-label="Smart Pokhara Home"
          >
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
              <span className="font-bold text-lg sm:text-xl tracking-tight">
                SP
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-blue-950 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                Smart Pokhara
              </span>
              <span className="text-[10px] text-blue-500 font-medium tracking-wider uppercase">
                Government of Nepal
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-blue-700 font-semibold hover:text-blue-900 hover:bg-blue-50"
            >
              <Link href="/login">Sign In</Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95 duration-200 rounded-full sm:rounded-md px-4 sm:px-6"
            >
              <Link href="/register" className="flex items-center gap-2">
                <span className="hidden sm:inline">Citizen Registration</span>
                <span className="sm:hidden">Register</span>
                <ChevronRight className="w-4 h-4 text-blue-100 hidden sm:block" />
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
      {/* Background Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-linear-to-b from-blue-100/50 to-transparent rounded-[100%] blur-3xl opacity-60"></div>
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="mx-auto max-w-7xl text-center">
        <Badge
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full border-blue-200 bg-white/80 backdrop-blur-sm px-4 py-1.5 mb-8 text-xs font-bold text-blue-700 uppercase tracking-wider shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live in all 33 Wards
        </Badge>

        <h1 className="mx-auto max-w-5xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-blue-950 mb-8 leading-[1.1] text-balance">
          A Smarter City Starts <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 relative">
            With Your Voice
            {/* Underline decoration */}
            <svg
              className="absolute w-full h-3 -bottom-1 left-0 text-blue-300/50 -z-10"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg sm:text-xl text-blue-600/90 leading-relaxed font-medium text-pretty">
          The official platform to report infrastructure issues, pay municipal
          taxes, and track city progress. Simple, transparent, and direct.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 mb-16 max-w-xl mx-auto">
          <Button
            asChild
            size="lg"
            className="group w-full sm:flex-1 h-14 text-base font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-xl shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <Link href="/register">
              Report an Issue
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:flex-1 h-14 text-base font-bold text-blue-800 bg-white border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <Link href="/login">Track Complaint</Link>
          </Button>
        </div>

        {/* Social Proof Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards delay-200">
          {[
            {
              icon: ShieldCheck,
              text: "Government Verified",
              color: "text-green-600",
            },
            { icon: Users, text: "10k+ Citizens", color: "text-blue-600" },
            {
              icon: TrendingUp,
              text: "500+ Resolved",
              color: "text-indigo-600",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-blue-100 shadow-sm"
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-sm font-semibold text-blue-800">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeautySection() {
  // Images defined inside to keep it self-contained
  const images = [
    {
      src: "https://images.unsplash.com/photo-1652788608087-e8f766b0a93e?q=80&w=1074&auto=format&fit=crop",
      caption: "Phewa Lake Serenity",
    },
    {
      src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
      caption: "Machhapuchhre Range",
    },
    {
      src: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop",
      caption: "World Peace Pagoda",
    },
    {
      src: "https://www.thirdrockadventures.com/assets-back/images/trip/pokhara-sarangkot.jpgDFn.jpg",
      caption: "Sarangkot Sunrise",
    },
    {
      src: "https://media.app.beyondthelimitstreks.com/uploads/fullbanner/pokhara-city-1.webp",
      caption: "The Vibrant Valley",
    },
  ];
  const marqueeImages = [...images, ...images]; // Duplicate for loop

  return (
    <section className="relative py-24 bg-blue-950 overflow-hidden">
      {/* Marquee CSS Animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 50s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-blue-300/80 mb-3 text-sm font-bold uppercase tracking-widest">
          <MountainSnow className="w-4 h-4" />
          <span>Our Pride</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          The City We Protect Together
        </h2>
        <p className="text-blue-200/60 max-w-xl mx-auto">
          From the serene Phewa Lake to the majestic Himalayan peaks, every
          corner of Pokhara deserves our care.
        </p>
      </div>

      {/* Slider */}
      <div className="relative w-full overflow-hidden group">
        <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-linear-to-r from-blue-950 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-linear-to-l from-blue-950 to-transparent z-20 pointer-events-none"></div>

        <div className="flex animate-marquee gap-6 pl-6 w-max">
          {marqueeImages.map((img, idx) => (
            <div
              key={`${idx}-${img.caption}`}
              className="relative w-[280px] md:w-[350px] aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-500 ease-out shadow-2xl border border-white/10"
            >
              <img
                src={img.src}
                alt={img.caption}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 p-5">
                <p className="text-white font-bold text-lg">{img.caption}</p>
                <div className="h-1 w-8 bg-blue-500 rounded-full mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Smartphone,
      title: "Snap & Report",
      desc: "Take a photo of the issue and upload it with precise GPS location.",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: FileText,
      title: "Automatic Routing",
      desc: "System instantly routes your report to the specific Ward Officer.",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: CheckCircle2,
      title: "Get Resolved",
      desc: "Receive real-time notifications when the work is completed.",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">
            Simple Process
          </span>
          <h2 className="text-4xl font-extrabold text-blue-950 mt-2">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-blue-200 via-indigo-200 to-green-200 border-t border-dashed border-blue-300"></div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div
                className={`h-20 w-20 rounded-2xl ${step.bg} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300 border border-blue-100`}
              >
                <step.icon className={`w-10 h-10 ${step.color}`} />
              </div>
              <h3 className="font-bold text-xl text-blue-900 mb-3">
                {step.title}
              </h3>
              <p className="text-slate-600 leading-relaxed max-w-xs">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Citizen Services",
      items: [
        {
          icon: MapPin,
          title: "Geo-Tagged Reporting",
          desc: "Pinpoint exact locations with GPS.",
        },
        {
          icon: CreditCard,
          title: "Digital Tax Payment",
          desc: "Pay taxes securely online.",
        },
        {
          icon: Bell,
          title: "Status Alerts",
          desc: "SMS & Email updates on requests.",
        },
      ],
    },
    {
      title: "City Transparency",
      items: [
        {
          icon: Building2,
          title: "Ward Profiles",
          desc: "Contact details for representatives.",
        },
        {
          icon: Info,
          title: "Public Notices",
          desc: "Official announcements & alerts.",
        },
        {
          icon: CheckCircle2,
          title: "Performance Tracker",
          desc: "Real-time resolution statistics.",
        },
      ],
    },
  ];

  return (
    <section className="py-24 bg-blue-50/50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-blue-950 mb-6 tracking-tight">
            Everything You Need to Connect
          </h2>
          <p className="text-lg text-slate-600">
            Smart Pokhara bridges the gap between citizens and local government.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {features.map((group, groupIdx) => (
            <div
              key={groupIdx}
              className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100/50"
            >
              <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-8 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-blue-500 rounded-full"></span>
                {group.title}
              </h3>
              <div className="space-y-6">
                {group.items.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-blue-900 group-hover:text-blue-700 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-slate-500 text-sm mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { number: "33", label: "Wards Connected", icon: Building2 },
    { number: "24h", label: "Avg. Response", icon: Zap },
    { number: "500+", label: "Issues Resolved", icon: CheckCircle2 },
    { number: "100%", label: "Verified Citizens", icon: ShieldCheck },
  ];

  return (
    <section className="py-20 bg-linear-to-br from-blue-900 to-indigo-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-blue-300 opacity-80" />
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                {stat.number}
              </div>
              <div className="text-xs md:text-sm font-medium text-blue-200 uppercase tracking-widest opacity-70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-4 fill-red-50" />
          <h2 className="text-4xl font-bold text-blue-950">
            Real Stories, Real Impact
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote:
                "I reported a pothole near my house and it was fixed within 48 hours. This platform actually works!",
              author: "Ramesh K.",
              role: "Ward 12",
            },
            {
              quote:
                "Paying my property tax online saved me hours of waiting in line. Simple and secure.",
              author: "Sunita M.",
              role: "Business Owner",
            },
            {
              quote:
                "The transparency in tracking complaint status is amazing. I always know what's happening.",
              author: "Bikash T.",
              role: "Ward 7",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-slate-700 italic mb-6">"{t.quote}"</p>
              <div>
                <p className="font-bold text-blue-900">{t.author}</p>
                <p className="text-xs text-blue-500 font-semibold uppercase">
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto bg-linear-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-64 h-64 bg-indigo-900/20 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Ready to improve your neighborhood?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Join your neighbors in making Pokhara cleaner, safer, and smarter.
            Registration is free and takes less than 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 border-0 h-14 px-8 text-base font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <Link href="/register">Create Citizen Account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-blue-700/30 border-blue-400 text-white hover:bg-blue-700/50 h-14 px-8 text-base font-bold"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  // Data for links
  const footerLinks = {
    quickLinks: [
      { href: "/login", label: "Staff Login" },
      { href: "/register", label: "Citizen Registration" },
      { href: "#", label: "Report Issue" },
      { href: "#", label: "Track Status" },
    ],
    legal: [
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Terms of Service" },
      { href: "#", label: "Accessibility" },
      { href: "#", label: "Data Protection" },
    ],
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 px-6 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6 text-white">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center font-bold">
                SP
              </div>
              <span className="font-bold text-xl">Smart Pokhara</span>
            </div>
            <p className="text-sm mb-6 leading-relaxed">
              The official digital gateway for services, information, and civic
              engagement in Pokhara Metropolitan City.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.quickLinks.map((link) => (
                // FIX: Used link.label as key instead of link.href to avoid duplicates
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6">Legal</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.legal.map((link) => (
                // FIX: Used link.label as key
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 shrink-0" /> New Road, Pokhara-8,
                Kaski
              </li>
              <li className="flex gap-3">
                <Smartphone className="w-4 h-4 shrink-0" /> +977-61-521105
              </li>
              <li className="flex gap-3">
                <span className="font-bold w-4 text-center">@</span>{" "}
                info@pokharamun.gov.np
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-slate-800 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>
            &copy; {currentYear} Pokhara Metropolitan City. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-green-500 font-medium">
              Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
