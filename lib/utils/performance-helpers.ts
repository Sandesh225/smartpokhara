/**
 * Calculates the average resolution time in hours.
 */
export function calculateResolutionTime(
  completedItems: { submitted_at: string; resolved_at: string }[]
): number {
  if (!completedItems || completedItems.length === 0) return 0;

  const totalMs = completedItems.reduce((acc, curr) => {
    const start = new Date(curr.submitted_at).getTime();
    const end = new Date(curr.resolved_at).getTime();
    return acc + Math.max(0, end - start);
  }, 0);

  // Convert ms to hours and round to 1 decimal place
  return (
    Math.round((totalMs / completedItems.length / (1000 * 60 * 60)) * 10) / 10
  );
}

/**
 * Calculates percentage of items resolved within SLA.
 */
export function calculateSLACompliance(total: number, onTime: number): number {
  if (total === 0) return 100;
  return Math.round((onTime / total) * 100);
}