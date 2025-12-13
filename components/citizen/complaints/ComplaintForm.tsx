"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { Label } from "@/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Checkbox } from "@/ui//checkbox"
import { Badge } from "@/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"

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
} from "lucide-react"

import type {
  SubmitComplaintRequest,
  ComplaintCategory,
  ComplaintSubcategory,
  Ward,
} from "@/lib/supabase/queries/complaints"
import { complaintsService } from "@/lib/supabase/queries/complaints"

// Dynamic imports for heavy components
const MapPicker = dynamic(() => import("@/components/shared/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-muted/50 animate-pulse rounded-xl flex items-center justify-center border border-border">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
      <span className="text-muted-foreground">Loading Map...</span>
    </div>
  ),
})

// Zod schema aligned with SubmitComplaintRequest
const formSchema = z.object({
  title: z
    .string()
    .min(10, { message: "Title must be at least 10 characters long." })
    .max(200, { message: "Title must not exceed 200 characters." }),
  category_id: z.string().min(1, { message: "Please select a category." }),
  subcategory_id: z.string().optional().nullable(),
  priority: z.enum(["critical", "urgent", "high", "medium", "low"]).default("medium"),
  is_anonymous: z.boolean().default(false),
  ward_id: z.string().min(1, { message: "Please select a ward." }),
  address_text: z
    .string()
    .min(5, { message: "Please provide a detailed address." })
    .max(500, { message: "Address is too long." }),
  landmark: z.string().optional().nullable(),
  location_point: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    })
    .nullable(),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters long." })
    .max(5000, { message: "Description must not exceed 5000 characters." }),
})

type FormData = z.infer<typeof formSchema>

interface ComplaintFormProps {
  categories: ComplaintCategory[]
  wards: Ward[]
  // Parent handles calling complaintsService.submitComplaint and uploadAttachment
  onSubmit: (data: SubmitComplaintRequest, attachments: File[]) => Promise<void>
}

// Steps configuration
const STEPS = [
  {
    id: 1,
    title: "Basic Info",
    description: "What is your complaint about?",
    icon: FileText,
  },
  {
    id: 2,
    title: "Location",
    description: "Where did it happen?",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Details",
    description: "Provide details and evidence",
    icon: Camera,
  },
  {
    id: 4,
    title: "Review",
    description: "Check and submit",
    icon: CheckCircle,
  },
]

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
    borderColor: "border-emerald-300",
    icon: Clock,
    description: "General maintenance or improvement",
  },
  medium: {
    label: "Medium",
    color: "bg-amber-500",
    textColor: "text-amber-700",
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
    borderColor: "border-amber-300",
    icon: AlertCircle,
    description: "Needs attention within a week",
  },
  high: {
    label: "High",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
    borderColor: "border-orange-300",
    icon: AlertTriangle,
    description: "Requires prompt action",
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-gradient-to-br from-red-50 to-orange-50",
    borderColor: "border-red-300",
    icon: Zap,
    description: "Immediate attention needed",
  },
  critical: {
    label: "Critical",
    color: "bg-rose-600",
    textColor: "text-rose-700",
    bgColor: "bg-gradient-to-br from-rose-50 to-red-50",
    borderColor: "border-rose-300",
    icon: Flame,
    description: "Emergency situation",
  },
} as const

// Animation variants
const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
}

