/**
 * Gemini API Settings Management
 * Allows admins to update API key and monitor token usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Get current settings and token usage
export async function GET(request: NextRequest) {
  try {
    // Get active settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('gemini_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError;
    }

    // Get token usage statistics
    const { data: stats, error: statsError } = await supabaseAdmin
      .rpc('get_gemini_token_stats');

    if (statsError) {
      console.error('Error fetching token stats:', statsError);
    }

    // Get recent usage history
    const { data: recentUsage, error: usageError } = await supabaseAdmin
      .from('gemini_token_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (usageError) {
      console.error('Error fetching recent usage:', usageError);
    }

    // Get usage by endpoint
    const { data: usageByEndpoint, error: endpointError } = await supabaseAdmin
      .from('gemini_token_usage')
      .select('endpoint, tokens_used')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const endpointStats = usageByEndpoint?.reduce((acc: any, item: any) => {
      if (!acc[item.endpoint]) {
        acc[item.endpoint] = { count: 0, tokens: 0 };
      }
      acc[item.endpoint].count++;
      acc[item.endpoint].tokens += item.tokens_used;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        settings: settings ? {
          ...settings,
          api_key: settings.api_key ? '••••••••' + settings.api_key.slice(-4) : null // Mask API key
        } : null,
        stats: stats?.[0] || null,
        recentUsage: recentUsage || [],
        usageByEndpoint: endpointStats || {}
      }
    });

  } catch (error) {
    console.error('Error fetching Gemini settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Gemini settings' },
      { status: 500 }
    );
  }
}

// Update API key and settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, tokensLimit, action } = body;

    // Handle different actions
    if (action === 'reset_tokens') {
      // Reset token counter
      const { error } = await supabaseAdmin.rpc('reset_gemini_token_counter');
      
      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Token counter reset successfully'
      });
    }

    if (action === 'test_key') {
      // Test the API key
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // Simple test prompt
        const result = await model.generateContent('Say "API key is valid" in exactly 4 words.');
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
          success: true,
          message: 'API key is valid',
          testResponse: text
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'API key is invalid or has issues',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
      }
    }

    // Update settings
    if (apiKey || tokensLimit) {
      // Check if settings exist
      const { data: existing } = await supabaseAdmin
        .from('gemini_settings')
        .select('id')
        .eq('is_active', true)
        .single();

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (apiKey) {
        updateData.api_key = apiKey;
      }

      if (tokensLimit) {
        updateData.tokens_limit = parseInt(tokensLimit);
      }

      if (existing) {
        // Update existing
        const { error } = await supabaseAdmin
          .from('gemini_settings')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabaseAdmin
          .from('gemini_settings')
          .insert({
            ...updateData,
            api_key: apiKey,
            tokens_limit: tokensLimit || 1000000,
            is_active: true
          });

        if (error) throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'No valid action or data provided' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating Gemini settings:', error);
    return NextResponse.json(
      { error: 'Failed to update Gemini settings' },
      { status: 500 }
    );
  }
}

// Delete/deactivate settings
export async function DELETE(request: NextRequest) {
  try {
    const { error } = await supabaseAdmin
      .from('gemini_settings')
      .update({ is_active: false })
      .eq('is_active', true);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'API key deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating Gemini settings:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate settings' },
      { status: 500 }
    );
  }
}
