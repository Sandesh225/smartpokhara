import { Clock, Settings, Map, Phone } from "lucide-react";

export default function ServicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 text-slate-900">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 tracking-tight">
          Services Coming Soon
        </h1>
        <p className="text-lg text-slate-600 mb-12">
          We're crafting powerful tools and smart digital services to elevate
          your experience. Stay tuned for what's next!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-10">
          <div className="flex flex-col items-center gap-3">
            <Clock className="w-14 h-14 text-blue-600" />
            <span className="text-base">Fast Support</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Settings className="w-14 h-14 text-blue-600" />
            <span className="text-base">Smart Tools</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Map className="w-14 h-14 text-blue-600" />
            <span className="text-base">Location Services</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Phone className="w-14 h-14 text-blue-600" />
            <span className="text-base">24/7 Support</span>
          </div>
        </div>

        <p className="mt-14 text-sm opacity-60">
          New features will be available soon. Thank you for your patience!
        </p>
      </div>
    </div>
  );
}
