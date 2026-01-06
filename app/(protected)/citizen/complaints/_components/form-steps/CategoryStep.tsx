"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { complaintsService } from "@/lib/supabase/queries/complaints";
import { getCategoryIcon, formatCategoryName } from "./category-helpers";

type Category = { id: string; name: string; };
type CategoryStepProps = { categories: Category[]; };

export function CategoryStep({ categories }: CategoryStepProps) {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const watchedCategory = watch("category_id");

  useEffect(() => {
    if (!watchedCategory) {
      setSubcategories([]);
      return;
    }
    const loadSubs = async () => {
      try {
        const subs = await complaintsService.getSubcategories(watchedCategory);
        setSubcategories(subs || []);
      } catch (err) {
        toast.error("Failed to load subcategories");
      }
    };
    loadSubs();
  }, [watchedCategory]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Category Selection */}
      <div className="space-y-6">
        <Label required variant="stone" className="text-xl font-black text-[rgb(var(--text-ink))]">
          What type of issue are you reporting?
        </Label>

        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <div role="radiogroup" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const isSelected = field.value === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      field.onChange(category.id);
                      setValue("subcategory_id", "");
                    }}
                    className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 outline-none ring-offset-2 focus:ring-2 focus:ring-[rgb(var(--primary-brand))] ${
                      isSelected
                        ? "bg-[rgb(var(--primary-brand))]/5 border-2 border-[rgb(var(--primary-brand))] elevation-3 scale-[1.02]"
                        : "bg-white border-2 border-[rgb(var(--neutral-stone-200))] hover:border-[rgb(var(--primary-brand))]/30 elevation-1"
                    }`}
                  >
                    {isSelected && (
                      <motion.div 
                        layoutId="activeCheck"
                        className="absolute top-3 right-3 text-[rgb(var(--primary-brand))]"
                      >
                        <CheckCircle2 className="h-6 w-6 fill-current text-white stroke-[rgb(var(--primary-brand))]" />
                      </motion.div>
                    )}
                    
                    <div className={`mb-4 p-4 rounded-xl transition-all duration-300 ${
                      isSelected ? "bg-white elevation-2" : "bg-[rgb(var(--neutral-stone-50))] group-hover:scale-110"
                    }`}>
                      <div className={isSelected ? "text-[rgb(var(--primary-brand))]" : "text-[rgb(var(--neutral-stone-500))]"}>
                        {getCategoryIcon(category.name)}
                      </div>
                    </div>

                    <span className={`font-bold text-sm text-center leading-tight tracking-tight uppercase ${
                      isSelected ? "text-[rgb(var(--primary-brand))]" : "text-[rgb(var(--neutral-stone-600))]"
                    }`}>
                      {formatCategoryName(category.name)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.category_id && (
          <p className="text-sm text-[rgb(var(--error-red))] flex items-center gap-1.5 mt-2 font-medium">
            <AlertCircle className="h-4 w-4" /> {errors.category_id.message as string}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Subcategory */}
        {subcategories.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
            <Label variant="stone" className="font-bold">Specific Issue Type</Label>
            <Controller
              name="subcategory_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger className="h-12 bg-white border-[rgb(var(--neutral-stone-200))] rounded-xl elevation-1">
                    <SelectValue placeholder="Select specific detail..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl elevation-4 border-[rgb(var(--neutral-stone-200))]">
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id} className="focus:bg-[rgb(var(--primary-brand))]/5">
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {/* Title */}
        <div className="space-y-3">
          <Label required variant="stone" className="font-bold">Report Title</Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="stone"
                placeholder="e.g. Broken Streetlight on Main St."
                className="h-12 font-medium"
              />
            )}
          />
          {errors.title && (
            <p className="text-sm text-[rgb(var(--error-red))] flex items-center gap-1.5 mt-1">
              <AlertCircle className="h-4 w-4" /> {errors.title.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}