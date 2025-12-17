import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusData } from "@/types/admin";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ComplaintStatusChart({ data }: { data: ComplaintStatusData[] }) {
  const chartData = data.map(d => ({ 
    name: d.status.replace('_', ' ').toUpperCase(), 
    value: d.count 
  }));

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-50">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
          </div>
          Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '10px 14px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={40}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <PieChartIcon className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No status data available</p>
            <p className="text-xs mt-1">Data will appear once complaints are logged</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}