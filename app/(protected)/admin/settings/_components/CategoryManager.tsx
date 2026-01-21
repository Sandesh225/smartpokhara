// ═══════════════════════════════════════════════════════════
// _components/CategoryManager.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { Edit2, Trash2, Plus, Save, X, Building2, Clock, Layers } from "lucide-react";
import { saveCategory, deleteCategory } from "../actions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Department {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  default_department_id: string | null;
  default_sla_days: number | null;
}

export default function CategoryManager({
  categories,
  departments,
}: {
  categories: Category[];
  departments: Department[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="stone-card overflow-hidden">
      {/* HEADER */}
      <div className="p-4 md:p-6 border-b-2 border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-base md:text-lg text-foreground">
              Complaint Categories
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Manage categories and route them to departments
            </p>
          </div>
        </div>
        <Button
          onClick={() => setEditingId("new")}
          className="gap-2 font-bold"
          size="sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* CATEGORIES LIST */}
      <div className="divide-y divide-border">
        {/* NEW CATEGORY FORM */}
        {editingId === "new" && (
          <CategoryRow
            category={{
              id: "",
              name: "",
              description: "",
              default_department_id: "",
              default_sla_days: 3,
            }}
            departments={departments}
            onCancel={() => setEditingId(null)}
            isNew
          />
        )}

        {/* EXISTING CATEGORIES */}
        {categories.map((cat) =>
          editingId === cat.id ? (
            <CategoryRow
              key={cat.id}
              category={cat}
              departments={departments}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={cat.id}
              className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-accent/30 transition-colors group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-black text-sm md:text-base text-foreground">
                    {cat.name}
                  </h4>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold border-primary/30 bg-primary/10 text-primary"
                  >
                    ACTIVE
                  </Badge>
                </div>
                
                {cat.description && (
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">
                    {cat.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-warning-amber" />
                    <span className="font-medium">
                      SLA: <span className="text-foreground font-bold">{cat.default_sla_days} Days</span>
                    </span>
                  </div>
                  <span className="text-border">•</span>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">
                      Routes to:{" "}
                      <span className="text-primary font-bold">
                        {departments.find((d) => d.id === cat.default_department_id)?.name || "Unassigned"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingId(cat.id)}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this category?")) {
                      deleteCategory(cat.id);
                    }
                  }}
                  className="hover:bg-error-red/10 hover:text-error-red"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        )}

        {categories.length === 0 && editingId !== "new" && (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Layers className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-2">
              No Categories Yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first complaint category to get started
            </p>
            <Button onClick={() => setEditingId("new")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryRow({ category, departments, onCancel, isNew }: any) {
  return (
    <form
      action={async (formData) => {
        await saveCategory(formData);
        onCancel();
      }}
      className="p-4 md:p-5 bg-primary/5 border-2 border-primary/20"
    >
      {!isNew && <input type="hidden" name="id" value={category.id} />}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
        {/* NAME */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Category Name
          </label>
          <input
            name="name"
            defaultValue={category.name}
            className="w-full px-3 py-2 border-2 border-border rounded-lg bg-card font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder="e.g. Roads & Transport"
            required
          />
        </div>

        {/* DEPARTMENT */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Department Mapping
          </label>
          <select
            name="department_id"
            defaultValue={category.default_department_id || ""}
            className="w-full px-3 py-2 border-2 border-border rounded-lg bg-card font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            <option value="">Select Department...</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* SLA DAYS */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            SLA (Days)
          </label>
          <input
            name="sla_days"
            type="number"
            defaultValue={category.default_sla_days}
            className="w-full px-3 py-2 border-2 border-border rounded-lg bg-card font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            required
            min="1"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <input
            name="description"
            defaultValue={category.description}
            className="w-full px-3 py-2 border-2 border-border rounded-lg bg-card font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder="Optional..."
          />
        </div>

        {/* ACTIONS */}
        <div className="md:col-span-2 flex gap-2 items-end">
          <Button
            type="submit"
            className="flex-1 gap-2 font-bold"
            size="sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="font-bold"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </form>
  );
}

