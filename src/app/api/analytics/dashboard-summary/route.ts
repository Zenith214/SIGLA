import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getActiveCycleId } from '@/utils/surveyCycleHelpers'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Helper function to calculate satisfaction from survey responses
async function calculateBarangaySatisfaction(client: any, barangayId: number, cycleId: number): Promise<number> {
  // Get the overall satisfaction from the "overall" section
  const overallQuery = `
    SELECT 
      ss.data->>'overallSatisfaction' as overall_satisfaction
    FROM survey_response sr
    LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
    WHERE sr.barangay_id = $1 
      AND sr.survey_cycle_id = $2 
      AND sr.status IN ('completed', 'submitted')
      AND ss.section_key = 'overall'
      AND ss.data->>'overallSatisfaction' IS NOT NULL
  `
  
  const result = await client.query(overallQuery, [barangayId, cycleId])
  
  if (result.rows.length === 0) {
    return 0
  }
  
  // Calculate average satisfaction from responses
  // Format is like "5 - Very Satisfied / Lubos na Nasiyahan"
  let totalSatisfaction = 0
  let count = 0
  
  result.rows.forEach((row: any) => {
    const satisfactionStr = row.overall_satisfaction
    if (satisfactionStr) {
      const satisfactionValue = String(satisfactionStr).toLowerCase();
      
      // Check if it's the new binary format
      if (satisfactionValue.includes('yes') || satisfactionValue.includes('oo')) {
        // Binary "Yes" = satisfied = 100%
        totalSatisfaction += 100
        count++
      } else if (satisfactionValue.includes('no') || satisfactionValue.includes('hindi')) {
        // Binary "No" = not satisfied = 0%
        totalSatisfaction += 0
        count++
      } else {
        // Old format: Extract the numeric value (first character)
        const numericValue = parseInt(satisfactionValue.charAt(0))
        if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
          // Convert 1-5 scale to percentage (1=20%, 2=40%, 3=60%, 4=80%, 5=100%)
          totalSatisfaction += (numericValue / 5) * 100
          count++
        }
      }
    }
  })
  
  return count > 0 ? Math.round(totalSatisfaction / count) : 0
}

