import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function PendingBillsList({ bills }: { bills: any[] }) {
  return (
    <Card className="h-full">
       <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Accounts Receivable</CardTitle>
          <Button size="sm" variant="outline">
             <BellRing className="w-4 h-4 mr-2" /> Remind All
          </Button>
       </CardHeader>
       <CardContent>
          <div className="space-y-4">
             {bills.map((bill) => (
                <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                   <div>
                      <p className="font-medium text-sm">{bill.citizen?.profile?.full_name}</p>
                      <p className="text-xs text-gray-500">
                         {bill.bill_type.replace('_', ' ')} • Due {formatDistanceToNow(new Date(bill.due_date), { addSuffix: true })}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-sm">NPR {bill.total_amount}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">Send Reminder</Button>
                   </div>
                </div>
             ))}
             {bills.length === 0 && <p className="text-center text-gray-500 py-4">No pending bills.</p>}
          </div>
       </CardContent>
    </Card>
  );
}