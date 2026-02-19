"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Lock, Plus, Users, Tag, FileText } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { complaintsApi } from "@/features/complaints";
import { AddNoteModal } from "@/components/supervisor/modals/AddNoteModal";

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
      const result = await complaintsApi.addInternalNote(
        supabase,
        complaintId,
        text,
        tags,
        visibility
      );

      // Transform result to match the Note interface exactly
      const newNote = {
        ...result,
        text: result.content, // Map 'content' from DB to 'text' for UI
        author: {
          profile: {
            full_name: result.author?.profile?.full_name || "Supervisor",
            avatar_url: result.author?.profile?.profile_photo_url,
          },
        },
      };

      setNotes((prev) => [newNote, ...prev]);
      toast.success("Note added to ledger");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync with database");
    }
  };
  return (
    <>
      <Card className="stone-card dark:stone-card-elevated border-none shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-primary/5 dark:bg-dark-surface/40 px-6 py-4 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">
                Internal Ledger
              </CardTitle>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
                Supervisory Observations
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="h-9 text-xs font-bold uppercase tracking-wider border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-2" /> New Note
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[400px] custom-scrollbar">
            <div className="p-6 space-y-6">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <FileText className="w-12 h-12 text-primary/30 mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest text-foreground">
                    No records found
                  </p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="group relative pl-6 border-l-2 border-border hover:border-primary transition-all"
                  >
                    {/* Timeline Node */}
                    <div className="absolute top-0 -left-[7px] w-3 h-3 rounded-full bg-border group-hover:bg-primary transition-colors ring-4 ring-background" />

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-background shadow-sm">
                          <AvatarImage src={note.author?.profile?.avatar_url} />
                          <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                            {note.author?.profile?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-black text-foreground/80 uppercase tracking-wide">
                          {note.author?.profile?.full_name}
                        </span>
                        <span className="text-[11px] font-bold text-muted-foreground/50">
                          {formatDistanceToNow(new Date(note.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-help">
                            {note.visibility === "internal_only" ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase font-black">
                                <Lock className="w-2.5 h-2.5 mr-1" /> Private
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] uppercase font-black">
                                <Users className="w-2.5 h-2.5 mr-1" /> Shared
                              </Badge>
                            )}
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="glass text-[10px] font-bold uppercase tracking-widest"
                          >
                            {note.visibility === "internal_only"
                              ? "Staff-Only Protocol"
                              : "Department-Wide View"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="glass dark:bg-dark-surface-elevated p-4 rounded-xl rounded-tl-none border border-primary/5 shadow-sm group-hover:shadow-md transition-all">
                      <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                        {note.text}
                      </p>

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-primary/5">
                          {note.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] font-black uppercase py-0.5 border-primary/10 text-muted-foreground bg-background/50"
                            >
                              <Tag className="w-2.5 h-2.5 mr-1" /> {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
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