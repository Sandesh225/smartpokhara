"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type { ComplaintComment } from "@/lib/supabase/queries/complaints";

interface CommentThreadProps {
  complaintId: string;
  comments: ComplaintComment[];
  isSubscribed?: boolean;
  onNewComment?: (comment: ComplaintComment) => void;
}

const commentSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Comment cannot be empty" })
    .max(2000, { message: "Comment is too long (max 2000 characters)" }),
});

type CommentFormData = z.infer<typeof commentSchema>;

export function CommentThread({
  complaintId,
  comments,
  isSubscribed = false,
  onNewComment,
}: CommentThreadProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const content = watch("content");
  useEffect(() => {
    setCharacterCount(content?.length || 0);
  }, [content]);

  useEffect(() => {
    scrollToBottom();
  }, [comments.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onSubmit = async (data: CommentFormData) => {
    if (!complaintId) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await complaintsService.addComment(
        complaintId,
        data.content,
        false
      );

      reset();
      setReplyingTo(null);
      setSuccess("Comment posted successfully");

      if (onNewComment) {
        // Use the ID returned from the server to prevent duplicates
        // when the realtime subscription also picks it up.
        const mockComment: ComplaintComment = {
          id: result.comment_id,
          complaint_id: complaintId,
          author_id: "current-user",
          author_role: "citizen",
          content: data.content,
          is_internal: false,
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: {
            id: "current-user",
            email: "user@example.com",
            full_name: "You",
            profile_photo_url: null,
          },
        };
        onNewComment(mockComment);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error posting comment:", err);
      setError(err.message || "Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (date: string) => {
    const commentDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - commentDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(commentDate, "MMM dd, hh:mm a");
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Comments</CardTitle>
            <CardDescription>
              Public conversation about this complaint
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <MessageSquare className="h-3 w-3" />
              {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </Badge>

            {isSubscribed && (
              <Badge
                variant="outline"
                className="animate-pulse gap-1 text-green-600 border-green-200 bg-green-50"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div
          ref={containerRef}
          className="space-y-6 max-h-[500px] overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200"
        >
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Start the conversation
              </h3>
              <p className="text-slate-600 max-w-md mx-auto mb-6">
                Be the first to comment on this complaint. Ask questions or
                provide additional details.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isCitizen = comment.author_role === "citizen";
              const isStaff =
                comment.author_role === "staff" ||
                comment.author_role === "admin";

              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 ${isCitizen ? "justify-end" : ""}`}
                >
                  {isStaff && (
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm mt-1">
                      {comment.author?.profile_photo_url ? (
                        <AvatarImage src={comment.author.profile_photo_url} />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                          {comment.author?.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "ST"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}

                  <div
                    className={`flex-1 ${isCitizen ? "max-w-[85%]" : "max-w-[85%]"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isCitizen
                          ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                          : "bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between mb-1 ${isCitizen ? "text-blue-100" : "text-slate-600"}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs">
                            {comment.author?.full_name ||
                              (isCitizen ? "You" : "Municipal Staff")}
                          </span>
                          {isStaff && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 border-0"
                            >
                              Staff
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(comment.created_at)}</span>
                        </div>
                      </div>

                      <div
                        className={`whitespace-pre-line text-sm ${isCitizen ? "text-white" : "text-slate-700"}`}
                      >
                        {comment.content}
                      </div>
                    </div>

                    {isStaff && (
                      <div className="mt-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs text-slate-500 hover:text-slate-700"
                          onClick={() => {
                            setReplyingTo(comment.id);
                            setTimeout(() => {
                              document
                                .getElementById("comment-textarea")
                                ?.focus();
                            }, 100);
                          }}
                        >
                          Reply
                        </Button>
                      </div>
                    )}
                  </div>

                  {isCitizen && (
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm mt-1">
                      <AvatarFallback className="bg-indigo-100 text-indigo-800 text-xs">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {replyingTo && (
          <div className="flex items-center justify-between bg-blue-50 p-2 px-3 rounded-lg border border-blue-100 text-sm mb-2">
            <div className="flex items-center gap-2 text-blue-700">
              <MessageSquare className="h-4 w-4" />
              <span>Replying to comment...</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReplyingTo(null)}
              className="h-6 w-6 text-blue-400 hover:text-blue-700 hover:bg-blue-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {error && (
          <Alert
            variant="destructive"
            className="animate-in slide-in-from-top-2 py-2"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert
            variant="default"
            className="bg-green-50 border-green-200 text-green-800 py-2 animate-in slide-in-from-top-2"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-xs font-medium">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-2 border-t border-slate-100">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex gap-3 items-end"
          >
            <div className="flex-1 space-y-2">
              <Textarea
                id="comment-textarea"
                placeholder="Type your comment..."
                className={`min-h-[40px] max-h-[120px] resize-none py-3 text-sm ${
                  errors.content
                    ? "border-red-300 focus-visible:ring-red-200"
                    : ""
                }`}
                {...register("content")}
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                  }
                }}
              />
              <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                <span>Press Enter to send</span>
                <span className={characterCount > 1800 ? "text-amber-600" : ""}>
                  {characterCount}/2000
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || characterCount === 0}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 shadow-sm mb-6"
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 ml-0.5" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
