import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';
import { getCachedOrCompute } from '@/lib/ml-cache';

const execAsync = promisify(exec);

interface Recommendation {
  service: string;
  action: string;
  impact: string;
  effort: string;
}

interface Recommendations {
  immediate: Recommendation[];
  short_term: Recommendation[];
  long_term: Recommendation[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!barangayId) {
      return NextResponse.json(
        { error: "barangayId parameter is required" },
        { status: 400 }
      );
    }

    const activeCycleId = await getActiveCycleId();

    // Use caching with 24-hour TTL
    const result = await getCachedOrCompute(
      'ml-insights',
      { barangayId: parseInt(barangayId), cycleId: activeCycleId },
      async () => {
        console.log(`🔄 [ML INSIGHTS] Computing insights for barangay ${barangayId}...`);
        
        let mlResults;
        let mlApiUrl = process.env.ML_API_URL;
        
        if (mlApiUrl) {
          // Ensure URL has protocol
          if (!mlApiUrl.startsWith('http://') && !mlApiUrl.startsWith('https://')) {
            mlApiUrl = `https://${mlApiUrl}`;
          }
          
          // Use HTTP API call to separate ML service
          console.log(`🌐 [ML INSIGHTS] Calling ML API at ${mlApiUrl}`);
          
          try {
            const response = await fetch(`${mlApiUrl}/api/analyze`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                barangay_id: parseInt(barangayId),
                cycle_id: activeCycleId
              })
            });

            if (!response.ok) {
              throw new Error(`ML API returned ${response.status}`);
            }

            mlResults = await response.json();
            console.log(`✅ [ML INSIGHTS] Received ML results from API`);
          } catch (fetchError: any) {
            console.error('❌ [ML INSIGHTS] Failed to call ML API:', fetchError.message);
            throw new Error(`Failed to connect to ML service: ${fetchError.message}`);
          }
        } else {
          // Fall back to local Python execution
          console.log(`🐍 [ML INSIGHTS] Using local Python execution`);
          
          const mlScriptPath = path.join(process.cwd(), 'ml', 'analyze_barangay.py');
          const venvPython = process.platform === 'win32' 
            ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
            : path.join(process.cwd(), '.venv', 'bin', 'python');
          const pythonCommand = `"${venvPython}" "${mlScriptPath}" --barangay_id ${barangayId}`;

          const { stdout, stderr } = await execAsync(pythonCommand);

          if (stderr) {
            console.error('ML Insights Error:', stderr);
          }

          try {
            mlResults = JSON.parse(stdout);
          } catch (parseError) {
            console.error('Failed to parse ML insights:', parseError);
            throw new Error("Failed to parse ML insights");
          }
        }

        // Get actual unique respondent count from database
        let actualRespondentCount = mlResults.total_responses || 0;
        
        if (activeCycleId) {
          try {
            const { count, error } = await supabaseAdmin
              .from('survey_response')
              .select('response_id', { count: 'exact', head: true })
              .eq('barangay_id', parseInt(barangayId))
              .eq('survey_cycle_id', activeCycleId)
              .in('status', ['completed', 'submitted']);
            
            if (!error && count !== null) {
              actualRespondentCount = count;
              console.log(`📊 [ML INSIGHTS] Corrected respondent count from ${mlResults.total_responses} to ${actualRespondentCount}`);
            }
          } catch (error) {
            console.error('Error fetching actual respondent count:', error);
          }
        }

        // Generate comprehensive insights with corrected count
        return generateComprehensiveInsights(mlResults, parseInt(barangayId), actualRespondentCount);
      },
      {
        ttl: 86400, // 24 hours
        staleWhileRevalidate: true,
        forceRefresh
      }
    );

    // Add cache metadata to response
    const response = {
      ...result.data,
      _cache: {
        cached: result.cached,
        stale: result.stale,
        computedAt: result.computedAt,
        expiresAt: result.expiresAt
      }
    };

    console.log(`✅ [ML INSIGHTS] Returned ${result.cached ? (result.stale ? 'stale cached' : 'fresh cached') : 'newly computed'} data for barangay ${barangayId}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error generating ML insights:", error);
    return NextResponse.json(
      { error: "Failed to generate ML insights" },
      { status: 500 }
    );
  }
}

function generateComprehensiveInsights(mlResults: any, barangayId: number, actualRespondentCount?: number) {
  // Calculate overall satisfaction from service scores
  const serviceScores = mlResults.service_scores || {};
  const satisfactionScores = Object.values(serviceScores).map((score: any) => score.satisfaction_score || 0);
  const overallSatisfaction = satisfactionScores.length > 0 
    ? Math.round(satisfactionScores.reduce((sum: number, score: number) => sum + score, 0) / satisfactionScores.length)
    : 0;
  // Use corrected respondent count if provided, otherwise fall back to ML results
  const totalResponses = actualRespondentCount !== undefined ? actualRespondentCount : (mlResults.total_responses || 0);
  const actionGrid = mlResults.action_grid || {};

  // Generate performance assessment
  const performanceLevel = overallSatisfaction >= 70 ? 'excellent' : 
                          overallSatisfaction >= 60 ? 'good' : 
                          overallSatisfaction >= 50 ? 'fair' : 'poor';

  // Identify priority areas
  const priorityAreas = Object.entries(actionGrid)
    .filter(([_, grid]: [string, any]) => grid.quadrant === 'FIX_NOW')
    .map(([service, _]) => service);

  const opportunityAreas = Object.entries(actionGrid)
    .filter(([_, grid]: [string, any]) => grid.quadrant === 'OPPORTUNITIES')
    .map(([service, _]) => service);

  const maintainAreas = Object.entries(actionGrid)
    .filter(([_, grid]: [string, any]) => grid.quadrant === 'MAINTAIN')
    .map(([service, _]) => service);

  // Generate key insights
  const keyInsights = [];

  if (overallSatisfaction < 60) {
    keyInsights.push({
      type: 'warning',
      title: 'Below Average Performance',
      message: `With ${overallSatisfaction}% overall satisfaction, this barangay requires immediate attention to improve service delivery.`,
      priority: 'high'
    });
  } else if (overallSatisfaction >= 70) {
    keyInsights.push({
      type: 'success',
      title: 'Strong Performance',
      message: `Excellent ${overallSatisfaction}% satisfaction rating indicates effective governance and service delivery.`,
      priority: 'low'
    });
  }

  if (priorityAreas.length > 0) {
    keyInsights.push({
      type: 'urgent',
      title: 'Critical Service Areas',
      message: `${priorityAreas.length} service area(s) require immediate intervention: ${priorityAreas.join(', ')}.`,
      priority: 'high'
    });
  }

  if (totalResponses < 30) {
    keyInsights.push({
      type: 'info',
      title: 'Limited Survey Data',
      message: `Only ${totalResponses} residents participated in the survey. Consider increasing sample size for more reliable insights.`,
      priority: 'medium'
    });
  }

  // Generate recommendations
  const recommendations = generateActionableRecommendations(serviceScores, actionGrid, performanceLevel);

  // Generate summary
  const summary = generateExecutiveSummary(overallSatisfaction, priorityAreas, opportunityAreas, maintainAreas, totalResponses);

  return {
    barangay_id: barangayId,
    overall_assessment: {
      satisfaction_score: overallSatisfaction,
      performance_level: performanceLevel,
      total_responses: totalResponses,
      data_quality: totalResponses >= 50 ? 'high' : totalResponses >= 30 ? 'medium' : 'low'
    },
    key_insights: keyInsights,
    priority_areas: {
      fix_now: priorityAreas,
      opportunities: opportunityAreas,
      maintain: maintainAreas
    },
    recommendations: recommendations,
    executive_summary: summary,
    ml_confidence: calculateMLConfidence(mlResults),
    timestamp: new Date().toISOString()
  };
}

function generateActionableRecommendations(serviceScores: any, actionGrid: any, performanceLevel: string): Recommendations {
  const recommendations: Recommendations = {
    immediate: [],
    short_term: [],
    long_term: []
  };

  // Immediate actions (0-1 month)
  Object.entries(actionGrid).forEach(([service, grid]: [string, any]) => {
    if (grid.quadrant === 'FIX_NOW') {
      recommendations.immediate.push({
        service: service,
        action: `Address critical issues in ${service.replace('_', ' ')} service delivery`,
        impact: 'high',
        effort: 'medium'
      });
    }
  });

  // Short-term actions (1-6 months)
  Object.entries(serviceScores).forEach(([service, scores]: [string, any]) => {
    if (scores.awareness_score < 60) {
      recommendations.short_term.push({
        service: service,
        action: `Launch awareness campaign for ${service.replace('_', ' ')} services`,
        impact: 'medium',
        effort: 'low'
      });
    }
    if (scores.availment_score < 40) {
      recommendations.short_term.push({
        service: service,
        action: `Improve accessibility of ${service.replace('_', ' ')} services`,
        impact: 'high',
        effort: 'medium'
      });
    }
  });

  // Long-term actions (6+ months)
  if (performanceLevel === 'poor' || performanceLevel === 'fair') {
    recommendations.long_term.push({
      service: 'overall',
      action: 'Implement comprehensive governance improvement program',
      impact: 'high',
      effort: 'high'
    });
  }

  return recommendations;
}

function generateExecutiveSummary(satisfaction: number, priorityAreas: string[], opportunityAreas: string[], maintainAreas: string[], totalResponses: number) {
  const performanceText = satisfaction >= 70 ? 'excellent performance' :
                         satisfaction >= 60 ? 'good performance' :
                         satisfaction >= 50 ? 'moderate performance' : 'below-average performance';

  let summary = `This barangay demonstrates ${performanceText} with an overall satisfaction rating of ${satisfaction}%. `;

  if (priorityAreas.length > 0) {
    summary += `Critical attention is needed in ${priorityAreas.length} service area(s): ${priorityAreas.join(', ')}. `;
  }

  if (opportunityAreas.length > 0) {
    summary += `There are ${opportunityAreas.length} opportunity area(s) for enhancement: ${opportunityAreas.join(', ')}. `;
  }

  if (maintainAreas.length > 0) {
    summary += `${maintainAreas.length} service area(s) are performing well and should be maintained: ${maintainAreas.join(', ')}. `;
  }

  summary += `Based on feedback from ${totalResponses} residents, `;

  if (priorityAreas.length > 0) {
    summary += 'immediate intervention is recommended to address critical service gaps.';
  } else if (opportunityAreas.length > 0) {
    summary += 'focus should be on leveraging opportunities for further improvement.';
  } else {
    summary += 'continue current practices while monitoring for potential improvements.';
  }

  return summary;
}

function calculateMLConfidence(mlResults: any): string {
  const totalResponses = mlResults.total_responses || 0;
  const servicesWithData = Object.keys(mlResults.service_scores || {}).length;
  
  if (totalResponses >= 50 && servicesWithData >= 5) {
    return 'high';
  } else if (totalResponses >= 30 && servicesWithData >= 3) {
    return 'medium';
  } else {
    return 'low';
  }
}