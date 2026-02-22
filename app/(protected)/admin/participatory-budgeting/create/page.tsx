"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Calendar, DollarSign, Users, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Domain Features
import { usePBMutations } from "@/features/participatory-budgeting";

export default function CreateCyclePage() {
  const router = useRouter();
  const mutations = usePBMutations();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      total_budget_amount: 50000000, // Default 50 Lakhs
      min_project_cost: 100000,
      max_project_cost: 5000000,
      submission_start_at: "",
      submission_end_at: "",
      voting_start_at: "",
      voting_end_at: "",
      max_votes_per_user: 3,
    }
  });

  const onSubmit = async (data: any) => {
    // Validate dates
    const submissionStart = new Date(data.submission_start_at);
    const submissionEnd = new Date(data.submission_end_at);
    const votingStart = new Date(data.voting_start_at);
    const votingEnd = new Date(data.voting_end_at);

    if (submissionEnd <= submissionStart) {
      toast.error("Submission end date must be after start date");
      return;
    }

    if (votingStart <= submissionEnd) {
      toast.error("Voting should start after submission period ends");
      return;
    }

    if (votingEnd <= votingStart) {
      toast.error("Voting end date must be after start date");
      return;
    }

    if (data.total_budget_amount <= 0) {
      toast.error("Total budget must be greater than 0");
      return;
    }

    mutations.createCycle.mutate({
      ...data,
      is_active: true,
      submission_start_at: submissionStart.toISOString(),
      submission_end_at: submissionEnd.toISOString(),
      voting_start_at: votingStart.toISOString(),
      voting_end_at: votingEnd.toISOString(),
    }, {
      onSuccess: () => {
        router.push("/admin/participatory-budgeting");
      }
    });
  };

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
            Back to Cycles
          </Button>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            Internal Governance
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight">
            Create <span className="text-primary">Budget Cycle</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            Initialize a new democratic fiscal period and define the parameters for citizen engagement.
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
                          placeholder="e.g. FY 2081/82 - Sustainable Urban Development"
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
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Administrative Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the scope and objectives for this cycle..."
                          className="min-h-[120px] rounded-xl bg-muted/10 border-border/50 focus:border-primary transition-all p-6 text-sm font-medium leading-relaxed"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs font-bold uppercase tracking-widest opacity-40">Internal context for other administrators</FormDescription>
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
                        <FormDescription className="text-xs font-bold uppercase tracking-widest opacity-40">Max projects per user</FormDescription>
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
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Launch Phase</FormLabel>
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
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Closure Phase</FormLabel>
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
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Ballot Opens</FormLabel>
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
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Ballot Finalization</FormLabel>
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
                disabled={mutations.createCycle.isPending}
              >
                {mutations.createCycle.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Initialize Fiscal Cycle
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1 h-14 text-muted-foreground font-black uppercase tracking-widest text-xs rounded-xl hover:text-foreground"
                onClick={() => router.back()}
              >
                Cancel Initialization
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>

  );
}