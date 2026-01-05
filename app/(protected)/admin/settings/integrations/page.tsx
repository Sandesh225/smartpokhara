import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import IntegrationKeys from "../_components/IntegrationKeys";
import PaymentGatewayCard from "../_components/PaymentGatewayConfig";

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link
            href="/admin/settings"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PaymentGatewayCard provider="eSewa" active={true} />
          <PaymentGatewayCard provider="Khalti" active={true} />
          <PaymentGatewayCard provider="IME Pay" active={false} />
          <PaymentGatewayCard provider="Connect IPS" active={true} />
        </div>

        <IntegrationKeys />
      </div>
    </div>
  );
}
