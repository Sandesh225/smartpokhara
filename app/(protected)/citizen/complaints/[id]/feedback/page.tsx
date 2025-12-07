// app/(protected)/citizen/complaints/[id]/feedback/page.tsx - COMPLETE FEEDBACK PAGE
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const complaintId = params.id as string;
  
  const [complaint, setComplaint] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  async function fetchComplaint() {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      // Fetch complaint
      const { data: complaintData, error: complaintError } = await supabase
        .from("complaints")
        .select(`
          *,
          category:complaint_categories(name),
          subcategory:complaint_subcategories(name),
          ward:wards(ward_number, name),
          department:departments(name)
        `)
        .eq("id", complaintId)
        .single();

      if (complaintError) throw complaintError;
      
      // Check if user owns the complaint
      if (complaintData.citizen_id !== userData.user.id) {
        router.push("/citizen/complaints");
        return;
      }

      // Check if complaint is resolved
      if (!["resolved", "closed"].includes(complaintData.status)) {
        toast.error("Feedback can only be submitted for resolved complaints");
        router.push(`/citizen/complaints/${complaintId}`);
        return;
      }

      // Check if feedback already submitted
      if (complaintData.citizen_satisfaction_rating) {
        setAlreadySubmitted(true);
      }

      setComplaint(complaintData);

    } catch (error) {
      console.error("Error fetching complaint:", error);
      toast.error("Failed to load complaint details");
      router.push("/citizen/complaints");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          citizen_satisfaction_rating: rating,
          citizen_feedback: feedback.trim() || null,
          feedback_submitted_at: new Date().toISOString(),
          status: "closed", // Auto-close after feedback
        })
        .eq("id", complaintId);

      if (error) throw error;

      // Also record in feedback table
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase
          .from("complaint_citizen_feedback")
          .insert({
            complaint_id: complaintId,
            user_id: userData.user.id,
            rating,
            feedback_text: feedback.trim() || null,
            submitted_at: new Date().toISOString(),
          });
      }

      toast.success("Thank you for your feedback!");
      
      // Redirect after delay
      setTimeout(() => {
        router.push(`/citizen/complaints/${complaintId}`);
      }, 2000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  const ratingLabels = [
    "Very Dissatisfied",
    "Dissatisfied",
    "Neutral",
    "Satisfied",
    "Very Satisfied"
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  if (alreadySubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href={`/citizen/complaints/${complaintId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Complaint
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Already Submitted</CardTitle>
            <CardDescription>
              You have already provided feedback for this complaint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-green-50 border border-green-200 p-6">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Thank you for your feedback!</h3>
                  <p className="text-sm">Your rating has been recorded.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Your Feedback</h3>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= complaint.citizen_satisfaction_rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {complaint.citizen_satisfaction_rating}/5 - {
                    ratingLabels[complaint.citizen_satisfaction_rating - 1]
                  }
                </span>
              </div>

              {complaint.citizen_feedback && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">{complaint.citizen_feedback}</p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Submitted on {new Date(complaint.feedback_submitted_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={`/citizen/complaints/${complaintId}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Complaint
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>
            Help us improve our services by sharing your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Complaint Summary */}
          <div className="space-y-3">
            <h3 className="font-medium">Complaint Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tracking Code</p>
                <p className="font-medium">{complaint.tracking_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{complaint.category?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium">
                  {new Date(complaint.submitted_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="font-medium">
                  {new Date(complaint.resolved_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                How would you rate your experience? <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Select a rating from 1 (very dissatisfied) to 5 (very satisfied)
              </p>
              
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-12 w-12 ${
                        star <= (hoverRating || rating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              <p className="mt-2 text-sm font-medium">
                {rating > 0 && ratingLabels[rating - 1]}
              </p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                Additional Feedback (Optional)
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Share more details about your experience. What went well? What could be improved?
              </p>
              
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience..."
                className="min-h-[120px]"
              />
              
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <AlertCircle className="h-4 w-4" />
                <span>Your feedback helps us improve our services</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Tips for helpful feedback:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Be specific about what worked well or what could be improved</li>
              <li>• Mention staff by name if they were particularly helpful</li>
              <li>• Share suggestions for future improvements</li>
              <li>• Focus on constructive feedback that helps us serve you better</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/citizen/complaints/${complaintId}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}