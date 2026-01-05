"use client";

import { Clock, Mail } from "lucide-react";
import { scheduleReport } from "../actions";

export default function ReportScheduler() {
  return (
    <form
      action={scheduleReport}
      className="stone-card p-6 h-full flex flex-col justify-between"
    >
      <div>
        <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" /> Automate Delivery
        </h4>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Report Type
            </label>
            <select name="report_type" className="dept-input-base w-full">
              <option value="monthly_summary">Monthly Executive Summary</option>
              <option value="weekly_operations">Weekly Operations</option>
              <option value="daily_finance">Daily Revenue</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Frequency
            </label>
            <div className="flex gap-2">
              {["Daily", "Weekly", "Monthly"].map((freq) => (
                <label key={freq} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value={freq.toLowerCase()}
                    className="peer sr-only"
                  />
                  <div className="text-center py-2 border rounded-md text-sm peer-checked:bg-accent peer-checked:text-white peer-checked:border-accent hover:bg-neutral-stone-50 transition-all">
                    {freq}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Recipients
            </label>
            <input
              name="recipients"
              type="text"
              placeholder="email@pokhara.gov.np, ..."
              className="dept-input-base w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma separated emails.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full py-2.5 border border-primary text-primary font-medium rounded-lg hover:bg-primary/5 transition-colors"
      >
        Save Schedule
      </button>
    </form>
  );
}
