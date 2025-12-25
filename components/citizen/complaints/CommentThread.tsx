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
    <Card className="border-2 border-[rgb(var(--neutral-stone-200))] stone-card">
      <CardHeader className="card-padding border-b border-[rgb(var(--neutral-stone-200))]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[rgb(var(--text-ink))] font-bold text-lg">
              Comments
            </CardTitle>
            <CardDescription className="text-[rgb(var(--neutral-stone-500))] mt-1">
              Public conversation about this complaint
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="gap-2 border-[rgb(var(--neutral-stone-300))] px-3 py-1.5 rounded-full"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[rgb(var(--primary-brand))]" />
              <span className="font-mono text-[rgb(var(--text-ink))] font-semibold">
                {comments.length}
              </span>
            </Badge>

            {isSubscribed && (
              <Badge
                variant="outline"
                className="animate-pulse gap-2 text-[rgb(var(--success-green))] border-[rgb(var(--success-green))] bg-green-50 px-3 py-1.5 rounded-full"
              >
                <div className="h-2 w-2 rounded-full bg-[rgb(var(--success-green))]" />
                <span className="font-semibold text-xs">Live</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="card-padding space-y-6">
        <div
          ref={containerRef}
          className="space-y-6 max-h-[500px] overflow-y-auto pr-2 pb-4 scrollbar-hide"
        >
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-[rgb(var(--neutral-stone-100))] flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-[rgb(var(--neutral-stone-400))]" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--text-ink))] mb-2">
                Start the conversation
              </h3>
              <p className="text-[rgb(var(--neutral-stone-500))] max-w-md mx-auto mb-6 leading-relaxed">
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
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm mt-1 elevation-1">
                      {comment.author?.profile_photo_url ? (
                        <AvatarImage
                          src={
                            comment.author.profile_photo_url ||
                            "/placeholder.svg"
                          }
                        />
                      ) : (
                        <AvatarFallback className="bg-[rgb(var(--primary-brand-light))] text-white text-xs font-semibold">
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
                          ? "bg-[rgb(var(--primary-brand))] text-white rounded-br-none shadow-sm elevation-2"
                          : "bg-[rgb(var(--neutral-stone-100))] text-[rgb(var(--text-ink))] rounded-bl-none border-2 border-[rgb(var(--neutral-stone-200))]"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between mb-1.5 ${isCitizen ? "text-white/80" : "text-[rgb(var(--neutral-stone-500))]"}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs">
                            {comment.author?.full_name ||
                              (isCitizen ? "You" : "Municipal Staff")}
                          </span>
                          {isStaff && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-[10px] bg-[rgb(var(--accent-nature-light))] text-[rgb(var(--text-ink))] border-0 font-semibold"
                            >
                              Staff
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(comment.created_at)}</span>
                        </div>
                      </div>

                      <div
                        className={`whitespace-pre-line text-sm leading-relaxed ${isCitizen ? "text-white" : "text-[rgb(var(--text-ink))]"}`}
                      >
                        {comment.content}
                      </div>
                    </div>

                    {isStaff && (
                      <div className="mt-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-[rgb(var(--neutral-stone-500))] hover:text-[rgb(var(--primary-brand))] hover:bg-[rgb(var(--neutral-stone-50))]"
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
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm mt-1 elevation-1">
                      <AvatarFallback className="bg-[rgb(var(--accent-nature))] text-white text-xs font-semibold">
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
          <div className="flex items-center justify-between bg-[rgb(var(--accent-nature))]/10 p-3 px-4 rounded-xl border border-[rgb(var(--accent-nature))]/20 text-sm">
            <div className="flex items-center gap-2 text-[rgb(var(--accent-nature-dark))]">
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold text-xs">
                Replying to comment...
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReplyingTo(null)}
              className="h-6 w-6 text-[rgb(var(--neutral-stone-400))] hover:text-[rgb(var(--accent-nature))] hover:bg-[rgb(var(--accent-nature))]/10"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {error && (
          <Alert
            variant="destructive"
            className="animate-in slide-in-from-top-2 py-3 border-[rgb(var(--error-red))]"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert
            variant="default"
            className="bg-green-50 border-[rgb(var(--success-green))]/30 text-[rgb(var(--success-green))] py-3 animate-in slide-in-from-top-2"
          >
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-xs font-medium">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t border-[rgb(var(--neutral-stone-200))]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex gap-3 items-end"
          >
            <div className="flex-1 space-y-2">
              <Textarea
                id="comment-textarea"
                placeholder="Type your comment..."
                className={`min-h-[44px] max-h-[120px] resize-none py-3 text-sm border-2 rounded-xl ${
                  errors.content
                    ? "border-[rgb(var(--error-red))] focus-visible:ring-[rgb(var(--error-red))]/20"
                    : "border-[rgb(var(--neutral-stone-200))] focus-visible:ring-[rgb(var(--primary-brand))]/20"
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
              <div className="flex justify-between items-center text-xs text-[rgb(var(--neutral-stone-400))] px-1">
                <span>Press Enter to send</span>
                <span
                  className={`font-mono ${characterCount > 1800 ? "text-[rgb(var(--warning-amber))] font-semibold" : ""}`}
                >
                  {characterCount}/2000
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || characterCount === 0}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full bg-[rgb(var(--primary-brand))] hover:bg-[rgb(var(--primary-brand-dark))] shadow-md elevation-2 mb-6"
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
