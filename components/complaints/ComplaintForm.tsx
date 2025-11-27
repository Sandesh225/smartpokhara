// components/complaints/ComplaintForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { CurrentUser } from '@/lib/types/auth';

interface Category {
  id: string;
  name: string;
  name_nepali: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  complaint_subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  name_nepali: string | null;
  description: string | null;
  default_priority: 'low' | 'medium' | 'high' | 'critical';
  sla_days: number;
}

interface Ward {
  id: string;
  ward_number: number;
  name: string;
  name_nepali: string | null;
}

interface ComplaintFormProps {
  categories: Category[];
  wards: Ward[];
  user: CurrentUser;
}

type FormStep = 1 | 2 | 3 | 4;

export function ComplaintForm({ categories, wards, user }: ComplaintFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    ward_id: '',
    address_text: '',
    landmark: '',
    title: '',
    description: '',
    attachments: [] as File[],
  });

  const selectedCategory = categories.find(c => c.id === formData.category_id);
  const selectedSubcategory = selectedCategory?.complaint_subcategories.find(
    s => s.id === formData.subcategory_id
  );

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as FormStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as FormStep);
    }
  };// components/complaints/ComplaintForm.tsx - Update the handleSubmit function
const handleSubmit = async () => {
  try {
    setLoading(true);

    // Insert complaint
    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        citizen_id: user.id,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        ward_id: formData.ward_id,
        address_text: formData.address_text,
        landmark: formData.landmark,
        title: formData.title,
        description: formData.description,
        source: 'web',
        status: 'submitted',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }

    if (!complaint) {
      throw new Error('No complaint data returned');
    }

    console.log('Complaint created:', complaint);

    // Upload attachments if any
    if (formData.attachments.length > 0) {
      for (const file of formData.attachments) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${complaint.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('complaint-attachments')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue; // Continue with other files even if one fails
        }

        const { data: urlData } = supabase.storage
          .from('complaint-attachments')
          .getPublicUrl(fileName);

        await supabase
          .from('complaint_attachments')
          .insert({
            complaint_id: complaint.id,
            uploaded_by_user_id: user.id,
            file_name: file.name,
            file_type: fileExt,
            mime_type: file.type,
            file_size_bytes: file.size,
            file_url: urlData.publicUrl,
            storage_path: fileName,
            is_public: true,
          });
      }
    }

    // Redirect to complaint detail
    router.push(`/citizen/complaints/${complaint.id}`);
    router.refresh();
  } catch (error: any) {
    console.error('Error submitting complaint:', error);
    alert(`Error submitting complaint: ${error.message || 'Please try again.'}`);
  } finally {
    setLoading(false);
  }
};
  const Step1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Category & Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, category_id: category.id, subcategory_id: '' }))}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              formData.category_id === category.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              {category.icon && (
                <span className="text-2xl">{category.icon}</span>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                {category.name_nepali && (
                  <p className="text-sm text-gray-500">{category.name_nepali}</p>
                )}
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Specific Issue
          </label>
          <div className="space-y-2">
            {selectedCategory.complaint_subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subcategory_id: subcategory.id }))}
                className={`w-full p-3 border rounded-lg text-left transition-colors ${
                  formData.subcategory_id === subcategory.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{subcategory.name}</h5>
                    {subcategory.name_nepali && (
                      <p className="text-sm text-gray-500">{subcategory.name_nepali}</p>
                    )}
                    {subcategory.description && (
                      <p className="text-sm text-gray-600 mt-1">{subcategory.description}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    SLA: {subcategory.sla_days} days
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const Step2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Location Details</h3>
      
      <div>
        <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
          Ward *
        </label>
        <select
          id="ward"
          required
          value={formData.ward_id}
          onChange={(e) => setFormData(prev => ({ ...prev, ward_id: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Ward</option>
          {wards.map((ward) => (
            <option key={ward.id} value={ward.id}>
              Ward {ward.ward_number} - {ward.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          id="address"
          rows={3}
          value={formData.address_text}
          onChange={(e) => setFormData(prev => ({ ...prev, address_text: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your complete address..."
        />
      </div>

      <div>
        <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">
          Landmark (Optional)
        </label>
        <input
          type="text"
          id="landmark"
          value={formData.landmark}
          onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nearby landmarks for easy identification..."
        />
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Complaint Details</h3>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of the issue..."
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Detailed Description *
        </label>
        <textarea
          id="description"
          required
          rows={6}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Please provide detailed information about the issue..."
        />
      </div>

      <div>
        <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
          Attachments (Optional)
        </label>
        <input
          type="file"
          id="attachments"
          multiple
          accept="image/*,.pdf"
          onChange={(e) => setFormData(prev => ({
            ...prev,
            attachments: Array.from(e.target.files || [])
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          You can upload images or PDF files (max 10MB each)
        </p>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Review & Submit</h3>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Category</h4>
            <p className="text-gray-600">
              {selectedCategory?.name} &gt; {selectedSubcategory?.name}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Location</h4>
            <p className="text-gray-600">
              Ward {wards.find(w => w.id === formData.ward_id)?.ward_number}
              {formData.landmark && ` • ${formData.landmark}`}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Title</h4>
          <p className="text-gray-600">{formData.title}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Description</h4>
          <p className="text-gray-600 whitespace-pre-wrap">{formData.description}</p>
        </div>

        {formData.attachments.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900">Attachments</h4>
            <p className="text-gray-600">
              {formData.attachments.length} file(s) ready for upload
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your complaint will be assigned a tracking number and 
          forwarded to the relevant department. You can track its progress in your dashboard.
        </p>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.category_id && formData.subcategory_id;
      case 2:
        return formData.ward_id;
      case 3:
        return formData.title && formData.description;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {[1, 2, 3, 4].map((step) => (
              <li key={step} className={`flex items-center ${step !== 1 ? 'flex-1' : ''}`}>
                {step !== 1 && (
                  <div className="flex-1 border-t-2 border-gray-200 mx-4" />
                )}
                <div className="flex items-center">
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step < currentStep
                        ? 'bg-blue-600 text-white'
                        : step === currentStep
                        ? 'bg-blue-100 border-2 border-blue-600 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      step <= currentStep ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step === 1 && 'Category'}
                    {step === 2 && 'Location'}
                    {step === 3 && 'Details'}
                    {step === 4 && 'Review'}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Form Steps */}
      <div className="mb-8">
        {currentStep === 1 && <Step1 />}
        {currentStep === 2 && <Step2 />}
        {currentStep === 3 && <Step3 />}
        {currentStep === 4 && <Step4 />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canProceed()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        )}
      </div>
    </div>
  );
}