"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  MessageSquare,
  User,
  Shield,
  Clock,
  Smile,
  Paperclip,
  X,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type { ComplaintComment } from "@/lib/supabase/queries/complaints";

interface CommentThreadProps {
  complaintId: string;
  comments: ComplaintComment[];
  isSubscribed?: boolean;
  onNewComment?: (comment: ComplaintComment) => void;
}

export function CommentThread({
  complaintId,
  comments,
  isSubscribed = false,
  onNewComment,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments.length]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await complaintsService.addComment(
        complaintId,
        newComment,
        false
      );

      setNewComment("");
      setShowSuccess(true);

      if (onNewComment) {
        const mockComment: ComplaintComment = {
          id: result.comment_id,
          complaint_id: complaintId,
          author_id: "current-user",
          author_role: "citizen",
          content: newComment,
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

      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err: any) {
      console.error("Error posting comment:", err);
      setError(err.message || "Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border relative">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Discussion
              </h3>
              <p className="text-sm text-gray-600">
                {comments.length} messages
              </p>
            </div>
          </div>
          {isSubscribed && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No messages yet
            </h4>
            <p className="text-gray-500 max-w-sm">
              Start the conversation by posting your first comment below
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
                className={`flex gap-3 ${isCitizen ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                    isCitizen
                      ? "bg-gradient-to-br from-blue-500 to-blue-600"
                      : "bg-gradient-to-br from-purple-500 to-purple-600"
                  }`}
                >
                  {comment.author?.profile_photo_url ? (
                    <img
                      src={comment.author.profile_photo_url}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : isCitizen ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 max-w-[70%] ${isCitizen ? "text-right" : ""}`}
                >
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl ${
                      isCitizen
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white text-gray-900 border shadow-sm rounded-bl-sm"
                    }`}
                  >
                    {/* Author Info */}
                    <div
                      className={`flex items-center gap-2 mb-1 ${isCitizen ? "justify-end" : ""}`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          isCitizen ? "text-blue-100" : "text-gray-900"
                        }`}
                      >
                        {comment.author?.full_name ||
                          (isCitizen ? "You" : "Staff")}
                      </span>
                      {isStaff && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                          STAFF
                        </span>
                      )}
                    </div>

                    {/* Message Content */}
                    <p
                      className={`text-sm leading-relaxed whitespace-pre-line ${
                        isCitizen ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {comment.content}
                    </p>

                    {/* Timestamp */}
                    <div
                      className={`flex items-center gap-1 mt-2 text-xs ${
                        isCitizen
                          ? "text-blue-100 justify-end"
                          : "text-gray-400"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Comment posted!</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 max-w-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send)"
              className="w-full px-4 py-3 pr-12 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={1}
              style={{
                minHeight: "48px",
                maxHeight: "120px",
              }}
              disabled={isSubmitting}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add emoji"
                disabled={isSubmitting}
              >
                <Smile className="w-5 h-5 text-gray-400" />
              </button>
              <button
                type="button"
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach file"
                disabled={isSubmitting}
              >
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className={`px-6 h-12 rounded-xl font-medium text-white transition-all flex items-center gap-2 ${
              !newComment.trim() || isSubmitting
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-xs text-gray-500">
            Press{" "}
            <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">
              Enter
            </kbd>{" "}
            to send,{" "}
            <kbd className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono">
              Shift+Enter
            </kbd>{" "}
            for new line
          </p>
          <p
            className={`text-xs font-mono ${newComment.length > 1800 ? "text-orange-500 font-semibold" : "text-gray-400"}`}
          >
            {newComment.length}/2000
          </p>
        </div>
      </div>
    </div>
  );
}