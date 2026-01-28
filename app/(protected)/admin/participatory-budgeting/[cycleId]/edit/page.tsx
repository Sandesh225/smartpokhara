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
import { pbService, type BudgetCycle } from "@/lib/supabase/queries/participatory-budgeting";

export default function EditCyclePage() {
  const router = useRouter();
  const params = useParams();
  const cycleId = params.cycleId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  // 1. Fetch Existing Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await pbService.getCycleById(cycleId);
        if (!data) {
          toast.error("Cycle not found");
          router.push("/admin/participatory-budgeting");
          return;
        }

        // Helper to format DB timestamp to HTML datetime-local input format (YYYY-MM-DDThh:mm)
        const formatForInput = (dateString: string) => {
          if (!dateString) return "";
          return new Date(dateString).toISOString().slice(0, 16);
        };

        // Pre-fill form
        form.reset({
          title: data.title,
          description: data.description || "",
          total_budget_amount: data.total_budget_amount,
          min_project_cost: data.min_project_cost,
          max_project_cost: data.max_project_cost || 0,
          submission_start_at: formatForInput(data.submission_start_at),
          submission_end_at: formatForInput(data.submission_end_at),
          voting_start_at: formatForInput(data.voting_start_at),
          voting_end_at: formatForInput(data.voting_end_at),
          max_votes_per_user: data.max_votes_per_user,
        });
      } catch (error) {
        console.error("Load Error:", error);
        toast.error("Failed to load cycle data");
      } finally {
        setLoading(false);
      }
    };

    if (cycleId) loadData();
  }, [cycleId, form, router]);

  // 2. Handle Update
  const onSubmit = async (data: any) => {
    // Basic validation
    const submissionStart = new Date(data.submission_start_at);
    const submissionEnd = new Date(data.submission_end_at);
    const votingStart = new Date(data.voting_start_at);
    const votingEnd = new Date(data.voting_end_at);

    if (submissionEnd <= submissionStart) return toast.error("Submission end date must be after start date");
    if (votingStart <= submissionEnd) return toast.error("Voting should start after submission period ends");
    if (votingEnd <= votingStart) return toast.error("Voting end date must be after start date");

    setSubmitting(true);
    try {
      await pbService.updateBudgetCycle(cycleId, {
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
      });
      
      toast.success("✅ Cycle updated successfully!");
      router.push(`/admin/participatory-budgeting/${cycleId}`);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update cycle");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-4 sm:px-6">
      {/* Header */}
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="pl-0 hover:pl-2 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Cancel & Back
        </Button>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Edit Configuration
              </h1>
              <p className="text-muted-foreground mt-1">
                Update rules, budget, and timeline for {form.getValues("title")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Alert className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-900 dark:text-yellow-200">
          <strong>Warning:</strong> Changing budget limits or dates while a cycle is active may affect ongoing user submissions or voting.
        </AlertDescription>
      </Alert>

      {/* Main Form */}
      <Card className="shadow-xl">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold border-b pb-2">1. Basic Information</h3>
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle Title</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea {...field} className="min-h-[100px]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold border-b pb-2">2. Budget Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="total_budget_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Budget (NPR)</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_votes_per_user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Users className="w-4 h-4" /> Max Votes / User</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="min_project_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Project Cost</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_project_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Project Cost</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Timeline Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold border-b pb-2">3. Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
                    <h4 className="font-bold text-sm">Submission Phase</h4>
                    <FormField
                      control={form.control}
                      name="submission_start_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Start</FormLabel>
                          <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="submission_end_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">End</FormLabel>
                          <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
                    <h4 className="font-bold text-sm">Voting Phase</h4>
                    <FormField
                      control={form.control}
                      name="voting_start_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Start</FormLabel>
                          <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="voting_end_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">End</FormLabel>
                          <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
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