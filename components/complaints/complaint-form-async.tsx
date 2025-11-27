/**
 * Refactored complaint form with standardized toast notifications
 * Clean step-by-step flow with professional feedback on all operations
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { CurrentUser } from "@/lib/types/auth"
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from "@/lib/shared/toast-service"
import { FormField } from "@/components/shared/form-field"
import { PrimaryButton } from "@/components/shared/button-primary"
import { CardSection } from "@/components/shared/card-section"

interface ComplaintFormAsyncProps {
  categories: any[]
  wards: any[]
  user: CurrentUser
}

type FormStep = 1 | 2 | 3 | 4

export function ComplaintFormAsync({ categories, wards, user }: ComplaintFormAsyncProps) {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState<FormStep>(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    ward_id: "",
    address_text: "",
    landmark: "",
    title: "",
    description: "",
    attachments: [] as File[],
  })

  const selectedCategory = categories.find((c) => c.id === formData.category_id)
  const selectedSubcategory = selectedCategory?.complaint_subcategories.find(
    (s: any) => s.id === formData.subcategory_id,
  )

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((currentStep + 1) as FormStep)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as FormStep)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const toastId = showLoadingToast("Submitting your complaint...")

      // Insert complaint
      const { data: complaint, error } = await supabase
        .from("complaints")
        .insert({
          citizen_id: user.id,
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id,
          ward_id: formData.ward_id,
          address_text: formData.address_text,
          landmark: formData.landmark,
          title: formData.title,
          description: formData.description,
          source: "web",
          status: "submitted",
        })
        .select()
        .single()

      if (error) throw error
      if (!complaint) throw new Error("No complaint data returned")

      // Upload attachments if any
      if (formData.attachments.length > 0) {
        for (const file of formData.attachments) {
          const fileExt = file.name.split(".").pop()
          const fileName = `${complaint.id}/${Math.random().toString(36).substring(2)}.${fileExt}`

          const { error: uploadError } = await supabase.storage.from("complaint-attachments").upload(fileName, file)

          if (uploadError) {
            console.warn("Failed to upload one attachment, continuing...")
            continue
          }

          const { data: urlData } = supabase.storage.from("complaint-attachments").getPublicUrl(fileName)

          await supabase.from("complaint_attachments").insert({
            complaint_id: complaint.id,
            uploaded_by_user_id: user.id,
            file_name: file.name,
            file_type: fileExt,
            mime_type: file.type,
            file_size_bytes: file.size,
            file_url: urlData.publicUrl,
            storage_path: fileName,
            is_public: true,
          })
        }
      }

      dismissToast(toastId)
      showSuccessToast(`Complaint submitted successfully! Tracking #${complaint.tracking_code}`)
      router.push(`/citizen/complaints/${complaint.id}`)
      router.refresh()
    } catch (error: any) {
      showErrorToast("Failed to submit complaint", error?.message)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.category_id && formData.subcategory_id
      case 2:
        return formData.ward_id
      case 3:
        return formData.title && formData.description
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <CardSection title="Submit a Complaint">
      {/* Progress indicator */}
      <div className="mb-8 flex justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step === currentStep
                  ? "bg-blue-600 text-white"
                  : step < currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {step < currentStep ? "✓" : step}
            </div>
            <span className="text-xs text-gray-600 mt-2">
              {["Category", "Location", "Details", "Review"][step - 1]}
            </span>
          </div>
        ))}
      </div>

      {/* Form steps */}
      <div className="space-y-6 mb-8">
        {currentStep === 1 && <Step1 formData={formData} setFormData={setFormData} categories={categories} />}
        {currentStep === 2 && <Step2 formData={formData} setFormData={setFormData} wards={wards} />}
        {currentStep === 3 && <Step3 formData={formData} setFormData={setFormData} />}
        {currentStep === 4 && (
          <Step4
            formData={formData}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            wards={wards}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 justify-between">
        <PrimaryButton onClick={handleBack} variant="secondary" disabled={currentStep === 1 || loading}>
          ← Back
        </PrimaryButton>
        {currentStep < 4 ? (
          <PrimaryButton onClick={handleNext} disabled={!canProceed() || loading}>
            Next →
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Submitting..."
            disabled={!canProceed()}
          >
            Submit Complaint
          </PrimaryButton>
        )}
      </div>
    </CardSection>
  )
}

// ... Step components (Step1, Step2, Step3, Step4) remain unchanged in structure
// but use the new FormField component for consistency

function Step1({ formData, setFormData, categories }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Category & Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category: any) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setFormData((prev: any) => ({ ...prev, category_id: category.id, subcategory_id: "" }))}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              formData.category_id === category.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <h4 className="font-semibold text-gray-900">{category.name}</h4>
            {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
          </button>
        ))}
      </div>
    </div>
  )
}

function Step2({ formData, setFormData, wards }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
      <FormField
        label="Ward"
        required
        value={formData.ward_id}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, ward_id: e.target.value }))}
        as="select"
      >
        <option value="">Select Ward</option>
        {wards.map((ward: any) => (
          <option key={ward.id} value={ward.id}>
            Ward {ward.ward_number} - {ward.name}
          </option>
        ))}
      </FormField>
      <textarea
        placeholder="Enter your complete address..."
        value={formData.address_text}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, address_text: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        rows={3}
      />
    </div>
  )
}

function Step3({ formData, setFormData }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
      <FormField
        label="Title"
        required
        placeholder="Brief description of the issue..."
        value={formData.title}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
      />
      <textarea
        label="Description"
        required
        placeholder="Please provide detailed information..."
        value={formData.description}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        rows={6}
      />
    </div>
  )
}

function Step4({ formData, selectedCategory, selectedSubcategory, wards }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Review & Confirm</h3>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div>
          <p className="text-sm text-gray-600">Category</p>
          <p className="font-medium text-gray-900">{selectedCategory?.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Issue Type</p>
          <p className="font-medium text-gray-900">{selectedSubcategory?.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Title</p>
          <p className="font-medium text-gray-900">{formData.title}</p>
        </div>
      </div>
    </div>
  )
}
