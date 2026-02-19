// components/citizen/payments/PaymentMethodSelector.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Removed missing radio-group imports
import {
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Smartphone as Phone,
  Building,
  QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: PaymentMethod) => void;
  selectedMethod: PaymentMethod | null;
  billAmount: number;
  walletBalance?: number;
  isLoading?: boolean;
}

export type PaymentMethod = 
  | "esewa" 
  | "khalti" 
  | "connect_ips" 
  | "bank_transfer" 
  | "credit_card" 
  | "debit_card" 
  | "wallet" 
  | "qr_code";

const PAYMENT_METHODS = [
  {
    id: "esewa" as const,
    name: "eSewa",
    icon: Smartphone,
    description: "Pay using eSewa wallet",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    recommended: true
  },
  {
    id: "khalti" as const,
    name: "Khalti",
    icon: Smartphone,
    description: "Pay using Khalti wallet",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    id: "connect_ips" as const,
    name: "Connect IPS",
    icon: Landmark,
    description: "Internet banking",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    id: "bank_transfer" as const,
    name: "Bank Transfer",
    icon: Building,
    description: "Direct bank transfer",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    id: "credit_card" as const,
    name: "Credit Card",
    icon: CreditCard,
    description: "Visa, MasterCard, etc.",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    id: "debit_card" as const,
    name: "Debit Card",
    icon: CreditCard,
    description: "ATM/Debit cards",
    color: "text-teal-600",
    bgColor: "bg-teal-50"
  },
  {
    id: "wallet" as const,
    name: "Digital Wallet",
    icon: Wallet,
    description: "Use your Smart City wallet",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  {
    id: "qr_code" as const,
    name: "QR Payment",
    icon: QrCode,
    description: "Scan QR code to pay",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  }
];

export default function PaymentMethodSelector({
  onMethodSelect,
  selectedMethod,
  billAmount,
  walletBalance = 0,
  isLoading = false
}: PaymentMethodSelectorProps) {
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  const [showCardForm, setShowCardForm] = useState(false);
  const [esewaPhone, setEsewaPhone] = useState("");
  const [khaltiPhone, setKhaltiPhone] = useState("");

  const handleMethodSelect = (method: PaymentMethod) => {
    onMethodSelect(method);
    setShowCardForm(method === "credit_card" || method === "debit_card");
  };

  const isWalletDisabled = walletBalance < billAmount;
  const walletShortage = billAmount - walletBalance;

  const getMethodDetails = (methodId: PaymentMethod) => {
    switch (methodId) {
      case "esewa":
        return (
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="esewa-phone">eSewa Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="esewa-phone"
                  placeholder="98XXXXXXXX"
                  value={esewaPhone}
                  onChange={(e) => setEsewaPhone(e.target.value)}
                  className="pl-9"
                  type="tel"
                />
              </div>
            </div>
            <div className="rounded-lg border p-3 bg-blue-50">
              <p className="text-sm font-medium">How to pay with eSewa:</p>
              <ol className="text-xs text-gray-600 mt-1 list-decimal pl-4 space-y-1">
                <li>Enter your eSewa registered phone number</li>
                <li>Click "Pay Now" to proceed</li>
                <li>Complete payment in the eSewa app</li>
                <li>Return to this page to view receipt</li>
              </ol>
            </div>
          </div>
        );

      case "khalti":
        return (
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="khalti-phone">Khalti Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="khalti-phone"
                  placeholder="98XXXXXXXX"
                  value={khaltiPhone}
                  onChange={(e) => setKhaltiPhone(e.target.value)}
                  className="pl-9"
                  type="tel"
                />
              </div>
            </div>
            <div className="rounded-lg border p-3 bg-red-50">
              <p className="text-sm font-medium">How to pay with Khalti:</p>
              <ol className="text-xs text-gray-600 mt-1 list-decimal pl-4 space-y-1">
                <li>Enter your Khalti registered phone number</li>
                <li>Click "Pay Now" to proceed</li>
                <li>Complete payment in the Khalti app</li>
                <li>Return to this page to view receipt</li>
              </ol>
            </div>
          </div>
        );

      case "credit_card":
      case "debit_card":
        return (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input
                id="card-name"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card-expiry">Expiry Date</Label>
                <Input
                  id="card-expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-cvc">CVC</Label>
                <Input
                  id="card-cvc"
                  placeholder="123"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Your card details are secure and encrypted</span>
            </div>
          </div>
        );

      case "connect_ips":
        return (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border p-3 bg-blue-50">
              <p className="text-sm font-medium">Bank Transfer Details:</p>
              <div className="mt-2 text-xs space-y-1">
                <p><strong>Bank:</strong> Nepal Investment Mega Bank</p>
                <p><strong>Account Name:</strong> Pokhara Metropolitan City</p>
                <p><strong>Account Number:</strong> 1234567890123456</p>
                <p><strong>Reference:</strong> Use your bill number</p>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Payments will be updated within 24 hours after transfer.
              </p>
            </div>
          </div>
        );

      case "wallet":
        return (
          <div className="mt-4 space-y-3">
            <div className={cn(
              "rounded-lg border p-3",
              isWalletDisabled ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">Wallet Balance</p>
                  <p className="text-2xl font-bold mt-1">NPR {walletBalance.toFixed(2)}</p>
                </div>
                <Wallet className="h-8 w-8 text-gray-400" />
              </div>
              
              {isWalletDisabled ? (
                <div className="mt-2 text-sm text-red-600">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Insufficient balance. You need NPR {walletShortage.toFixed(2)} more.
                </div>
              ) : (
                <div className="mt-2 text-sm text-green-600">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  Sufficient balance available
                </div>
              )}
            </div>
            
            {isWalletDisabled && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {/* Handle wallet top-up */}}
              >
                <Plus className="mr-2 h-4 w-4" />
                Top Up Wallet
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Select Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Methods Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <div key={method.id} className="relative">
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                id={method.id}
                className="peer sr-only"
                checked={selectedMethod === method.id}
                onChange={() => handleMethodSelect(method.id)}
                disabled={method.id === "wallet" && isWalletDisabled}
              />
              <Label
                htmlFor={method.id}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all",
                  selectedMethod === method.id ? "border-primary bg-primary/5" : "border-border",
                  "hover:bg-gray-50 hover:border-gray-300",
                  (method.id === "wallet" && isWalletDisabled) && "opacity-50 cursor-not-allowed hover:bg-white hover:border-border",
                  method.recommended && "border-primary/30 bg-primary/5 shadow-sm"
                )}
              >
                <div className={`p-3 rounded-full ${method.bgColor} mb-2`}>
                  <method.icon className={`h-6 w-6 ${method.color}`} />
                </div>
                <span className="font-medium text-sm text-center">{method.name}</span>
                <span className="text-xs text-gray-500 text-center mt-1">{method.description}</span>
                {method.recommended && (
                  <Badge className="absolute -top-2 -right-2 text-[10px] bg-primary font-bold">
                    RECOMMENDED
                  </Badge>
                )}
              </Label>
            </div>
          ))}
        </div>

        {/* Selected Method Details */}
        {selectedMethod && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Payment Details</h3>
            {getMethodDetails(selectedMethod)}
          </div>
        )}

        {/* Security Info */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>PCI DSS Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            Your payment information is securely processed and encrypted
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}