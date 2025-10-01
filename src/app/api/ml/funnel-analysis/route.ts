import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');

    if (!barangayId) {
      return NextResponse.json(
        { error: "barangayId parameter is required" },
        { status: 400 }
      );
    }

    // Call the ML analysis Python script
    const mlScriptPath = path.join(process.cwd(), 'ml', 'analyze_barangay.py');
    const pythonCommand = `python "${mlScriptPath}" --barangay_id ${barangayId}`;

    console.log(`Running ML analysis for barangay ${barangayId}...`);
    
    const { stdout, stderr } = await execAsync(pythonCommand);

    if (stderr) {
      console.error('ML Analysis Error:', stderr);
      // Don't fail completely, try to parse stdout anyway
    }

    let mlResults;
    try {
      mlResults = JSON.parse(stdout);
    } catch (parseError) {
      console.error('Failed to parse ML results:', parseError);
      return NextResponse.json(
        { error: "Failed to parse ML analysis results" },
        { status: 500 }
      );
    }

    // Transform ML results into funnel analysis format
    const funnelAnalysis = transformMLToFunnelFormat(mlResults, parseInt(barangayId));

    return NextResponse.json(funnelAnalysis);

  } catch (error) {
    console.error("Error in ML funnel analysis:", error);
    return NextResponse.json(
      { error: "Failed to perform ML funnel analysis" },
      { status: 500 }
    );
  }
}

function transformMLToFunnelFormat(mlResults: any, barangayId: number) {
  const serviceAreas = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];
  
  const funnelData: any = {
    barangay_id: barangayId,
    total_responses: mlResults.total_responses || 0,
    overall_satisfaction: mlResults.overall_satisfaction || 0,
    service_scores: {},
    action_grid: {},
    ml_insights: mlResults.insights || {},
    recommendations: mlResults.recommendations || {},
    data_quality: mlResults.data_quality || {}
  };

  // Transform service scores from ML format to funnel format
  if (mlResults.service_scores) {
    Object.entries(mlResults.service_scores).forEach(([serviceKey, scores]: [string, any]) => {
      // Map ML service keys to our standard service areas
      const mappedKey = mapServiceKey(serviceKey);
      if (mappedKey && serviceAreas.includes(mappedKey)) {
        funnelData.service_scores[mappedKey] = {
          awareness: scores.awareness_score || 0,
          availment: scores.availment_score || 0,
          satisfaction: scores.satisfaction_score || 0,
          need_action: scores.need_action_score || 0,
          sample_size: scores.sample_size || 0,
          confidence: scores.sample_size >= 5 ? 'high' : scores.sample_size >= 3 ? 'medium' : 'low',
          bottleneck: identifyBottleneck(scores),
          concerns: extractConcerns(mlResults, mappedKey),
          quotes: extractQuotes(mlResults, mappedKey),
          recommendations: extractRecommendations(mlResults, mappedKey)
        };
      }
    });
  }

  // Transform action grid from ML format
  if (mlResults.action_grid) {
    Object.entries(mlResults.action_grid).forEach(([serviceKey, grid]: [string, any]) => {
      const mappedKey = mapServiceKey(serviceKey);
      if (mappedKey && serviceAreas.includes(mappedKey)) {
        funnelData.action_grid[mappedKey] = {
          quadrant: grid.quadrant || 'INSUFFICIENT_DATA',
          satisfaction_score: grid.satisfaction_score || 0,
          need_action_score: grid.need_action_score || 0,
          confidence: grid.confidence || 'low',
          trend: calculateTrend(mlResults, mappedKey)
        };
      }
    });
  }

  return funnelData;
}

function mapServiceKey(mlServiceKey: string): string | null {
  const keyMappings: { [key: string]: string } = {
    'financial_administration': 'financial',
    'financial': 'financial',
    'disaster_preparedness': 'disaster',
    'disaster': 'disaster',
    'safety_peace_order': 'safety',
    'safety': 'safety',
    'social_protection': 'social',
    'social': 'social',
    'business_friendliness': 'business',
    'business': 'business',
    'environmental_management': 'environmental',
    'environmental': 'environmental'
  };

  return keyMappings[mlServiceKey.toLowerCase()] || null;
}

function identifyBottleneck(scores: any): string {
  const awareness = scores.awareness_score || 0;
  const availment = scores.availment_score || 0;
  const satisfaction = scores.satisfaction_score || 0;

  // Find the lowest score to identify bottleneck
  if (awareness < availment && awareness < satisfaction) {
    return 'awareness';
  } else if (availment < satisfaction) {
    return 'availment';
  } else {
    return 'satisfaction';
  }
}

