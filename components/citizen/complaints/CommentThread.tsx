// components/citizen/complaints/CommentThread.tsx
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
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
import { Separator } from "@/components/ui/separator";
import {
  Send,
  User,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Paperclip,
  X,
  Smile,
  ThumbsUp,
} from 'lucide-react';
import { complaintsService } from '@/lib/supabase/queries/complaints';
import type { ComplaintComment } from '@/lib/supabase/queries/complaints';

interface CommentThreadProps {
  complaintId: string;
  comments: ComplaintComment[];
  isSubscribed?: boolean;
  onNewComment?: (comment: ComplaintComment) => void;
}

const commentSchema = z.object({
  content: z.string()
    .min(1, { message: 'Comment cannot be empty' })
    .max(2000, { message: 'Comment is too long (max 2000 characters)' }),
});

type CommentFormData = z.infer<typeof commentSchema>;

export function CommentThread({ 
  complaintId, 
  comments, 
  isSubscribed = false,
  onNewComment 
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
      content: '',
    },
  });

  // Watch content for character count
  const content = watch('content');
  useEffect(() => {
    setCharacterCount(content.length);
  }, [content]);

  // Auto-scroll to bottom on new comments
  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSubmit = async (data: CommentFormData) => {
    if (!complaintId) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Submit comment via RPC
      const result = await complaintsService.addComment(complaintId, data.content, false);
      
      // Clear form
      reset();
      setReplyingTo(null);
      
      // Show success message
      setSuccess('Comment posted successfully');
      
      // Trigger callback if provided
      if (onNewComment) {
        // Create a mock comment object for immediate UI update
        // In real implementation, you would wait for the subscription to get the actual comment
        const mockComment: ComplaintComment = {
          id: result.comment_id,
          complaint_id: complaintId,
          author_id: 'current-user',
          author_role: 'citizen',
          content: data.content,
          is_internal: false,
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: {
            id: 'current-user',
            email: 'user@example.com',
            full_name: 'You',
            profile_photo_url: null,
          },
        };
        onNewComment(mockComment);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setError(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separate comments by author type
  const citizenComments = comments.filter(c => c.author_role === 'citizen');
  const staffComments = comments.filter(c => c.author_role === 'staff');

  const formatTime = (date: string) => {
    const commentDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(commentDate, 'MMM dd, hh:mm a');
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
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </Badge>
            
            {isSubscribed && (
              <Badge variant="outline" className="animate-pulse gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Comments Container */}
        <div 
          ref={containerRef}
          className="space-y-6 max-h-[500px] overflow-y-auto pr-2 pb-4"
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
                Be the first to comment on this complaint. Ask questions or provide additional details.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isCitizen = comment.author_role === 'citizen';
              const isStaff = comment.author_role === 'staff';
              
              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 ${isCitizen ? 'justify-end' : ''}`}
                >
                  {/* Staff/Citizen indicator */}
                  {isStaff && (
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                      {comment.author?.profile_photo_url ? (
                        <AvatarImage src={comment.author.profile_photo_url} />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                          {comment.author?.full_name?.split(' ').map(n => n[0]).join('') || 'MS'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}
                  
                  {/* Comment Bubble */}
                  <div className={`flex-1 ${isCitizen ? 'max-w-[85%]' : 'max-w-[85%]'}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      isCitizen 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : isStaff 
                          ? 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                          : 'bg-slate-100'
                    }`}>
                      {/* Author info */}
                      <div className={`flex items-center justify-between mb-2 ${isCitizen ? 'text-blue-100' : 'text-slate-600'}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {comment.author?.full_name || 
                              (isCitizen ? 'You' : 'Municipal Staff')}
                          </span>
                          {isStaff && (
                            <Badge variant="outline" className="h-5 text-xs">
                              Staff
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(comment.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Comment content */}
                      <div className={`whitespace-pre-line ${isCitizen ? 'text-blue-50' : 'text-slate-700'}`}>
                        {comment.content}
                      </div>
                      
                      {/* Updated indicator */}
                      {comment.updated_at !== comment.created_at && (
                        <div className={`mt-2 text-xs ${isCitizen ? 'text-blue-200' : 'text-slate-500'}`}>
                          <span>Edited • {format(new Date(comment.updated_at), 'MMM dd, hh:mm a')}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Reply button (for citizen replies to staff) */}
                    {isStaff && (
                      <div className="mt-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-slate-500 hover:text-slate-700"
                          onClick={() => {
                            setReplyingTo(comment.id);
                            // Focus the textarea
                            setTimeout(() => {
                              document.getElementById('comment-textarea')?.focus();
                            }, 100);
                          }}
                        >
                          Reply
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Citizen avatar on right side */}
                  {isCitizen && (
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Replying indicator */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-700">
                Replying to staff comment
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="h-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {/* Error/Success alerts */}
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="bg-green-50 border-green-200 animate-in slide-in-from-top">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        
        {/* Comment Form */}
        <Separator />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            <Textarea
              id="comment-textarea"
              placeholder="Type your comment here... (Questions, updates, or additional details)"
              className={`min-h-[100px] resize-none ${
                errors.content ? 'border-red-500' : ''
              }`}
              {...register('content')}
              disabled={isSubmitting}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500">
                  <span className={characterCount > 1800 ? 'text-amber-600' : ''}>
                    {characterCount}
                  </span>
                  /2000 characters
                </div>
                
                {errors.content && (
                  <div className="text-sm text-red-500">
                    {errors.content.message}
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting || characterCount === 0}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Comment guidelines */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-slate-500 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-700">
                  Comment Guidelines
                </h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Be respectful and professional</li>
                  <li>• Provide clear and relevant information</li>
                  <li>• Staff will respond during business hours</li>
                  <li>• Avoid sharing personal contact information</li>
                  <li>• All comments are public and visible to assigned staff</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}