
// ========================================

// PaymentCollectionStats.tsx - Enhanced
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStat } from "@/types/admin";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign } from "lucide-react";

export function PaymentCollectionStats({ data }: { data: PaymentStat[] }) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 ">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-50">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          Payment Collections
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[220px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="period"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="#9ca3af"
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="#9ca3af"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={(value) => [
                  `NPR ${Number(value).toLocaleString()}`,
                  "Amount",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "10px 14px",
                }}
              />
              <Bar
                dataKey="amount"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <DollarSign className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No payment data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
