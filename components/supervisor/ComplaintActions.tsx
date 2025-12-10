"use client";

import { useState } from "react";
import { Button } from "@/ui/button";
import { UserPlus } from "lucide-react";
import AssignmentModal from "./AssignmentModal";
import { useRouter } from "next/navigation";

interface Props {
  complaintId: string;
  currentDeptId: string;
}

export default function ComplaintActions({ complaintId, currentDeptId }: Props) {
  const [showAssign, setShowAssign] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setShowAssign(true)}
      >
        <UserPlus className="w-4 h-4 mr-1" />
        Assign
      </Button>

      {showAssign && (
        <AssignmentModal
          isOpen={showAssign}
          onClose={() => setShowAssign(false)}
          complaintId={complaintId}
          currentDepartmentId={currentDeptId}
          onSuccess={() => {
            // Refresh server data to show new assignment
            router.refresh();
          }}
        />
      )}
    </>
  );
}