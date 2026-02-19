// ═══════════════════════════════════════════════════════════
// TASK COMMENTS COMPONENT
// ═══════════════════════════════════════════════════════════

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { TaskComment } from "@/features/tasks";
import { Send } from "lucide-react";

interface TaskCommentsProps {
  comments: TaskComment[];
  onAddComment: (text: string) => Promise<void>;
}

export function TaskComments({ comments, onAddComment }: TaskCommentsProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    await onAddComment(text);
    setText("");
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* COMMENTS LIST */}
      <div className="bg-muted p-3 md:p-4 rounded-lg border border-border h-[250px] md:h-[300px] overflow-y-auto custom-scrollbar space-y-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className={`flex gap-2 md:gap-3 ${c.is_private ? "opacity-75" : ""}`}
          >
            <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
              <AvatarImage src={c.author?.avatar_url} />
              <AvatarFallback className="text-xs">
                {c.author?.full_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-card p-2 md:p-3 rounded-lg border border-border shadow-sm min-w-0">
              <div className="flex justify-between items-center mb-1 gap-2">
                <span className="font-bold text-xs md:text-sm truncate">
                  {c.author?.full_name || "Unknown"}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(c.created_at))} ago
                </span>
              </div>
              <p className="text-xs md:text-sm text-foreground break-words">
                {c.content}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-muted-foreground text-xs md:text-sm py-8 md:py-10">
            No comments yet. Start the discussion!
          </p>
        )}
      </div>

      {/* ADD COMMENT FORM */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[70px] md:min-h-[80px] flex-1"
        />
        <Button
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
          size="icon"
          className="h-[70px] w-[70px] md:h-[80px] md:w-[80px] flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
