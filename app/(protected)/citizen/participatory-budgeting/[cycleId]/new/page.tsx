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
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:pl-2 transition-all"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Submit Project Proposal</CardTitle>
          <p className="text-sm text-muted-foreground">
            Share your idea for the {cycle.title}.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. New Playground in Ward 5"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Department Selection */}
                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relevant Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ward_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Ward</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a ward" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="city-wide">City Wide</SelectItem>
                          {wards.map((ward) => (
                            <SelectItem key={ward.id} value={ward.id}>
                              Ward {ward.ward_number} - {ward.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="estimated_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost (NPR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        min={cycle.min_project_cost}
                        max={cycle.max_project_cost || undefined}
                      />
                    </FormControl>
                    <FormDescription>
                      Range: NPR {cycle.min_project_cost.toLocaleString()} -{" "}
                      {cycle.max_project_cost
                        ? cycle.max_project_cost.toLocaleString()
                        : "No Limit"}
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the project, who it benefits, and why it's needed."
                        className="min-h-[120px]"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Details</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="Specific street address or landmark"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Cover Image (Optional)</FormLabel>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Input
                    type="file"
                    className="hidden"
                    id="image-upload"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">
                      {coverImage
                        ? coverImage.name
                        : "Click to upload an image"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      JPG, PNG up to 5MB
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitMutation.isPending}>
                  {submitMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Proposal
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}