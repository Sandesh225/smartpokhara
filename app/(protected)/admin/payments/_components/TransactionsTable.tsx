import { PaymentTransaction } from "@/types/admin-payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Flag, CornerUpLeft } from "lucide-react";

interface TransactionsTableProps {
  data: PaymentTransaction[];
}

export function TransactionsTable({ data }: TransactionsTableProps) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
           <tr>
             <th className="px-6 py-3">Date</th>
             <th className="px-6 py-3">Transaction ID</th>
             <th className="px-6 py-3">Payer</th>
             <th className="px-6 py-3">Method</th>
             <th className="px-6 py-3 text-right">Amount</th>
             <th className="px-6 py-3 text-center">Status</th>
             <th className="px-6 py-3 text-right">Actions</th>
           </tr>
        </thead>
        <tbody className="divide-y">
           {data.map((txn) => (
             <tr key={txn.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">
                   {format(new Date(txn.created_at), "MMM d, HH:mm")}
                </td>
                <td className="px-6 py-4 font-mono text-xs">{txn.transaction_id}</td>
                <td className="px-6 py-4">
                   <div className="font-medium">{txn.citizen.full_name}</div>
                   <div className="text-xs text-gray-500">{txn.bill.bill_type.replace('_', ' ')}</div>
                </td>
                <td className="px-6 py-4 capitalize">{txn.payment_method.replace('_', ' ')}</td>
                <td className="px-6 py-4 text-right font-bold">
                   NPR {txn.amount_paid.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                   <Badge variant={txn.status === 'completed' ? 'default' : 'destructive'} className={txn.status === 'completed' ? 'bg-green-600' : ''}>
                      {txn.status}
                   </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Receipt">
                         <Eye className="w-4 h-4 text-gray-500"/>
                      </Button>
                      <Button variant="ghost" size="icon" title="Flag as Suspicious">
                         <Flag className="w-4 h-4 text-amber-500"/>
                      </Button>
                   </div>
                </td>
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
}