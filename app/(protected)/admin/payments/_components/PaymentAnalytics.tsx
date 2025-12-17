"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";

interface PaymentAnalyticsProps {
  data: any; // Type from query response
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export function PaymentAnalytics({ data }: PaymentAnalyticsProps) {
  if (!data) return <div className="p-4">Loading analytics...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
       {/* Metric Cards */}
       <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-6">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-sm font-medium text-emerald-700">Total Revenue</p>
                   <h3 className="text-2xl font-bold text-emerald-900 mt-2">
                      NPR {data.revenue.toLocaleString()}
                   </h3>
                </div>
                <div className="p-2 bg-white rounded-full text-emerald-600">
                   <DollarSign className="w-5 h-5" />
                </div>
             </div>
          </CardContent>
       </Card>

       <Card>
          <CardContent className="p-6">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-sm font-medium text-gray-500">Transactions</p>
                   <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {data.transactions.toLocaleString()}
                   </h3>
                </div>
                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                   <TrendingUp className="w-5 h-5" />
                </div>
             </div>
          </CardContent>
       </Card>

       {/* Revenue Trend Chart */}
       <Card className="md:col-span-2">
          <CardHeader className="py-4 pb-2">
             <CardTitle className="text-sm">Revenue Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[120px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend}>
                   <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <Tooltip 
                      contentStyle={{borderRadius:'8px', border:'none'}} 
                      formatter={(val) => `NPR ${Number(val).toLocaleString()}`}
                   />
                   <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
             </ResponsiveContainer>
          </CardContent>
       </Card>
    </div>
  );
}