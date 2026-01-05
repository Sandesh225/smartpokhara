import { PaymentHistoryItem } from "@/types/admin-citizens";
import { Wallet, AlertCircle, CheckCircle2 } from "lucide-react";

export default function CitizenWalletView({
  bills,
}: {
  bills: PaymentHistoryItem[];
}) {
  const totalDue = bills
    .filter((b) => b.status === "pending")
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  const totalPaid = bills
    .filter((b) => b.status === "completed")
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-medium opacity-90">Total Paid</span>
        </div>
        <p className="text-2xl font-bold">NPR {totalPaid.toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2 text-red-600">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="font-medium">Outstanding Due</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          NPR {totalDue.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {bills.filter((b) => b.status === "pending").length} pending bills
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2 text-green-600">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-medium">Payment Reliability</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {bills.length > 0
            ? Math.round(
                (bills.filter((b) => b.status === "completed").length /
                  bills.length) *
                  100
              )
            : 0}
          %
        </div>
        <p className="text-xs text-gray-500 mt-1">Completion rate</p>
      </div>
    </div>
  );
}
