"use client";

import { useState } from "react";
import { Lock, Plus, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AddNoteModal } from "@/components/supervisor/modals/AddNoteModal";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  visibility: string;
  created_at: string;
  author: {
    profile: {
      full_name: string;
      avatar_url?: string;
    }
  }
}

interface InternalNotesProps {
  complaintId: string;
  initialNotes: Note[];
}

export function InternalNotes({ complaintId, initialNotes }: InternalNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const handleAddNote = async (text: string, tags: string[], visibility: string) => {
    try {
      await supervisorComplaintsQueries.addInternalNote(supabase, complaintId, text, tags, visibility);
      toast.success("Note added");
      // Optimistic update
      const newNote = {
        id: Date.now().toString(),
        text,
        visibility,
        created_at: new Date().toISOString(),
        author: { profile: { full_name: "You" } }
      };
      setNotes([newNote as any, ...notes]);
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">Internal Notes</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add Note
        </button>
      </div>
      
      <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">No internal notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{note.author?.profile?.full_name || "Supervisor"}</span>
                  <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                </div>
                {note.visibility === 'internal_only' ? (
                   <Lock className="h-3 w-3 text-gray-400" title="Private" />
                ) : (
                   <Users className="h-3 w-3 text-gray-400" title="Shared" />
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
            </div>
          ))
        )}
      </div>

      <AddNoteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddNote}
      />
    </div>
  );
}