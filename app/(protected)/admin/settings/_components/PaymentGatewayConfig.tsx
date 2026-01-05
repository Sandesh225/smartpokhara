import { CreditCard } from "lucide-react";

export default function PaymentGatewayCard({
  provider,
  active,
}: {
  provider: string;
  active: boolean;
}) {
  return (
    <div
      className={`border rounded-xl p-5 transition-all ${
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-white opacity-70 grayscale"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
            <CreditCard className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h4 className="font-bold text-foreground capitalize">{provider}</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {active ? "Active" : "Disabled"}
            </span>
          </div>
        </div>
        <div className="relative inline-block w-10 h-6 align-middle select-none">
          <input
            type="checkbox"
            defaultChecked={active}
            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
            style={{ left: active ? "1.25rem" : "0" }}
          />
          <div
            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
              active ? "bg-primary" : "bg-gray-300"
            }`}
          ></div>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Merchant ID"
          className="dept-input-base w-full text-xs"
        />
        <input
          type="password"
          placeholder="Secret Key"
          className="dept-input-base w-full text-xs"
        />
      </div>
    </div>
  );
}