export async function GET(request: NextRequest) {
  let client: any
  try {
    client = await pool.connect()
    const activeCycleId = await getActiveCycleId()

    console.log('[Dashboard Summary] Active Cycle ID:', activeCycleId)

    if (!activeCycleId) {
      return NextResponse.json({ error: 'No active cycle' }, { status: 400 })
    }

    // Get list of barangays with completed surveys
    // First check what statuses exist
    const statusCheckQuery = `
      SELECT DISTINCT status, COUNT(*) as count
      FROM survey_response
      WHERE survey_cycle_id = $1
      GROUP BY status
    `
    const statusCheck = await client.query(statusCheckQuery, [activeCycleId])
    console.log('[Dashboard Summary] Available statuses:', statusCheck.rows)
    
    const barangaysQuery = `
      SELECT DISTINCT 
        sr.barangay_id,
        b.barangay_name,
        b.households
      FROM survey_response sr
      LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
      WHERE sr.survey_cycle_id = $1 
        AND sr.status IN ('completed', 'submitted')
        AND sr.progress = 100
      ORDER BY b.barangay_name
    `
    
    const barangaysResult = await client.query(barangaysQuery, [activeCycleId])
    const barangays = barangaysResult.rows
    
    console.log('[Dashboard Summary] Found barangays with completed surveys:', barangays.length)
    
    // Calculate satisfaction for each barangay
    const barangayScores: Array<{barangayId: number, barangayName: string, satisfaction: number}> = []
    let totalSatisfaction = 0
    let totalNeedForAction = 0
    
    for (const barangay of barangays) {
      const satisfaction = await calculateBarangaySatisfaction(client, barangay.barangay_id, activeCycleId)
      barangayScores.push({
        barangayId: barangay.barangay_id,
        barangayName: barangay.barangay_name,
        satisfaction
      })
      totalSatisfaction += satisfaction
      // Need for action is inverse of satisfaction
      totalNeedForAction += (100 - satisfaction)
    }
    
    // Sort by satisfaction
    barangayScores.sort((a, b) => b.satisfaction - a.satisfaction)
    
    // Get total responses and target
    // Target: 150 responses per survey target (barangay with survey target set)
    const statsQuery = `
      SELECT 
        COUNT(*) as total_responses,
        (SELECT COUNT(*) FROM survey_target WHERE survey_cycle_id = $1) as survey_targets_count,
        (SELECT COUNT(*) FROM barangay) as total_barangays
      FROM survey_response
      WHERE survey_cycle_id = $1 AND status IN ('completed', 'submitted')
    `
    
    const statsResult = await client.query(statsQuery, [activeCycleId])
    
    // Target: number of survey targets × 150 responses per target
    const surveyTargetsCount = parseInt(statsResult.rows[0]?.survey_targets_count || 0)
    const targetPerBarangay = 150
    const targetResponses = surveyTargetsCount * targetPerBarangay
    
    console.log('[Dashboard Summary] Survey targets:', surveyTargetsCount, 'Target per barangay:', targetPerBarangay, 'Total target:', targetResponses)
    
    // Count barangays that have finished surveys (100% complete)
    const finishedBarangaysQuery = `
      SELECT COUNT(DISTINCT barangay_id) as finished_count
      FROM survey_target
      WHERE survey_cycle_id = $1 AND percentage = 100
    `
    const finishedResult = await client.query(finishedBarangaysQuery, [activeCycleId])
    const finishedBarangays = parseInt(finishedResult.rows[0]?.finished_count || 0)
    
    console.log('[Dashboard Summary] Finished barangays:', finishedBarangays, 'out of', surveyTargetsCount)
    
    const kpis = {
      overallSatisfaction: barangayScores.length > 0 ? Math.round(totalSatisfaction / barangayScores.length) : 0,
      overallNeedForAction: barangayScores.length > 0 ? Math.round(totalNeedForAction / barangayScores.length) : 0,
      totalResponses: parseInt(statsResult.rows[0]?.total_responses || 0),
      targetResponses: targetResponses,
      barangaysCovered: finishedBarangays,
      totalBarangays: surveyTargetsCount
    }

    // Get top 5 and bottom 5
    const top5 = barangayScores.slice(0, 5).map(b => ({
      ...b,
      trend: 'stable' as 'up' | 'down' | 'stable'
    }))
    
    const bottom5 = barangayScores.slice(-5).reverse().map(b => ({
      ...b,
      trend: 'stable' as 'up' | 'down' | 'stable'
    }))

    // Get trend data across all cycles
    const cyclesQuery = `
      SELECT cycle_id, name, year
      FROM survey_cycle
      ORDER BY year ASC, cycle_id ASC
    `
    
    const cyclesResult = await client.query(cyclesQuery)
    const trendData = []
    
    for (const cycle of cyclesResult.rows) {
      // Get barangays with completed surveys for this cycle
      const cycleBarangaysQuery = `
        SELECT DISTINCT sr.barangay_id
        FROM survey_response sr
        WHERE sr.survey_cycle_id = $1 
          AND sr.status IN ('completed', 'submitted')
      `
      
      const cycleBarangaysResult = await client.query(cycleBarangaysQuery, [cycle.cycle_id])
      
      if (cycleBarangaysResult.rows.length > 0) {
        let cycleTotalSatisfaction = 0
        let cycleCount = 0
        
        for (const barangay of cycleBarangaysResult.rows) {
          const satisfaction = await calculateBarangaySatisfaction(client, barangay.barangay_id, cycle.cycle_id)
          if (satisfaction > 0) {
            cycleTotalSatisfaction += satisfaction
            cycleCount++
          }
        }
        
        if (cycleCount > 0) {
          trendData.push({
            cycleName: cycle.name,
            cycleYear: cycle.year,
            avgSatisfaction: Math.round(cycleTotalSatisfaction / cycleCount)
          })
        }
      }
    }

    // Service area performance - calculate actual satisfaction from each service section
    const serviceAreas = [
      { key: 'financial', name: 'Financial Administration' },
      { key: 'disaster', name: 'Disaster Preparedness' },
      { key: 'safety', name: 'Safety & Peace Order' },
      { key: 'social', name: 'Social Protection' },
      { key: 'business', name: 'Business Friendliness' },
      { key: 'environmental', name: 'Environmental Management' }
    ]

    const serviceAreaPerformance = await Promise.all(
      serviceAreas.map(async (area) => {
        // Get all satisfaction scores for this service area
        const satisfactionQuery = `
          SELECT ss.data
          FROM survey_response sr
          LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
          WHERE sr.survey_cycle_id = $1
            AND sr.status IN ('completed', 'submitted')
            AND ss.section_key = $2
            AND ss.data IS NOT NULL
        `
        
        const result = await client.query(satisfactionQuery, [activeCycleId, area.key])
        
        let totalSatisfaction = 0
        let satisfactionCount = 0
        
        result.rows.forEach((row: any) => {
          const sectionData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
          
          // Extract all satisfaction scores from this section
          Object.keys(sectionData).forEach((key) => {
            if (key.toLowerCase().includes('satisfaction')) {
              const value = sectionData[key]
              // Handle both numeric strings and "N - Description" format
              const numericValue = typeof value === 'string' 
                ? parseInt(value.charAt(0)) 
                : parseInt(value)
              
              if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
                totalSatisfaction += (numericValue / 5) * 100
                satisfactionCount++
              }
            }
          })
        })
        
        const avgSatisfaction = satisfactionCount > 0 
          ? Math.round(totalSatisfaction / satisfactionCount) 
          : 0
        
        return {
          serviceArea: area.name,
          avgSatisfaction
        }
      })
    )

    return NextResponse.json({
      kpis,
      leaderboard: { top5, bottom5 },
      trendData,
      serviceAreaPerformance
    })

  } catch (error) {
    console.error('[Dashboard Summary] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (client) client.release()
  }
}
