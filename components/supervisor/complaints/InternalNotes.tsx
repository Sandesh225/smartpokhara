"use client";

import { useState } from "react";
import { Lock, Plus, Users, FileText, Tag } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { AddNoteModal } from "@/components/supervisor/modals/AddNoteModal";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Note {
  id: string;
  text: string;
  visibility: string;
  created_at: string;
  tags?: string[];
  author: {
    profile: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

interface InternalNotesProps {
  complaintId: string;
  initialNotes: Note[];
}

export function InternalNotes({
  complaintId,
  initialNotes,
}: InternalNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const handleAddNote = async (
    text: string,
    tags: string[],
    visibility: string
  ) => {
    try {
      await supervisorComplaintsQueries.addInternalNote(
        supabase,
        complaintId,
        text,
        tags,
        visibility
      );
      toast.success("Note added successfully");
      // Optimistic update
      const newNote = {
        id: Date.now().toString(),
        text,
        visibility,
        tags,
        created_at: new Date().toISOString(),
        author: { profile: { full_name: "You" } },
      };
      setNotes([newNote as any, ...notes]);
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Internal Notes
            </CardTitle>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="gap-1"
              aria-label="Add internal note"
            >
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Private notes visible only to staff members
          </p>
        </CardHeader>

        <ScrollArea className="h-[300px]">
          <CardContent>
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 rounded-full bg-muted p-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No internal notes</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Add private notes to track important details about this case
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">
                          {note.author?.profile?.full_name || "Supervisor"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(note.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1">
                                {note.visibility === "internal_only" ? (
                                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {note.visibility === "internal_only"
                                    ? "Private"
                                    : "Shared"}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {note.visibility === "internal_only"
                                ? "Visible to staff only"
                                : "Shared with team"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <p className="text-sm whitespace-pre-wrap mb-3">
                      {note.text}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1 text-xs"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-2">
                      {format(
                        new Date(note.created_at),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      <AddNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddNote}
      />
    </>
  );
}