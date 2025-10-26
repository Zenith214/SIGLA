/**
 * Gemini API Configuration
 * Manages API key retrieval and token usage tracking
 */

import { supabaseAdmin } from '@/lib/supabase';

let cachedApiKey: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get Gemini API key from database or environment variable
 */
export async function getGeminiApiKey(): Promise<string> {
  // Check cache first
  if (cachedApiKey && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedApiKey;
  }

  try {
    // Try to get from database first
    const { data: settings, error } = await supabaseAdmin
      .from('gemini_settings')
      .select('api_key')
      .eq('is_active', true)
      .single();

    if (!error && settings?.api_key) {
      cachedApiKey = settings.api_key;
      cacheTimestamp = Date.now();
      return settings.api_key;
    }
  } catch (error) {
    console.warn('Failed to fetch API key from database, falling back to env variable');
  }

  // Fallback to environment variable
  const envKey = process.env.GEMINI_API_KEY;
  if (!envKey) {
    throw new Error('Gemini API key not found in database or environment variables');
  }

  return envKey;
}

/**
 * Clear cached API key (call this after updating settings)
 */
export function clearApiKeyCache() {
  cachedApiKey = null;
  cacheTimestamp = 0;
}

/**
 * Log token usage to database
 */
export async function logTokenUsage(
  endpoint: string,
  tokensUsed: number,
  barangayId?: number,
  cycleId?: number,
  requestType: string = 'generation'
): Promise<void> {
  try {
    await supabaseAdmin.rpc('log_gemini_token_usage', {
      p_endpoint: endpoint,
      p_tokens_used: tokensUsed,
      p_barangay_id: barangayId || null,
      p_cycle_id: cycleId || null,
      p_request_type: requestType
    });
  } catch (error) {
    console.error('Failed to log token usage:', error);
    // Don't throw - logging failure shouldn't break the main functionality
  }
}

/**
 * Estimate token count for text
 * Rough estimation: ~4 characters per token
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if token limit is reached
 */
export async function checkTokenLimit(): Promise<{
  withinLimit: boolean;
  tokensUsed: number;
  tokensLimit: number;
  tokensRemaining: number;
}> {
  try {
    const { data: stats } = await supabaseAdmin.rpc('get_gemini_token_stats');
    
    if (!stats || stats.length === 0) {
      return {
        withinLimit: true,
        tokensUsed: 0,
        tokensLimit: 1000000,
        tokensRemaining: 1000000
      };
    }

    const stat = stats[0];
    return {
      withinLimit: stat.tokens_remaining > 0,
      tokensUsed: stat.total_tokens_used,
      tokensLimit: stat.tokens_limit,
      tokensRemaining: stat.tokens_remaining
    };
  } catch (error) {
    console.error('Failed to check token limit:', error);
    // Default to allowing requests if check fails
    return {
      withinLimit: true,
      tokensUsed: 0,
      tokensLimit: 1000000,
      tokensRemaining: 1000000
    };
  }
}
