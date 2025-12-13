// components/citizen/payments/BillsList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { ChevronLeft, ChevronRight, CreditCard, Search, AlertCircle, Calendar, FileText, ExternalLink, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BillsListProps {
  bills: any[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onFilterChange?: (status: string) => void;
  currentFilter?: string;
  onSearchChange?: (search: string) => void;
}

export default function BillsList({
  bills,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onFilterChange,
  currentFilter = "all",
  onSearchChange,
}: BillsListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("due_date");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  const totalPages = Math.ceil(total / limit) || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

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

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (status === "completed") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      );
    }

    if (isOverdue) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const calculateLateFee = (dueDate: string, baseAmount: number): number => {
    const due = new Date(dueDate);
    const today = new Date();
    
    if (today <= due) return 0;

    const diffTime = Math.abs(today.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 0.1% per day late, capped at 20%
    const feePercentage = Math.min(0.001 * diffDays, 0.2);
    return Math.round(baseAmount * feePercentage);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = newSortBy === sortBy && sortOrder === "DESC" ? "ASC" : "DESC";
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handlePreviousPage = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  if (isLoading && bills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No bills found
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || currentFilter !== "all"
                ? "Try adjusting your filters or search term"
                : "You don't have any pending bills at the moment"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = bills.filter(b => b.status === "pending").length;
  const overdueCount = bills.filter(b => b.is_overdue).length;
  const totalDue = bills
    .filter(b => b.status === "pending")
    .reduce((sum, bill) => sum + bill.total_amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pending Bills ({total})
              {(overdueCount > 0 || pendingCount > 0) && (
                <div className="flex gap-2 text-sm font-normal">
                  {overdueCount > 0 && (
                    <Badge variant="destructive">{overdueCount} overdue</Badge>
                  )}
                  {pendingCount > 0 && (
                    <Badge variant="outline">{pendingCount} pending</Badge>
                  )}
                </div>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {from}-{to} of {total} bills • Total Due: NPR {totalDue.toFixed(2)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-[200px] sm:w-[250px]"
              />
            </div>

            {/* Filter */}
            {onFilterChange && (
              <Select
                value={currentFilter}
                onValueChange={onFilterChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bills</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Paid</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Bills List */}
        <div className="space-y-4">
          {bills.map((bill) => {
            const dueDate = new Date(bill.due_date);
            const isOverdue = bill.is_overdue;
            const lateFee = isOverdue ? calculateLateFee(bill.due_date, bill.base_amount) : 0;
            const totalAmount = bill.total_amount + lateFee;

            return (
              <div
                key={bill.id}
                className={cn(
                  "group p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer",
                  isOverdue && "border-red-200 bg-red-50/50",
                  bill.status === "completed" && "border-green-200 bg-green-50/50"
                )}
                onClick={() => router.push(`/citizen/payments/${bill.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Section - Bill Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                        {getBillTypeLabel(bill.bill_type)}
                      </h4>
                      {getStatusBadge(bill.status, isOverdue)}
                      {bill.department && (
                        <Badge variant="outline" className="text-xs">
                          {bill.department.name}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <FileText className="mr-1 h-3 w-3" />
                        Bill #{bill.bill_number}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        Due: {format(dueDate, "MMM d, yyyy")}
                      </div>
                      {bill.period_start && (
                        <div className="flex items-center">
                          Period: {format(new Date(bill.period_start), "MMM yyyy")}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {bill.description}
                    </p>
                  </div>
                  
                  {/* Right Section - Amount & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        NPR {totalAmount.toFixed(2)}
                      </div>
                      {isOverdue && lateFee > 0 && (
                        <div className="text-sm text-red-600">
                          Includes NPR {lateFee.toFixed(2)} late fee
                        </div>
                      )}
                      {bill.status === "pending" && (
                        <div className="text-xs text-gray-500">
                          Base: NPR {bill.base_amount.toFixed(2)}
                          {bill.tax_amount > 0 && ` + Tax: NPR ${bill.tax_amount.toFixed(2)}`}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {bill.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/citizen/payments/${bill.id}/checkout`);
                            }}
                          >
                            Pay Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/citizen/payments/${bill.id}`);
                            }}
                          >
                            Details
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/citizen/payments/receipt?bill=${bill.id}`);
                          }}
                        >
                          View Receipt
                        </Button>
                      )}
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="h-8 w-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}