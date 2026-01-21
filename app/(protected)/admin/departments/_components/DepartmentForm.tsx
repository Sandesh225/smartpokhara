// ==================== DEPARTMENT FORM COMPONENT ====================
// app/admin/departments/_components/DepartmentForm.tsx

"use client";
import { useState } from "react";
import { Save, X, Loader2, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createDepartment, updateDepartment } from "../actions";

interface Profile {
  user_id: string;
  full_name: string;
}

interface Props {
  initialData?: any;
  potentialManagers: Profile[];
  isEditing?: boolean;
}

export default function DepartmentForm({
  initialData,
  potentialManagers,
  isEditing = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      if (isEditing && initialData?.id) {
        await updateDepartment(initialData.id, formData);
      } else {
        await createDepartment(formData);
      }
    } catch (e) {
      alert("Error saving department");
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="glass rounded-2xl p-8 border border-border elevation-1">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {isEditing ? "Edit Department Details" : "Create New Department"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? "Update department information"
                : "Add a new department to the system"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground block">
              Department Name (English){" "}
              <span className="text-destructive">*</span>
            </label>
            <input
              name="name"
              defaultValue={initialData?.name}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="e.g., Sanitation Department"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground block">
              Department Name (Nepali)
            </label>
            <input
              name="name_nepali"
              defaultValue={initialData?.name_nepali}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="e.g., सरसफाई विभाग"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground block">
              Department Code <span className="text-destructive">*</span>
            </label>
            <input
              name="code"
              defaultValue={initialData?.code}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground font-mono uppercase focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="SAN"
              maxLength={5}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground block">
              Head of Department
            </label>
            <select
              name="head_user_id"
              defaultValue={initialData?.head_user_id || ""}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            >
              <option value="">Select Official...</option>
              {potentialManagers.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground block">
              Email Address
            </label>
            <input
              name="contact_email"
              defaultValue={initialData?.contact_email}
              type="email"
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="department@pokhara.gov.np"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground block">
              Phone Number
            </label>
            <input
              name="contact_phone"
              defaultValue={initialData?.contact_phone}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="+977-61-123456"
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground block">
                Status
              </label>
              <select
                name="is_active"
                defaultValue={String(initialData?.is_active)}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}

          <div className="col-span-full space-y-2">
            <label className="text-sm font-bold text-foreground block">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={initialData?.description}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
              placeholder="Brief description of department responsibilities..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border-2 border-border bg-background text-foreground font-semibold hover:bg-muted transition-all"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all shadow-lg elevation-2 hover:elevation-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditing ? "Update Department" : "Create Department"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
