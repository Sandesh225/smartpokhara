"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { TaskComment } from "@/types/admin-tasks";

interface TaskCommentsProps {
  comments: TaskComment[];
  onAddComment: (text: string) => Promise<void>;
}

export function TaskComments({ comments, onAddComment }: TaskCommentsProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if(!text.trim()) return;
    setSubmitting(true);
    await onAddComment(text);
    setText("");
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
       <div className="bg-gray-50 p-4 rounded-lg border h-[300px] overflow-y-auto space-y-4">
          {comments.map((c) => (
             <div key={c.id} className={`flex gap-3 ${c.is_private ? 'opacity-75' : ''}`}>
                <Avatar className="h-8 w-8">
                   <AvatarImage src={c.author.avatar_url} />
                   <AvatarFallback>{c.author.full_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-white p-3 rounded-lg border shadow-sm">
                   <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm">{c.author.full_name}</span>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(c.created_at))} ago</span>
                   </div>
                   <p className="text-sm text-gray-700">{c.content}</p>
                </div>
             </div>
          ))}
          {comments.length === 0 && <p className="text-center text-gray-400 text-sm py-10">No comments yet.</p>}
       </div>

       <div className="flex gap-2">
          <Textarea 
             placeholder="Add a comment..." 
             value={text}
             onChange={(e) => setText(e.target.value)}
             className="min-h-[80px]"
          />
          <Button onClick={handleSubmit} disabled={submitting || !text} className="h-auto">Send</Button>
       </div>
    </div>
  );
}