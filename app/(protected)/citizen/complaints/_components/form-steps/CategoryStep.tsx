"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { complaintsService } from "@/lib/supabase/queries/complaints";
import { getCategoryIcon, formatCategoryName } from "./category-helpers";

type Category = { id: string; name: string };
type CategoryStepProps = { categories: Category[] };

export function CategoryStep({ categories }: CategoryStepProps) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const watchedCategory = watch("category_id");
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    if (!watchedCategory) {
      setSubcategories([]);
      return;
    }

    const fetchSubcategories = async () => {
      setLoadingSubs(true);
      try {
        const subs = await complaintsService.getSubcategories(watchedCategory);
        setSubcategories(subs || []);
      } catch (err) {
        toast.error("Failed to load subcategories");
      } finally {
        setLoadingSubs(false);
      }
    };

    fetchSubcategories();
  }, [watchedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold mb-1">Select Issue Category</h2>
        <p className="text-sm text-muted-foreground">
          Choose the category that best describes your complaint
        </p>
      </div>

      {/* Category Grid */}
      <Controller
        name="category_id"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((category) => {
              const isSelected = field.value === category.id;
              return (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    field.onChange(category.id);
                    setValue("subcategory_id", "");
                    toast.success(`Selected: ${formatCategoryName(category.name)}`);
                  }}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="text-2xl mb-2">{getCategoryIcon(category.name)}</div>
                  <span className="font-medium text-sm">
                    {formatCategoryName(category.name)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      />
      {errors.category_id && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {errors.category_id.message as string}
        </div>
      )}

      {/* Subcategory & Title */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Subcategory */}
        {subcategories.length > 0 && (
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Specific Type
            </label>
            <Controller
              name="subcategory_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={loadingSubs}
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  onChange={(e) => {
                    field.onChange(e);
                    const subName = subcategories.find(s => s.id === e.target.value)?.name;
                    if (subName) toast.success(`Selected: ${subName}`);
                  }}
                >
                  <option value="">Choose type...</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {loadingSubs && (
              <div className="absolute right-3 top-10">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div className={subcategories.length === 0 ? "sm:col-span-2" : ""}>
          <label className="block text-sm font-medium mb-2">
            Brief Title <span className="text-destructive">*</span>
          </label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="e.g., Broken streetlight on Main Road"
                className="w-full px-3 py-2 rounded-lg border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}
          />
          {errors.title && (
            <div className="flex items-center gap-2 mt-1.5 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {errors.title.message as string}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}