"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, MapPin } from "lucide-react";
import { Button } from "../../../../../../components/ui/button";
import { Input } from "../../../../../../components/ui/input";
import { Textarea } from "../../../../../../components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
// Domain Features
import { 
  useBudgetCycle, 
  usePBDepartments, 
  usePBMutations,
  type BudgetCycle,
  type ProposalCategory,
  type Department
} from "@/features/participatory-budgeting";

import { complaintsApi } from "@/features/complaints";
import { createClient } from "@/lib/supabase/client";

interface ProposalFormData {
  title: string;
  description: string;
  category: ProposalCategory; // This will now act as a Department selector
  department_id: string; // We will store the selected department ID here
  estimated_cost: number;
  ward_id: string;
  address_text: string;
}

export default function NewProposalPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;

  // --- Data Fetching & Mutations ---
  const { data: cycle, isLoading: cycleLoading } = useBudgetCycle(cycleId);
  const { data: departments = [], isLoading: deptsLoading } = usePBDepartments();
  const [wards, setWards] = useState<any[]>([]);
  const [wardsLoading, setWardsLoading] = useState(true);
  const { submitProposal: submitMutation } = usePBMutations();
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const loading = cycleLoading || deptsLoading || wardsLoading;

  const form = useForm<ProposalFormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "road_infrastructure",
      department_id: "",
      estimated_cost: 0,
      address_text: "",
    },
  });

  useEffect(() => {
    async function loadWards() {
      try {
        const wardsData = await complaintsApi.getWards(createClient());
        setWards(wardsData);
      } catch (error) {
        toast.error("Failed to load wards");
      } finally {
        setWardsLoading(false);
      }
    }
    loadWards();
  }, []);

  // Helper to map department code to category enum
  const getCategoryFromCode = (code: string): ProposalCategory => {
    switch (code) {
      case "ROAD":
        return "road_infrastructure";
      case "WATER":
        return "water_sanitation";
      case "WASTE":
        return "water_sanitation";
      case "HEALTH":
        return "health_safety";
      case "PARKS":
        return "parks_environment";
      case "BUILDING":
        return "other";
      case "WARD":
        return "education_culture";
      default:
        return "other";
    }
  };

  const onSubmit = async (data: ProposalFormData) => {
    if (!cycle) return;

    // Validate Department Selection
    if (!data.department_id) {
      toast.error("Please select a department");
      return;
    }

    // Get the selected department
    const selectedDept = departments.find((d: any) => d.id === data.department_id);
    if (!selectedDept) {
      toast.error("Invalid department selected");
      return;
    }

    // Map department to category
    const derivedCategory = getCategoryFromCode(selectedDept.code);

    // Validate Cost
    if (data.estimated_cost < cycle.min_project_cost) {
      form.setError("estimated_cost", {
        type: "min",
        message: `Minimum cost is NPR ${cycle.min_project_cost.toLocaleString()}`,
      });
      return;
    }

    if (
      cycle.max_project_cost &&
      data.estimated_cost > cycle.max_project_cost
    ) {
      form.setError("estimated_cost", {
        type: "max",
        message: `Maximum cost is NPR ${cycle.max_project_cost.toLocaleString()}`,
      });
      return;
    }

    submitMutation.mutate({
      data: {
        cycle_id: cycleId,
        title: data.title,
        description: data.description,
        category: derivedCategory,
        department_id: data.department_id,
        ward_id: data.ward_id === "city-wide" ? null : data.ward_id,
        estimated_cost: data.estimated_cost,
        address_text: data.address_text,
        location_point: null,
      },
      coverImage: coverImage || undefined
    }, {
      onSuccess: () => {
        router.push(`/citizen/participatory-budgeting/${cycleId}`);
      }
    });
  };


  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!cycle) return <div>Cycle not found</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-6 md:px-8">
      {/* 1. Ultra-Clean Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-12 shadow-sm mt-6 text-center">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30" />
        
        <div className="relative space-y-6 max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
            Discard Thesis
          </button>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
              Civic Submission
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase leading-none">
              Propose <span className="text-primary">Impact</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
              Formulate your vision for <span className="text-foreground font-bold">{cycle.title}</span>. Your technical concept will be reviewed for municipal feasibility.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Structured Form Content */}
      <div className="max-w-3xl mx-auto py-10">
        <Card className="rounded-3xl border border-border shadow-2xl bg-card overflow-hidden">
          <CardHeader className="p-8 md:p-12 border-b border-border/50 bg-muted/5 space-y-2">
             <CardTitle className="text-xl font-black uppercase tracking-[0.1em] text-foreground">Technical Specification</CardTitle>
             <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Architect your proposal with precision and clarity</p>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                <div className="space-y-10">
                  {/* Phase 1: Identity */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Initiative Nomenclature</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Ward 4 Botanical Infrastructure"
                            className="h-16 font-black text-2xl bg-muted/5 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl px-6"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-bold uppercase text-destructive" />
                      </FormItem>
                    )}
                  />

                  {/* Phase 2: Logistics */}
                  <div className="grid sm:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="department_id"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Domain Specification</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-2xl bg-muted/5 border-border font-black text-xs uppercase tracking-widest focus:ring-4 focus:ring-primary/5">
                                <SelectValue placeholder="Select Sector" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-border">
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id} className="text-xs font-black uppercase tracking-widest py-3">
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs font-bold uppercase text-destructive" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ward_id"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Geospatial Target</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-2xl bg-muted/5 border-border font-black text-xs uppercase tracking-widest focus:ring-4 focus:ring-primary/5">
                                <SelectValue placeholder="Select Area" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-border text-xs">
                              <SelectItem value="city-wide" className="font-black uppercase tracking-widest">Pokhara Metro (City Wide)</SelectItem>
                              {wards.map((ward) => (
                                <SelectItem key={ward.id} value={ward.id} className="font-black uppercase tracking-widest">
                                  Ward {ward.ward_number}: {ward.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs font-bold uppercase text-destructive" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Phase 3: Fiscal */}
                  <FormField
                    control={form.control}
                    name="estimated_cost"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Fiscal Projection (NPR)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                              <span className="text-xs font-black text-primary uppercase tracking-widest">NPR</span>
                              <div className="w-[1px] h-4 bg-border" />
                            </div>
                            <Input
                              type="number"
                              className="pl-20 h-14 rounded-2xl bg-muted/5 border-border font-black text-lg focus:ring-4 focus:ring-primary/5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <div className="flex justify-between items-center px-2">
                           <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">
                             Min: {cycle.min_project_cost.toLocaleString()}
                           </p>
                           <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 text-right">
                             Max: {cycle.max_project_cost ? cycle.max_project_cost.toLocaleString() : "Uncapped"}
                           </p>
                        </div>
                        <FormMessage className="text-xs font-bold uppercase text-destructive" />
                      </FormItem>
                    )}
                  />

                  {/* Phase 4: Narrative */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Operational Strategy</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detail the community problem, proposed methodology, and expected societal ROI..."
                            className="min-h-[200px] rounded-2xl bg-muted/5 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all p-8 text-sm font-medium leading-relaxed"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-bold uppercase text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_text"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Specific Contextual Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" strokeWidth={3} />
                            <Input
                              className="pl-14 h-14 rounded-2xl bg-muted/5 border-border font-black text-sm focus:ring-4 focus:ring-primary/5"
                              placeholder="Intersection, landmark, or cadastral reference"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs font-bold uppercase text-destructive" />
                      </FormItem>
                    )}
                  />

                  {/* Phase 5: Media */}
                  <div className="space-y-4">
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Technical Visualization (Optional)</FormLabel>
                    <div className="group relative border-2 border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        id="image-upload"
                        accept="image/*"
                        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                      />
                      <div className="relative z-10 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-card transition-all duration-500">
                          <Upload className="h-8 w-8 text-primary/60" strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-foreground">
                            {coverImage ? coverImage.name : "Integrate Evidence"}
                          </p>
                          <p className="text-xs text-muted-foreground/40 mt-1.5 font-bold uppercase tracking-widest">
                            Optimized High-Res JPG/PNG (Max 10MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Execution */}
                <div className="flex flex-col gap-4 pt-10 border-t border-border/50">
                  <Button 
                    type="submit" 
                    className="w-full h-16 bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-wider rounded-2xl shadow-2xl shadow-primary/20 transition-all text-xs active:scale-95"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    ) : null}
                    Execute Submission
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-14 text-muted-foreground/40 font-black uppercase tracking-widest text-xs rounded-2xl hover:text-foreground hover:bg-muted/30 transition-all"
                    onClick={() => router.back()}
                  >
                    Abandon Project Concept
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>


  );
}