// app/page.tsx
// ✅ FIXED: Sign In button properly links to /login

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";

export default async function LandingPage() {
  const user = await getCurrentUserWithRoles();

  // If user is authenticated, redirect to their appropriate dashboard
  if (user) {
    const dashboardPath = getDefaultDashboardPath(user);
    redirect(dashboardPath);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white">
              SP
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Smart City Pokhara
              </h1>
              <p className="text-xs text-gray-500">पोखरा महानगरपालिका</p>
            </div>
          </Link>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
            Welcome to Smart City Pokhara
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
            Report issues, track complaints, and access municipal services all
            in one place. Making Pokhara a better place to live, one complaint
            at a time.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border-2 border-blue-600 bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-colors hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h3 className="mb-12 text-center text-3xl font-bold text-gray-900">
          Our Services
        </h3>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard
            icon="📝"
            title="Submit Complaints"
            description="Report issues in your area quickly and easily. Track the status of your complaints in real-time."
          />
          <FeatureCard
            icon="💳"
            title="Pay Bills Online"
            description="Pay your municipal bills conveniently from anywhere. View payment history and download receipts."
          />
          <FeatureCard
            icon="📢"
            title="Public Notices"
            description="Stay informed with the latest announcements and notices from Pokhara Metropolitan City."
          />
          <FeatureCard
            icon="🏘️"
            title="Ward Information"
            description="Access information about your ward, including office locations and contact details."
          />
          <FeatureCard
            icon="📊"
            title="Track Progress"
            description="Monitor the status of your complaints and see how the city is addressing issues."
          />
          <FeatureCard
            icon="🔔"
            title="Get Notifications"
            description="Receive updates via SMS, email, or in-app notifications about your complaints."
          />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <StatCard number="33" label="Wards" />
            <StatCard number="1000+" label="Registered Users" />
            <StatCard number="500+" label="Resolved Complaints" />
            <StatCard number="7" label="Departments" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h3 className="mb-4 text-3xl font-bold text-gray-900">
          Ready to get started?
        </h3>
        <p className="mb-8 text-xl text-gray-600">
          Join thousands of citizens making Pokhara a better place
        </p>
        <Link
          href="/register"
          className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h4 className="mb-4 font-semibold text-white">
                Smart City Pokhara
              </h4>
              <p className="text-sm">
                पोखरा महानगरपालिका
                <br />
                Pokhara Metropolitan City
                <br />
                Gandaki Province, Nepal
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 +977-61-XXXXXX</li>
                <li>📧 info@pokharamun.gov.np</li>
                <li>🌐 www.pokharamun.gov.np</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} Pokhara Metropolitan City. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="mb-4 text-4xl">{icon}</div>
      <h4 className="mb-2 text-xl font-semibold text-gray-900">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="mb-2 text-4xl font-bold">{number}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  );
}
