"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper imports
import { getCategoryIcon, formatCategoryName } from "./category-helpers";
import { complaintsService } from "@/lib/supabase/queries/complaints";

export function CategoryStep({ categories }: { categories: any[] }) {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const [subcategories, setSubcategories] = useState<any[]>([]);
  
  // Watch for changes to load subcategories
  const watchedCategory = watch("category_id");

  useEffect(() => {
    if (!watchedCategory) {
      setSubcategories([]);
      return;
    }
    const loadSubs = async () => {
      try {
        // Ensure you have this service method, or remove this block if not needed yet
        const subs = await complaintsService.getSubcategories(watchedCategory);
        setSubcategories(subs || []);
      } catch (err) {
        console.error("Failed to load subcategories", err);
      }
    };
    loadSubs();
  }, [watchedCategory]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <Label className="text-lg font-bold text-slate-800">
          What type of issue are you reporting? <span className="text-red-500">*</span>
        </Label>
        
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => {
                const isSelected = field.value === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      field.onChange(category.id);
                      // Reset subcategory when category changes
                      setValue("subcategory_id", "");
                    }}
                    className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 outline-none focus:ring-4 focus:ring-blue-100 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 shadow-md scale-[1.02]"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 text-blue-600"
                      >
                        <CheckCircle2 className="h-6 w-6" />
                      </motion.div>
                    )}
                    <div className={`mb-4 p-4 rounded-full transition-colors ${isSelected ? "bg-white" : "bg-slate-100 group-hover:bg-blue-50"}`}>
                      {getCategoryIcon(category.name)}
                    </div>
                    <span className={`font-bold text-sm text-center leading-tight ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                      {formatCategoryName(category.name)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.category_id && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Required</AlertTitle>
            <AlertDescription>{errors.category_id.message as string}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Subcategory Select */}
      {subcategories.length > 0 && (
        <div className="space-y-3 animate-in fade-in">
          <Label className="text-base font-semibold text-slate-800">Specific Issue Type</Label>
          <Controller
            name="subcategory_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger className="h-12 bg-white border-slate-200">
                  <SelectValue placeholder="Select specific detail..." />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      {/* Title Input */}
      <div className="space-y-3">
        <Label className="text-lg font-bold text-slate-800">
          Give it a short title <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input 
              {...field} 
              placeholder="e.g. Broken Streetlight on Main St." 
              className="h-12 text-base bg-white border-slate-200 focus:ring-2 focus:ring-blue-500" 
            />
          )}
        />
        {errors.title && (
            <p className="text-red-500 text-sm font-medium flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> {errors.title.message as string}
            </p>
        )}
      </div>
    </div>
  );
}