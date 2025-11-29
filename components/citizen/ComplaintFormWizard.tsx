"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";

import {
  createComplaint,
  uploadComplaintAttachments,
} from "@/lib/api/complaints";
import {
  complaintSchema,
  type ComplaintFormData,
} from "@/utils/validation";

import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/shared/toast-service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/shared/file-upload";

interface Subcategory {
  id: string;
  name: string;
  name_nepali?: string | null;
  description?: string | null;
  sla_days: number | null;
}

interface Category {
  id: string;
  name: string;
  name_nepali?: string | null;
  description?: string | null;
  icon?: string | null;
  complaint_subcategories: Subcategory[];
}

interface Ward {
  id: string;
  ward_number: number;
  name: string;
  name_nepali?: string | null;
}

interface ComplaintFormWizardProps {
  categories: Category[];
  wards: Ward[];
}

export function ComplaintFormWizard({
  categories = [],
  wards = [],
}: ComplaintFormWizardProps) {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    mode: "onChange",
    // @ts-ignore – schema defines attachments as optional File[]
    defaultValues: { attachments: [] },
  });

  const selectedCategoryId = watch("category_id");
  const selectedSubcategoryId = watch("subcategory_id");
  const selectedWardId = watch("ward_id");
  const attachments = (watch("attachments") || []) as File[];

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedSubcategory =
    selectedCategory?.complaint_subcategories.find(
      (s) => s.id === selectedSubcategoryId
    );
  const selectedWard = wards.find((w) => w.id === selectedWardId);

  const canProceedToStep2 = Boolean(selectedCategoryId && selectedSubcategoryId);
  const canProceedToStep3 = Boolean(selectedWardId);
  const canProceedToStep4 = Boolean(watch("title") && watch("description"));

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);
    const toastId = showLoadingToast("Submitting your complaint...");

    try {
      const complaint = await createComplaint({
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        ward_id: data.ward_id,
        title: data.title,
        description: data.description,
        address_text: data.address_text,
        landmark: data.landmark,
      });

      if (data.attachments && data.attachments.length > 0) {
        dismissToast(toastId);
        const uploadToastId = showLoadingToast(
          `Uploading ${data.attachments.length} file(s)...`
        );
        try {
          await uploadComplaintAttachments(
            complaint.id,
            data.attachments,
            (progress) => setUploadProgress(progress)
          );
          dismissToast(uploadToastId);
        } catch (uploadError) {
          console.error("Attachment upload error:", uploadError);
          dismissToast(uploadToastId);
          showErrorToast(
            "Some attachments failed to upload",
            "Your complaint was submitted but some files could not be uploaded. You can try uploading them again from the complaint detail page."
          );
        }
      } else {
        dismissToast(toastId);
      }

      showSuccessToast(
        `Complaint submitted successfully! Tracking code: ${complaint.tracking_code}`
      );
      router.push(`/citizen/complaints/${complaint.id}`);
      router.refresh();
    } catch (error) {
      console.error("Complaint submission failed:", error);
      dismissToast(toastId);
      showErrorToast(
        "Failed to submit complaint",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // --- Step components (same as previously, lightly formatted) ---

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Step 1: Select category
        </CardTitle>
        <p className="mt-1 text-sm text-gray-600">
          Choose the category that best matches your issue, then a subcategory
          for more precise routing.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category */}
        <div className="space-y-2">
          <label
            htmlFor="category_id"
            className="block text-sm font-medium text-gray-900"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            {...register("category_id")}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.category_id ? "border-red-500" : "border-gray-300"
            }`}
            onChange={(e) => {
              setValue("category_id", e.target.value);
              setValue("subcategory_id", "");
            }}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
                {cat.name_nepali ? ` / ${cat.name_nepali}` : ""}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category_id.message as string}
            </p>
          )}
          {selectedCategory?.description && (
            <p className="mt-1 text-xs text-gray-600">
              {selectedCategory.description}
            </p>
          )}
        </div>

        {/* Subcategory */}
        <div className="space-y-2">
          <label
            htmlFor="subcategory_id"
            className="block text-sm font-medium text-gray-900"
          >
            Subcategory <span className="text-red-500">*</span>
          </label>
          <select
            id="subcategory_id"
            {...register("subcategory_id")}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.subcategory_id ? "border-red-500" : "border-gray-300"
            }`}
            disabled={!selectedCategory}
          >
            <option value="">
              {selectedCategory
                ? "Select a subcategory"
                : "Select a category first"}
            </option>
            {selectedCategory?.complaint_subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
                {sub.name_nepali ? ` / ${sub.name_nepali}` : ""}
                {typeof sub.sla_days === "number"
                  ? ` (Target ${sub.sla_days} day${
                      sub.sla_days === 1 ? "" : "s"
                    })`
                  : ""}
              </option>
            ))}
          </select>
          {errors.subcategory_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subcategory_id.message as string}
            </p>
          )}
          {selectedSubcategory?.description && (
            <p className="mt-1 text-xs text-gray-600">
              {selectedSubcategory.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Step 2: Location
        </CardTitle>
        <p className="mt-1 text-sm text-gray-600">
          Tell us where this issue is happening so we can route it to the
          correct ward.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ward */}
        <div className="space-y-2">
          <label
            htmlFor="ward_id"
            className="block text-sm font-medium text-gray-900"
          >
            Ward <span className="text-red-500">*</span>
          </label>
          <select
            id="ward_id"
            {...register("ward_id")}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.ward_id ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a ward</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                Ward {ward.ward_number}
                {ward.name ? ` - ${ward.name}` : ""}
                {ward.name_nepali ? ` / ${ward.name_nepali}` : ""}
              </option>
            ))}
          </select>
          {errors.ward_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.ward_id.message as string}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label
            htmlFor="address_text"
            className="block text-sm font-medium text-gray-900"
          >
            Street / area address
          </label>
          <input
            id="address_text"
            type="text"
            {...register("address_text")}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.address_text ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g. Lakeside, near main road"
          />
          {errors.address_text && (
            <p className="mt-1 text-sm text-red-600">
              {errors.address_text.message as string}
            </p>
          )}
        </div>

        {/* Landmark */}
        <div className="space-y-2">
          <label
            htmlFor="landmark"
            className="block text-sm font-medium text-gray-900"
          >
            Nearby landmark
          </label>
          <input
            id="landmark"
            type="text"
            {...register("landmark")}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.landmark ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g. Near XYZ School, beside ABC Temple"
          />
          {errors.landmark && (
            <p className="mt-1 text-sm text-red-600">
              {errors.landmark.message as string}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Step 3: Complaint details
        </CardTitle>
        <p className="mt-1 text-sm text-gray-600">
          Clearly describe the issue so our team can understand and resolve it
          quickly.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-900"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Short summary of the issue"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">
              {errors.title.message as string}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-900"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={6}
            {...register("description")}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Describe what is happening, since when, and how it is affecting you or others..."
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.description ? (
              <p className="text-sm text-red-600">
                {errors.description.message as string}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Please provide clear details so we can route this to the right
                team.
              </p>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Attachments
          </label>
          <p className="mb-1 text-xs text-gray-500">
            Add photos or PDFs to help us understand the issue better. Maximum 5
            files, up to 10MB each.
          </p>

          <Controller
            control={control}
            name="attachments"
            // @ts-ignore File[] at runtime
            render={({ field: { value, onChange } }) => (
              <FileUpload
                value={value || []}
                onChange={onChange}
                maxFiles={5}
                maxSize={10}
                accept={["image/*", "application/pdf"]}
                error={errors.attachments?.message as string | undefined}
              />
            )}
          />

          {errors.attachments && (
            <p className="mt-1 text-sm text-red-600">
              {errors.attachments.message as string}
            </p>
          )}
        </div>

        {uploadProgress > 0 && (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
              <span>Uploading attachments...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Step 4: Review & submit
        </CardTitle>
        <p className="mt-1 text-sm text-gray-600">
          Review your complaint before submitting. You can go back to edit any
          section.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 text-sm text-gray-800">
        {/* Category summary */}
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Category</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Category</dt>
              <dd className="font-medium">
                {selectedCategory
                  ? `${selectedCategory.name}${
                      selectedCategory.name_nepali
                        ? ` / ${selectedCategory.name_nepali}`
                        : ""
                    }`
                  : "Not selected"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Subcategory</dt>
              <dd className="font-medium">
                {selectedSubcategory
                  ? `${selectedSubcategory.name}${
                      selectedSubcategory.name_nepali
                        ? ` / ${selectedSubcategory.name_nepali}`
                        : ""
                    }`
                  : "Not selected"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Location summary */}
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Location</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Ward</dt>
              <dd className="font-medium">
                {selectedWard
                  ? `Ward ${selectedWard.ward_number}${
                      selectedWard.name ? ` - ${selectedWard.name}` : ""
                    }${
                      selectedWard.name_nepali
                        ? ` / ${selectedWard.name_nepali}`
                        : ""
                    }`
                  : "Not selected"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Address</dt>
              <dd className="font-medium">
                {watch("address_text") || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Landmark</dt>
              <dd className="font-medium">
                {watch("landmark") || "Not provided"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Details summary */}
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Details</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500">Title</dt>
              <dd className="font-medium">
                {watch("title") || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Description</dt>
              <dd className="whitespace-pre-wrap">
                {watch("description") || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Attachments</dt>
              <dd>
                {attachments.length === 0 ? (
                  <span className="font-medium">No files attached</span>
                ) : (
                  <ul className="list-disc space-y-1 pl-4">
                    {attachments.map((file, idx) => (
                      <li key={`${file.name}-${idx}`} className="text-gray-800">
                        {file.name} (
                        {(file.size / (1024 * 1024)).toFixed(1)} MB)
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <p className="text-xs text-gray-500">
          By submitting this complaint, you confirm that the information
          provided is accurate to the best of your knowledge.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit a Complaint</h1>
        <p className="mt-2 text-gray-600">
          Help us improve the city by reporting issues and concerns.
        </p>
      </div>

      {/* Step indicator */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {[
              { number: 1, name: "Category" },
              { number: 2, name: "Location" },
              { number: 3, name: "Details" },
              { number: 4, name: "Review" },
            ].map((s, idx) => {
              const isCurrent = step === s.number;
              const isCompleted = step > s.number;
              return (
                <li
                  key={s.number}
                  className={`flex items-center ${idx !== 3 ? "flex-1" : ""}`}
                >
                  {idx !== 0 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        step > s.number ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <div className="relative flex items-center">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                        isCurrent
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : isCompleted
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-500"
                      }`}
                    >
                      {isCompleted ? "✓" : s.number}
                    </span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {s.name}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1 || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {step < 4 && (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1 && !canProceedToStep2) return;
                  if (step === 2 && !canProceedToStep3) return;
                  if (step === 3 && !canProceedToStep4) return;
                  setStep((prev) => Math.min(4, prev + 1));
                }}
                disabled={
                  isSubmitting ||
                  (step === 1 && !canProceedToStep2) ||
                  (step === 2 && !canProceedToStep3) ||
                  (step === 3 && !canProceedToStep4)
                }
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {step === 4 && (
              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Complaint"
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
