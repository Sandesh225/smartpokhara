"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  Loader2,
  MapPin,
  Upload,
  X,
  CheckCircle2,
  Camera,
  FileText,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Image as ImageIcon,
  Droplets,
  Lightbulb,
  Trash2,
  Construction,
  Trees,
  Volume2,
  Edit2,
  Paperclip,
  Check,
  Building2,
  Car,
  HeartPulse,
  Zap,
  BusFront,
  Wind,
  HelpCircle,
  Waves,
} from "lucide-react";

import type {
  SubmitComplaintRequest,
  ComplaintCategory,
  ComplaintSubcategory,
  Ward,
} from "@/lib/supabase/queries/complaints";
import { complaintsService } from "@/lib/supabase/queries/complaints";

// ----------------------------------------------------------------------
// 1. HELPERS & UTILS
// ----------------------------------------------------------------------

const formatCategoryName = (name: string) => {
  if (name.includes("-")) {
    const parts = name.split("-");
    return parts[parts.length - 1].trim();
  }
  return name;
};

// FIX: Expanded icon mapping to cover all 14 seed categories
const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("road") || lowerName.includes("pothole"))
    return <Construction className="h-6 w-6" />;
  if (lowerName.includes("drain") || lowerName.includes("sewer"))
    return <Waves className="h-6 w-6" />;
  if (
    lowerName.includes("waste") ||
    lowerName.includes("garbage") ||
    lowerName.includes("trash")
  )
    return <Trash2 className="h-6 w-6" />;
  if (lowerName.includes("street light") || lowerName.includes("bulb"))
    return <Lightbulb className="h-6 w-6" />;
  if (lowerName.includes("water") || lowerName.includes("leak"))
    return <Droplets className="h-6 w-6" />;
  if (
    lowerName.includes("park") ||
    lowerName.includes("tree") ||
    lowerName.includes("environment")
  )
    return <Trees className="h-6 w-6" />;
  if (lowerName.includes("building") || lowerName.includes("construction"))
    return <Building2 className="h-6 w-6" />;
  if (lowerName.includes("traffic") || lowerName.includes("parking"))
    return <Car className="h-6 w-6" />;
  if (lowerName.includes("health") || lowerName.includes("hospital"))
    return <HeartPulse className="h-6 w-6" />;
  if (lowerName.includes("electric") || lowerName.includes("power"))
    return <Zap className="h-6 w-6" />;
  if (lowerName.includes("transport") || lowerName.includes("bus"))
    return <BusFront className="h-6 w-6" />;
  if (lowerName.includes("noise") || lowerName.includes("sound"))
    return <Volume2 className="h-6 w-6" />;
  if (lowerName.includes("air") || lowerName.includes("pollution"))
    return <Wind className="h-6 w-6" />;
  if (lowerName.includes("other") || lowerName.includes("general"))
    return <HelpCircle className="h-6 w-6" />;

  return <FileText className="h-6 w-6" />;
};

// Dynamic Map Import
const MapPicker = dynamic(() => import("@/components/shared/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-blue-50/30 animate-pulse rounded-xl flex items-center justify-center border-2 border-slate-200 border-dashed">
      <div className="flex flex-col items-center text-slate-400 gap-3">
        <div className="h-14 w-14 rounded-full bg-white shadow-md flex items-center justify-center">
          <MapPin className="h-7 w-7 text-blue-500 animate-bounce" />
        </div>
        <span className="text-sm font-semibold">
          Loading Interactive Map...
        </span>
      </div>
    </div>
  ),
});

