import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FraudDetection() {
  return (
    <Card className="border-red-100 bg-red-50/30">
       <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
             <ShieldAlert className="h-4 w-4" /> Suspicious Activity
          </CardTitle>
       </CardHeader>
       <CardContent>
          <div className="space-y-3">
             <div className="bg-white p-3 rounded border border-red-100 shadow-sm flex justify-between items-center">
                <div>
                   <p className="text-sm font-medium text-gray-900">High Velocity Transactions</p>
                   <p className="text-xs text-gray-500">User #8821 made 5 payments in 1 minute.</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Review</Button>
             </div>
          </div>
       </CardContent>
    </Card>
  );
}