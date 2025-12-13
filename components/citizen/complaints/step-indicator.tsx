"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

interface Step {
  id: number
  title: string
  description: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop: Horizontal */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-8" />

        {/* Progress line filled */}
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-primary mx-8"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <motion.div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-card border-primary text-primary shadow-md",
                  !isCompleted && !isCurrent && "bg-card border-border text-muted-foreground",
                )}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <span className="text-sm font-semibold">{step.id}</span>}
              </motion.div>
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: Simplified */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">{steps[currentStep - 1]?.title}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(currentStep / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  )
}
