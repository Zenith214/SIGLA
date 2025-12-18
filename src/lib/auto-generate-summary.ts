/**
 * Utility to trigger auto-generation of executive summary
 * Call this when a survey reaches 100% completion
 */

export async function triggerAutoGenerateSummary(barangayId: number, cycleId: number) {
  try {
    console.log(`🤖 [TRIGGER] Auto-generating summary for Barangay ${barangayId}, Cycle ${cycleId}`);
    
    const response = await fetch('/api/ai/auto-generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barangayId, cycleId })
    });

    if (!response.ok) {
      console.error('Failed to trigger auto-generation');
      return false;
    }

    const result = await response.json();
    console.log(`✅ [TRIGGER] Auto-generation result:`, result.message);
    
    return result.success;
  } catch (error) {
    console.error('Error triggering auto-generation:', error);
    return false;
  }
}

/**
 * Check if summary should be auto-generated based on progress
 */
export function shouldAutoGenerateSummary(progress: number, previousProgress: number): boolean {
  // Generate when progress reaches 100% (crossing the threshold)
  return progress >= 100 && previousProgress < 100;
}