// ----------------------------------------------------------------------
// 2. SCHEMA & TYPES
// ----------------------------------------------------------------------

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title is too short (min 5 chars)." })
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
    title: "Review",
    description: "Ready to submit?",
    icon: CheckCircle2,
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [previews, setPreviews] = useState<string[]>([]);

  const [subcategories, setSubcategories] = useState<ComplaintSubcategory[]>(
    []
  );
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    setFocus,
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
  const formValues = watch();

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

  // --- FILE HANDLING ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name}`, {
          description: "Max file size is 5MB",
        });
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`, {
          description: "Only JPG, PNG, and WebP are allowed",
        });
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...validPreviews]);
      toast.success(`Added ${validFiles.length} photo(s)`, {
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }

    // Reset input
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      // Revoke URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    toast.success("Photo removed", {
      className: "bg-slate-50 border-slate-200 text-slate-800",
    });
  };

  // --- PREVENT ACCIDENTAL ENTER SUBMIT ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Enter key from submitting on ANY step
    // User must explicitly click "Submit Complaint" button
    if (e.key === "Enter") {
      // Allow Enter only if focused on the submit button itself
      const target = e.target as HTMLElement;
      if (
        target.tagName !== "BUTTON" ||
        target.getAttribute("type") !== "submit"
      ) {
        e.preventDefault();
      }
    }
  };

  // --- NAVIGATION ---
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
      toast.success("Step completed", {
        description: `Moving to ${STEPS[currentStep].title}...`,
        duration: 1500,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } else {
      toast.error("Please fill in required fields", {
        description: "Check the highlighted errors.",
        className: "bg-red-50 border-red-200 text-red-800",
      });
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        setFocus(firstError as keyof FormData);
      }
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLocationSelect = useCallback(
    (location: { lat: number; lng: number }) => {
      setValue(
        "location_point",
        { type: "Point", coordinates: [location.lng, location.lat] },
        { shouldValidate: true }
      );
      toast.success("Location pinned", {
        icon: <MapPin className="h-4 w-4 text-green-600" />,
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
    },
    [setValue]
  );

  const handleFormSubmit = async (data: FormData) => {
    // CRITICAL: Only allow submission on step 4
    if (currentStep !== 4) {
      console.warn("Form submission attempted before reaching review step");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting complaint...", {
      description: "Securely transmitting your data.",
    });

    try {
      await onSubmit(
        { ...data, source: "web" } as SubmitComplaintRequest,
        attachments
      );
      toast.success("Complaint Submitted!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("Submission Failed", {
        id: toastId,
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ANIMATIONS ---
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 20 : -20, opacity: 0 }),
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(handleFormSubmit)}
      onKeyDown={handleKeyDown}
      className="w-full"
    >
      {/* PREMIUM STEPPER */}
      <div className="mb-10">
        <div className="relative flex justify-between items-center">
          {/* Progress Track */}
          <div className="absolute left-0 right-0 top-[18px] h-1 bg-slate-200 -z-10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-sm"
              initial={{ width: "0%" }}
              animate={{
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative"
              >
                <motion.button
                  type="button"
                  onClick={() => isCompleted && jumpToStep(step.id)}
                  disabled={!isCompleted}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={`relative z-10 h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-white border-blue-600 shadow-lg shadow-blue-200 ring-4 ring-blue-100"
                      : isCompleted
                      ? "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-600 shadow-md hover:scale-105 cursor-pointer"
                      : "bg-slate-50 border-slate-300"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" strokeWidth={3} />
                  ) : (
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                  )}
                </motion.button>

                <div className="absolute top-12 flex flex-col items-center w-24 text-center pointer-events-none">
                  <span
                    className={`text-xs font-bold transition-colors duration-300 ${
                      isActive ? "text-blue-700" : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                    {step.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARD CONTAINER */}
      <Card className="shadow-xl border-0 bg-white overflow-hidden ring-1 ring-slate-900/5 rounded-2xl">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-6 pt-8 px-6 md:px-10">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200/50 flex items-center justify-center text-white ring-4 ring-blue-50 shrink-0">
              {React.createElement(STEPS[currentStep - 1].icon, {
                className: "h-7 w-7",
                strokeWidth: 2.5,
              })}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-base text-slate-600 mt-1 font-medium">
                {STEPS[currentStep - 1].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-10 min-h-[450px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-8"
            >
              {/* STEP 1: CATEGORY */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-bold text-slate-800">
                      What type of issue are you reporting?
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
                                className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                                  isSelected
                                    ? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-lg shadow-blue-100 scale-[1.02]"
                                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 hover:shadow-md"
                                }`}
                              >
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-3 right-3 text-blue-600"
                                  >
                                    <CheckCircle2
                                      className="h-6 w-6 fill-blue-100"
                                      strokeWidth={2.5}
                                    />
                                  </motion.div>
                                )}
                                <div
                                  className={`mb-4 p-4 rounded-full transition-all duration-200 ${
                                    isSelected
                                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md"
                                      : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                                  }`}
                                >
                                  {getCategoryIcon(category.name)}
                                </div>
                                <span
                                  className={`font-bold text-sm text-center leading-tight ${
                                    isSelected
                                      ? "text-blue-900"
                                      : "text-slate-700 group-hover:text-blue-800"
                                  }`}
                                >
                                  {formatCategoryName(category.name)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                    {errors.category_id && (
                      <Alert
                        variant="destructive"
                        className="animate-in slide-in-from-top-2 border-red-200 bg-red-50 text-red-900"
                      >
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800 font-bold">
                          Selection Required
                        </AlertTitle>
                        <AlertDescription className="text-red-700">
                          {errors.category_id.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {subcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <Label className="text-base font-semibold text-slate-800">
                        Specific Issue (Optional)
                      </Label>
                      <Controller
                        name="subcategory_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-xl text-base px-4 hover:bg-white hover:border-blue-300 transition-all focus:ring-2 focus:ring-blue-500 shadow-sm">
                              <SelectValue placeholder="Select specific type..." />
                            </SelectTrigger>
                            <SelectContent>
                              {subcategories.map((sub) => (
                                <SelectItem
                                  key={sub.id}
                                  value={sub.id}
                                  className="py-3 cursor-pointer hover:bg-blue-50"
                                >
                                  {sub.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-800">
                      Give it a short title{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...control.register("title")}
                      placeholder="e.g. Broken streetlight on Main St."
                      className="h-14 text-base bg-slate-50 border-slate-200 rounded-xl px-4 hover:bg-white hover:border-blue-300 transition-all focus:ring-2 focus:ring-blue-500 shadow-sm placeholder:text-slate-400"
                    />
                    {errors.title && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 text-sm ml-1 font-medium flex items-center gap-1.5"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {errors.title.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Form Fields */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-slate-800">
                          Ward Number <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                          name="ward_id"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-xl px-4 text-base hover:bg-white hover:border-blue-300 transition-all focus:ring-2 focus:ring-blue-500 shadow-sm">
                                <SelectValue placeholder="Select Ward..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {wards.map((ward) => (
                                  <SelectItem
                                    key={ward.id}
                                    value={ward.id}
                                    className="py-3 cursor-pointer hover:bg-blue-50"
                                  >
                                    <span className="font-bold text-blue-900">
                                      Ward {ward.ward_number}
                                    </span>
                                    <span className="text-slate-500 ml-2 text-xs uppercase tracking-wider">
                                      {ward.name}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.ward_id && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 text-sm ml-1 font-medium flex items-center gap-1.5"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.ward_id.message}
                          </motion.p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-slate-800">
                          Exact Address <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          {...control.register("address_text")}
                          placeholder="Street name, house number, nearby shop..."
                          className="min-h-[140px] text-base bg-slate-50 border-slate-200 rounded-xl p-4 hover:bg-white hover:border-blue-300 transition-all focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
                        />
                        {errors.address_text && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 text-sm ml-1 font-medium flex items-center gap-1.5"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.address_text.message}
                          </motion.p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-slate-800">
                          Nearby Landmark (Optional)
                        </Label>
                        <Input
                          {...control.register("landmark")}
                          placeholder="e.g. Behind City Hospital"
                          className="h-14 bg-slate-50 border-slate-200 rounded-xl px-4 hover:bg-white hover:border-blue-300 transition-all focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Right: Map */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center gap-2 text-blue-900">
                        <MapPin className="h-5 w-5 text-blue-600" /> Pin Exact
                        Location
                      </Label>
                      <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md h-[420px] bg-slate-50 transition-all hover:border-blue-400 hover:shadow-lg">
                        <MapPicker onLocationSelect={handleLocationSelect} />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-blue-200 text-xs font-bold text-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-red-500 animate-bounce" />{" "}
                          Click map to update pin
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DETAILS */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-800">
                      Describe the issue in detail{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      {...control.register("description")}
                      placeholder="Please provide as much detail as possible. When did you first notice it? How severe is it? Has it affected anyone?"
                      className="min-h-[200px] text-base bg-slate-50 border-slate-200 rounded-xl p-5 hover:bg-white hover:border-blue-300 transition-all focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y shadow-sm"
                    />
                    {errors.description && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 text-sm ml-1 font-medium flex items-center gap-1.5"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {errors.description.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2 text-slate-800">
                      <ImageIcon className="h-5 w-5 text-slate-600" />
                      Add Photos / Documents
                    </Label>

                    <div className="group relative border-2 border-dashed border-slate-300 rounded-2xl p-10 bg-gradient-to-br from-slate-50 to-blue-50/20 hover:from-blue-50 hover:to-indigo-50/30 hover:border-blue-400 transition-all duration-300 text-center cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center gap-3 pointer-events-none">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="h-16 w-16 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-200 group-hover:shadow-lg group-hover:border-blue-300 transition-all duration-300"
                        >
                          <Upload className="h-8 w-8 text-blue-600" />
                        </motion.div>
                        <div className="space-y-1">
                          <p className="font-bold text-lg text-slate-900">
                            Click or drag photos here
                          </p>
                          <p className="text-sm text-slate-500">
                            Supports JPG, PNG, WebP (Max 5MB per file)
                          </p>
                        </div>
                      </div>
                    </div>

                    {attachments.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                      >
                        {attachments.map((file, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative group rounded-xl overflow-hidden border-2 border-slate-200 aspect-square shadow-sm bg-white hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <img
                              src={previews[i]}
                              alt="Preview"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeAttachment(i)}
                                className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm hover:scale-110 active:scale-95"
                              >
                                <X className="h-5 w-5" strokeWidth={2.5} />
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <p className="text-[10px] text-white truncate font-mono">
                                {file.name}
                              </p>
                              <p className="text-[9px] text-white/70">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border-2 border-blue-200 mt-6 hover:shadow-md transition-shadow">
                    <Controller
                      name="is_anonymous"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="anon"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-6 w-6 border-2 border-blue-400 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 rounded-md mt-0.5 shrink-0"
                        />
                      )}
                    />
                    <label
                      htmlFor="anon"
                      className="cursor-pointer select-none space-y-1 flex-1"
                    >
                      <span className="block font-bold text-blue-900 text-sm">
                        Submit Anonymously?
                      </span>
                      <span className="block text-xs text-blue-700 leading-relaxed">
                        Your contact details will be hidden from public view.
                        Only authorized officers can see your information.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <Alert className="bg-gradient-to-br from-emerald-50 to-green-50/50 border-2 border-emerald-200 ring-1 ring-emerald-100 rounded-xl shadow-sm">
                    <CheckCircle2
                      className="h-5 w-5 text-emerald-600"
                      strokeWidth={2.5}
                    />
                    <AlertTitle className="text-emerald-900 font-bold ml-2 text-base">
                      Almost Done!
                    </AlertTitle>
                    <AlertDescription className="text-emerald-700 ml-2 leading-relaxed">
                      Please review the details below before submitting. We've
                      auto-assigned the relevant department for faster
                      processing.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Issue Card */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative group hover:border-blue-300 hover:shadow-md transition-all">
                      <button
                        type="button"
                        onClick={() => jumpToStep(1)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                        title="Edit Category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Issue Type
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 border-2 border-blue-100 shadow-sm">
                          {getCategoryIcon(
                            categories.find(
                              (c) => c.id === formValues.category_id
                            )?.name || ""
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-base">
                            {formatCategoryName(
                              categories.find(
                                (c) => c.id === formValues.category_id
                              )?.name || "Unknown"
                            )}
                          </p>
                          <p className="text-slate-600 font-medium text-sm mt-0.5">
                            {formValues.title}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative group hover:border-blue-300 hover:shadow-md transition-all">
                      <button
                        type="button"
                        onClick={() => jumpToStep(2)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                        title="Edit Location"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Location
                      </h3>
                      <div className="space-y-3">
                        <div className="flex gap-2 text-slate-700">
                          <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                          <span className="font-bold text-slate-900 text-base">
                            Ward{" "}
                            {
                              wards.find((w) => w.id === formValues.ward_id)
                                ?.ward_number
                            }
                          </span>
                        </div>
                        <div className="pl-7">
                          <p className="text-slate-600 leading-relaxed text-sm">
                            {formValues.address_text}
                          </p>
                          {formValues.landmark && (
                            <p className="text-slate-500 text-xs italic mt-2 flex items-center gap-1">
                              <span className="text-blue-500">📍</span>
                              Near: {formValues.landmark}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description & Attachments Card */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative group hover:border-blue-300 hover:shadow-md transition-all">
                      <button
                        type="button"
                        onClick={() => jumpToStep(3)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                        title="Edit Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Description & Evidence
                      </h3>
                      <div className="bg-slate-50 p-5 rounded-xl mb-6 border border-slate-100">
                        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                          {formValues.description}
                        </p>
                      </div>

                      {attachments.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Paperclip className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-bold text-slate-700">
                                {attachments.length} file
                                {attachments.length > 1 ? "s" : ""} attached
                              </span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                              {previews.map((src, i) => (
                                <div
                                  key={i}
                                  className="h-20 w-20 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0 shadow-sm hover:scale-105 hover:border-blue-300 transition-all"
                                >
                                  <img
                                    src={src}
                                    className="w-full h-full object-cover"
                                    alt={`attachment-${i + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {formValues.is_anonymous && (
                        <div className="mt-4 flex items-center gap-2 text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-semibold">
                            Anonymous submission enabled
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {/* Navigation Footer */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white backdrop-blur border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-6 rounded-xl border-2 border-slate-300 hover:bg-white hover:border-slate-400 hover:text-slate-900 font-bold text-slate-600 transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500 ring-offset-2"
            >
              Continue <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-green-500 ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Complaint <CheckCircle2 className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </form>
  );
}