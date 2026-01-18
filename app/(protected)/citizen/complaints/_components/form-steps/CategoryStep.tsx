"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const watchedCategory = watch("category_id");

  useEffect(() => {
    if (!watchedCategory) {
      setSubcategories([]);
      return;
    }

    const loadSubs = async () => {
      setLoading(true);
      const loadingToast = toast.loading("Loading subcategories...");
      try {
        const subs = await complaintsService.getSubcategories(watchedCategory);
        setSubcategories(subs || []);
        if (subs && subs.length > 0) {
          toast.success(`Found ${subs.length} subcategories`, {
            id: loadingToast,
          });
        } else {
          toast.dismiss(loadingToast);
        }
      } catch (err) {
        toast.error("Failed to load subcategories", { id: loadingToast });
      } finally {
        setLoading(false);
      }
    };
    loadSubs();
  }, [watchedCategory]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Select Issue Category
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the category that best describes your complaint
        </p>
      </div>

      {/* Category Grid */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Category <span className="text-destructive">*</span>
        </label>

        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => {
                const isSelected = field.value === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      field.onChange(category.id);
                      setValue("subcategory_id", "");
                      toast.success(
                        `Selected: ${formatCategoryName(category.name)}`
                      );
                    }}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="categoryCheck"
                        className="absolute top-2 right-2"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </motion.div>
                    )}

                    <div className="mb-2 text-2xl">
                      {getCategoryIcon(category.name)}
                    </div>

                    <span className="font-medium text-sm text-foreground block text-left">
                      {formatCategoryName(category.name)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />

        {errors.category_id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errors.category_id.message as string}</span>
          </motion.div>
        )}
      </div>

      {/* Subcategory & Title Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Subcategory */}
        {subcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
                  value={field.value || ""}
                  disabled={loading}
                  onChange={(e) => {
                    field.onChange(e);
                    if (e.target.value) {
                      const subName = subcategories.find(
                        (s) => s.id === e.target.value
                      )?.name;
                      toast.success(`Selected: ${subName}`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
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
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
          />
          {errors.title && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.title.message as string}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}