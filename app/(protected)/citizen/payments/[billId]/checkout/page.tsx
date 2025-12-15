// app/(protected)/citizen/payments/[billId]/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, CreditCard, Wallet, AlertCircle } from "lucide-react";
import { paymentsService } from "@/lib/supabase/queries/payments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type PaymentMethod = 'esewa' | 'khalti' | 'connect_ips' | 'bank_transfer' | 'wallet';

export default function PaymentCheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const billId = params.billId as string;
  const returnUrl = searchParams.get('returnUrl') || '/citizen/payments';
  
  // State
  const [bill, setBill] = useState<any>(null);
  const [lateFee, setLateFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('esewa');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (billId) {
      loadBill();
      loadWalletBalance();
    }
  }, [billId]);

  const loadBill = async () => {
    try {
      setIsLoading(true);
      
      const billData = await paymentsService.getBillById(billId);
      
      if (!billData) {
        toast.error('Bill not found');
        router.push('/citizen/payments');
        return;
      }
      
      // Check if bill is already paid
      if (billData.status === 'completed') {
        toast.info('This bill is already paid');
        router.push(`/citizen/payments/receipt?payment=${billId}`);
        return;
      }
      
      setBill(billData);
      
      // Calculate late fee if overdue
      const fee = billData.is_overdue 
        ? paymentsService.calculateLateFee(billData.due_date, billData.base_amount)
        : 0;
      
      setLateFee(fee);
      setTotalAmount(billData.total_amount + fee);
      
    } catch (error: any) {
      console.error('Error loading bill:', error);
      toast.error('Failed to load bill details');
      router.push('/citizen/payments');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const balance = await paymentsService.getWalletBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  const handlePayment = async () => {
    if (!bill || !selectedMethod) return;

    try {
      setIsProcessing(true);
      
      // Validate wallet payment
      if (selectedMethod === 'wallet' && walletBalance < totalAmount) {
        toast.error('Insufficient wallet balance');
        setIsProcessing(false);
        return;
      }
      
      toast.info('Processing payment...');
      
      const result = await paymentsService.processPayment({
        billId: bill.id,
        paymentMethod: selectedMethod,
        amount: totalAmount
      });
      
      if (result.success) {
        toast.success('Payment successful!');
        
        // Redirect to receipt page
        if (result.paymentId) {
          router.push(`/citizen/payments/receipt/${result.paymentId}`);
        } else {
          router.push(returnUrl);
        }
      } else {
        toast.error(result.error || 'Payment failed');
      }
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Bill Not Found</h1>
        <Button onClick={() => router.push('/citizen/payments')}>
          Back to Payments
        </Button>
      </div>
    );
  }

  const dueDate = new Date(bill.due_date);
  const isOverdue = bill.is_overdue;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push(returnUrl)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Payments
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Payment Summary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Checkout</CardTitle>
              <CardDescription>
                Complete your payment for {bill.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bill Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Bill Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bill Number</p>
                    <p className="font-medium">{bill.bill_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{bill.department?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                        {dueDate.toLocaleDateString()}
                      </p>
                      {isOverdue && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bill Type</p>
                    <Badge variant="outline">{bill.bill_type}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold">Payment Breakdown</h3>
                <div className="space-y-2">
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
                  {lateFee > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Late Fee</span>
                      <span>NPR {lateFee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>NPR {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold">Payment Method</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(['esewa', 'khalti', 'connect_ips', 'bank_transfer'] as PaymentMethod[]).map((method) => (
                    <Button
                      key={method}
                      variant={selectedMethod === method ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => setSelectedMethod(method)}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
                    </Button>
                  ))}
                  
                  {/* Wallet option */}
                  {walletBalance > 0 && (
                    <Button
                      variant={selectedMethod === 'wallet' ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => setSelectedMethod('wallet')}
                      disabled={walletBalance < totalAmount}
                    >
                      <Wallet className="h-6 w-6" />
                      <div className="text-center">
                        <span className="text-sm block">Wallet</span>
                        <span className="text-xs text-muted-foreground">
                          NPR {walletBalance.toFixed(2)}
                        </span>
                      </div>
                    </Button>
                  )}
                </div>
                
                {selectedMethod === 'wallet' && walletBalance < totalAmount && (
                  <p className="text-sm text-red-600">
                    Insufficient wallet balance. Please choose another payment method.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment Summary & Security */}
        <div className="space-y-6">
          {/* Security Badges */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-muted-foreground">256-bit SSL encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">PCI DSS Compliant</p>
                  <p className="text-sm text-muted-foreground">Your data is protected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Action */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount to Pay</span>
                  <span className="text-2xl font-bold">NPR {totalAmount.toFixed(2)}</span>
                </div>
                {isOverdue && (
                  <p className="text-sm text-red-600">
                    This bill is overdue. Please pay immediately to avoid additional penalties.
                  </p>
                )}
              </div>
              
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing || (selectedMethod === 'wallet' && walletBalance < totalAmount)}
              >
                {isProcessing ? 'Processing...' : `Pay NPR ${totalAmount.toFixed(2)}`}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                By completing this payment, you agree to our{' '}
                <Link href="/terms" className="underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}