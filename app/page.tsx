import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/auth/role-helpers";

export default async function LandingPage() {
  const user = await getCurrentUserWithRoles();

  // If user is already logged in, redirect to their appropriate dashboard
  if (user) {
    const dashboardPath = getDefaultDashboardPath(user);
    redirect(dashboardPath);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                SP
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Smart City Pokhara
                </h1>
                <p className="text-xs text-gray-500">पोखरा महानगरपालिका</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to Smart City Pokhara
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Report issues, track complaints, and access municipal services all
            in one place. Making Pokhara a better place to live, one complaint
            at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-blue-600"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Our Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="33" label="Wards" />
            <StatCard number="1000+" label="Registered Users" />
            <StatCard number="500+" label="Resolved Complaints" />
            <StatCard number="7" label="Departments" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to get started?
        </h3>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of citizens making Pokhara a better place
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">
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
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
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
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 +977-61-XXXXXX</li>
                <li>📧 info@pokharamun.gov.np</li>
                <li>🌐 www.pokharamun.gov.np</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
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
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h4 className="text-xl font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  );
}
