import { ComplaintHistoryItem } from "@/types/admin-citizens";
import { format } from "date-fns";
import Link from "next/link";

const statusColors: Record<string, string> = {
  received: "bg-gray-100 text-gray-700",
  under_review: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-800",
  rejected: "bg-red-100 text-red-700",
};

export default function ComplaintHistory({
  complaints,
}: {
  complaints: ComplaintHistoryItem[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Complaint History</h3>
        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
          {complaints.length} Total
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {complaints.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No complaints found.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Tracking ID
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-mono text-xs">
                    {c.tracking_code}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {c.category?.name}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
                        statusColors[c.status] || "bg-gray-100"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {format(new Date(c.submitted_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/admin/complaints/${c.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Details
                    </Link>
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
