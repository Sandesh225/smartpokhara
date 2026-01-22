"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
      const toastId = toast.loading("Loading subcategories...");
      try {
        const subs = await complaintsService.getSubcategories(watchedCategory);
        setSubcategories(subs || []);
        if (subs?.length) {
          toast.success(`Found ${subs.length} subcategories`, { id: toastId });
        } else {
          toast.dismiss(toastId);
        }
      } catch (err) {
        toast.error("Failed to load subcategories", { id: toastId });
      } finally {
        setLoadingSubs(false);
      }
    };

    fetchSubcategories();
  }, [watchedCategory]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-foreground">
          Select Issue Category
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick the category that best describes your complaint.
        </p>
      </div>

      {/* Category Grid */}
      <Controller
        name="category_id"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => {
              const isSelected = field.value === category.id;
              return (
                <motion.button
                  key={category.id}
                  type="button"
                  layout
                  onClick={() => {
                    field.onChange(category.id);
                    setValue("subcategory_id", "");
                    toast.success(
                      `Selected: ${formatCategoryName(category.name)}`
                    );
                  }}
                  className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-start justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                  whileHover={{ scale: 1.03 }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="categoryCheck"
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </motion.div>
                  )}
                  <div className="text-3xl mb-2">
                    {getCategoryIcon(category.name)}
                  </div>
                  <span className="font-semibold text-sm text-foreground">
                    {formatCategoryName(category.name)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      />
      {errors.category_id && (
        <div className="flex items-center gap-2 mt-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="w-4 h-4" />
          {errors.category_id.message as string}
        </div>
      )}

      {/* Subcategory & Title */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Subcategory */}
        <AnimatePresence>
          {subcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <label className="block text-sm font-medium text-foreground mb-2">
                Specific Type
              </label>
              <Controller
                name="subcategory_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={loadingSubs}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    onChange={(e) => {
                      field.onChange(e);
                      const subName = subcategories.find(
                        (s) => s.id === e.target.value
                      )?.name;
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <div className={subcategories.length === 0 ? "md:col-span-2" : ""}>
          <label className="block text-sm font-medium text-foreground mb-2">
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
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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

      {/* Loading Overlay */}
      {loadingSubs && (
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-xl">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
