export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Note: The <Toaster /> is already in app/providers.tsx 
         so it will work here automatically without adding it again.
      */}
      {children}
    </div>
  );
}
