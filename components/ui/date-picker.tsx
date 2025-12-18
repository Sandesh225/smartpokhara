'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  date?: Date
  onSelect?: (date?: Date) => void
}

function formatDateForInput(date?: Date) {
  if (!date) return ''
  // yyyy-mm-dd
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, date, onSelect, ...props }, ref) => {
    const value = formatDateForInput(date)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (!onSelect) return
      if (!v) {
        onSelect(undefined)
        return
      }
      const selected = new Date(v + 'T00:00:00')
      onSelect(selected)
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type="date"
          data-slot="date-picker"
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
            'dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 pr-9 py-1',
            'text-base shadow-xs transition-[color,box-shadow] outline-none',
            'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            className,
          )}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <CalendarIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
      </div>
    )
  },
)

DatePicker.displayName = 'DatePicker'

export { DatePicker }
