// components/citizen/payments/WalletCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  History,
  CreditCard,
  Smartphone,
  
  CheckCircle,
  AlertCircle,
  Banknote
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WalletCardProps {
  balance: number;
  onTopUp?: (amount: number) => Promise<void>;
  onWithdraw?: (amount: number) => Promise<void>;
  showTransactions?: boolean;
}

export default function WalletCard({
  balance,
  onTopUp,
  onWithdraw,
  showTransactions = true
}: WalletCardProps) {
  const [topUpAmount, setTopUpAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"topup" | "withdraw">("topup");

  // Mock transaction history
  const [transactions] = useState([
    {
      id: 1,
      type: "credit" as const,
      amount: 5000,
      description: "Wallet top-up via eSewa",
      date: new Date("2024-12-10"),
      status: "completed"
    },
    {
      id: 2,
      type: "debit" as const,
      amount: 2500,
      description: "Property tax payment",
      date: new Date("2024-12-05"),
      status: "completed"
    },
    {
      id: 3,
      type: "credit" as const,
      amount: 10000,
      description: "Wallet top-up via bank transfer",
      date: new Date("2024-11-28"),
      status: "completed"
    },
    {
      id: 4,
      type: "debit" as const,
      amount: 1500,
      description: "Water bill payment",
      date: new Date("2024-11-20"),
      status: "completed"
    }
  ]);

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      if (onTopUp) {
        await onTopUp(parseFloat(topUpAmount));
        toast.success(`Successfully topped up NPR ${parseFloat(topUpAmount).toFixed(2)}`);
        setTopUpAmount("");
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(`Successfully topped up NPR ${parseFloat(topUpAmount).toFixed(2)}`);
        setTopUpAmount("");
      }
    } catch (error) {
      console.error("Error topping up wallet:", error);
      toast.error("Failed to top up wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsLoading(true);
    try {
      if (onWithdraw) {
        await onWithdraw(parseFloat(withdrawAmount));
        toast.success(`Successfully withdrew NPR ${parseFloat(withdrawAmount).toFixed(2)}`);
        setWithdrawAmount("");
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(`Successfully withdrew NPR ${parseFloat(withdrawAmount).toFixed(2)}`);
        setWithdrawAmount("");
      }
    } catch (error) {
      console.error("Error withdrawing from wallet:", error);
      toast.error("Failed to withdraw from wallet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-blue-600" />
            Digital Wallet
          </span>
          <Badge variant="outline" className="bg-white">
            Smart City Wallet
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            NPR {balance.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Use this balance for quick and easy payments
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Top Up
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Top Up Wallet</DialogTitle>
                <DialogDescription>
                  Add funds to your digital wallet for faster payments.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Quick Amounts */}
                <div className="space-y-2">
                  <Label>Quick Amounts (NPR)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setTopUpAmount(amount.toString())}
                        type="button"
                        className={cn(
                          "h-10",
                          topUpAmount === amount.toString() && "bg-blue-50 border-blue-200"
                        )}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Custom Amount (NPR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min="100"
                    step="100"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center"
                    >
                      <Smartphone className="h-5 w-5 mb-1" />
                      <span className="text-xs">eSewa</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center"
                    >
                      <Smartphone className="h-5 w-5 mb-1" />
                      <span className="text-xs">Khalti</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center"
                    >
                      <Banknote className="h-5 w-5 mb-1" />
                      <span className="text-xs">Bank</span>
                    </Button>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleTopUp}
                  disabled={isLoading || !topUpAmount}
                  className="w-full"
                >
                  {isLoading ? "Processing..." : "Top Up Now"}
                </Button>

                {/* Security Note */}
                <div className="text-xs text-gray-500 text-center">
                  <CheckCircle className="inline h-3 w-3 mr-1" />
                  Secured with 256-bit SSL encryption
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Minus className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Withdraw from Wallet</DialogTitle>
                <DialogDescription>
                  Transfer funds from your wallet to your bank account.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount to Withdraw (NPR)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={balance}
                    min="100"
                    step="100"
                  />
                  <p className="text-xs text-gray-500">
                    Maximum: NPR {balance.toFixed(2)}
                  </p>
                </div>

                {/* Bank Account Details */}
                <div className="space-y-2">
                  <Label>Bank Account Details</Label>
                  <div className="space-y-2">
                    <Input placeholder="Bank Name" />
                    <Input placeholder="Account Number" />
                    <Input placeholder="Account Holder Name" />
                  </div>
                </div>

                <Button
                  onClick={handleWithdraw}
                  disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) > balance}
                  className="w-full"
                >
                  {isLoading ? "Processing..." : "Request Withdrawal"}
                </Button>

                <div className="text-xs text-gray-500">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Withdrawals are processed within 2-3 business days
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recent Transactions */}
        {showTransactions && transactions.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Recent Transactions</h3>
              <Button variant="ghost" size="sm">
                <History className="mr-1 h-3 w-3" />
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {transactions.slice(0, 3).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "p-2 rounded-full mr-3",
                      transaction.type === "credit"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    )}>
                      {transaction.type === "credit" ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {format(transaction.date, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "font-semibold",
                    transaction.type === "credit" ? "text-green-600" : "text-red-600"
                  )}>
                    {transaction.type === "credit" ? "+" : "-"}
                    NPR {transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallet Benefits */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Wallet Benefits</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-2" />
              Instant payments without entering card details
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-2" />
              No transaction fees for wallet payments
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-2" />
              Track all payments in one place
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-2" />
              Automatic refunds to wallet for cancelled services
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}