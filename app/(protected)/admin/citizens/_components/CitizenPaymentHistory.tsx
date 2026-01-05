import { PaymentHistoryItem } from "@/types/admin-citizens";
import { format } from "date-fns";

export default function CitizenPaymentHistory({
  payments,
}: {
  payments: PaymentHistoryItem[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900">Billing & Payments</h3>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No billing history available.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Bill Type
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-900 capitalize">
                      {p.bill_type.replace("_", " ")}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      #{p.bill_number}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium">
                    NPR {p.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    {p.status === "completed" ? (
                      <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded capitalize">
                        {p.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {format(new Date(p.generated_date), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
