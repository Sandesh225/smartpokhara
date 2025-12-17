import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

export function ReconciliationReport() {
  // Mock data for UI structure - Real implementation would fetch from rpc_get_reconciliation
  const data = {
     systemTotal: 1250000,
     gatewayTotal: 1248500,
     discrepancy: 1500,
     mismatchedTxns: [
        { id: "TXN-8821", system: 5000, gateway: 0, status: "Missing in Gateway" },
        { id: "TXN-9932", system: 1500, gateway: 3000, status: "Amount Mismatch" }
     ]
  };

  const isMatched = data.discrepancy === 0;

  return (
    <Card>
       <CardHeader><CardTitle>Daily Reconciliation</CardTitle></CardHeader>
       <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
             <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 uppercase font-bold">System Record</div>
                <div className="text-xl font-bold mt-1">NPR {data.systemTotal.toLocaleString()}</div>
             </div>
             <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-600 uppercase font-bold">Bank Statement</div>
                <div className="text-xl font-bold mt-1">NPR {data.gatewayTotal.toLocaleString()}</div>
             </div>
             <div className={`p-4 rounded-lg ${isMatched ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-xs uppercase font-bold ${isMatched ? 'text-green-600' : 'text-red-600'}`}>
                   Discrepancy
                </div>
                <div className={`text-xl font-bold mt-1 ${isMatched ? 'text-green-700' : 'text-red-700'}`}>
                   NPR {data.discrepancy.toLocaleString()}
                </div>
             </div>
          </div>

          {!isMatched && (
             <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Mismatched Transactions</div>
                {data.mismatchedTxns.map((txn) => (
                   <div key={txn.id} className="flex justify-between items-center p-4 border-b last:border-0">
                      <div className="flex items-center gap-3">
                         <AlertCircle className="h-5 w-5 text-red-500" />
                         <div>
                            <div className="font-mono font-medium">{txn.id}</div>
                            <div className="text-xs text-red-600">{txn.status}</div>
                         </div>
                      </div>
                      <div className="text-right text-xs">
                         <div>Sys: {txn.system}</div>
                         <div>Bank: {txn.gateway}</div>
                      </div>
                   </div>
                ))}
             </div>
          )}
          
          {isMatched && (
             <div className="flex flex-col items-center justify-center py-6 text-green-600">
                <CheckCircle className="h-12 w-12 mb-2" />
                <p className="font-medium">All records match perfectly.</p>
             </div>
          )}
       </CardContent>
    </Card>
  );
}