"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ComboboxItem {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  [key: string]: any;
}

interface UniversalComboboxProps {
  items: ComboboxItem[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
  renderItem?: (item: ComboboxItem, isSelected: boolean) => React.ReactNode;
}

export function UniversalCombobox({
  items,
  value,
  onChange,
  placeholder = "Select item...",
  searchPlaceholder = "Search...",
  emptyLabel = "No item found.",
  className,
  disabled = false,
  renderItem,
}: UniversalComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedItem = items.find((item) => item.value === value) || items.find((item) => item.id === value);

  // Filter items based on search
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setOpen(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedItem ? (
             <span className="truncate">{selectedItem.label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 min-w-[200px]" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground border-none shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="h-full max-h-[300px]">
           <div className="p-1">
            {filteredItems.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyLabel}
                </div>
            ) : (
                filteredItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => {
                        if (!item.disabled) handleSelect(item.value);
                    }}
                    className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                    item.disabled && "opacity-50 cursor-not-allowed",
                    value === item.value && "bg-accent"
                    )}
                >
                    <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            value === item.value ? "opacity-100" : "opacity-0"
                        )}
                    />
                    <div className="flex-1">
                        {renderItem ? renderItem(item, value === item.value) : item.label}
                    </div>
                </div>
                ))
            )}
           </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
