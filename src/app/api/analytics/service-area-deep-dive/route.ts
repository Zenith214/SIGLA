import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getActiveCycleId } from '@/utils/surveyCycleHelpers'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Helper to map age to age group
function getAgeGroup(age: number): string {
  if (age >= 18 && age <= 24) return '18-24'
  if (age >= 25 && age <= 34) return '25-34'
  if (age >= 35 && age <= 44) return '35-44'
  if (age >= 45 && age <= 54) return '45-54'
  if (age >= 55 && age <= 64) return '55-64'
  if (age >= 65) return '65+'
  return 'Unknown'
}

import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  let client
  try {
    client = await pool.connect()
    const { searchParams } = new URL(request.url)
    
    const serviceArea = searchParams.get('serviceArea') || 'financial'
    const cycleId = searchParams.get('cycleId') || await getActiveCycleId()
    const ageGroup = searchParams.get('ageGroup')
    const gender = searchParams.get('gender')
    const householdIncome = searchParams.get('householdIncome')
    const educationalAttainment = searchParams.get('educationalAttainment')

    if (!cycleId) {
      return NextResponse.json({ error: 'No active cycle' }, { status: 400 })
    }

    // Build demographic filters
    const demographicFilters: string[] = []
    const queryParams: any[] = [cycleId]
    let paramIndex = 2

    if (ageGroup) {
      const [minAge, maxAge] = ageGroup.includes('+') 
        ? [parseInt(ageGroup.replace('+', '')), 999]
        : ageGroup.split('-').map(Number)
      demographicFilters.push(`sr.respondent_age BETWEEN $${paramIndex} AND $${paramIndex + 1}`)
      queryParams.push(minAge, maxAge)
      paramIndex += 2
    }

    if (gender) {
      demographicFilters.push(`sr.gender_identity = $${paramIndex}`)
      queryParams.push(gender)
      paramIndex++
    }

    if (householdIncome) {
      demographicFilters.push(`rd.data->>'householdIncome' = $${paramIndex}`)
      queryParams.push(householdIncome)
      paramIndex++
    }

    if (educationalAttainment) {
      demographicFilters.push(`rd.data->>'educationalAttainment' LIKE $${paramIndex}`)
      queryParams.push(`%${educationalAttainment}%`)
      paramIndex++
    }

    const demographicWhere = demographicFilters.length > 0 
      ? `AND ${demographicFilters.join(' AND ')}`
      : ''

    // Map service area to field names
    const fieldMap: Record<string, string> = {
      financial: 'financial',
      disaster: 'disaster',
      safety: 'safety',
      social: 'social',
      business: 'business',
      environmental: 'environmental'
    }

    const field = fieldMap[serviceArea] || 'financial'
    
    // Map service areas to their corresponding service IDs for conditional questions
    const serviceIdMap: Record<string, string[]> = {
      financial: ['financial', 'projects'],
      disaster: ['disasterInfo', 'evacuation'],
      safety: ['tanods', 'lupon', 'antiDrug'],
      social: ['socialPrograms', 'healthServices', 'womenChildrenProtection', 'communityParticipation'],
      business: ['businessClearance'],
      environmental: ['wasteManagement']
    }
    
    const serviceIds = serviceIdMap[serviceArea] || []

    logger.debug('[Service Area Deep Dive] Service area:', serviceArea, 'Field:', field, 'Cycle:', cycleId)
    
    // First, let's check what section keys exist
    const sectionKeysQuery = `
      SELECT DISTINCT ss.section_key, COUNT(*) as count
      FROM survey_response sr
      LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
      WHERE sr.survey_cycle_id = $1
      GROUP BY ss.section_key
      ORDER BY ss.section_key
    `
    const sectionKeysResult = await client.query(sectionKeysQuery, [cycleId])
    logger.debug('[Service Area Deep Dive] Available section keys:', sectionKeysResult.rows)
    
    // Build demographic filter for survey responses
    let demographicFilter = ''
    const demographicParams: any[] = []
    
    if (ageGroup) {
      const [minAge, maxAge] = ageGroup.includes('+') 
        ? [parseInt(ageGroup.replace('+', '')), 999]
        : ageGroup.split('-').map(Number)
      demographicFilter += ` AND sr.respondent_age BETWEEN ${queryParams.length + 1} AND ${queryParams.length + 2}`
      demographicParams.push(minAge, maxAge)
    }

    if (gender) {
      demographicFilter += ` AND sr.gender_identity = $${queryParams.length + demographicParams.length + 1}`
      demographicParams.push(gender)
    }

    if (householdIncome) {
      // We'll need to join with respondent_demographics section for this
      console.log('[Service Area Deep Dive] Household income filter:', householdIncome)
    }

    if (educationalAttainment) {
      // We'll need to join with respondent_demographics section for this
      console.log('[Service Area Deep Dive] Education filter:', educationalAttainment)
    }
    
    logger.debug('[Service Area Deep Dive] Demographic filters:', { ageGroup, gender, householdIncome, educationalAttainment })
    
    // Get list of barangays with completed surveys
    const barangaysQuery = `
      SELECT DISTINCT 
        sr.barangay_id,
        b.barangay_name
      FROM survey_response sr
      LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
      WHERE sr.survey_cycle_id = $1 
        AND sr.status IN ('completed', 'submitted')
        AND sr.progress = 100
        ${demographicFilter}
      ORDER BY b.barangay_name
    `
    
    const barangaysResult = await client.query(barangaysQuery, [...queryParams, ...demographicParams])
    logger.debug('[Service Area Deep Dive] Found barangays after demographic filter:', barangaysResult.rows.length)
    
    const rankings = []
    
    // For each barangay, calculate metrics from the service section
    for (const barangay of barangaysResult.rows) {
      // Get all responses for this barangay and service area with demographic filters
      const metricsQuery = `
        SELECT ss.data as full_data
        FROM survey_response sr
        LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
        WHERE sr.barangay_id = $1
          AND sr.survey_cycle_id = $2
          AND sr.status IN ('completed', 'submitted')
          AND ss.section_key = $3
          AND ss.data IS NOT NULL
          ${demographicFilter}
      `
      
      const metricsQueryParams = [barangay.barangay_id, cycleId, field, ...demographicParams]
      const metricsResult = await client.query(metricsQuery, metricsQueryParams)
      
      logger.debug(`[Service Area Deep Dive] Barangay ${barangay.barangay_name} (${field}):`, metricsResult.rows.length, 'responses')
      
      // Debug: Check what section keys exist for this barangay
      if (metricsResult.rows.length === 0) {
        const debugQuery = `
          SELECT DISTINCT ss.section_key, COUNT(*) as count
          FROM survey_response sr
          LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
          WHERE sr.barangay_id = $1 AND sr.survey_cycle_id = $2
          GROUP BY ss.section_key
          ORDER BY ss.section_key
        `
        const debugResult = await client.query(debugQuery, [barangay.barangay_id, cycleId])
        logger.debug(`[Service Area Deep Dive] ${barangay.barangay_name} available section keys:`, debugResult.rows)
      }
      
      if (metricsResult.rows.length > 0) {
        logger.debug('[Service Area Deep Dive] Sample data:', JSON.stringify(metricsResult.rows[0].full_data).substring(0, 200))
      }
      
      if (metricsResult.rows.length === 0) {
        continue
      }
      
      // Calculate metrics by aggregating across all awareness/availment/satisfaction fields
      // IMPORTANT: Track unique respondents, not sum of all service responses
      const serviceMetrics: Record<string, { aware: number, availed: number, satisfied: number, nfaYes: number, nfaTotal: number }> = {}
      
      // Initialize metrics for each service in this area
      serviceIds.forEach(serviceId => {
        serviceMetrics[serviceId] = { aware: 0, availed: 0, satisfied: 0, nfaYes: 0, nfaTotal: 0 }
      })
      
      let totalResponses = metricsResult.rows.length
      
      // Track unique respondents for correct percentage calculation
      const respondentsAware = new Set<number>()
      const respondentsAvailed = new Set<number>()
      const respondentsSatisfied = new Set<number>()
      
      metricsResult.rows.forEach((row: any, rowIndex: number) => {
        const data = row.full_data
        
        // Track if THIS respondent is aware/availed/satisfied of ANY service in this area
        let respondentIsAware = false
        let respondentAvailed = false
        let respondentIsSatisfied = false
        
        // Process each service in this service area
        serviceIds.forEach(serviceId => {
          const serviceIdLower = serviceId.toLowerCase()
          
          // Find awareness field for this service
          const awarenessKey = Object.keys(data).find(key => 
            key.toLowerCase().startsWith('awareness') && key.toLowerCase().includes(serviceIdLower)
          )
          
          if (awarenessKey) {
            const awarenessValue = data[awarenessKey]
            if (awarenessValue === 'Oo' || awarenessValue === 'Yes' || awarenessValue === 'yes' || awarenessValue === '1') {
              serviceMetrics[serviceId].aware++
              respondentIsAware = true // This respondent is aware of at least one service
              
              // Find availment field for this service
              const availmentKey = Object.keys(data).find(key => {
                const keyLower = key.toLowerCase()
                return (keyLower.includes('availment') || keyLower.includes('benefit') || 
                        keyLower.includes('used') || keyLower.includes('participated') ||
                        keyLower.includes('experience') || keyLower.includes('obtained') ||
                        keyLower.includes('received') || keyLower.includes('location')) &&
                       keyLower.includes(serviceIdLower)
              })
              
              if (availmentKey) {
                const availmentValue = data[availmentKey]
                if (availmentValue === 'Oo' || availmentValue === 'Yes' || availmentValue === 'yes' || availmentValue === '1') {
                  serviceMetrics[serviceId].availed++
                  respondentAvailed = true // This respondent availed at least one service
                  
                  // Find satisfaction field for this service (only if they availed)
                  const satisfactionKey = Object.keys(data).find(key =>
                    key.toLowerCase().startsWith('satisfaction') && key.toLowerCase().includes(serviceIdLower)
                  )
                  
                  if (satisfactionKey) {
                    const satisfactionValue = String(data[satisfactionKey])
                    const satisfactionLower = satisfactionValue.toLowerCase()
                    
                    // Handle binary format (Yes/No, Oo/Hindi)
                    if (satisfactionLower.includes('yes') || satisfactionLower.includes('oo')) {
                      serviceMetrics[serviceId].satisfied++
                      respondentIsSatisfied = true // This respondent is satisfied with at least one service
                    }
                    // Handle numeric format (1-5 scale, where 4-5 = satisfied)
                    else {
                      const numValue = parseInt(satisfactionValue)
                      if (!isNaN(numValue) && numValue >= 4) {
                        serviceMetrics[serviceId].satisfied++
                        respondentIsSatisfied = true
                      }
                    }
                  }
                }
              }
            }
          }
          
          // Find NFA field for this service
          const nfaKey = Object.keys(data).find(key => {
            const keyLower = key.toLowerCase()
            return (keyLower.includes('nfabinary') || keyLower.includes('need_for_action')) &&
                   keyLower.includes(serviceIdLower)
          })
          
          if (nfaKey) {
            serviceMetrics[serviceId].nfaTotal++
            const nfaValue = data[nfaKey]
            if (nfaValue === 'Oo' || nfaValue === 'Yes' || nfaValue === 'yes' || nfaValue === '1') {
              serviceMetrics[serviceId].nfaYes++
            }
          }
        })
        
        // Track unique respondents
        if (respondentIsAware) respondentsAware.add(rowIndex)
        if (respondentAvailed) respondentsAvailed.add(rowIndex)
        if (respondentIsSatisfied) respondentsSatisfied.add(rowIndex)
      })
      
      // Aggregate across all services in this area
      let totalNfaYes = 0
      let totalNfa = 0
      
      serviceIds.forEach(serviceId => {
        totalNfaYes += serviceMetrics[serviceId].nfaYes
        totalNfa += serviceMetrics[serviceId].nfaTotal
      })
      
      // Calculate percentages based on UNIQUE respondents
      // Awareness = % of respondents aware of at least one service in this area
      const awareness = totalResponses > 0 ? Math.round((respondentsAware.size / totalResponses) * 100) : 0
      // Availment = % of aware respondents who availed at least one service
      const availment = respondentsAware.size > 0 ? Math.round((respondentsAvailed.size / respondentsAware.size) * 100) : 0
      // Satisfaction = % of availed respondents who are satisfied with at least one service
      const satisfaction = respondentsAvailed.size > 0 ? Math.round((respondentsSatisfied.size / respondentsAvailed.size) * 100) : 0
      const needForAction = totalNfa > 0 ? Math.round((totalNfaYes / totalNfa) * 100) : 0
      
      logger.debug(`[Service Area Deep Dive] ${barangay.barangay_name} (${field}) metrics:`, {
        awareness: `${respondentsAware.size}/${totalResponses} = ${awareness}%`,
        availment: `${respondentsAvailed.size}/${respondentsAware.size} = ${availment}%`,
        satisfaction: `${respondentsSatisfied.size}/${respondentsAvailed.size} = ${satisfaction}%`,
        needForAction: `${totalNfaYes}/${totalNfa} = ${needForAction}%`,
        serviceBreakdown: serviceMetrics
      })
      
      // Extract unawareness and non-availment reasons directly from section data
      // (They're stored in section_data, not in response-level columns)
      const unawarenessReasons: Record<string, number> = {}
      const nonAvailmentReasons: Record<string, number> = {}
      
      metricsResult.rows.forEach((row: any) => {
        const data = row.full_data
        
        // Extract unawareness reasons for services in this area
        serviceIds.forEach(serviceId => {
          const serviceIdLower = serviceId.toLowerCase()
          
          // Look for unawareness reason fields
          const unawarenessKey = Object.keys(data).find(key =>
            key.toLowerCase().includes(serviceIdLower) && 
            key.toLowerCase().includes('unawareness') &&
            key.toLowerCase().includes('reason') &&
            !key.toLowerCase().includes('skip')
          )
          
          if (unawarenessKey && data[unawarenessKey]) {
            const reasonData = data[unawarenessKey]
            // Handle both string and object formats
            const reasonText = typeof reasonData === 'string' 
              ? reasonData 
              : reasonData.main || JSON.stringify(reasonData)
            
            if (reasonText && reasonText !== 'null') {
              unawarenessReasons[reasonText] = (unawarenessReasons[reasonText] || 0) + 1
            }
          }
          
          // Look for non-availment reason fields
          const nonAvailmentKey = Object.keys(data).find(key =>
            key.toLowerCase().includes(serviceIdLower) && 
            key.toLowerCase().includes('non_availment') &&
            key.toLowerCase().includes('reason') &&
            !key.toLowerCase().includes('skip')
          )
          
          if (nonAvailmentKey && data[nonAvailmentKey]) {
            const reasonData = data[nonAvailmentKey]
            // Handle both string and object formats
            const reasonText = typeof reasonData === 'string' 
              ? reasonData 
              : reasonData.main || JSON.stringify(reasonData)
            
            if (reasonText && reasonText !== 'null') {
              nonAvailmentReasons[reasonText] = (nonAvailmentReasons[reasonText] || 0) + 1
            }
          }
        })
      })
      

      
      // Get top 3 reasons for each
      const topUnawarenessReasons = Object.entries(unawarenessReasons)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([reason, count]) => ({ reason, count }))
      
      const topNonAvailmentReasons = Object.entries(nonAvailmentReasons)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([reason, count]) => ({ reason, count }))
      
      rankings.push({
        barangayId: barangay.barangay_id,
        barangayName: barangay.barangay_name,
        awareness,
        availment,
        satisfaction,
        needForAction,
        responseCount: totalResponses,
        trend: 'stable' as 'up' | 'down' | 'stable',
        unawarenessReasons: topUnawarenessReasons,
        nonAvailmentReasons: topNonAvailmentReasons
      })
    }
    
    // Sort by satisfaction descending
    rankings.sort((a, b) => b.satisfaction - a.satisfaction)
    
    logger.info(`✅ [Service Area Deep Dive] Calculated rankings for ${rankings.length} barangays (${serviceArea})`)

    return NextResponse.json({ rankings })

  } catch (error) {
    console.error('Error fetching service area deep dive:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service area data' },
      { status: 500 }
    )
  } finally {
    if (client) client.release()
  }
}
