import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-xl text-sm font-bold transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground elevation-2 hover:elevation-3 hover:bg-primary/90",

        secondary:
          "bg-secondary text-secondary-foreground elevation-1 hover:elevation-2 hover:bg-secondary/85",

        destructive:
          "bg-destructive text-destructive-foreground elevation-2 hover:bg-destructive/90 focus-visible:ring-destructive",

        outline:
          "border-2 border-border bg-background text-foreground hover:bg-muted",

        ghost: "bg-transparent text-foreground hover:bg-muted",

        link: "text-primary underline-offset-4 hover:underline",

        /* ✨ Machhapuchhre additions */
        stone: "stone-card text-foreground hover:elevation-3",

        glass: "glass text-foreground hover:glass-strong elevation-2",
      },

      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);



function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
