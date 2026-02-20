"use client";

import { useMemo } from "react";
import { UserPlus, AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { UniversalBatchActions, type BatchAction } from "@/components/shared/UniversalBatchActions";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAssign: () => void;
  onPrioritize: () => void;
  onEscalate: () => void;
  onResolve: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onAssign,
  onPrioritize,
  onEscalate,
  onResolve,
}: BulkActionsBarProps) {
  
  const actions: BatchAction[] = useMemo(() => [
    {
       id: "assign",
       label: "Assign",
       icon: UserPlus,
       onClick: onAssign,
       variant: "ghost",
       className: "hover:bg-gray-100"
    },
    {
       id: "prioritize",
       label: "Prioritize",
       icon: AlertTriangle,
       onClick: onPrioritize,
       variant: "ghost",
       className: "hover:bg-gray-100"
    },
    {
       id: "escalate",
       label: "Escalate",
       icon: ArrowUpRight,
       onClick: onEscalate,
       variant: "ghost",
       className: "hover:bg-gray-100"
    },
    {
       id: "resolve",
       label: "Resolve",
       icon: CheckCircle2,
       onClick: onResolve,
       variant: "default",
       className: "bg-green-600 hover:bg-green-700 text-white shadow-sm"
    }
  ], [onAssign, onPrioritize, onEscalate, onResolve]);

  return (
    <UniversalBatchActions
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      actions={actions}
    />
  );
}