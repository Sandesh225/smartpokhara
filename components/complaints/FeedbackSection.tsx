// components/complaints/FeedbackSection.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FeedbackSectionProps {
  complaint: {
    id: string;
    citizen_satisfaction_rating: number | null;
    citizen_feedback: string | null;
    status: string;
  };
}

export function FeedbackSection({ complaint }: FeedbackSectionProps) {
  const [rating, setRating] = useState(complaint.citizen_satisfaction_rating || 0);
  const [feedback, setFeedback] = useState(complaint.citizen_feedback || '');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmitFeedback = async () => {
    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('complaints')
        .update({
          citizen_satisfaction_rating: rating,
          citizen_feedback: feedback,
          feedback_submitted_at: new Date().toISOString(),
        })
        .eq('id', complaint.id);

      if (error) throw error;

      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If feedback already submitted and we are viewing
  if (complaint.citizen_satisfaction_rating !== null) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Feedback</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Satisfaction Rating</label>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${star <= complaint.citizen_satisfaction_rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          {complaint.citizen_feedback && (
            <div>
              <label className="text-sm font-medium text-gray-500">Your Comments</label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {complaint.citizen_feedback}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If complaint is resolved/closed but no feedback yet
  if (complaint.status === 'resolved' || complaint.status === 'closed') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Provide Feedback</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How satisfied are you with the resolution?
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              id="feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience or suggestions..."
            />
          </div>

          <button
            type="button"
            onClick={handleSubmitFeedback}
            disabled={submitting || rating === 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}