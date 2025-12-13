'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import {
  Download,
  Printer,
  Mail,
  Copy,
  CheckCircle,
  FileText,
  Building2,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';

interface ReceiptViewerProps {
  payment: any;
  bill: any;
  user: any;
}

export default function ReceiptViewer({ payment, bill, user }: ReceiptViewerProps) {
  const [copied, setCopied] = useState(false);

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      esewa: 'eSewa',
      khalti: 'Khalti',
      ime_pay: 'IME Pay',
      connect_ips: 'Connect IPS',
      cash: 'Cash',
    };
    return labels[method] || method.replace('_', ' ');
  };

  const getBillTypeLabel = (billType: string) => {
    const labels: Record<string, string> = {
      property_tax: 'Property Tax',
      business_license: 'Business License',
      water_bill: 'Water Bill',
      waste_management: 'Waste Management',
      parking_fine: 'Parking Fine',
      building_permit: 'Building Permit',
      event_permit: 'Event Permit',
      other_fee: 'Other Fee',
    };
    return labels[billType] || billType.replace('_', ' ');
  };

  const handleDownload = () => {
    // Generate PDF and trigger download
    const element = document.getElementById('receipt-content');
    // In a real implementation, use a PDF generation library
    console.log('Download receipt');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReceipt = async () => {
    try {
      const response = await fetch('/api/email-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.id }),
      });

      if (response.ok) {
        alert('Receipt sent to your email!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(payment.receipt_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Receipt</h1>
          <p className="text-gray-600">Transaction #{payment.receipt_number}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmailReceipt}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <Card id="receipt-content" className="border-2">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b">
            <div>
              <div className="flex items-center mb-2">
                <Building2 className="h-8 w-8 text-blue-600 mr-2" />
                <div>
                  <h2 className="text-2xl font-bold">Pokhara Metropolitan City</h2>
                  <p className="text-gray-600">Government of Nepal</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>Pokhara, Kaski, Nepal</p>
                <p>Email: payments@pokhara.gov.np | Phone: 061-123456</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800 mb-2">
                <CheckCircle className="mr-1 h-3 w-3" />
                Payment Successful
              </Badge>
              <p className="text-3xl font-bold">RECEIPT</p>
              <p className="text-gray-500">Official Payment Receipt</p>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt Number:</span>
                  <div className="flex items-center">
                    <span className="font-mono font-bold">{payment.receipt_number}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyReference}
                      className="ml-2"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {format(new Date(payment.created_at), 'PPP')} at{' '}
                    {format(new Date(payment.created_at), 'hh:mm a')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium font-mono">
                    {payment.transaction_id || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">
                    {getPaymentMethodLabel(payment.payment_method)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="default">Completed</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Bill Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Type:</span>
                  <span className="font-medium">{getBillTypeLabel(bill.bill_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Number:</span>
                  <span className="font-medium">{bill.bill_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium text-right">{bill.description}</span>
                </div>
                {bill.period_start && bill.period_end && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium">
                      {format(new Date(bill.period_start), 'MMM yyyy')} -{' '}
                      {format(new Date(bill.period_end), 'MMM yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Amount Breakdown</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>NPR {bill.base_amount.toFixed(2)}</span>
                </div>
                {bill.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>NPR {bill.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                {bill.late_fee_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Late Fee:</span>
                    <span>NPR {bill.late_fee_amount.toFixed(2)}</span>
                  </div>
                )}
                {bill.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>- NPR {bill.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Paid:</span>
                    <span>NPR {payment.amount_paid.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Paid By</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{user?.full_name}</p>
                <p className="text-gray-600">{user?.address_line1}</p>
                <p className="text-gray-600">
                  {user?.address_line2 && `${user.address_line2}, `}
                  Ward {user?.ward_id}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Email: {user?.email || 'N/A'}</p>
                <p className="text-gray-600">Phone: {user?.phone || 'N/A'}</p>
                <p className="text-gray-600">
                  Citizenship: {user?.citizenship_number || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Section */}
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-2">Official Verification</p>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded">
                    <QRCode
                      value={`https://pokhara.gov.np/verify/${payment.id}`}
                      size={80}
                      level="L"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Scan to verify this receipt
                    </p>
                    <p className="text-xs text-gray-500">
                      Verification URL: https://pokhara.gov.np/verify/{payment.id}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm text-gray-500 mb-2">Authorized Signature</p>
                <div className="border-t pt-2 w-48">
                  <p className="font-semibold">Pokhara Metropolitan City</p>
                  <p className="text-xs text-gray-500">Treasury Department</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 pt-6 border-t text-xs text-gray-500">
            <p className="mb-2">
              <strong>Note:</strong> This is an official receipt from Pokhara Metropolitan City.
              Please keep this receipt for your records.
            </p>
            <p>
              For any queries, contact: Treasury Department, Pokhara Metropolitan City,
              Phone: 061-123456, Email: payments@pokhara.gov.np
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Actions */}
      <div className="mt-6 flex justify-center space-x-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Payments
        </Button>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Receipt
        </Button>
      </div>
    </div>
  );
}