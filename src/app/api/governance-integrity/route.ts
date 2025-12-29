import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, isAdmin } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');
    const cycleId = searchParams.get('cycleId');

    if (!barangayId || !cycleId) {
      return NextResponse.json(
        { success: false, message: 'Missing barangayId or cycleId parameter' },
        { status: 400 }
      );
    }

    // Fetch survey responses for this barangay and cycle
    // Filter for Financial Administration section which contains corruption questions
    const responses = await prisma.surveyResponse.findMany({
      where: {
        barangay_id: parseInt(barangayId),
        survey_cycle_id: parseInt(cycleId),
        progress: 100 // Only completed surveys
      },
      select: {
        response_id: true,
        sections: {
          where: {
            section_key: 'financial' // Financial Administration section
          },
          select: {
            section_id: true,
            section_key: true,
            data: true
          }
        }
      }
    });

    if (responses.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No completed survey data available for this barangay and cycle'
      });
    }

    // Extract corruption-related data from Financial section
    let experiencedCount = 0;
    let reportedCount = 0;
    let satisfiedCount = 0;
    const reasonsNotReporting: Record<string, number> = {};
    const corruptionTypes: Record<string, number> = {};
    const preventionSuggestions: string[] = [];

    // Helper functions for checking yes/no values
    const isYes = (value: any) => {
      if (!value) return false;
      const str = String(value).toLowerCase();
      return str.includes('yes') || str.includes('oo') || value === true;
    };
    
    const isNo = (value: any) => {
      if (!value) return false;
      const str = String(value).toLowerCase();
      return str.includes('no') || str.includes('hindi') || value === false;
    };

    responses.forEach(response => {
      const financialSection = response.sections.find((s: any) => s.section_key === 'financial');
      if (!financialSection || !financialSection.data) return;

      const data = financialSection.data as any;
      
      // Log the actual data structure for debugging
      console.log('[GOVERNANCE] Financial section data keys:', Object.keys(data));

      // Check if resident experienced corruption
      // Try multiple possible field name variations
      const experiencedCorruption = 
        data.awarenessCorruption || 
        data.corruptionAwareness || 
        data.experiencedCorruption ||
        data.corruption_awareness ||
        data.corruption_experience;
        
      if (isYes(experiencedCorruption)) {
        experiencedCount++;

        // Check if they reported it
        const reported = 
          data.reportedCorruption || 
          data.corruptionReported ||
          data.corruption_reported;
          
        if (isYes(reported)) {
          reportedCount++;

          // Check satisfaction with response
          const satisfaction = 
            data.satisfactionCorruption ||
            data.satisfactionCorruptionResponse || 
            data.corruptionResponseSatisfaction ||
            data.corruption_response_satisfaction;
            
          // Handle satisfaction: "satisfied", "Satisfied", "Yes", etc.
          const isSatisfied = (value: any) => {
            if (!value) return false;
            const str = String(value).toLowerCase();
            return str.includes('satisfied') || str.includes('yes') || str.includes('oo');
          };
            
          if (isSatisfied(satisfaction)) {
            satisfiedCount++;
          }
        } else if (isNo(reported)) {
          // Collect reasons for not reporting
          const reason = 
            data.reasonNotReporting || 
            data.whyNotReported ||
            data.reason_not_reporting ||
            data.notReportingReason;
            
          if (reason && typeof reason === 'string' && reason.trim() !== '' && 
              reason !== 'conditional_skip' && reason !== '*conditional_skip*') {
            reasonsNotReporting[reason] = (reasonsNotReporting[reason] || 0) + 1;
          }
        }

        // Collect types of corruption witnessed
        const corruptionType = 
          data.corruptionType || 
          data.typeOfCorruption ||
          data.corruption_type ||
          data.corruptionTypeWitnessed;
          
        if (corruptionType && typeof corruptionType === 'string' && corruptionType.trim() !== '' &&
            corruptionType !== 'conditional_skip' && corruptionType !== '*conditional_skip*') {
          corruptionTypes[corruptionType] = (corruptionTypes[corruptionType] || 0) + 1;
        }
      }

      // Collect prevention suggestions (regardless of whether they experienced corruption)
      const suggestion = 
        data.suggestionsCorruption ||
        data.corruptionPreventionSuggestion || 
        data.preventionSuggestion ||
        data.corruption_prevention ||
        data.preventCorruptionSuggestion;
        
      if (suggestion && typeof suggestion === 'string' && suggestion.trim() !== '' && 
          suggestion !== 'conditional_skip' && suggestion !== '*conditional_skip*') {
        preventionSuggestions.push(suggestion);
      }
    });

    const totalRespondents = responses.length;
    const corruptionExperienceRate = (experiencedCount / totalRespondents) * 100;

    // Log summary for debugging
    console.log('[GOVERNANCE] Summary:', {
      totalRespondents,
      experiencedCount,
      reportedCount,
      satisfiedCount,
      corruptionExperienceRate: `${corruptionExperienceRate.toFixed(1)}%`
    });

    // If no corruption data found at all, return a helpful message
    if (experiencedCount === 0 && Object.keys(reasonsNotReporting).length === 0 && 
        Object.keys(corruptionTypes).length === 0 && preventionSuggestions.length === 0) {
      console.log('[GOVERNANCE] No corruption data found in survey responses');
      return NextResponse.json({
        success: false,
        message: 'No corruption data available. The Financial Administration section of the survey may not include corruption-related questions, or no respondents have provided corruption data yet.'
      });
    }

    // Calculate funnel percentages
    const reportingFunnel = {
      experienced: (experiencedCount / totalRespondents) * 100,
      reported: experiencedCount > 0 ? (reportedCount / totalRespondents) * 100 : 0,
      satisfied: experiencedCount > 0 ? (satisfiedCount / totalRespondents) * 100 : 0,
      experiencedCount,
      reportedCount,
      satisfiedCount
    };

    // Sort and format top reasons for not reporting
    const topReasonsNotReporting = Object.entries(reasonsNotReporting)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: (count / (experiencedCount - reportedCount)) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sort and format corruption types
    const topCorruptionTypes = Object.entries(corruptionTypes)
      .map(([type, count]) => ({
        type,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Sample prevention suggestions (limit to 10)
    const sampledSuggestions = preventionSuggestions
      .filter((s, i, arr) => arr.indexOf(s) === i) // Remove duplicates
      .slice(0, 10);

    const governanceData = {
      corruptionExperienceRate,
      reportingFunnel,
      topReasonsNotReporting,
      residentVoice: {
        corruptionTypes: topCorruptionTypes,
        preventionSuggestions: sampledSuggestions
      },
      totalRespondents,
      detailedResponses: [] as any[] // Will be populated below
    };

    // Add detailed anonymized responses for admin review
    // Only include responses where corruption was experienced
    const detailedResponses: any[] = [];
    let responseIndex = 1;

    responses.forEach(response => {
      const financialSection = response.sections.find((s: any) => s.section_key === 'financial');
      if (!financialSection || !financialSection.data) return;

      const data = financialSection.data as any;
      
      const experiencedCorruption = data.awarenessCorruption;
      
      if (isYes(experiencedCorruption)) {
        const reported = data.reportedCorruption;
        const satisfaction = data.satisfactionCorruption;
        const corruptionType = data.corruptionType || data.typeOfCorruption;
        const reasonNotReporting = data.reasonNotReporting || data.whyNotReported;
        const suggestion = data.suggestionsCorruption || data.corruptionPreventionSuggestion;
        const corruptionDetails = data.corruptionDetails || data.corruptionDescription;
        
        detailedResponses.push({
          responseNumber: responseIndex++,
          experienced: experiencedCorruption,
          reported: reported || 'Not answered',
          satisfaction: satisfaction || 'Not answered',
          corruptionType: corruptionType || 'Not specified',
          reasonNotReporting: reasonNotReporting || null,
          suggestion: suggestion || null,
          details: corruptionDetails || null
        });
      }
    });

    governanceData.detailedResponses = detailedResponses;

    return NextResponse.json({
      success: true,
      data: governanceData
    });

  } catch (error) {
    console.error('Error fetching governance integrity data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch governance integrity data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
