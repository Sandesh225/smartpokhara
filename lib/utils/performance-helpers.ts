import type { StaffProfile } from "@/lib/types/supervisor.types";

/**
 * Calculates the average resolution time in hours given a list of completed items.
 */
export function calculateResolutionTime(
  completedItems: { submitted_at: string; resolved_at: string }[]
): number {
  if (!completedItems || completedItems.length === 0) return 0;
  
  const totalMs = completedItems.reduce((acc, curr) => {
    const start = new Date(curr.submitted_at).getTime();
    const end = new Date(curr.resolved_at).getTime();
    // Prevent negative times if data is messy
    const duration = Math.max(0, end - start);
    return acc + duration;
  }, 0);

  return Math.round((totalMs / completedItems.length) / (1000 * 60 * 60)); // Result in Hours
}

/**
 * Calculates percentage of items resolved within their SLA deadline.
 */
export function calculateSLACompliance(
  totalResolved: number,
  onTimeCount: number
): number {
  if (totalResolved === 0) return 100; // Default to 100 if no closed tickets to penalize
  return Math.round((onTimeCount / totalResolved) * 100);
}

/**
 * Calculates average star rating (1-5).
 */
export function calculateSatisfactionScore(
  ratings: number[]
): number {
  const validRatings = ratings.filter(r => r > 0);
  if (!validRatings.length) return 0;
  const sum = validRatings.reduce((a, b) => a + b, 0);
  return Number((sum / validRatings.length).toFixed(1));
}

/**
 * Returns a qualitative insight based on staff score vs team average.
 */
export function getPerformanceInsights(staff: any, avgTeamScore: number) {
  // Normalize staff score to 0-100 based on 5-star rating system
  const score = (staff.performance_rating || 0) * 20; 
  
  if (score >= 90) return { label: "Top Performer", color: "text-green-600", bg: "bg-green-100" };
  if (score > avgTeamScore + 10) return { label: "Above Average", color: "text-blue-600", bg: "bg-blue-100" };
  if (score < avgTeamScore - 15) return { label: "Needs Support", color: "text-red-600", bg: "bg-red-100" };
  return { label: "Consistent", color: "text-gray-600", bg: "bg-gray-100" };
}