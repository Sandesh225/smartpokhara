import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react"; // Optional: if you want a close icon

type SheetContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be used within <Sheet>");
  return ctx;
}

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open: openProp, onOpenChange, children }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = openProp ?? internalOpen;

  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  };

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

interface SheetTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    const { open, setOpen } = useSheetContext();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        onClick: (e: React.MouseEvent) => {
          children.props.onClick?.(e);
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
SheetTrigger.displayName = "SheetTrigger";

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "right" | "left";
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = "right", children, ...props }, ref) => {
    const { open, setOpen } = useSheetContext();

    if (!open) return null;

    const sideClasses =
      side === "right" ? "right-0 border-l" : "left-0 border-r";

    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={() => setOpen(false)}
        />
        
        {/* Panel */}
        <div
          ref={ref}
          className={cn(
            "fixed inset-y-0 z-50 h-full w-[85vw] max-w-sm bg-background p-6 shadow-xl transition-transform duration-300 ease-in-out sm:max-w-sm",
            sideClasses,
            className
          )}
          {...props}
        >
          {/* Optional: Standard X close button usually found in SheetContent */}
          <button 
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          {children}
        </div>
      </div>
    );
  }
);
SheetContent.displayName = "SheetContent";

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

// ============================================
// ADDED COMPONENTS BELOW
// ============================================

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-auto pt-4",
        className
      )}
      {...props}
    />
  );
}

export const SheetClose = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    const { setOpen } = useSheetContext();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        onClick: (e: React.MouseEvent) => {
          children.props.onClick?.(e);
          setOpen(false); // Explicitly close
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
          setOpen(false); // Explicitly close
        }}
      >
        {children}
      </button>
    );
  }
);
SheetClose.displayName = "SheetClose";