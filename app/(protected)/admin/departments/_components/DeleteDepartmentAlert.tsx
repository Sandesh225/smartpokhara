// ==================== DELETE ALERT COMPONENT ====================
// app/admin/departments/_components/DeleteDepartmentAlert.tsx

"use client";
import { useState } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { deleteDepartment } from "../actions";
import { useRouter } from "next/navigation";

interface Props {
  departmentId: string;
  departmentName: string;
}

export default function DeleteDepartmentAlert({
  departmentId,
  departmentName,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDepartment(departmentId);
      router.push("/admin/departments");
    } catch (error) {
      alert("Error deleting department");
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-3 rounded-xl bg-[rgb(var(--error-red))]/10 text-[rgb(var(--error-red))] border-2 border-[rgb(var(--error-red))]/20 font-semibold hover:bg-[rgb(var(--error-red))]/20 hover:border-[rgb(var(--error-red))]/40 transition-all flex items-center gap-2 group"
      >
        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Delete Department
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass rounded-2xl shadow-2xl max-w-md w-full border-2 border-[rgb(var(--error-red))]/30 overflow-hidden elevation-3">
        <div className="bg-gradient-to-br from-[rgb(var(--error-red))]/10 to-[rgb(var(--error-red))]/5 p-6 border-b-2 border-[rgb(var(--error-red))]/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(var(--error-red))]/20 rounded-xl">
              <AlertTriangle className="w-7 h-7 text-[rgb(var(--error-red))]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Delete Department?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This will permanently delete{" "}
                <strong className="text-foreground">{departmentName}</strong>{" "}
                and remove all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 flex justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-muted transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[rgb(var(--error-red))] text-white font-semibold hover:brightness-110 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
