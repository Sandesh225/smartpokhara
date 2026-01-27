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
import { pbService } from "@/lib/supabase/queries/participatory-budgeting";

export default function CreateCyclePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      await pbService.createBudgetCycle({
        ...data,
        is_active: true,
        submission_start_at: submissionStart.toISOString(),
        submission_end_at: submissionEnd.toISOString(),
        voting_start_at: votingStart.toISOString(),
        voting_end_at: votingEnd.toISOString(),
      });
      
      toast.success("Budget cycle created successfully! 🎉");
      router.push("/admin/participatory-budgeting");
    } catch (error: any) {
      console.error("Create cycle error:", error);
      toast.error(error.message || "Failed to create cycle");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-4 sm:px-6">
      {/* Header */}
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="pl-0 hover:pl-2 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cycles
        </Button>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent border border-primary/20 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 dark:bg-primary/30 rounded-xl">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Create New Budget Cycle
              </h1>
              <p className="text-muted-foreground mt-1">
                Set up a new participatory budgeting cycle for citizen engagement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-200">
          A budget cycle consists of two phases: <strong>Submission Period</strong> (citizens propose projects) 
          and <strong>Voting Period</strong> (citizens vote on approved proposals).
        </AlertDescription>
      </Alert>

      {/* Main Form */}
      <Card className="shadow-xl bg-gradient-to-br from-card to-card/95">
        <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Cycle Configuration
          </CardTitle>
          <CardDescription>
            Fill in all required information to create the budget cycle
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground pb-2 border-b">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black">1</span>
                  Basic Information
                </h3>

                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Cycle Title *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Fiscal Year 2081/82 - Community Infrastructure" 
                          {...field}
                          className="bg-gradient-to-br from-background to-muted/10 dark:from-background dark:to-muted/5 border-2 focus:border-primary"
                        />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive name for this budget cycle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the focus and goals of this budgeting cycle..."
                          className="min-h-[100px] bg-gradient-to-br from-background to-muted/10 dark:from-background dark:to-muted/5 border-2 focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional context about what this cycle aims to achieve
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground pb-2 border-b">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black">2</span>
                  Budget Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="total_budget_amount"
                    rules={{ 
                      required: "Total budget is required",
                      min: { value: 1, message: "Budget must be greater than 0" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          Total Budget (NPR) *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="50000000"
                            className="font-mono font-bold text-lg bg-gradient-to-br from-background to-muted/10 border-2 focus:border-primary"
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription>
                          Total available: NPR {Number(field.value || 0).toLocaleString()}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_votes_per_user"
                    rules={{ 
                      required: "Vote limit is required",
                      min: { value: 1, message: "At least 1 vote required" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Max Votes per Citizen *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="3"
                            className="bg-gradient-to-br from-background to-muted/10 border-2 focus:border-primary"
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription>
                          How many proposals each citizen can vote for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_project_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Minimum Project Cost (NPR)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100000"
                            className="font-mono bg-gradient-to-br from-background to-muted/10 border-2 focus:border-primary"
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Minimum cost for proposals
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_project_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Maximum Project Cost (NPR)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5000000"
                            className="font-mono bg-gradient-to-br from-background to-muted/10 border-2 focus:border-primary"
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Maximum cost for proposals
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Timeline Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground pb-2 border-b">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black">3</span>
                  Timeline Configuration
                </h3>

                <Alert className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <AlertDescription className="text-purple-900 dark:text-purple-200">
                    <strong>Important:</strong> Voting period should start after the submission period ends to allow for proposal review.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                    <h4 className="font-bold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
                      <span className="text-xl">📝</span>
                      Submission Period
                    </h4>

                    <FormField
                      control={form.control}
                      name="submission_start_at"
                      rules={{ required: "Submission start date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-xs">Start Date & Time *</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              className="bg-white dark:bg-slate-900 border-2 focus:border-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="submission_end_at"
                      rules={{ required: "Submission end date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-xs">End Date & Time *</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              className="bg-white dark:bg-slate-900 border-2 focus:border-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
                      <span className="text-xl">🗳️</span>
                      Voting Period
                    </h4>

                    <FormField
                      control={form.control}
                      name="voting_start_at"
                      rules={{ required: "Voting start date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-xs">Start Date & Time *</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              className="bg-white dark:bg-slate-900 border-2 focus:border-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="voting_end_at"
                      rules={{ required: "Voting end date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-xs">End Date & Time *</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              className="bg-white dark:bg-slate-900 border-2 focus:border-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={submitting}
                  className="flex-1 border-2"
                >
                  Cancel
                </Button>

                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300" 
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Cycle...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Create Budget Cycle
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}