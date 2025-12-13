"use client"

import { cn } from "@/lib/utils"
import type { ComplaintCategory } from "@/lib/supabase/queries/complaints"
import { motion } from "framer-motion"

interface CategorySelectorProps {
  categories: ComplaintCategory[]
  selectedId: string
  onSelect: (id: string) => void
  isLoading?: boolean
}

export function CategorySelector({ categories, selectedId, onSelect, isLoading }: CategorySelectorProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Select complaint category">
      {categories.map((category, index) => {
        const isSelected = selectedId === category.id

        return (
          <motion.button
            key={category.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(category.id)}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center",
              "hover:border-primary/50 hover:bg-accent/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card",
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="text-2xl mb-2" aria-hidden="true">
              {category.icon}
            </span>
            <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>
              {category.name}
            </span>
            {isSelected && (
              <motion.div
                className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"
                layoutId="categoryIndicator"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
