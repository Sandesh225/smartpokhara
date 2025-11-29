// app/page.tsx
// Enhanced Landing Page with Modern Design & Animations

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
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
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
              <p className="text-xs text-gray-500 font-medium">पोखरा महानगरपालिका</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            <Link href="#stats" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Impact
            </Link>
          </nav>

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
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="mx-auto max-w-7xl text-center">
        <div className="inline-block mb-6 px-4 py-2 bg-blue-100 rounded-full">
          <span className="text-sm font-semibold text-blue-700">🚀 Welcome to the Future</span>
        </div>

        <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent leading-tight">
          Transform Your City Experience
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-gray-600 leading-relaxed">
          Report issues, track complaints, and access municipal services seamlessly. 
          <span className="font-semibold text-gray-900"> Making Pokhara smarter, one solution at a time.</span>
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
      description: "Report issues in your area quickly and easily with photo attachments and GPS location.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "💳",
      title: "Pay Bills Online",
      description: "Pay municipal bills conveniently from anywhere with secure payment integration.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: "📢",
      title: "Public Notices",
      description: "Stay informed with latest announcements and notices from Pokhara Metropolitan City.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: "🏘️",
      title: "Ward Information",
      description: "Access comprehensive information about your ward, offices, and contact details.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: "📊",
      title: "Track Progress",
      description: "Monitor complaint status in real-time and see how the city addresses issues.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description: "Get instant updates via SMS, email, or push notifications about your requests.",
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to interact with your city government efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group relative rounded-2xl bg-white p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

      <div className="relative z-10">
        <div className="mb-4 text-5xl">{icon}</div>
        <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href="/login"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Learn more →
          </Link>
        </div>
      </div>
    </div>
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
    <section id="stats" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Our Impact
          </h2>
          <p className="text-lg text-blue-100">
            Making Pokhara smarter every single day
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ number, label, icon }: { number: string; label: string; icon: string }) {
  return (
    <div className="text-center group">
      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-4xl md:text-5xl font-black mb-2">{number}</div>
      <div className="text-blue-100 font-medium">{label}</div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { number: "1", title: "Create Account", description: "Sign up in seconds with your email" },
    { number: "2", title: "Report Issues", description: "Submit complaints with photos and location" },
    { number: "3", title: "Track Progress", description: "Monitor updates in real-time" },
    { number: "4", title: "See Results", description: "Watch your city improve" },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Getting started is simple and takes just a few minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200 -z-10"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-black text-xl mb-4 shadow-lg relative z-10">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Resident, Ward 15",
      content: "Amazing app! My pothole complaint was fixed within 2 weeks. Transparency at its best!",
      avatar: "RK",
    },
    {
      name: "Priya Sharma",
      role: "Business Owner, Ward 22",
      content: "Paying bills has never been easier. Instant confirmation and digital receipts. Highly recommended!",
      avatar: "PS",
    },
    {
      name: "Amit Poudel",
      role: "Community Leader, Ward 8",
      content: "The public notices feature keeps us updated on all municipal activities. Very helpful!",
      avatar: "AP",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            What Users Say
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of satisfied citizens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  name,
  role,
  content,
  avatar,
}: {
  name: string;
  role: string;
  content: string;
  avatar: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8 shadow-md hover:shadow-lg transition-shadow border border-slate-200">
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400">
            ★
          </span>
        ))}
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed italic">"{content}"</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
          {avatar}
        </div>
        <div>
          <p className="font-bold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
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
          Join thousands of citizens actively improving Pokhara. Sign up today and start reporting issues that matter.
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
          {/* Brand */}
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

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
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
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span>📞</span> +977-61-XXXXXX
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span> info@pokharamun.gov.np
              </li>
              <li className="flex items-center gap-2">
                <span>🌐</span> www.pokharamun.gov.np
              </li>
              <li className="text-gray-500 pt-2">
                Gandaki Province, Nepal
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Pokhara Metropolitan City. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}