// app/(protected)/citizen/payments/receipt/[paymentId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Printer, ArrowLeft, CheckCircle, Building, Calendar, CreditCard, Receipt } from "lucide-react";
import { paymentsService } from "@/lib/supabase/queries/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReceiptPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.paymentId as string;
  
  // State
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (paymentId) {
      loadReceipt();
    }
  }, [paymentId]);

  const loadReceipt = async () => {
    try {
      setIsLoading(true);
      
      const data = await paymentsService.getReceipt(paymentId);
      
      if (!data) {
        toast.error('Receipt not found');
        router.push('/citizen/payments/history');
        return;
      }
      
      setReceiptData(data);
    } catch (error: any) {
      console.error('Error loading receipt:', error);
      toast.error('Failed to load receipt');
      router.push('/citizen/payments/history');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast.info('Generating PDF...');
      
      const receiptElement = document.getElementById('receipt-content');
      
      if (!receiptElement) return;
      
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${receiptData.payment.receipt_number}.pdf`);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return null;
  }

  const { payment, bill, userProfile } = receiptData;
  const paymentDate = new Date(payment.created_at);
  const billDueDate = new Date(bill.due_date);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/citizen/payments/history')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <div id="receipt-content" className="bg-white dark:bg-gray-900 p-8 rounded-lg border shadow-lg">
        {/* Receipt Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Smart City Pokhara</h1>
          </div>
          <p className="text-muted-foreground">Pokhara Metropolitan City</p>
          <p className="text-muted-foreground">Official Payment Receipt</p>
        </div>

        <Separator className="my-6" />

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <Badge variant="success" className="px-4 py-2 text-base">
            <CheckCircle className="mr-2 h-5 w-5" />
            Payment Successful
          </Badge>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Payment Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Payment Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt Number</span>
                  <span className="font-bold">{payment.receipt_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono">{payment.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span>{paymentDate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge variant="outline" className="capitalize">
                    {payment.payment_method.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="success" className="capitalize">
                    {payment.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Bill Information */}
            <div>
              <h2 className="text-xl font-bold mb-4">Bill Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill Number</span>
                  <span>{bill.bill_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill Type</span>
                  <Badge variant="outline">{bill.bill_type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span>{bill.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{billDueDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span>{bill.department?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Amount & Payer */}
          <div className="space-y-6">
            {/* Payer Information */}
            <div>
              <h2 className="text-xl font-bold mb-4">Payer Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span>{userProfile?.full_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span>{userProfile?.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ward</span>
                  <span>{userProfile?.ward_id ? `Ward ${userProfile.ward_id}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact</span>
                  <span>{userProfile?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Amount Breakdown */}
            <div>
              <h2 className="text-xl font-bold mb-4">Amount Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Amount</span>
                  <span>NPR {bill.base_amount.toFixed(2)}</span>
                </div>
                {bill.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>NPR {bill.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                {bill.fine_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fine</span>
                    <span>NPR {bill.fine_amount.toFixed(2)}</span>
                  </div>
                )}
                {bill.is_overdue && (
                  <div className="flex justify-between text-red-600">
                    <span>Late Fee</span>
                    <span>NPR {bill.total_amount - bill.base_amount - bill.tax_amount - bill.fine_amount}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Paid</span>
                  <span>NPR {payment.amount_paid.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Receipt className="h-5 w-5 text-primary" />
            <p className="font-medium">Official Receipt</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This is an official receipt issued by Pokhara Metropolitan City
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Customer Support</p>
              <p>061-521105</p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p>info@pokharamun.gov.np</p>
            </div>
            <div>
              <p className="font-medium">Website</p>
              <p>www.pokharamun.gov.np</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            This receipt is computer generated and does not require a signature.
            Please retain this receipt for your records.
          </p>
        </div>
      </div>
    </div>
  );
}