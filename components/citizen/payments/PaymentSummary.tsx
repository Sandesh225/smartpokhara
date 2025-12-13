// components/citizen/payments/PaymentSummary.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Alert, AlertDescription } from "@/ui/alert";
import { Calendar, FileText, AlertCircle, CheckCircle, CreditCard, Info, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PaymentSummaryProps {
  bill: any;
  lateFee: number;
  totalAmount: number;
  onPrint?: () => void;
  onDownload?: () => void;
}

export default function PaymentSummary({
  bill,
  lateFee,
  totalAmount,
  onPrint,
  onDownload
}: PaymentSummaryProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getBillTypeLabel = (billType: string) => {
    const labels: Record<string, string> = {
      property_tax: "Property Tax",
      water_bill: "Water Bill",
      electricity_bill: "Electricity Bill",
      waste_management: "Waste Management",
      parking_fee: "Parking Fee",
      business_license: "Business License",
      building_permit: "Building Permit",
      event_permit: "Event Permit",
      other: "Other"
    };
    return labels[billType] || billType.replace(/_/g, " ");
  };

  const dueDate = new Date(bill.due_date);
  const isOverdue = bill.is_overdue;
  const isPaid = bill.status === "completed";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
          <div className="flex gap-2">
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <FileText className="mr-2 h-4 w-4" />
                Print
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex justify-center">
          {isPaid ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-4 py-2">
              <CheckCircle className="mr-2 h-4 w-4" />
              Bill Paid
            </Badge>
          ) : isOverdue ? (
            <Badge variant="destructive" className="px-4 py-2">
              <AlertCircle className="mr-2 h-4 w-4" />
              Payment Overdue
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 px-4 py-2">
              <AlertCircle className="mr-2 h-4 w-4" />
              Payment Pending
            </Badge>
          )}
        </div>

        {/* Bill Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Bill Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Bill Type:</span>
                <span className="font-medium">{getBillTypeLabel(bill.bill_type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bill Number:</span>
                <span className="font-medium">{bill.bill_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{bill.department?.name || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Generated Date:</span>
                <span className="font-medium">
                  {format(new Date(bill.generated_date), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", isOverdue && "text-red-600")}>
                    {format(dueDate, "MMM d, yyyy")}
                  </span>
                  {isOverdue && (
                    <Badge variant="destructive" size="sm">Overdue</Badge>
                  )}
                </div>
              </div>
              {bill.period_start && bill.period_end && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing Period:</span>
                  <span className="font-medium">
                    {format(new Date(bill.period_start), "MMM yyyy")} -{" "}
                    {format(new Date(bill.period_end), "MMM yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-gray-600">Description:</p>
            <p className="font-medium mt-1">{bill.description}</p>
          </div>
        </div>

        <Separator />

        {/* Amount Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Amount Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Amount:</span>
              <span>NPR {bill.base_amount.toFixed(2)}</span>
            </div>
            {bill.tax_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span>NPR {bill.tax_amount.toFixed(2)}</span>
              </div>
            )}
            {bill.fine_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Fine:</span>
                <span>NPR {bill.fine_amount.toFixed(2)}</span>
              </div>
            )}
            {bill.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>- NPR {bill.discount_amount.toFixed(2)}</span>
              </div>
            )}
            {lateFee > 0 && (
              <div className="flex justify-between text-red-600">
                <span className="flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  Late Fee:
                </span>
                <span>+ NPR {lateFee.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total Amount:</span>
              <div className="text-right">
                <div className="text-2xl text-blue-600">NPR {totalAmount.toFixed(2)}</div>
                {isOverdue && (
                  <div className="text-sm text-red-600">
                    (includes NPR {lateFee.toFixed(2)} late fee)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Warning */}
        {isOverdue && !isPaid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This bill is overdue. Please pay immediately to avoid additional penalties and service interruptions.
            </AlertDescription>
          </Alert>
        )}

        {/* Additional Information */}
        <div className="border-t pt-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <Info className="h-4 w-4" />
            {showDetails ? "Hide" : "Show"} payment instructions
          </button>
          
          {showDetails && (
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">Important Information:</p>
                <ul className="mt-2 space-y-1 list-disc pl-4">
                  <li>Payments are processed in real-time</li>
                  <li>Receipt will be generated immediately after payment</li>
                  <li>Keep the receipt for future reference</li>
                  <li>For any issues, contact the municipal help desk</li>
                </ul>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">Payment Methods Accepted:</p>
                <ul className="mt-2 space-y-1 list-disc pl-4">
                  <li>eSewa & Khalti (Instant)</li>
                  <li>Connect IPS (Instant)</li>
                  <li>Credit/Debit Cards (Instant)</li>
                  <li>Bank Transfer (24-48 hours)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}