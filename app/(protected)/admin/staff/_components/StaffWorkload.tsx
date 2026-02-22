"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkloadStats } from "@/features/staff";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface WorkloadData {
  balanced: number;
  overloaded: number;
  underutilized: number;
  avgWorkload: number;
}

export function StaffWorkload() {
    // Ideally we get supervisor ID from context or auth
    // For now, let's fetch current user's ID
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        createClient().auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    const { data: stats, isLoading } = useWorkloadStats(userId || "");
    
    // Default data structure
    const data = (stats as unknown as WorkloadData) || {
        balanced: 0,
        overloaded: 0,
        underutilized: 0,
        avgWorkload: 0
    };

    // Calculate trend (simplified logic as previous code)
    let trend: "up" | "down" | "stable" = "stable";
    if (data.overloaded > data.balanced) trend = "up";
    else if (data.underutilized > data.balanced) trend = "down";

    const balancedPercentage = data.balanced || 0;
    
    const status =
        balancedPercentage >= 70
        ? "optimal"
        : balancedPercentage >= 50
            ? "moderate"
            : "critical";

    if (isLoading) {
        return (
        <Card className="stone-card">
            <CardHeader className="p-4 border-b border-border bg-muted/30">
            <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Workload Overview
            </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
            <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-muted rounded" />
                <div className="h-2 bg-muted rounded" />
                <div className="h-3 bg-muted rounded" />
            </div>
            </CardContent>
        </Card>
        );
    }

    return (
        <Card className="stone-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="p-4 border-b border-border bg-muted/30">
            <CardTitle className="text-sm md:text-base font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>Workload Overview</span>
            </div>
            {trend === "up" && <TrendingUp className="w-4 h-4 text-error-red" />}
            {trend === "down" && (
                <TrendingDown className="w-4 h-4 text-warning-amber" />
            )}
            </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
            {/* Main Status */}
            <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {status === "optimal"
                    ? "Balanced Distribution"
                    : status === "moderate"
                    ? "Moderate Load"
                    : "Attention Needed"}
                </span>
                <span
                className={cn(
                    "text-sm font-black",
                    status === "optimal" && "text-success-green",
                    status === "moderate" && "text-warning-amber",
                    status === "critical" && "text-error-red"
                )}
                >
                {balancedPercentage}%
                </span>
            </div>

            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                className={cn(
                    "h-full rounded-full transition-all duration-500",
                    status === "optimal" && "bg-success-green",
                    status === "moderate" && "bg-warning-amber",
                    status === "critical" && "bg-error-red"
                )}
                style={{ width: `${balancedPercentage}%` }}
                />
            </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
            <div className="text-center p-2 rounded-lg bg-success-green/10">
                <p className="text-lg md:text-xl font-black text-success-green">
                {data.balanced}%
                </p>
                <p className="text-xs md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Balanced
                </p>
            </div>

            <div className="text-center p-2 rounded-lg bg-error-red/10">
                <p className="text-lg md:text-xl font-black text-error-red">
                {data.overloaded}%
                </p>
                <p className="text-xs md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                High Load
                </p>
            </div>

            <div className="text-center p-2 rounded-lg bg-info-blue/10">
                <p className="text-lg md:text-xl font-black text-info-blue">
                {data.underutilized}%
                </p>
                <p className="text-xs md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Low Load
                </p>
            </div>
            </div>

            {/* Average Workload */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground">
                Average Workload
            </span>
            <span className="text-sm font-bold text-foreground">
                {data.avgWorkload} tasks/person
            </span>
            </div>

            {/* Alert for Critical Status */}
            {status === "critical" && (
            <div className="flex items-start gap-2 p-3 bg-error-red/10 border border-error-red/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-error-red shrink-0 mt-0.5" />
                <p className="text-xs text-error-red leading-tight">
                Workload imbalance detected. Consider redistributing tasks.
                </p>
            </div>
            )}

            {/* Recommendation */}
            <p className="text-xs text-muted-foreground leading-relaxed">
            {status === "optimal"
                ? "Staff workload is well distributed across the team."
                : status === "moderate"
                ? "Monitor workload distribution to prevent overload."
                : "Immediate action needed to rebalance task assignments."}
            </p>
        </CardContent>
        </Card>
    );
}
