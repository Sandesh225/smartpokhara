// ui//popover.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) {
    throw new Error("Popover components must be used within <Popover>");
  }
  return ctx;
}

interface PopoverProps {
  children: React.ReactNode;
}

export function Popover({ children }: PopoverProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    const { open, setOpen } = usePopoverContext();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref,
        onClick: (e: React.MouseEvent) => {
          (children.props as any).onClick?.(e);
          setOpen(!open);
        },
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        {...props}
        onClick={(e) => {
          props.onClick?.(e);
          setOpen(!open);
        }}
      >
        {children}
      </button>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align, ...props }, ref) => {
    const { open } = usePopoverContext();

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-2 min-w-[8rem] rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "right-0",
          className
        )}
        {...props}
      />
    );
  }
);
PopoverContent.displayName = "PopoverContent";
