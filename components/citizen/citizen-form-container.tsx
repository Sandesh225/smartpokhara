"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { CurrentUser } from "@/lib/types/auth"
import { showSuccessToast, showErrorToast } from "@/lib/shared/toast-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  complaint_subcategories: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  default_priority: string
}

interface Ward {
  id: string
  ward_number: number
  name: string
}

interface ComplaintFormContainerProps {
  categories: Category[]
  wards: Ward[]
  user: CurrentUser
}

export function ComplaintFormContainer({ categories, wards, user }: ComplaintFormContainerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    ward_id: "",
    title: "",
    description: "",
    address_text: "",
    landmark: "",
  })

  const selectedCategory = categories.find((c) => c.id === formData.category_id)
  const selectedSubcategory = selectedCategory?.complaint_subcategories.find((s) => s.id === formData.subcategory_id)

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category_id || !formData.ward_id || !formData.title) {
      showErrorToast("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)

      const { data: complaint, error } = await supabase
        .from("complaints")
        .insert({
          citizen_user_id: user.id,
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id || null,
          ward_id: formData.ward_id,
          title: formData.title,
          description: formData.description,
          address_text: formData.address_text,
          landmark: formData.landmark,
          status: "submitted",
        })
        .select("id, tracking_code")
        .single()

      if (error) throw error

      showSuccessToast(`Complaint submitted successfully! Tracking code: ${complaint.tracking_code}`)
      router.push(`/citizen/complaints/${complaint.id}`)
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "Failed to submit complaint")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-slate-200 max-w-2xl">
      <CardHeader>
        <CardTitle>Step {currentStep} of 4</CardTitle>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`h-2 flex-1 rounded ${step <= currentStep ? "bg-blue-600" : "bg-slate-200"}`} />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value, subcategory_id: "" })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Subcategory</label>
                  <select
                    value={formData.subcategory_id}
                    onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select subcategory</option>
                    {selectedCategory.complaint_subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Ward *</label>
                <select
                  value={formData.ward_id}
                  onChange={(e) => setFormData({ ...formData, ward_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select a ward</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      Ward {ward.ward_number} - {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Location Details</label>
                <input
                  type="text"
                  placeholder="Street address or location"
                  value={formData.address_text}
                  onChange={(e) => setFormData({ ...formData, address_text: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Landmark</label>
                <input
                  type="text"
                  placeholder="Nearby landmark or reference"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Title *</label>
                <input
                  type="text"
                  placeholder="Brief title of your complaint"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  maxLength={120}
                />
                <p className="mt-1 text-xs text-slate-500">{formData.title.length}/120</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
                <textarea
                  placeholder="Provide detailed information about your complaint"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-slate-500">{formData.description.length}/1000</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 rounded-lg bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">Review Your Complaint</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Category:</p>
                  <p className="font-medium text-slate-900">
                    {selectedCategory?.name}
                    {selectedSubcategory && ` / ${selectedSubcategory.name}`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Location:</p>
                  <p className="font-medium text-slate-900">{wards.find((w) => w.id === formData.ward_id)?.name}</p>
                </div>
                <div>
                  <p className="text-slate-600">Title:</p>
                  <p className="font-medium text-slate-900">{formData.title}</p>
                </div>
                <div>
                  <p className="text-slate-600">Description:</p>
                  <p className="font-medium text-slate-900 break-words">{formData.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-between pt-6 border-t border-slate-200">
            <Button type="button" onClick={handleBack} disabled={currentStep === 1 || isSubmitting} variant="outline">
              Back
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext} type="button">
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
