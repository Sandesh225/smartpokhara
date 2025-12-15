"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Icons
import {
  Loader2,
  MapPin,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  FileText,
  Globe,
  Home,
  Info,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Shield,
  Clock,
  FileImage,
  AlertTriangle,
  Zap,
  Flame,
  Droplets,
  Lightbulb,
  Trash2,
  Construction,
  Trees,
  Volume2,
} from "lucide-react";

import type {
  SubmitComplaintRequest,
  ComplaintCategory,
  ComplaintSubcategory,
  Ward,
} from "@/lib/supabase/queries/complaints";
import { complaintsService } from "@/lib/supabase/queries/complaints";

// ----------------------------------------------------------------------
// 1. HELPERS FOR UI/UX IMPROVEMENT
// ----------------------------------------------------------------------

// Helper to clean up "Road - Road and Infrastructure" to just "Road and Infrastructure"
// or whatever cleaner name you prefer.
const formatCategoryName = (name: string) => {
  // If the name is "Road - Infrastructure", split by "-" and take the last part
  if (name.includes("-")) {
    const parts = name.split("-");
    return parts[parts.length - 1].trim();
  }
  return name;
};

// Map keywords in category names to Lucide Icons
const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("water") || lowerName.includes("leak"))
    return <Droplets className="h-8 w-8" />;
  if (
    lowerName.includes("electric") ||
    lowerName.includes("light") ||
    lowerName.includes("power")
  )
    return <Lightbulb className="h-8 w-8" />;
  if (
    lowerName.includes("garbage") ||
    lowerName.includes("waste") ||
    lowerName.includes("trash")
  )
    return <Trash2 className="h-8 w-8" />;
  if (
    lowerName.includes("road") ||
    lowerName.includes("pothole") ||
    lowerName.includes("street")
  )
    return <Construction className="h-8 w-8" />;
  if (
    lowerName.includes("tree") ||
    lowerName.includes("park") ||
    lowerName.includes("garden")
  )
    return <Trees className="h-8 w-8" />;
  if (lowerName.includes("noise") || lowerName.includes("sound"))
    return <Volume2 className="h-8 w-8" />;

  // Default icon
  return <FileText className="h-8 w-8" />;
};

const MapPicker = dynamic(() => import("@/components/shared/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center border-2 border-slate-200 border-dashed">
      <div className="flex flex-col items-center text-slate-400">
        <MapPin className="h-8 w-8 mb-2 opacity-50" />
        <span className="text-sm font-medium">Loading Map...</span>
      </div>
    </div>
  ),
});

// ----------------------------------------------------------------------
// 2. SCHEMA DEFINITION
// ----------------------------------------------------------------------

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title is too short." })
    .max(100, { message: "Title is too long." }),
  category_id: z.string().min(1, { message: "Please select a category." }),
  subcategory_id: z.string().optional().nullable(),
  priority: z
    .enum(["critical", "urgent", "high", "medium", "low"])
    .default("medium"),
  is_anonymous: z.boolean().default(false),
  ward_id: z.string().min(1, { message: "Please select a ward." }),
  address_text: z.string().min(5, { message: "Address is required." }),
  landmark: z.string().optional().nullable(),
  location_point: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .nullable(),
  description: z
    .string()
    .min(20, { message: "Please provide more details (min 20 chars)." }),
});

type FormData = z.infer<typeof formSchema>;

interface ComplaintFormProps {
  categories: ComplaintCategory[];
  wards: Ward[];
  onSubmit: (
    data: SubmitComplaintRequest,
    attachments: File[]
  ) => Promise<void>;
}

const STEPS = [
  {
    id: 1,
    title: "Category",
    description: "What's the issue?",
    icon: FileText,
  },
  { id: 2, title: "Location", description: "Where is it?", icon: MapPin },
  { id: 3, title: "Details", description: "Tell us more", icon: Camera },
  {
    id: 4,
    title: "Confirm",
    description: "Review & Submit",
    icon: CheckCircle,
  },
];

// ----------------------------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------------------------

