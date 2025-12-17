import { ReconciliationReport } from "../_components/ReconciliationReport";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function ReconciliationPage() {
  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">Daily Reconciliation</h1>
             <p className="text-gray-500">Match system records with payment gateway settlements.</p>
          </div>
          <Button>
             <Upload className="w-4 h-4 mr-2" /> Upload Bank Statement
          </Button>
       </div>

       <ReconciliationReport />
       
       <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
          <strong>Tip:</strong> Upload the CSV file provided by eSewa/Khalti merchant portal to automatically detect discrepancies.
       </div>
    </div>
  );
}