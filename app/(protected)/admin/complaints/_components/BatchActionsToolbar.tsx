"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  UserPlus,
  Printer,
  Trash2,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { UniversalBatchActions, type BatchAction } from "@/components/shared/UniversalBatchActions";

interface BatchActionsToolbarProps {
  selectedCount: number;
  onClear: () => void;
  onStatusChange: (status: string) => void;
}

export function BatchActionsToolbar({
  selectedCount,
  onClear,
  onStatusChange,
}: BatchActionsToolbarProps) {
  
  const actions: BatchAction[] = useMemo(() => [
    {
      id: "activate",
      label: "Activate",
      icon: PlayCircle,
      onClick: () => onStatusChange("in_progress"),
      variant: "ghost",
      className: "text-info-blue hover:bg-info-blue/10"
    },
    {
      id: "resolve",
      label: "Resolve",
      icon: CheckCircle2,
      onClick: () => onStatusChange("resolved"),
      variant: "ghost",
      className: "text-success-green hover:bg-success-green/10"
    },
    {
      id: "assign",
      label: "Assign Staff",
      icon: UserPlus,
      onClick: () => {}, // Placeholder
      collapsed: true
    },
    {
      id: "change_status",
      label: "Change Status",
      icon: ArrowRight,
      onClick: () => {}, // Placeholder
      collapsed: true
    },
    {
      id: "export",
      label: "Export",
      icon: Printer,
      onClick: () => {}, // Placeholder
      collapsed: true
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: () => {}, // Placeholder
      variant: "destructive",
      className: "text-error-red hover:bg-error-red/10",
      collapsed: true
    }
  ], [onStatusChange]);

  return (
    <UniversalBatchActions
      selectedCount={selectedCount}
      onClearSelection={onClear}
      actions={actions}
    />
  );
}