export default function ComplaintForm({
  categories,
  wards,
  onSubmit,
}: ComplaintFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [subcategories, setSubcategories] = useState<ComplaintSubcategory[]>(
    []
  );
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category_id: "",
      priority: "medium",
      is_anonymous: false,
      ward_id: "",
      address_text: "",
      location_point: null,
      description: "",
    },
    mode: "onChange",
  });

  const watchedCategory = watch("category_id");

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!watchedCategory) {
        setSubcategories([]);
        setValue("subcategory_id", null);
        return;
      }
      setLoadingSubcategories(true);
      try {
        const subs = await complaintsService.getSubcategories(watchedCategory);
        setSubcategories(subs);
        setValue("subcategory_id", null);
      } catch (err) {
        console.error("Error loading subcategories:", err);
      } finally {
        setLoadingSubcategories(false);
      }
    };
    loadSubcategories();
  }, [watchedCategory, setValue]);

  // File handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Simple validation (add size checks if needed)
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Navigation
  const nextStep = async () => {
    let fields: (keyof FormData)[] = [];
    if (currentStep === 1) fields = ["category_id", "title"];
    if (currentStep === 2) fields = ["ward_id", "address_text"];
    if (currentStep === 3) fields = ["description"];

    const isValid = await trigger(fields);
    if (isValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLocationSelect = useCallback(
    (location: { lat: number; lng: number }) => {
      setValue(
        "location_point",
        { type: "Point", coordinates: [location.lng, location.lat] },
        { shouldValidate: true }
      );
    },
    [setValue]
  );

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Note: We do NOT pass department_id here.
      // The Backend RPC (rpc_submit_complaint) handles the auto-assignment
      // based on the category_id or subcategory_id.
      await onSubmit(
        { ...data, source: "web" } as SubmitComplaintRequest,
        attachments
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 20 : -20, opacity: 0 }),
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 -z-10 rounded-full" />
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div
                key={step.id}
                className="flex flex-col items-center bg-white px-2"
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isActive || isCompleted
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs font-semibold mt-2 ${isActive ? "text-blue-600" : "text-slate-500"}`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card className="shadow-lg border-0 ring-1 ring-slate-200/50">
          <CardHeader className="bg-slate-50/50 border-b pb-6">
            <CardTitle className="text-xl">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 min-h-[400px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* STEP 1: CATEGORY SELECTION */}
                {currentStep === 1 && (
                  <>
                    <div className="space-y-4">
                      <Label className="text-base">
                        What best describes the issue?
                      </Label>
                      <Controller
                        name="category_id"
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {categories.map((category) => {
                              const isSelected = field.value === category.id;
                              return (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() => field.onChange(category.id)}
                                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                                    isSelected
                                      ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                                      : "border-slate-100 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                                  }`}
                                >
                                  <div
                                    className={`mb-3 p-3 rounded-full ${isSelected ? "bg-blue-100" : "bg-slate-100"}`}
                                  >
                                    {getCategoryIcon(category.name)}
                                  </div>
                                  <span className="font-semibold text-sm text-center">
                                    {formatCategoryName(category.name)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      />
                      {errors.category_id && (
                        <p className="text-red-500 text-sm mt-2">
                          {errors.category_id.message}
                        </p>
                      )}
                    </div>

                    {/* Subcategories */}
                    {subcategories.length > 0 && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label>Specific Issue (Optional)</Label>
                        <Controller
                          name="subcategory_id"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Select specific type" />
                              </SelectTrigger>
                              <SelectContent>
                                {subcategories.map((sub) => (
                                  <SelectItem key={sub.id} value={sub.id}>
                                    {sub.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Issue Title</Label>
                      <Input
                        {...control.register("title")}
                        placeholder="e.g. Broken streetlight near park"
                        className="h-12 text-lg"
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm">
                          {errors.title.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* STEP 2: LOCATION */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>
                            Ward No. <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name="ward_id"
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select Ward" />
                                </SelectTrigger>
                                <SelectContent>
                                  {wards.map((ward) => (
                                    <SelectItem key={ward.id} value={ward.id}>
                                      Ward {ward.ward_number} - {ward.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.ward_id && (
                            <p className="text-red-500 text-sm">
                              {errors.ward_id.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Exact Address{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            {...control.register("address_text")}
                            placeholder="Street name, house number, etc."
                            className="resize-none h-32"
                          />
                          {errors.address_text && (
                            <p className="text-red-500 text-sm">
                              {errors.address_text.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Nearby Landmark (Optional)</Label>
                          <Input
                            {...control.register("landmark")}
                            placeholder="e.g. Behind City Hospital"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Pin on Map
                          (Recommended)
                        </Label>
                        <div className="rounded-xl overflow-hidden border border-slate-200 h-[300px]">
                          <MapPicker onLocationSelect={handleLocationSelect} />
                        </div>
                        <p className="text-xs text-slate-500">
                          Click on the map to automatically get coordinates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: DETAILS */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Detailed Description</Label>
                      <Textarea
                        {...control.register("description")}
                        placeholder="Please describe the issue in detail. When did it start? How severe is it?"
                        className="min-h-[150px] text-base"
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Photos / Documents</Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors text-center cursor-pointer relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <p className="font-medium text-slate-700">
                          Click to upload photos
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Supports JPG, PNG (Max 5MB)
                        </p>
                      </div>

                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {attachments.map((file, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="pl-2 pr-1 py-1 flex items-center gap-2"
                            >
                              <FileImage className="h-3 w-3" />
                              <span className="max-w-[150px] truncate">
                                {file.name}
                              </span>
                              <button
                                onClick={() => removeAttachment(i)}
                                className="hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <Controller
                        name="is_anonymous"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="anon"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <label htmlFor="anon" className="text-sm cursor-pointer">
                        <span className="font-semibold block text-blue-900">
                          Submit Anonymously?
                        </span>
                        <span className="text-blue-700">
                          Your name will be hidden from public view.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">
                        Almost Done!
                      </AlertTitle>
                      <AlertDescription className="text-green-700">
                        We have auto-assigned this to the relevant department
                        based on your category selection.
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 text-sm">
                      <div className="grid grid-cols-3 gap-4 border-b border-slate-200 pb-4">
                        <span className="text-slate-500">Category</span>
                        <span className="col-span-2 font-medium">
                          {
                            categories.find(
                              (c) => c.id === watch("category_id")
                            )?.name
                          }
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-slate-200 pb-4">
                        <span className="text-slate-500">Title</span>
                        <span className="col-span-2 font-medium">
                          {watch("title")}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-slate-200 pb-4">
                        <span className="text-slate-500">Location</span>
                        <span className="col-span-2 font-medium">
                          {watch("address_text")} (Ward{" "}
                          {
                            wards.find((w) => w.id === watch("ward_id"))
                              ?.ward_number
                          }
                          )
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-slate-500">Description</span>
                        <span className="col-span-2 text-slate-700">
                          {watch("description")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          {/* Footer Controls */}
          <div className="p-6 bg-slate-50 rounded-b-xl border-t flex justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next Step <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 min-w-[140px]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit Complaint"
                )}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
