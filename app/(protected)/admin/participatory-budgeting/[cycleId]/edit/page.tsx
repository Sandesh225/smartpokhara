"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  ArrowLeft, Loader2, Calendar, DollarSign, 
  Users, AlertCircle, Save, Settings 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Domain Features
import { 
  useBudgetCycle, 
  usePBMutations,
  type BudgetCycle 
} from "@/features/participatory-budgeting";

export default function EditCyclePage() {
  const router = useRouter();
  const params = useParams();
  const cycleId = params.cycleId as string;

  // Domain Hooks
  const { data: cycle, isLoading: loading } = useBudgetCycle(cycleId);
  const mutations = usePBMutations();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      total_budget_amount: 0,
      min_project_cost: 0,
      max_project_cost: 0,
      submission_start_at: "",
      submission_end_at: "",
      voting_start_at: "",
      voting_end_at: "",
      max_votes_per_user: 3,
    }
  });

  // Fetch Existing Data - Sync with Form
  useEffect(() => {
    if (cycle) {
      // Helper to format DB timestamp to HTML datetime-local input format (YYYY-MM-DDThh:mm)
      const formatForInput = (dateString: string) => {
        if (!dateString) return "";
        try {
          return new Date(dateString).toISOString().slice(0, 16);
        } catch (e) {
          return "";
        }
      };

      // Pre-fill form
      form.reset({
        title: cycle.title,
        description: cycle.description || "",
        total_budget_amount: cycle.total_budget_amount,
        min_project_cost: cycle.min_project_cost,
        max_project_cost: cycle.max_project_cost || 0,
        submission_start_at: formatForInput(cycle.submission_start_at),
        submission_end_at: formatForInput(cycle.submission_end_at),
        voting_start_at: formatForInput(cycle.voting_start_at),
        voting_end_at: formatForInput(cycle.voting_end_at),
        max_votes_per_user: cycle.max_votes_per_user,
      });
    }
  }, [cycle, form]);

  const onSubmit = async (data: any) => {
    // Basic validation
    const submissionStart = new Date(data.submission_start_at);
    const submissionEnd = new Date(data.submission_end_at);
    const votingStart = new Date(data.voting_start_at);
    const votingEnd = new Date(data.voting_end_at);

    if (submissionEnd <= submissionStart) return toast.error("Submission end date must be after start date");
    if (votingStart <= submissionEnd) return toast.error("Voting should start after submission period ends");
    if (votingEnd <= votingStart) return toast.error("Voting end date must be after start date");

    mutations.updateCycle.mutate({
      id: cycleId,
      data: {
        title: data.title,
        description: data.description,
        total_budget_amount: data.total_budget_amount,
        min_project_cost: data.min_project_cost,
        max_project_cost: data.max_project_cost,
        max_votes_per_user: data.max_votes_per_user,
        submission_start_at: submissionStart.toISOString(),
        submission_end_at: submissionEnd.toISOString(),
        voting_start_at: votingStart.toISOString(),
        voting_end_at: votingEnd.toISOString(),
      }
    }, {
      onSuccess: () => {
        router.push(`/admin/participatory-budgeting/${cycleId}`);
      }
    });
  };

  if (loading) {
    return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-6 md:px-8">
      {/* 1. Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-10 shadow-sm mt-6 text-center">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
        
        <div className="relative space-y-4 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-8 gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Cancel & Back
          </Button>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            System Configuration
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight">
            Edit <span className="text-primary">Cycle</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            Modify parameters and constraints for <span className="text-foreground font-bold">{form.getValues("title")}</span>.
          </p>
        </div>
      </div>

      {/* 2. Main Form Content */}
      <div className="max-w-4xl mx-auto py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            {/* Section 1: Core Configuration */}
            <Card className="rounded-xl border border-border shadow-xs bg-card">
              <CardHeader className="p-8 border-b border-border/50 bg-muted/10 space-y-1">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-black text-xs">01</div>
                   <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Cycle Definition</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Cycle Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. FY 2081/82"
                          className="h-14 font-black text-xl bg-muted/10 border-border/50 focus:border-primary transition-all rounded-xl shadow-none"
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-bold uppercase" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Cycle Objectives</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the scope..."
                          className="min-h-[120px] rounded-xl bg-muted/10 border-border/50 focus:border-primary transition-all p-6 text-sm font-medium leading-relaxed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-bold uppercase" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section 2: Fiscal Parameters */}
            <Card className="rounded-xl border border-border shadow-xs bg-card">
              <CardHeader className="p-8 border-b border-border/50 bg-muted/10 space-y-1">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-black text-xs">02</div>
                   <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Fiscal Parameters</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  <FormField
                    control={form.control}
                    name="total_budget_amount"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Total Pool Allocation (NPR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-12 bg-muted/10 border-border/50 font-black text-base rounded-xl"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription className="text-xs font-bold uppercase tracking-widest opacity-40">NPR {field.value.toLocaleString()}</FormDescription>
                        <FormMessage className="text-xs font-bold uppercase" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_votes_per_user"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Citizen Vote Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-12 bg-muted/10 border-border/50 font-black text-base rounded-xl"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-bold uppercase" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_project_cost"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Min Project Cap</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-12 bg-muted/10 border-border/50 font-bold text-sm rounded-xl"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-bold uppercase" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_project_cost"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Max Project Cap</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-12 bg-muted/10 border-border/50 font-bold text-sm rounded-xl"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-bold uppercase" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Strategic Timeline */}
            <Card className="rounded-xl border border-border shadow-xs bg-card">
              <CardHeader className="p-8 border-b border-border/50 bg-muted/10 space-y-1">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-black text-xs">03</div>
                   <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Strategic Timeline</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Submission Period
                    </h4>
                    <FormField
                      control={form.control}
                      name="submission_start_at"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <Input type="datetime-local" className="h-12 rounded-xl bg-muted/10 border-border/50 font-bold text-xs" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="submission_end_at"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <Input type="datetime-local" className="h-12 rounded-xl bg-muted/10 border-border/50 font-bold text-xs" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Voting Window
                    </h4>
                    <FormField
                      control={form.control}
                      name="voting_start_at"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <Input type="datetime-local" className="h-12 rounded-xl bg-muted/10 border-border/50 font-bold text-xs" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="voting_end_at"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <Input type="datetime-local" className="h-12 rounded-xl bg-muted/10 border-border/50 font-bold text-xs" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 max-w-2xl mx-auto w-full">
              <Button 
                type="submit" 
                className="flex-2 h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all text-sm"
                disabled={mutations.updateCycle.isPending}
              >
                {mutations.updateCycle.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Commit Configuration Updates
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1 h-14 text-muted-foreground font-black uppercase tracking-widest text-xs rounded-xl hover:text-foreground"
                onClick={() => router.back()}
              >
                Discard Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>

  );
}