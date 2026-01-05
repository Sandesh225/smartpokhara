"use client";

import { useState } from "react";
import { Edit2, Trash2, Plus, Save } from "lucide-react";
import { saveCategory, deleteCategory } from "../actions";

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
    <div className="stone-card p-0 overflow-hidden">
      <div className="p-6 border-b border-border bg-neutral-stone-50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-primary">
            Complaint Categories
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage categories and route them to departments.
          </p>
        </div>
        <button
          onClick={() => setEditingId("new")}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-opacity-90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="divide-y divide-border">
        {/* New Category Form */}
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

        {/* Existing Categories */}
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
              className="p-4 flex items-center justify-between hover:bg-neutral-stone-50 group"
            >
              <div>
                <h4 className="font-semibold text-foreground">{cat.name}</h4>
                <div className="text-sm text-muted-foreground flex gap-4 mt-1">
                  <span>SLA: {cat.default_sla_days} Days</span>
                  <span>&bull;</span>
                  <span>
                    Routes to:{" "}
                    <span className="text-primary font-medium">
                      {departments.find(
                        (d) => d.id === cat.default_department_id
                      )?.name || "Unassigned"}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingId(cat.id)}
                  className="p-2 hover:bg-white rounded border border-transparent hover:border-border text-muted-foreground hover:text-primary"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-2 hover:bg-red-50 rounded text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
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
      className="p-4 bg-primary/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
    >
      {!isNew && <input type="hidden" name="id" value={category.id} />}

      <div className="md:col-span-3 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">
          Name
        </label>
        <input
          name="name"
          defaultValue={category.name}
          className="dept-input-base w-full py-1.5"
          placeholder="e.g. Roads"
          required
        />
      </div>

      <div className="md:col-span-3 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">
          Department Mapping
        </label>
        <select
          name="department_id"
          defaultValue={category.default_department_id || ""}
          className="dept-input-base w-full py-1.5"
        >
          <option value="">Select Department...</option>
          {departments.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">
          Default SLA (Days)
        </label>
        <input
          name="sla_days"
          type="number"
          defaultValue={category.default_sla_days}
          className="dept-input-base w-full py-1.5"
          required
        />
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">
          Description
        </label>
        <input
          name="description"
          defaultValue={category.description}
          className="dept-input-base w-full py-1.5"
          placeholder="Optional..."
        />
      </div>

      <div className="md:col-span-2 flex gap-2">
        <button
          type="submit"
          className="flex-1 py-2 bg-primary text-white rounded text-xs font-bold hover:brightness-110"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border border-border bg-white rounded text-xs font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
