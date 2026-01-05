"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Lock, Plus, Users, Tag, FileText } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { AddNoteModal } from "@/components/supervisor/modals/AddNoteModal"; // Assumed existing or generic modal

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [notes, setNotes] = useState<Note[]>(initialNotes);
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

      const newNote: Note = {
        id: Date.now().toString(),
        text,
        visibility,
        tags,
        created_at: new Date().toISOString(),
        author: { profile: { full_name: "You" } },
      };

      setNotes([newNote, ...notes]);
      toast.success("Note added successfully");
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  return (
    <>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">
              Internal Notes
            </CardTitle>
            <Badge
              variant="secondary"
              className="ml-2 text-xs font-normal bg-background"
            >
              {notes.length}
            </Badge>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="ghost"
            size="sm"
            className="h-7 text-xs hover:bg-background"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Note
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[320px]">
            <div className="p-4 space-y-4">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No notes yet
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Private notes are only visible to staff and supervisors.
                  </p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="group relative pl-4 border-l-2 border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={note.author?.profile?.avatar_url} />
                          <AvatarFallback className="text-[9px]">
                            {note.author?.profile?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-foreground">
                          {note.author?.profile?.full_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          •{" "}
                          {formatDistanceToNow(new Date(note.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {note.visibility === "internal_only" ? (
                              <Lock className="w-3 h-3 text-amber-500" />
                            ) : (
                              <Users className="w-3 h-3 text-blue-500" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            {note.visibility === "internal_only"
                              ? "Private (Staff Only)"
                              : "Shared Visibility"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {note.text}
                      </p>

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
                          {note.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] py-0 h-5 border-border/60 text-muted-foreground bg-background"
                            >
                              <Tag className="w-2.5 h-2.5 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 rounded-full bg-border group-hover:bg-primary transition-colors ring-4 ring-background" />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AddNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddNote}
      />
    </>
  );
}