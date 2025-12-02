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

    console.log('[Service Area Deep Dive] Service area:', serviceArea, 'Field:', field, 'Cycle:', cycleId)
    
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
    console.log('[Service Area Deep Dive] Available section keys:', sectionKeysResult.rows)
    
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
    
    console.log('[Service Area Deep Dive] Demographic filters:', { ageGroup, gender, householdIncome, educationalAttainment })
    
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
    console.log('[Service Area Deep Dive] Found barangays after demographic filter:', barangaysResult.rows.length)
    
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
      
      console.log(`[Service Area Deep Dive] Barangay ${barangay.barangay_name} (${field}):`, metricsResult.rows.length, 'responses')
      if (metricsResult.rows.length > 0) {
        console.log('[Service Area Deep Dive] Sample data:', JSON.stringify(metricsResult.rows[0].full_data).substring(0, 200))
      }
      
      if (metricsResult.rows.length === 0) {
        continue
      }
      
      // Calculate metrics by aggregating across all awareness/nfa/satisfaction fields
      let awareCount = 0
      let awareTotal = 0
      let nfaCount = 0
      let nfaTotal = 0
      let satisfactionSum = 0
      let satisfactionCount = 0
      let totalResponses = metricsResult.rows.length
      
      metricsResult.rows.forEach((row: any) => {
        const data = row.full_data
        
        // Aggregate all awareness fields (fields starting with "awareness")
        Object.keys(data).forEach((key) => {
          if (key.toLowerCase().startsWith('awareness')) {
            awareTotal++
            const value = data[key]
            if (value === 'Oo' || value === 'Yes' || value === 'yes' || value === '1') {
              awareCount++
            }
          }
          
          // Aggregate all NFA fields (fields containing "nfaBinary" or "nfa")
          if (key.toLowerCase().includes('nfabinary') || key.toLowerCase().includes('nfa')) {
            nfaTotal++
            const value = data[key]
            // Count "Hindi" or "No" as good (no action needed)
            if (value === 'Hindi' || value === 'No' || value === 'no' || value === '0') {
              nfaCount++
            }
          }
          
          // Aggregate all satisfaction fields (fields starting with "satisfaction")
          if (key.toLowerCase().startsWith('satisfaction')) {
            const value = data[key]
            if (value) {
              const satValue = parseInt(String(value).charAt(0))
              if (!isNaN(satValue) && satValue >= 1 && satValue <= 5) {
                satisfactionSum += (satValue / 5) * 100
                satisfactionCount++
              }
            }
          }
        })
      })
      
      const awareness = awareTotal > 0 ? Math.round((awareCount / awareTotal) * 100) : 0
      const availment = nfaTotal > 0 ? Math.round((nfaCount / nfaTotal) * 100) : 0
      const satisfaction = satisfactionCount > 0 ? Math.round(satisfactionSum / satisfactionCount) : 0
      const needForAction = 100 - satisfaction // Inverse of satisfaction
      
      console.log(`[Service Area Deep Dive] ${barangay.barangay_name} metrics:`, {
        awareness: `${awareCount}/${awareTotal} = ${awareness}%`,
        availment: `${nfaCount}/${nfaTotal} = ${availment}%`,
        satisfaction: `${satisfactionCount} responses = ${satisfaction}%`,
        needForAction: `${needForAction}%`
      })
      
      rankings.push({
        barangayId: barangay.barangay_id,
        barangayName: barangay.barangay_name,
        awareness,
        availment,
        satisfaction,
        needForAction,
        responseCount: totalResponses,
        trend: 'stable' as 'up' | 'down' | 'stable'
      })
    }
    
    // Sort by satisfaction descending
    rankings.sort((a, b) => b.satisfaction - a.satisfaction)
    
    console.log('[Service Area Deep Dive] Calculated rankings for', rankings.length, 'barangays')

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
