import { PaymentTransaction } from "@/types/admin-payments";

export const fraudDetector = {
  /**
   * Check for high-value transactions
   */
  checkHighValue(amount: number): boolean {
    const THRESHOLD = 50000; // 50k NPR
    return amount > THRESHOLD;
  },

  /**
   * Check velocity (Mock logic: In real app, check DB for recent txns from same user)
   * This is a helper to run on fetched lists
   */
  analyzePattern(transactions: PaymentTransaction[]): string[] {
    const flaggedIds: string[] = [];
    const userTxnMap: Record<string, number> = {};

    // 1. High Value Check
    transactions.forEach(txn => {
        if (this.checkHighValue(txn.amount_paid)) {
            flaggedIds.push(txn.id);
        }
    });

    // 2. Simple Frequency Check (if list is sorted by time)
    // Real implementation would query backend for "Last 5 mins count"
    
    return flaggedIds;
  }
};