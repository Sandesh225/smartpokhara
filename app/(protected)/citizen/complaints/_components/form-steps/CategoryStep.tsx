"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import {
  useSubcategories as useSubcategoriesHook,
} from "@/features/complaints";
import { ChevronRight } from "lucide-react";
import { getCategoryIcon, formatCategoryName } from "./category-helpers";
import { cn } from "@/lib/utils";

type CategoryStepProps = {
  categories: any[];
};


export function CategoryStep({ categories }: CategoryStepProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const watchedCategory = useWatch({
    control,
    name: "category_id",
  });

  const { data: subcategories = [], isLoading: loadingSubs } = useSubcategoriesHook(watchedCategory);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5 pb-6 border-b border-border">
        <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Classify Intelligence</h2>
        <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest text-center leading-relaxed">
          Identify the specific department or operations sector for this report.
        </p>
      </div>

      {/* Category Grid */}
      <Controller
        name="category_id"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const isSelected = field.value === category.id;
              return (
                <motion.button
                  key={category.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (field.value !== category.id) {
                      field.onChange(category.id);
                      setValue("subcategory_id", "");
                    }
                  }}
                  className={cn(
                    "group relative p-5 rounded-2xl border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                      : "border-border bg-card hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground/60 group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {getCategoryIcon(category.name)}
                    </div>
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground p-1 rounded-full shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-4" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className={cn(
                      "text-xs font-black uppercase tracking-widest transition-colors",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {category.name_nepali && (
                        <span className="block text-[10px] opacity-60 font-bold mb-1">
                          {category.name_nepali}
                        </span>
                      )}
                      {formatCategoryName(category.name)}
                    </p>
                  </div>
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

        {/* Subcategory & Title Section */}
        <div className="grid gap-8">
          <AnimatePresence mode="wait">
            {(subcategories.length > 0 || loadingSubs) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <label className="text-xs font-black uppercase tracking-wider text-foreground px-1">
                  Sub-Operations Logic
                </label>
                <Controller
                  name="subcategory_id"
                  control={control}
                  render={({ field }) => (
                    <div className="relative group">
                      <select
                        {...field}
                        disabled={loadingSubs}
                        className="w-full h-12 px-5 rounded-xl border border-border bg-background text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none disabled:opacity-50 transition-all group-hover:border-primary/20"
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      >
                        <option value="">
                          {loadingSubs ? "Syncing Sub-Protocols..." : "Select Specification"}
                        </option>
                        {subcategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                        {loadingSubs ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        )}
                      </div>
                    </div>
                  )}
                />
                {errors.subcategory_id && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-destructive"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.subcategory_id.message as string}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title Input */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-foreground px-1">
              Mission Title <span className="text-primary ml-1">•</span>
            </label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div className="relative group">
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter operation summary..."
                    className="w-full h-12 px-5 rounded-xl border border-border bg-background text-sm font-black uppercase tracking-widest placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all group-hover:border-primary/20"
                  />
                </div>
              )}
            />
            {errors.title && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-destructive"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.title.message as string}
              </motion.div>
            )}
          </div>
        </div>
    </div>
  );
}