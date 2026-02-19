"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Plus, Calendar, DollarSign, Loader2, TrendingUp, 
  Users, CheckCircle2, Clock, BarChart3, Settings,
  Eye, AlertCircle, Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Domain Features
import { 
  useBudgetCycles, 
  type BudgetCycle 
} from "@/features/participatory-budgeting";

export default function AdminBudgetingPage() {
  const { data: cycles = [], isLoading: loading } = useBudgetCycles();

  const activeCycles = cycles.filter(c => c.is_active);
  const archivedCycles = cycles.filter(c => !c.is_active);

  const CycleCard = ({ cycle }: { cycle: BudgetCycle }) => {
    const isVotingActive = new Date() >= new Date(cycle.voting_start_at) && 
                          new Date() <= new Date(cycle.voting_end_at);
    const isSubmissionActive = new Date() >= new Date(cycle.submission_start_at) && 
                               new Date() <= new Date(cycle.submission_end_at);

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 bg-linear-to-br from-card to-card/95 hover:from-card/95 hover:to-primary/5 dark:hover:to-primary/10 border-2 hover:border-primary/30">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant={cycle.is_active ? "default" : "secondary"}
                className={cycle.is_active 
                  ? "bg-linear-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white shadow-md" 
                  : "bg-muted text-muted-foreground"
                }
              >
                {cycle.is_active ? (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Active
                  </>
                ) : (
                  "Archived"
                )}
              </Badge>
              
               {isVotingActive && (
                <Badge className="bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-md">
                  <Users className="w-3 h-3 mr-1" />
                  Voting Open
                </Badge>
              )}
              
              {isSubmissionActive && !isVotingActive && (
                <Badge className="bg-linear-to-r from-purple-500 to-purple-600 text-white shadow-md">
                  <Clock className="w-3 h-3 mr-1" />
                  Submissions Open
                </Badge>
              )}
            </div>
          </div>
          
          <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
            {cycle.title}
          </CardTitle>
          
          {cycle.description && (
            <CardDescription className="line-clamp-2 text-sm mt-2">
              {cycle.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
           {/* Budget Display */}
          <div className="bg-linear-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Total Budget</span>
              </div>
              <span className="text-2xl font-black bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                NPR {(cycle.total_budget_amount / 100000).toFixed(1)}L
              </span>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">Submission Period</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(cycle.submission_start_at), "MMM d, yyyy")} - {format(new Date(cycle.submission_end_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">Voting Period</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(cycle.voting_start_at), "MMM d, yyyy")} - {format(new Date(cycle.voting_end_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              asChild 
              className="flex-1 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
            >
              <Link href={`/admin/participatory-budgeting/${cycle.id}`}>
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline"
              className="border-2 hover:bg-muted/50"
            >
              <Link href={`/admin/participatory-budgeting/${cycle.id}/analytics`}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-4 sm:px-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent border border-primary/20 dark:border-primary/30 p-8 shadow-lg">
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-black/10 [mask-image:radial-gradient(white,transparent_85%)]" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 dark:bg-primary/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Participatory Budgeting
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Manage fiscal cycles, track citizen engagement, and oversee democratic budget allocation.
            </p>
          </div>
          
          <Button 
            asChild 
            size="lg"
            className="bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/admin/participatory-budgeting/create">
              <Plus className="mr-2 h-5 w-5" /> 
              New Cycle
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Total Cycles
                  </p>
                  <p className="text-3xl font-black text-blue-700 dark:text-blue-400">
                    {cycles.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-200 dark:bg-blue-900 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">
                    Active Cycles
                  </p>
                  <p className="text-3xl font-black text-green-700 dark:text-green-400">
                    {activeCycles.length}
                  </p>
                </div>
                <div className="p-3 bg-green-200 dark:bg-green-900 rounded-xl">
                  <Sparkles className="w-6 h-6 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1">
                    Total Budget
                  </p>
                  <p className="text-3xl font-black text-purple-700 dark:text-purple-400">
                    {(cycles.reduce((sum, c) => sum + c.total_budget_amount, 0) / 10000000).toFixed(1)}Cr
                  </p>
                </div>
                <div className="p-3 bg-purple-200 dark:bg-purple-900 rounded-xl">
                  <DollarSign className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
                    Archived
                  </p>
                  <p className="text-3xl font-black text-orange-700 dark:text-orange-400">
                    {archivedCycles.length}
                  </p>
                </div>
                <div className="p-3 bg-orange-200 dark:bg-orange-900 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cycles List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 blur-3xl animate-pulse" />
            <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10 mb-4" />
          </div>
          <p className="text-base text-muted-foreground font-medium">Loading cycles...</p>
        </div>
      ) : cycles.length === 0 ? (
        <Card className="text-center py-16 border-2 border-dashed rounded-2xl bg-linear-to-br from-muted/20 via-muted/10 to-transparent">
          <CardContent className="space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 blur-2xl rounded-full" />
              <div className="relative p-6 bg-linear-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl">
                <AlertCircle className="w-16 h-16 text-primary mx-auto opacity-60" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                No Budget Cycles Yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Create your first participatory budgeting cycle to start engaging citizens in budget decisions.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90">
                <Link href="/admin/participatory-budgeting/create">
                  <Plus className="mr-2 h-5 w-5" /> 
                  Create First Cycle
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 h-12 bg-muted/50 dark:bg-muted/30 p-1 rounded-xl">
            <TabsTrigger 
              value="active"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold rounded-lg transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Active ({activeCycles.length})
            </TabsTrigger>
            <TabsTrigger 
              value="archived"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold rounded-lg transition-all duration-300"
            >
              <Clock className="w-4 h-4 mr-2" />
              Archived ({archivedCycles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeCycles.length === 0 ? (
              <Card className="text-center py-12 border-2 border-dashed">
                <CardContent>
                  <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No active cycles</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeCycles.map((cycle) => (
                  <CycleCard key={cycle.id} cycle={cycle} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            {archivedCycles.length === 0 ? (
              <Card className="text-center py-12 border-2 border-dashed">
                <CardContent>
                  <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No archived cycles</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {archivedCycles.map((cycle) => (
                  <CycleCard key={cycle.id} cycle={cycle} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}