export default function ComplaintForm({ categories, wards, onSubmit }: ComplaintFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [subcategories, setSubcategories] = useState<ComplaintSubcategory[]>([])
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)

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
      subcategory_id: null,
      priority: "medium",
      is_anonymous: false,
      ward_id: "",
      address_text: "",
      landmark: null,
      location_point: null,
      description: "",
    },
    mode: "onChange",
  })

  const watchedCategory = watch("category_id")
  const watchedPriority = watch("priority")

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!watchedCategory) {
        setSubcategories([])
        setValue("subcategory_id", null)
        return
      }
      setLoadingSubcategories(true)
      try {
        const subs = await complaintsService.getSubcategories(watchedCategory)
        setSubcategories(subs)
        // reset subcategory when category changes
        setValue("subcategory_id", null)
      } catch (err) {
        console.error("Error loading subcategories:", err)
      } finally {
        setLoadingSubcategories(false)
      }
    }
    loadSubcategories()
  }, [watchedCategory, setValue])

  // File upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newFiles = Array.from(files)

    const validFiles = newFiles.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/gif", "application/pdf"].includes(file.type)
      const isValidSize = file.size <= 5 * 1024 * 1024
      if (!isValidType) {
        alert(`${file.name} is not a supported file type. Please upload JPG, PNG, GIF, or PDF.`)
        return false
      }
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`)
        return false
      }
      return true
    })

    setAttachments((prev) => [...prev, ...validFiles])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Step navigation
  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = []
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["title", "category_id", "priority"]
        break
      case 2:
        fieldsToValidate = ["ward_id", "address_text"]
        break
      case 3:
        fieldsToValidate = ["description"]
        break
    }
    const isValidStep = await trigger(fieldsToValidate)
    if (isValidStep) {
      setDirection(1)
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    setDirection(-1)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle location selection
  const handleLocationSelect = useCallback(
    (location: { lat: number; lng: number }) => {
      setValue(
        "location_point",
        {
          type: "Point",
          coordinates: [location.lng, location.lat], // [lng, lat]
        },
        { shouldValidate: true },
      )
    },
    [setValue],
  )

  // Form submission – aligned with SubmitComplaintRequest + rpc_submit_complaint
  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const complaintData: SubmitComplaintRequest = {
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        // ensure empty string becomes null at service level as well
        subcategory_id: data.subcategory_id || null,
        ward_id: data.ward_id,
        location_point: data.location_point ?? null,
        address_text: data.address_text,
        landmark: data.landmark || undefined,
        priority: data.priority,
        is_anonymous: data.is_anonymous,
        source: "web",
      }

      await onSubmit(complaintData, attachments)
    } catch (err) {
      console.error("Error submitting form:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold">
                Complaint Title <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="title"
                    placeholder="Brief summary of your complaint"
                    className={`h-12 text-base transition-all duration-200 ${
                      errors.title
                        ? "border-destructive focus-visible:ring-destructive"
                        : "focus-visible:ring-2 focus-visible:ring-primary/20"
                    }`}
                  />
                )}
              />
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.title.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Be specific but concise. Example: "Damaged water pipeline near city park"
              </p>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Category <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => field.onChange(category.id)}
                        className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                          field.value === category.id
                            ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10"
                            : "border-border hover:border-primary/50 bg-card"
                        }`}
                      >
                        {field.value === category.id && (
                          <div className="absolute top-2 right-2 animate-in zoom-in">
                            <div className="rounded-full bg-primary p-0.5">
                              <CheckCircle className="h-4 w-4 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        <span className="text-2xl mb-2 block">
                          {category.icon ? category.icon : <FileText className="h-6 w-6" />}
                        </span>
                        <span className="font-semibold text-sm">{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.category_id && (
                <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.category_id.message}
                </p>
              )}
            </div>

            {/* Subcategory */}
            {watchedCategory && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <Label className="text-base font-semibold">Subcategory (Optional)</Label>
                <Controller
                  name="subcategory_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                      disabled={loadingSubcategories}
                    >
                      <SelectTrigger className="h-12 transition-all duration-200">
                        <SelectValue placeholder={loadingSubcategories ? "Loading..." : "Select subcategory"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
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

            {/* Priority */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Priority Level</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {(Object.keys(PRIORITY_CONFIG) as Array<keyof typeof PRIORITY_CONFIG>).map((priority) => {
                      const config = PRIORITY_CONFIG[priority]
                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => field.onChange(priority)}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98] ${
                            field.value === priority
                              ? `${config.borderColor} ${config.bgColor} shadow-lg`
                              : "border-border hover:border-muted-foreground/30 bg-card hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`h-2.5 w-2.5 rounded-full ${config.color} shadow-sm`} />
                            <span
                              className={`font-semibold text-sm ${field.value === priority ? config.textColor : ""}`}
                            >
                              {config.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
                          {field.value === priority && (
                            <div className="absolute top-2 right-2 animate-in zoom-in">
                              <CheckCircle className={`h-4 w-4 ${config.textColor}`} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </div>

            {/* Anonymous */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border shadow-sm hover:shadow-md transition-all duration-200">
              <Controller
                name="is_anonymous"
                control={control}
                render={({ field }) => (
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Submit anonymously</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your name will not be displayed publicly or shared with officials
                      </p>
                    </div>
                  </label>
                )}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Ward */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Ward <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="ward_id"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className={`h-12 transition-all duration-200 ${errors.ward_id ? "border-destructive" : ""}`}
                        >
                          <SelectValue placeholder="Select your ward" />
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
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.ward_id.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <Label htmlFor="address_text" className="text-base font-semibold">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="address_text"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="address_text"
                        placeholder="Full address where the issue is located"
                        rows={4}
                        className={`resize-none transition-all duration-200 ${
                          errors.address_text
                            ? "border-destructive focus-visible:ring-destructive"
                            : "focus-visible:ring-2 focus-visible:ring-primary/20"
                        }`}
                      />
                    )}
                  />
                  {errors.address_text && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.address_text.message}
                    </p>
                  )}
                </div>

                {/* Landmark */}
                <div className="space-y-3">
                  <Label htmlFor="landmark" className="text-base font-semibold">
                    Landmark (Optional)
                  </Label>
                  <Controller
                    name="landmark"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ""}
                        id="landmark"
                        placeholder="Nearby landmark for easy identification"
                        className="h-12 transition-all duration-200"
                      />
                    )}
                  />
                  <p className="text-sm text-muted-foreground">Example: "Near City Hospital" or "Behind ABC School"</p>
                </div>
              </div>

              {/* Map */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Pin Location on Map (Optional)</Label>
                <div className="rounded-xl overflow-hidden border-2 border-border shadow-lg">
                  <MapPicker onLocationSelect={handleLocationSelect} />
                </div>
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Click on the map to mark the exact location of the complaint
                </p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base font-semibold">
                Detailed Description <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Provide a detailed description of the issue..."
                    rows={8}
                    className={`resize-none transition-all duration-200 ${
                      errors.description
                        ? "border-destructive focus-visible:ring-destructive"
                        : "focus-visible:ring-2 focus-visible:ring-primary/20"
                    }`}
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.description.message}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">Include relevant details like when you noticed the issue</p>
                <span className="text-muted-foreground">{watch("description")?.length || 0}/5000</span>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Attachments (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all duration-200 bg-gradient-to-br from-muted/30 to-muted/10">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Click to upload photos or documents</p>
                    <p className="text-sm text-muted-foreground">JPG, PNG, GIF, or PDF up to 5MB each</p>
                  </div>
                </label>
              </div>

              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm font-medium">Uploaded Files ({attachments.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileImage className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help Text */}
            <Alert className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950/30 dark:to-cyan-950/30 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-900 dark:text-blue-100">Helpful Tips</AlertTitle>
              <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                Photos showing the problem help officials understand and resolve your complaint faster. Include multiple
                angles if possible.
              </AlertDescription>
            </Alert>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Complaint details review */}
              <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="pb-4 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span>Complaint Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Title</span>
                      <Badge
                        className={`${PRIORITY_CONFIG[watchedPriority].bgColor} ${
                          PRIORITY_CONFIG[watchedPriority].textColor
                        } border-0 shadow-sm`}
                      >
                        {PRIORITY_CONFIG[watchedPriority].label}
                      </Badge>
                    </div>
                    <p className="font-semibold text-base">{watch("title")}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Category</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="shadow-sm">
                        {categories.find((c) => c.id === watch("category_id"))?.name}
                      </Badge>
                      {watch("subcategory_id") && (
                        <Badge variant="outline" className="shadow-sm">
                          {subcategories.find((s) => s.id === watch("subcategory_id"))?.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Description</span>
                    <p className="text-sm whitespace-pre-line line-clamp-4 leading-relaxed">{watch("description")}</p>
                  </div>
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Attachments</span>
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                          <Badge key={index} variant="outline" className="text-xs shadow-sm">
                            <FileImage className="h-3 w-3 mr-1" />
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location review */}
              <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="pb-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Location Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Ward</span>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        Ward {wards.find((w) => w.id === watch("ward_id"))?.ward_number} -{" "}
                        {wards.find((w) => w.id === watch("ward_id"))?.name}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Address</span>
                    <p className="font-medium leading-relaxed">{watch("address_text")}</p>
                  </div>
                  {watch("landmark") && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Landmark</span>
                      <p className="font-medium">{watch("landmark")}</p>
                    </div>
                  )}
                  {watch("location_point") && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Coordinates</span>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {watch("location_point")?.coordinates[1].toFixed(6)},{" "}
                          {watch("location_point")?.coordinates[0].toFixed(6)}
                        </span>
                      </div>
                    </div>
                  )}
                  {watch("is_anonymous") && (
                    <Alert className="bg-gradient-to-br from-muted/50 to-muted/30 border-border">
                      <Shield className="h-4 w-4 text-primary" />
                      <AlertTitle className="text-sm font-semibold">Anonymous Submission</AlertTitle>
                      <AlertDescription className="text-xs">
                        Your identity will not be shared publicly.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Final confirmation message */}
            <Alert className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950/30 dark:to-emerald-950/30 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-900 dark:text-green-100 font-semibold">Ready to Submit</AlertTitle>
              <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
                Please review your complaint details above. Once submitted, you'll receive a tracking number to monitor
                the progress of your complaint.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Submit New Complaint
          </h1>
          <p className="text-muted-foreground text-lg">Help us serve you better by providing detailed information</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {STEPS.map((step) => {
                const StepIcon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex flex-col items-center group">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 scale-110"
                          : isActive
                            ? "bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/40 scale-125 ring-4 ring-primary/20"
                            : "bg-muted border-2 border-border"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <StepIcon
                          className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                        />
                      )}
                    </div>
                    <div className="mt-3 text-center hidden sm:block">
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-border shadow-2xl">
          <CardHeader className="bg-gradient-to-br from-muted/30 to-muted/10 border-b border-border">
            <CardTitle className="text-2xl">{STEPS.find((s) => s.id === currentStep)?.title}</CardTitle>
            <CardDescription className="text-base">
              {STEPS.find((s) => s.id === currentStep)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="hover:scale-105 active:scale-95 transition-transform bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                ) : (
                  <div />
                )}
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[160px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Submit Complaint
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
