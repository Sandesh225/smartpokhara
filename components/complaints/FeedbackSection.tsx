"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showSuccessToast, showErrorToast } from "@/lib/shared/toast-service";
import type { Complaint } from "@/lib/types/complaints";
import { Star, MessageSquare, Send, CheckCircle } from "lucide-react";

interface FeedbackSectionProps {
  complaint: Complaint;
}

export function FeedbackSection({ complaint }: FeedbackSectionProps) {
  const [rating, setRating] = useState(
    complaint.citizen_satisfaction_rating || 0
  );
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState(complaint.citizen_feedback || "");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmitFeedback = async () => {
    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("complaints")
        .update({
          citizen_satisfaction_rating: rating,
          citizen_feedback: feedback,
          feedback_submitted_at: new Date().toISOString(),
        })
        .eq("id", complaint.id);

      if (error) throw error;

      showSuccessToast("Thank you for your feedback!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showErrorToast("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Already submitted
  if (complaint.citizen_satisfaction_rating !== null) {
    return (
      <div className="glass rounded-2xl shadow-xl p-6 border border-white/30 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Feedback</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-200">
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              Satisfaction Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-7 h-7 ${
                    star <= complaint.citizen_satisfaction_rating!
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {complaint.citizen_feedback && (
            <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-purple-50 border border-blue-200">
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Your Comments
              </label>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {complaint.citizen_feedback}
              </p>
            </div>
          )}

          <div className="p-3 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">
              Thank you for your feedback! We appreciate your input.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Feedback form
  if (complaint.status === "resolved" || complaint.status === "closed") {
    return (
      <div className="glass rounded-2xl shadow-xl p-6 border border-white/30 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Provide Feedback</h2>
        </div>

        <div className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              How satisfied are you with the resolution?
            </label>
            <div className="flex items-center gap-2 p-4 bg-linear-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-all duration-200 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-slate-600">
                {getRatingLabel(rating)}
              </p>
            )}
          </div>

          {/* Feedback Text */}
          <div>
            <label
              htmlFor="feedback"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Additional Comments (Optional)
            </label>
            <textarea
              id="feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              placeholder="Share your experience, suggestions, or any additional comments..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmitFeedback}
            disabled={submitting || rating === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>

          {rating === 0 && (
            <p className="text-xs text-center text-slate-500">
              Please select a rating before submitting
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function getRatingLabel(rating: number): string {
  const labels = {
    1: "😞 Very Dissatisfied",
    2: "😕 Dissatisfied",
    3: "😐 Neutral",
    4: "😊 Satisfied",
    5: "😄 Very Satisfied",
  };
  return labels[rating as keyof typeof labels] || "";
}
