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
} from "lucide-react";

export default async function LandingPage() {
  const user = await getCurrentUserWithRoles();

  if (user) {
    const dashboardPath = getDefaultDashboardPath(user);
    redirect(dashboardPath);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 antialiased">
      {/* Enhanced Top Trust Bar with Gradient */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-300 text-[11px] sm:text-xs py-2 px-4 text-center sm:text-left border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="font-semibold">
              Official Digital Platform of Pokhara Metropolitan City
            </span>
          </span>
          <div className="hidden sm:flex gap-4 items-center">
            <span className="hover:text-white cursor-pointer transition-all hover:scale-105">
              Support
            </span>
            <span className="hover:text-white cursor-pointer transition-all hover:scale-105">
              Emergency Contacts
            </span>
            <span className="text-slate-600">|</span>
            <span className="hover:text-white cursor-pointer transition-all hover:scale-105 flex items-center gap-1">
              <Globe className="w-3 h-3" /> EN
            </span>
          </div>
        </div>
      </div>

      <Header />

      <main>
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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo & Branding */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1 transition-all"
          >
            <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative font-bold text-xl sm:text-2xl tracking-tight">
                SP
              </span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                Smart Pokhara
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                Government of Nepal
              </p>
            </div>
          </Link>

          {/* Enhanced Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-105"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="group hidden sm:inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
            >
              Citizen Registration
              <ChevronRight className="w-4 h-4 text-blue-100 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            {/* Enhanced Mobile CTA */}
            <Link
              href="/register"
              className="sm:hidden inline-flex items-center justify-center h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg shadow-md shadow-blue-500/30 hover:scale-105 transition-all"
              aria-label="Register"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-36 px-4 sm:px-6 lg:px-8">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-1/4 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-400 opacity-20 blur-[120px] animate-pulse"></div>
        <div
          className="absolute right-1/4 bottom-0 -z-10 h-[300px] w-[300px] rounded-full bg-indigo-400 opacity-15 blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="mx-auto max-w-7xl text-center">
        {/* Enhanced Badge with Animation */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-1.5 mb-8 backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
          <span className="flex h-2 w-2 rounded-full bg-blue-600">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
          </span>
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
            Live in all 33 Wards
          </span>
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        </div>

        {/* Enhanced Headline with Better Typography */}
        <h1 className="mx-auto max-w-5xl text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.08]">
          A Smarter City Starts <br className="hidden md:block" />
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              With Your Voice
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/50 via-indigo-400/50 to-blue-400/50 blur-sm"></span>
          </span>
        </h1>

        {/* Enhanced Subhead */}
        <p className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
          The official platform to report infrastructure issues, pay municipal
          taxes, and track city progress.
          <span className="hidden sm:inline block mt-2 text-slate-500">
            Simple, transparent, and direct to the authorities.
          </span>
        </p>

        {/* Enhanced CTAs with Better Visual Hierarchy */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-14">
          <Link
            href="/register"
            className="group w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Report an Issue
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Track Existing Complaint
          </Link>
        </div>

        {/* Enhanced Trust Signals with Icons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-slate-700">
              Official Government Platform
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">
              10,000+ Citizens
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-700">
              500+ Issues Resolved
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BeautySection() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1652788608087-e8f766b0a93e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Phewa Lake Boat",
      caption: "Phewa Lake Serenity",
    },
    {
      src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
      alt: "Machhapuchhre Mountain View",
      caption: "Machhapuchhre Range",
    },
    {
      src: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop",
      alt: "World Peace Pagoda",
      caption: "World Peace Pagoda",
    },
    {
      src: "https://www.thirdrockadventures.com/assets-back/images/trip/pokhara-sarangkot.jpgDFn.jpg",
      alt: "Sarangkot Sunrise",
      caption: "Sarangkot Sunrise View",
    },
    {
      src: "https://media.app.beyondthelimitstreks.com/uploads/fullbanner/pokhara-city-1.webp",
      alt: "Pokhara Valley",
      caption: "The Vibrant Valley",
    },
  ];

  const marqueeImages = [...images, ...images];

  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `,
        }}
      />

      {/* Enhanced Gradient Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-slate-900 via-transparent to-slate-900"></div>
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-20 text-center">
        <div className="inline-flex items-center gap-2 text-blue-300 mb-4">
          <MountainSnow className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Our Pride
          </span>
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-3">
          The City We Protect Together
        </h2>
        <p className="text-blue-200/80 text-base max-w-2xl mx-auto">
          From the serene Phewa Lake to the majestic Himalayan peaks, every
          corner of Pokhara deserves our care
        </p>
      </div>

      <div className="flex relative w-full overflow-hidden z-0">
        <div className="flex animate-marquee gap-6 pl-6">
          {marqueeImages.map((img, idx) => (
            <div
              key={idx + img.src.slice(0, 5)}
              className="relative flex-shrink-0 w-[300px] md:w-[400px] h-[220px] md:h-[280px] rounded-2xl overflow-hidden group shadow-2xl"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-bold text-base sm:text-lg mb-1">
                    {img.caption}
                  </p>
                  <div className="w-12 h-1 bg-blue-400 rounded-full"></div>
                </div>
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
      desc: "Take a photo of the issue (pothole, waste, light) and upload it with precise location.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FileText,
      title: "Automatic Routing",
      desc: "Our intelligent system sends it directly to the responsible Ward Officer instantly.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: CheckCircle2,
      title: "Get Resolved",
      desc: "Receive real-time updates and notifications when the work is completed.",
      color: "from-blue-600 to-indigo-600",
    },
  ];

  return (
    <section className="py-24 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 text-blue-600 mb-4">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">
              Simple Process
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-5">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From submission to solution in three simple steps. Fast,
            transparent, and effective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Enhanced Connection Line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-blue-200 via-indigo-300 to-blue-200 z-0 rounded-full"></div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div
                className={`h-20 w-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300`}
              >
                <step.icon className="w-9 h-9" />
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200">
                <h3 className="font-bold text-slate-900 text-xl mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
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
          desc: "Pinpoint exact locations with GPS for faster and more accurate resolution.",
          gradient: "from-blue-500 to-blue-600",
        },
        {
          icon: CreditCard,
          title: "Digital Tax Payment",
          desc: "Pay property and business taxes securely online with instant receipts.",
          gradient: "from-indigo-500 to-indigo-600",
        },
        {
          icon: Bell,
          title: "Status Alerts",
          desc: "Receive SMS & Email notifications with every update on your request.",
          gradient: "from-blue-600 to-indigo-600",
        },
      ],
    },
    {
      title: "City Transparency",
      items: [
        {
          icon: Building2,
          title: "Ward Profiles",
          desc: "Direct contact information for your elected representatives and officers.",
          gradient: "from-indigo-500 to-purple-600",
        },
        {
          icon: Info,
          title: "Public Notices",
          desc: "Stay informed with official announcements and road closure alerts.",
          gradient: "from-blue-500 to-indigo-600",
        },
        {
          icon: CheckCircle2,
          title: "Performance Tracker",
          desc: "See real-time statistics on how fast your ward resolves complaints.",
          gradient: "from-indigo-600 to-blue-600",
        },
      ],
    },
  ];

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl"></div>

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-blue-600 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">
              Powerful Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Everything You Need to Connect with City Hall
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Smart Pokhara bridges the gap between citizens and local government
            with transparency, efficiency, and care.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-16">
          {features.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  {group.title}
                </h3>
              </div>
              <div className="grid gap-6">
                {group.items.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group relative flex items-start p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="shrink-0 mr-5 relative z-10">
                      <div
                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <feature.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-lg font-bold text-slate-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
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
    { number: "24h", label: "Avg. Response Time", icon: Zap },
    { number: "500+", label: "Issues Resolved (2025)", icon: CheckCircle2 },
    { number: "100%", label: "Verified Citizens", icon: ShieldCheck },
  ];

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-blue-200/80 text-lg max-w-2xl mx-auto">
            Real numbers from our growing community of engaged citizens
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-5xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-blue-200 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
          <p className="text-blue-100 italic text-lg mb-3">
            "We are committed to building a transparent, accountable, and smart
            city for everyone."
          </p>
          <p className="text-blue-300 text-sm font-semibold">
            — Office of the Mayor, Pokhara
          </p>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "I reported a pothole near my house and it was fixed within 48 hours. This platform actually works!",
      author: "Ramesh K.",
      role: "Ward 12 Resident",
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
      role: "Ward 7 Resident",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-blue-600 mb-4">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">
              From Our Citizens
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-5">
            Real Stories, Real Impact
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See how Smart Pokhara is making a difference in our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="group bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl group-hover:bg-blue-400/10 transition-all"></div>
              <div className="relative z-10">
                <div className="text-blue-600 mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-slate-700 text-base leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {testimonial.author}
                    </p>
                    <p className="text-slate-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
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
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 px-6 py-16 sm:px-16 sm:py-20 text-center shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-400/30 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Ready to improve your neighborhood?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join your neighbors in making Pokhara cleaner, safer, and smarter.
              Registration is free and takes less than 2 minutes.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link
                href="/register"
                className="group px-8 py-4 text-base font-bold text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 focus-visible:ring-white hover:scale-105 duration-200 flex items-center justify-center gap-2"
              >
                Create Citizen Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 text-base font-bold text-white border-2 border-blue-300/50 bg-blue-600/30 backdrop-blur-sm rounded-xl hover:bg-blue-600/50 hover:border-blue-200 transition-all shadow-lg hover:scale-105 duration-200"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100/90 text-sm">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Secure
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Official
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Data Privacy Protected
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.3),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.3),transparent)]"></div>
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                SP
              </div>
              <span className="font-bold text-white text-lg">
                Smart Pokhara
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              The official digital gateway for services, information, and civic
              engagement in Pokhara Metropolitan City.
            </p>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer hover:scale-110">
                <Globe className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer hover:scale-110">
                <Info className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-sm flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/login"
                  className="hover:text-blue-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Staff Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-blue-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Citizen Registration
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Report Issue
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Track Status
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-sm flex items-center gap-2">
              <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
              Legal & Policy
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Accessibility
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Data Protection
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-sm flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <span>
                  New Road, Pokhara-8,
                  <br />
                  Kaski, Gandaki Province
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>+977-61-521105</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-4 h-4 text-blue-500 font-bold flex-shrink-0">
                  @
                </div>
                <span>info@pokharamun.gov.np</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-2">
            &copy; {currentYear} Pokhara Metropolitan City. All rights reserved.
          </p>
          <div className="flex gap-6 items-center">
            <span className="text-slate-600">System Version 2.0.4</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-green-400">Systems Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}