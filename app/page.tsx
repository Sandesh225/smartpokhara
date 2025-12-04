import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";

export default async function LandingPage() {
  const user = await getCurrentUserWithRoles();

  if (user) {
    const dashboardPath = getDefaultDashboardPath(user);
    redirect(dashboardPath);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-lg font-bold text-white shadow-lg group-hover:shadow-xl transition-shadow">
              SP
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Smart Pokhara
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                पोखरा महानगरपालिका
              </p>
            </div>
          </Link>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="mx-auto max-w-7xl text-center">
        <div className="inline-block mb-6 px-4 py-2 bg-blue-100 rounded-full">
          <span className="text-sm font-semibold text-blue-700">
            🚀 Welcome to the Future
          </span>
        </div>

        <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent leading-tight">
          Transform Your City Experience
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-gray-600 leading-relaxed">
          Report issues, track complaints, and access municipal services
          seamlessly.
          <span className="font-semibold text-gray-900">
            {" "}
            Making Pokhara smarter, one solution at a time.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 rounded-xl shadow-lg hover:bg-blue-50 hover:scale-105 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-sm">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600">1000+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">Issues Resolved</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600">33</div>
            <div className="text-gray-600">Wards Covered</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "📝",
      title: "Submit Complaints",
      description:
        "Report issues in your area quickly and easily with photo attachments and GPS location.",
    },
    {
      icon: "💳",
      title: "Pay Bills Online",
      description:
        "Pay municipal bills conveniently from anywhere with secure payment integration.",
    },
    {
      icon: "📊",
      title: "Track Progress",
      description:
        "Monitor complaint status in real-time and see how the city addresses issues.",
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description:
        "Get instant updates via SMS, email, or push notifications about your requests.",
    },
    {
      icon: "🏘️",
      title: "Ward Information",
      description:
        "Access comprehensive information about your ward, offices, and contact details.",
    },
    {
      icon: "📢",
      title: "Public Notices",
      description:
        "Stay informed with latest announcements and notices from Pokhara Metropolitan City.",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to interact with your city government
            efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl bg-white p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden"
            >
              <div className="relative z-10">
                <div className="mb-4 text-5xl">{feature.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
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
    { number: "33", label: "Wards", icon: "🗺️" },
    { number: "1000+", label: "Users", icon: "👥" },
    { number: "500+", label: "Resolved", icon: "✅" },
    { number: "7", label: "Departments", icon: "🏛️" },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Our Impact</h2>
          <p className="text-lg text-blue-100">
            Making Pokhara smarter every single day
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-black mb-2">
                {stat.number}
              </div>
              <div className="text-blue-100 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Ready to Make a Difference?
        </h2>
        <p className="text-xl text-blue-100 mb-10 leading-relaxed">
          Join thousands of citizens actively improving Pokhara. Sign up today
          and start reporting issues that matter.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 hover:scale-105 transition-all duration-200"
          >
            Already a Member?
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-bold text-white">
                SP
              </div>
              <span className="font-bold text-white">Smart Pokhara</span>
            </Link>
            <p className="text-sm text-gray-400">
              Empowering citizens to build a smarter, more responsive city.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span>📞</span> +977-61-XXXXXX
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span> info@pokharamun.gov.np
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {currentYear} Pokhara Metropolitan City. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
