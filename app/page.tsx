import React from "react";
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
  Heart,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans antialiased bg-gray-50">
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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 group rounded-lg p-1">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2B5F75] to-[#5F9EA0] text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span className="font-bold text-xl tracking-tight font-mono">
                SP
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 tracking-tight leading-none group-hover:text-[#2B5F75] transition-colors">
                Smart Pokhara
              </span>
              <span className="text-[10px] text-[#5F9EA0] font-medium tracking-wider uppercase">
                Government of Nepal
              </span>
            </div>
          </a>

          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#2B5F75] hover:bg-[#2B5F75]/10 rounded-md transition-colors"
            >
              Sign In
            </Link>

            <Link href="/register">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold bg-[#2B5F75] hover:bg-[#2B5F75]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
                <span className="hidden sm:inline">Citizen Registration</span>
                <span className="sm:hidden">Register</span>
                <ChevronRight className="w-4 h-4 hidden sm:block" />
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#2B5F75]/10 to-transparent rounded-[100%] blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#5F9EA0]/30 bg-white/80 backdrop-blur-sm px-4 py-2 mb-8 text-xs font-bold text-[#5F9EA0] uppercase tracking-wider shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5F9EA0] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5F9EA0]"></span>
          </span>
          Live in all 33 Wards
        </div>

        <h1 className="mx-auto max-w-5xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
          A Smarter City Starts <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2B5F75] via-[#5F9EA0] to-[#2B5F75]">
            With Your Voice
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600 leading-relaxed font-medium">
          The official platform to report infrastructure issues, pay municipal
          taxes, and track city progress. Simple, transparent, and direct.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 mb-16 max-w-xl mx-auto">
          <button className="group w-full sm:flex-1 h-14 text-base font-bold bg-[#2B5F75] hover:bg-[#2B5F75]/90 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 rounded-lg inline-flex items-center justify-center gap-2">
            Report an Issue
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:flex-1 h-14 text-base font-bold text-[#2B5F75] bg-white border-2 border-[#2B5F75]/20 hover:border-[#2B5F75] hover:bg-[#2B5F75]/5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 rounded-lg">
            Track Complaint
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {[
            {
              icon: ShieldCheck,
              text: "Government Verified",
              color: "text-[#5F9EA0]",
            },
            { icon: Users, text: "10k+ Citizens", color: "text-[#2B5F75]" },
            {
              icon: TrendingUp,
              text: "500+ Resolved",
              color: "text-[#5F9EA0]",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 shadow-sm"
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-sm font-semibold text-gray-900">
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
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop",
      caption: "Sarangkot Sunrise",
    },
    {
      src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1000&auto=format&fit=crop",
      caption: "The Vibrant Valley",
    },
  ];
  const marqueeImages = [...images, ...images];

  return (
    <section className="relative py-24 bg-[#2B5F75] overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 50s linear infinite; }
          .animate-marquee:hover { animation-play-state: paused; }
        `,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-white/70 mb-3 text-sm font-bold uppercase tracking-widest">
          <MountainSnow className="w-4 h-4" />
          <span>Our Pride</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          The City We Protect Together
        </h2>
        <p className="text-white/80 max-w-xl mx-auto text-lg">
          From the serene Phewa Lake to the majestic Himalayan peaks, every
          corner of Pokhara deserves our care.
        </p>
      </div>

      <div className="relative w-full overflow-hidden group">
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#2B5F75] to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#2B5F75] to-transparent z-20 pointer-events-none"></div>

        <div className="flex animate-marquee gap-6 pl-6 w-max">
          {marqueeImages.map((img, idx) => (
            <div
              key={`${idx}-${img.caption}`}
              className="relative w-[350px] aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-500 shadow-xl border border-white/10"
            >
              <img
                src={img.src}
                alt={img.caption}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-5">
                <p className="text-white font-bold text-lg">{img.caption}</p>
                <div className="h-1 w-8 bg-[#5F9EA0] rounded-full mt-2"></div>
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
      color: "text-[#2B5F75]",
      bg: "bg-[#2B5F75]/5",
    },
    {
      icon: FileText,
      title: "Automatic Routing",
      desc: "System instantly routes your report to the specific Ward Officer.",
      color: "text-[#5F9EA0]",
      bg: "bg-[#5F9EA0]/5",
    },
    {
      icon: CheckCircle2,
      title: "Get Resolved",
      desc: "Receive real-time notifications when the work is completed.",
      color: "text-[#5F9EA0]",
      bg: "bg-[#5F9EA0]/5",
    },
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="text-[#5F9EA0] font-bold tracking-wider uppercase text-sm">
            Simple Process
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#2B5F75]/20 via-[#5F9EA0]/20 to-[#5F9EA0]/20"></div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div
                className={`h-20 w-20 rounded-2xl ${step.bg} flex items-center justify-center mb-6 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 border border-gray-100`}
              >
                <step.icon className={`w-10 h-10 ${step.color}`} />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-xs">
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
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Everything You Need to Connect
          </h2>
          <p className="text-lg text-gray-600">
            Smart Pokhara bridges the gap between citizens and local government.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {features.map((group, groupIdx) => (
            <div
              key={groupIdx}
              className="bg-white p-8 rounded-3xl shadow-md border border-gray-200"
            >
              <h3 className="text-sm font-bold text-[#5F9EA0] uppercase tracking-wider mb-8 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[#5F9EA0] rounded-full"></span>
                {group.title}
              </h3>
              <div className="space-y-6">
                {group.items.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-[#2B5F75]/5 text-[#2B5F75] flex items-center justify-center group-hover:bg-[#2B5F75] group-hover:text-white transition-colors duration-300">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#2B5F75] transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
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
    <section className="py-20 bg-gradient-to-br from-[#2B5F75] to-[#5F9EA0] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors backdrop-blur-sm"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-white opacity-90" />
              <div className="text-5xl font-extrabold mb-2 font-mono">
                {stat.number}
              </div>
              <div className="text-sm font-medium text-white/90 uppercase tracking-widest">
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
          <Heart className="w-8 h-8 text-[#E5793F] mx-auto mb-4 fill-[#E5793F]/10" />
          <h2 className="text-4xl font-bold text-gray-900">
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
              className="p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-[#E5793F] text-lg">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">"{t.quote}"</p>
              <div>
                <p className="font-bold text-gray-900">{t.author}</p>
                <p className="text-xs text-[#5F9EA0] font-semibold uppercase">
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
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#2B5F75] to-[#5F9EA0] rounded-[2.5rem] p-16 text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-64 h-64 bg-[#2B5F75]/20 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h2 className="text-5xl font-extrabold mb-6 tracking-tight">
            Ready to improve your neighborhood?
          </h2>
          <p className="text-white/95 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Join your neighbors in making Pokhara cleaner, safer, and smarter.
            Registration is free and takes less than 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-[#2B5F75] hover:bg-white/95 h-14 px-8 text-base font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 hover:scale-105 rounded-lg">
              Create Citizen Account
            </button>
            <button className="bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 h-14 px-8 text-base font-bold backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 rounded-lg">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 pt-20 pb-10 px-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6 text-white">
              <div className="h-8 w-8 rounded bg-[#2B5F75] flex items-center justify-center font-bold font-mono">
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
              <li>
                <a href="#" className="hover:text-[#5F9EA0] transition-colors">
                  Staff Login
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#5F9EA0] transition-colors">
                  Citizen Registration
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#5F9EA0] transition-colors">
                  Report Issue
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#5F9EA0] transition-colors">
                  Track Status
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-[#5F9EA0] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#5F9EA0] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#5F9EA0] transition-colors">
                  Accessibility
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#5F9EA0] transition-colors">
                  Data Protection
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 shrink-0" /> New Road, Pokhara-8,
                Kaski
              </li>
              <li className="flex gap-3 font-mono">
                <Smartphone className="w-4 h-4 shrink-0" /> +977-61-521105
              </li>
              <li className="flex gap-3">
                <span className="font-bold w-4 text-center">@</span>
                info@pokharamun.gov.np
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p className="text-gray-500">
              &copy; {currentYear} Pokhara Metropolitan City. All rights
              reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5F9EA0] animate-pulse"></span>
              <span className="text-[#5F9EA0] font-medium">
                Systems Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
