/**
 * Public Layout - For authentication pages
 * No authentication required
 */
//app/(public)/layout.tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header for branding */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              SP
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smart City Pokhara</h1>
              <p className="text-xs text-gray-500">पोखरा महानगरपालिका</p>
            </div>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Simple footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Pokhara Metropolitan City. All rights reserved.</p>
      </footer>
    </div>
  );
}