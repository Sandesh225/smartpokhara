"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("stone-card p-4 elevation-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-sm font-bold",

        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "glass", size: "icon-sm" }),
          "h-7 w-7 opacity-70 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",

        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "w-9 rounded-md text-[0.75rem] font-semibold text-muted-foreground",
        row: "flex w-full mt-2",

        cell:
          "relative h-9 w-9 p-0 text-center text-sm focus-within:z-20 " +
          "[&:has([aria-selected])]:bg-accent/40 " +
          "first:[&:has([aria-selected])]:rounded-l-lg " +
          "last:[&:has([aria-selected])]:rounded-r-lg",

        day: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "h-9 w-9 font-normal"
        ),

        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",

        day_today: "bg-secondary text-secondary-foreground font-bold",

        day_outside: "text-muted-foreground opacity-40",

        day_disabled: "text-muted-foreground opacity-30",

        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",

        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => props.orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar"

export { Calendar }