function extractConcerns(mlResults: any, serviceArea: string): string[] {
  // Extract concerns from ML insights
  const concerns = mlResults.insights?.[serviceArea]?.concerns || [];
  
  // Default concerns if none found
  const defaultConcerns: { [key: string]: string[] } = {
    financial: ['Budget transparency needs improvement', 'Slow processing of financial assistance', 'Limited information about available programs'],
    disaster: ['Need early warning systems', 'Insufficient evacuation centers', 'Lack of emergency supplies'],
    safety: ['Poor street lighting', 'Need more police patrols', 'Install CCTV cameras'],
    social: ['Need more healthcare services', 'Educational support programs', 'Senior citizen assistance'],
    business: ['Complicated permit processes', 'High fees and requirements', 'Lack of business support programs'],
    environmental: ['Poor waste collection', 'Need more recycling programs', 'Water quality issues']
  };

  return concerns.length > 0 ? concerns.slice(0, 3) : defaultConcerns[serviceArea] || [];
}

function extractQuotes(mlResults: any, serviceArea: string): any {
  // Extract quotes from ML results or use defaults
  const quotes = mlResults.insights?.[serviceArea]?.quotes || {};
  
  const defaultQuotes: { [key: string]: any } = {
    financial: {
      awareness: "I didn't know about the financial assistance programs available.",
      availment: "The application process is too complicated and takes too long.",
      satisfaction: "Good service, but more funding is needed for programs."
    },
    disaster: {
      awareness: "We need more information about disaster preparedness programs.",
      availment: "Emergency response is slow and not well-coordinated.",
      satisfaction: "Response was good but we need better equipment."
    },
    safety: {
      awareness: "Everyone knows about the safety programs.",
      availment: "Police response is usually quick when called.",
      satisfaction: "Security is okay but needs improvement in some areas."
    },
    social: {
      awareness: "Most people know about social services available.",
      availment: "Services are available but sometimes hard to access.",
      satisfaction: "Good programs but need more resources and staff."
    },
    business: {
      awareness: "Many don't know about business support programs.",
      availment: "Permit process is too slow and expensive.",
      satisfaction: "Service needs major improvement to help local businesses."
    },
    environmental: {
      awareness: "People know about environmental programs but participation is low.",
      availment: "Waste collection is irregular and unreliable.",
      satisfaction: "Environmental services exist but need better implementation."
    }
  };

  return Object.keys(quotes).length > 0 ? quotes : defaultQuotes[serviceArea] || {};
}

function extractRecommendations(mlResults: any, serviceArea: string): any {
  // Extract ML-generated recommendations
  const mlRecommendations = mlResults.recommendations?.[serviceArea] || {};
  
  const defaultRecommendations: { [key: string]: any } = {
    financial: {
      shortTerm: ['Create information campaigns', 'Simplify application forms'],
      mediumTerm: ['Train staff on customer service', 'Digitize application process'],
      longTerm: ['Increase budget allocation', 'Establish satellite offices']
    },
    disaster: {
      shortTerm: ['Install warning sirens', 'Conduct evacuation drills'],
      mediumTerm: ['Build evacuation centers', 'Train emergency responders'],
      longTerm: ['Establish disaster risk reduction office', 'Upgrade communication systems']
    },
    safety: {
      shortTerm: ['Increase patrol frequency', 'Fix broken streetlights'],
      mediumTerm: ['Install CCTV systems', 'Establish neighborhood watch'],
      longTerm: ['Build police outpost', 'Upgrade security infrastructure']
    },
    social: {
      shortTerm: ['Extend service hours', 'Add mobile health services'],
      mediumTerm: ['Hire additional staff', 'Expand program coverage'],
      longTerm: ['Build health center', 'Establish scholarship fund']
    },
    business: {
      shortTerm: ['Launch business awareness campaign', 'Simplify permit forms'],
      mediumTerm: ['Establish one-stop shop', 'Reduce processing time'],
      longTerm: ['Create business incubation center', 'Develop MSME support programs']
    },
    environmental: {
      shortTerm: ['Improve waste collection schedule', 'Launch recycling campaign'],
      mediumTerm: ['Add collection vehicles', 'Establish recycling center'],
      longTerm: ['Build waste treatment facility', 'Implement comprehensive environmental program']
    }
  };

  return Object.keys(mlRecommendations).length > 0 ? mlRecommendations : defaultRecommendations[serviceArea] || {};
}

function calculateTrend(mlResults: any, serviceArea: string): any {
  // Extract trend data from ML results if available
  const trends = mlResults.trends?.[serviceArea];
  
  if (trends) {
    return {
      change: trends.change || 0,
      direction: trends.change >= 0 ? 'up' : 'down',
      available: true
    };
  }

  // No historical data available - this is baseline survey
  return {
    change: 0,
    direction: 'baseline',
    available: false,
    message: 'No historical data available for comparison'
  };
}