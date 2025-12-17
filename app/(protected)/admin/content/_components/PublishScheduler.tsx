"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PublishSchedulerProps {
  status: string;
  onStatusChange: (status: string) => void;
  publishDate?: Date;
  onDateChange: (date: Date | undefined) => void;
}

export function PublishScheduler({ status, onStatusChange, publishDate, onDateChange }: PublishSchedulerProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
       <div className="space-y-2">
          <Label>Publishing Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
             <SelectTrigger>
                <SelectValue />
             </SelectTrigger>
             <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
             </SelectContent>
          </Select>
       </div>

       {status === 'published' && (
           <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label>Schedule (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !publishDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={publishDate}
                    onSelect={onDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-[10px] text-gray-500">
                 Leave empty to publish immediately.
              </p>
           </div>
       )}
    </div>
  );
}