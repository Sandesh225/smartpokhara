// components/complaints/InternalComments.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserAvatar } from '@/components/shared/UserAvatar';

interface InternalCommentsProps {
  complaintId: string;
  comments: any[];
}

export function InternalComments({ complaintId, comments }: InternalCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('complaint_internal_comments')
        .insert({
          complaint_id: complaintId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          comment: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      // Refresh the page to show new comment
      window.location.reload();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Add Internal Comment
          </label>
          <textarea
            id="comment"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a comment... Mark as work log if this represents work done."
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="work-log"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="work-log" className="text-sm text-gray-700">
              Mark as work log
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <UserAvatar user={comment.user} size="sm" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {comment.user?.user_profiles?.full_name || comment.user?.email}
                </span>
                {comment.is_work_log && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Work Log
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()} at{' '}
                  {new Date(comment.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                {comment.comment}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-8">No comments yet</p>
        )}
      </div>
    </div>
  );
}