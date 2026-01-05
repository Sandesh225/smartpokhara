"use client";
import { useState } from "react";
import { Save, X, Loader2 } from "lucide-react";
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
      if (isEditing && initialData?.id)
        await updateDepartment(initialData.id, formData);
      else await createDepartment(formData);
    } catch (e) {
      alert("Error saving department");
      setLoading(false);
    }
  };

  return (
    <form
      action={handleSubmit}
      className="stone-card card-padding space-y-8 animate-in fade-in"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Department Name (English)
          </label>
          <input
            name="name"
            defaultValue={initialData?.name}
            required
            className="dept-input-base"
            placeholder="e.g. Sanitation"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Department Name (Nepali)
          </label>
          <input
            name="name_nepali"
            defaultValue={initialData?.name_nepali}
            className="dept-input-base"
            placeholder="e.g. सरसफाई"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Department Code
          </label>
          <input
            name="code"
            defaultValue={initialData?.code}
            required
            className="dept-input-base font-mono uppercase"
            placeholder="WASTE"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Head of Department
          </label>
          <select
            name="head_user_id"
            defaultValue={initialData?.head_user_id || ""}
            className="dept-input-base"
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
          <label className="text-sm font-semibold text-foreground">Email</label>
          <input
            name="contact_email"
            defaultValue={initialData?.contact_email}
            type="email"
            className="dept-input-base"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Phone</label>
          <input
            name="contact_phone"
            defaultValue={initialData?.contact_phone}
            className="dept-input-base"
          />
        </div>
        {isEditing && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Status
            </label>
            <select
              name="is_active"
              defaultValue={String(initialData?.is_active)}
              className="dept-input-base"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        )}
        <div className="col-span-full space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={initialData?.description}
            rows={4}
            className="dept-input-base"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg border border-border"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-primary text-white flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}{" "}
          Save
        </button>
      </div>
    </form>
  );
}
