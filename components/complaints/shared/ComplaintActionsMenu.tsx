"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Eye, 
  Printer, 
  UserCog, 
  Trash2, 
  XCircle, 
  ShieldAlert, 
  CheckSquare, 
  Forward 
} from "lucide-react";
import Link from "next/link";
import { Complaint } from "@/features/complaints";
import { PortalMode, ComplaintActionType } from "@/types/complaints-ui";

interface ComplaintActionsMenuProps {
  complaint: Complaint;
  portalMode: PortalMode;
  onAction?: (action: ComplaintActionType, complaint: Complaint) => void;
}

export function ComplaintActionsMenu({
  complaint,
  portalMode,
  onAction,
}: ComplaintActionsMenuProps) {
  
  const handleAction = (action: ComplaintActionType) => {
    if (onAction) {
      onAction(action, complaint);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-border">
        <DropdownMenuLabel className="text-xs font-black text-muted-foreground uppercase tracking-widest">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* UNIVERSAL ACTIONS */}
        <DropdownMenuItem asChild>
          <Link
            href={`/${portalMode.toLowerCase()}/complaints/${complaint.id}`}
            className="cursor-pointer text-xs font-bold flex items-center"
          >
            <Eye className="w-4 h-4 mr-2 text-primary" />
            View Details
          </Link>
        </DropdownMenuItem>

        {/* CITIZEN ACTIONS */}
        {portalMode === "CITIZEN" && (
          <>
            <DropdownMenuItem 
              onClick={() => window.print()} 
              className="cursor-pointer text-xs font-bold"
            >
              <Printer className="mr-2 h-4 w-4" /> Print Document
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive font-bold cursor-pointer text-xs focus:bg-destructive/10 focus:text-destructive"
              onClick={() => handleAction("DELETE")} // Often mapped to Cancel for citizens
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel Request
            </DropdownMenuItem>
          </>
        )}

        {/* ADMIN ACTIONS */}
        {portalMode === "ADMIN" && (
          <>
            <DropdownMenuItem 
              className="cursor-pointer text-xs font-bold"
              onClick={() => handleAction("ASSIGN")}
            >
              <UserCog className="w-4 h-4 mr-2 text-secondary" />
              Assign Staff
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-error-red cursor-pointer text-xs font-bold focus:bg-error-red/10 focus:text-error-red"
              onClick={() => handleAction("DELETE")}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Mark as Spam
            </DropdownMenuItem>
          </>
        )}

        {/* SUPERVISOR ACTIONS */}
        {portalMode === "SUPERVISOR" && (
          <>
            <DropdownMenuItem 
              className="cursor-pointer text-xs font-bold"
              onClick={() => handleAction("ASSIGN")}
            >
              <Forward className="w-4 h-4 mr-2 text-primary" />
              Reassign Node
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-xs font-bold"
              onClick={() => handleAction("ESCALATE")}
            >
              <ShieldAlert className="w-4 h-4 mr-2 text-warning-amber" />
              Emergency Escalation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-xs font-black text-success-green focus:bg-success-green/10 focus:text-success-green"
              onClick={() => handleAction("RESOLVE")}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Mark Resolved
            </DropdownMenuItem>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
