import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import SLAConfigurator from '../_components/SLAConfigurator';

export default function SLAPage() {
  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/admin/settings" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Service Level Agreements</h1>
        </div>
        <SLAConfigurator />
      </div>
    </div>
  );
}