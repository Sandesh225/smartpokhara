// components/citizen/complaints/FeedbackForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Textarea } from '@/ui/textarea';
import { Label } from '@/ui/label';
import { RadioGroup, RadioGroupItem } from '@/ui//radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert';
import { Separator } from '@/ui//separator';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import { complaintsService } from '@/lib/supabase/queries/complaints';

interface FeedbackFormProps {
  complaintId: string;
  complaintStatus: string;
  onSubmitSuccess?: () => void;
}

const feedbackSchema = z.object({
  rating: z.number().min(1, { message: 'Please select a rating' }).max(5),
  satisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied']),
  issue_fully_resolved: z.enum(['yes', 'no']),
  would_recommend: z.enum(['yes', 'no']),
  feedback_text: z.string().max(1000, { message: 'Feedback is too long (max 1000 characters)' }).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const satisfactionLabels = {
  very_satisfied: 'Very Satisfied',
  satisfied: 'Satisfied',
  neutral: 'Neutral',
  dissatisfied: 'Dissatisfied',
  very_dissatisfied: 'Very Dissatisfied',
};

const satisfactionIcons = {
  very_satisfied: Smile,
  satisfied: Smile,
  neutral: Meh,
  dissatisfied: Frown,
  very_dissatisfied: Frown,
};

export function FeedbackForm({ 
  complaintId, 
  complaintStatus,
  onSubmitSuccess 
}: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      satisfaction: 'neutral',
      issue_fully_resolved: 'yes',
      would_recommend: 'yes',
      feedback_text: '',
    },
  });

  // Watch form values
  const satisfaction = watch('satisfaction');
  const issueResolved = watch('issue_fully_resolved');
  const wouldRecommend = watch('would_recommend');
  const feedbackText = watch('feedback_text');

  // Check if feedback already submitted
  useEffect(() => {
    const checkFeedback = async () => {
      try {
        // In a real implementation, you would check if feedback already exists
        // For now, we'll assume it hasn't been submitted
      } catch (err) {
        console.error('Error checking feedback:', err);
      }
    };

    if (complaintStatus === 'resolved' || complaintStatus === 'closed') {
      checkFeedback();
    }
  }, [complaintId, complaintStatus]);

  // Show form only for resolved/closed complaints
  if (complaintStatus !== 'resolved' && complaintStatus !== 'closed') {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <CardDescription>
            Feedback is available after complaint resolution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Awaiting Resolution
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Feedback form will be available once your complaint is resolved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: FeedbackFormData) => {
    if (!complaintId) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert form data to match RPC function
      const feedbackData = {
        rating: data.rating,
        issue_resolved: data.issue_fully_resolved === 'yes',
        would_recommend: data.would_recommend === 'yes',
        feedback_text: data.feedback_text || undefined,
      };

      // Submit feedback via RPC
      await complaintsService.submitFeedback(complaintId, feedbackData);
      
      // Show success state
      setIsSubmitted(true);
      
      // Reset form
      reset();
      setRating(0);
      setHoverRating(0);
      
      // Trigger success callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    setValue('rating', value, { shouldValidate: true });
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Thank You for Your Feedback!</CardTitle>
          <CardDescription className="text-green-700">
            Your feedback helps us improve our services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-3">
              Feedback Submitted Successfully
            </h3>
            <p className="text-green-700 max-w-md mx-auto mb-6">
              Thank you for taking the time to share your experience. 
              Your feedback has been recorded and will be reviewed by our team.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Your complaint is now marked as closed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>
          Help us improve by rating your experience
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-base">
                Overall Rating
              </Label>
              <div className="flex flex-col items-center gap-4">
                {/* Star Rating */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        className="p-1 focus:outline-none"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <Star
                          className={`h-10 w-10 transition-colors ${
                            isFilled 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                
                <div className="text-center">
                  <div className="font-semibold text-slate-900">
                    {rating === 0 ? 'Select a rating' : `${rating} out of 5 stars`}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {rating === 5 && 'Excellent! We\'re thrilled to hear that.'}
                    {rating === 4 && 'Great! Thank you for your positive feedback.'}
                    {rating === 3 && 'Good. We appreciate your honest feedback.'}
                    {rating === 2 && 'Fair. We\'ll work to improve.'}
                    {rating === 1 && 'Poor. We\'re sorry to hear that.'}
                  </div>
                </div>
              </div>
              
              {errors.rating && (
                <div className="text-sm text-red-500 mt-2">
                  {errors.rating.message}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Satisfaction Level */}
          <div className="space-y-4">
            <Label className="text-base">
              How satisfied are you with the resolution?
            </Label>
            
            <RadioGroup
              value={satisfaction}
              onValueChange={(value) => setValue('satisfaction', value as any)}
              className="space-y-3"
            >
              {Object.entries(satisfactionLabels).map(([value, label]) => {
                const Icon = satisfactionIcons[value as keyof typeof satisfactionIcons];
                const isSelected = satisfaction === value;
                
                return (
                  <div
                    key={value}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setValue('satisfaction', value as any)}
                  >
                    <RadioGroupItem value={value} id={`satisfaction-${value}`} />
                    <Label
                      htmlFor={`satisfaction-${value}`}
                      className="flex-1 flex items-center gap-3 cursor-pointer"
                    >
                      <Icon className={`h-5 w-5 ${
                        value === 'very_satisfied' || value === 'satisfied' 
                          ? 'text-green-500' 
                          : value === 'very_dissatisfied' || value === 'dissatisfied'
                            ? 'text-red-500'
                            : 'text-amber-500'
                      }`} />
                      <span className="font-medium">{label}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <Separator />

          {/* Quick Questions */}
          <div className="space-y-6">
            {/* Issue Resolution */}
            <div className="space-y-3">
              <Label className="text-base">
                Was your issue fully resolved?
              </Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    issueResolved === 'yes' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setValue('issue_fully_resolved', 'yes')}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center">
                      {issueResolved === 'yes' && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        Yes, fully resolved
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        The issue has been completely addressed
                      </p>
                    </div>
                  </div>
                </div>
                
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    issueResolved === 'no' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setValue('issue_fully_resolved', 'no')}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center">
                      {issueResolved === 'no' && (
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                        No, not fully resolved
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        The issue needs more attention
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Would Recommend */}
            <div className="space-y-3">
              <Label className="text-base">
                Would you recommend our services to others?
              </Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    wouldRecommend === 'yes' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setValue('would_recommend', 'yes')}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center">
                      {wouldRecommend === 'yes' && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        Yes, definitely
                      </div>
                    </div>
                  </div>
                </div>
                
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    wouldRecommend === 'no' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setValue('would_recommend', 'no')}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center">
                      {wouldRecommend === 'no' && (
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                        Probably not
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Feedback */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback_text" className="text-base">
                Additional Comments (Optional)
              </Label>
              <Textarea
                id="feedback_text"
                placeholder="Share any additional feedback, suggestions, or details about your experience..."
                className="min-h-[120px] resize-none"
                {...register('feedback_text')}
              />
              <div className="flex justify-between text-sm text-slate-500">
                <span>Maximum 1000 characters</span>
                <span>{feedbackText?.length || 0}/1000</span>
              </div>
              {errors.feedback_text && (
                <div className="text-sm text-red-500">
                  {errors.feedback_text.message}
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Privacy Note */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-slate-500 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-700">
                  Privacy Note
                </h4>
                <p className="text-sm text-slate-600">
                  Your feedback is anonymous and will be used to improve our services. 
                  It may be shared with the department that handled your complaint.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Submitting Feedback...
              </>
            ) : (
              <>
                <MessageSquare className="h-5 w-5" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}