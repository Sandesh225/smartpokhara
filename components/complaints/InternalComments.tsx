"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { User, MessageSquare, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    user_profiles: {
      full_name: string;
    } | null;
  } | null;
}

interface InternalCommentsProps {
  complaintId: string;
  comments: Comment[];
}

export function InternalComments({ complaintId, comments: initialComments }: InternalCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('complaint_internal_comments')
        .insert({
          complaint_id: complaintId,
          user_id: user.id,
          comment: newComment.trim(),
        })
        .select(`
          *,
          user:users(id, email, user_profiles(full_name))
        `)
        .single();

      if (error) throw error;

      setComments([data as any, ...comments]);
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add an internal note..."
          className="w-full h-24 p-4 rounded-xl border-2 bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all text-sm resize-none"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">No internal comments yet</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-xl bg-muted/20 border transition-all hover:bg-muted/30">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {comment.user?.user_profiles?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">
                    {comment.user?.user_profiles?.full_name || comment.user?.email || "Unknown User"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {comment.comment}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
