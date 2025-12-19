import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getActiveCycleId } from '@/utils/surveyCycleHelpers'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request: NextRequest) {
  let client
  try {
    client = await pool.connect()
    const { searchParams } = new URL(request.url)
    const cycleId = searchParams.get('cycleId') || await getActiveCycleId()

    if (!cycleId) {
      return NextResponse.json({ error: 'No active cycle' }, { status: 400 })
    }

    console.log('[Demographics] Fetching data for cycle:', cycleId)

    // First check what gender data exists
    const genderCheckQuery = `
      SELECT DISTINCT gender_identity, COUNT(*) as count
      FROM survey_response
      WHERE survey_cycle_id = $1
      GROUP BY gender_identity
    `
    const genderCheck = await client.query(genderCheckQuery, [cycleId])
    console.log('[Demographics] Gender identity values in database:', genderCheck.rows)

    // Get all responses with demographics and overall satisfaction
    const query = `
      SELECT 
        sr.respondent_age,
        sr.gender_identity as sr_gender,
        sr.respondent_purok,
        rd.data->>'genderIdentity' as rd_gender,
        rd.data->>'householdIncome' as household_income,
        rd.data->>'educationalAttainment' as educational_attainment,
        rd.data->>'purok' as rd_purok,
        os.data->>'overallSatisfaction' as overall_satisfaction
      FROM survey_response sr
      LEFT JOIN survey_section rd ON sr.response_id = rd.response_id AND rd.section_key = 'respondent_demographics'
      LEFT JOIN survey_section os ON sr.response_id = os.response_id AND os.section_key = 'overall'
      WHERE sr.survey_cycle_id = $1
        AND sr.status IN ('completed', 'submitted')
        AND sr.progress = 100
    `

    const result = await client.query(query, [cycleId])
    console.log('[Demographics] Found responses:', result.rows.length)
    
    // Log sample data to see what we're getting
    if (result.rows.length > 0) {
      console.log('[Demographics] Sample row:', {
        sr_gender: result.rows[0].sr_gender,
        rd_gender: result.rows[0].rd_gender,
        household_income: result.rows[0].household_income,
        educational_attainment: result.rows[0].educational_attainment
      })
    }

    // Process data
    const ageGroups: Record<string, { count: number, satisfactionSum: number }> = {}
    const genders: Record<string, { count: number, satisfactionSum: number }> = {}
    const incomes: Record<string, { count: number, satisfactionSum: number }> = {}
    const educations: Record<string, { count: number, satisfactionSum: number }> = {}
    const puroks: Record<string, { count: number, satisfactionSum: number }> = {}

    result.rows.forEach((row: any) => {
      // Calculate satisfaction (binary or 1-5 scale to percentage)
      let satisfaction = 0
      if (row.overall_satisfaction) {
        const satisfactionValue = String(row.overall_satisfaction).toLowerCase();
        
        // Check if it's the new binary format
        if (satisfactionValue.includes('yes') || satisfactionValue.includes('oo')) {
          satisfaction = 100
        } else if (satisfactionValue.includes('no') || satisfactionValue.includes('hindi')) {
          satisfaction = 0
        } else {
          // Old format: 1-5 scale
          const satValue = parseInt(satisfactionValue.charAt(0))
          if (!isNaN(satValue) && satValue >= 1 && satValue <= 5) {
            satisfaction = (satValue / 5) * 100
          }
        }
      }

      // Age groups
      const age = row.respondent_age
      let ageGroup = 'Unknown'
      if (age >= 18 && age <= 24) ageGroup = '18-24'
      else if (age >= 25 && age <= 34) ageGroup = '25-34'
      else if (age >= 35 && age <= 44) ageGroup = '35-44'
      else if (age >= 45 && age <= 54) ageGroup = '45-54'
      else if (age >= 55 && age <= 64) ageGroup = '55-64'
      else if (age >= 65) ageGroup = '65+'

      if (!ageGroups[ageGroup]) {
        ageGroups[ageGroup] = { count: 0, satisfactionSum: 0 }
      }
      ageGroups[ageGroup].count++
      ageGroups[ageGroup].satisfactionSum += satisfaction

      // Gender - try both sources
      const gender = row.rd_gender || row.sr_gender || 'Not specified'
      if (!genders[gender]) {
        genders[gender] = { count: 0, satisfactionSum: 0 }
      }
      genders[gender].count++
      genders[gender].satisfactionSum += satisfaction

      // Income
      const income = row.household_income || 'Not specified'
      if (!incomes[income]) {
        incomes[income] = { count: 0, satisfactionSum: 0 }
      }
      incomes[income].count++
      incomes[income].satisfactionSum += satisfaction

      // Education
      const education = row.educational_attainment || 'Not specified'
      if (!educations[education]) {
        educations[education] = { count: 0, satisfactionSum: 0 }
      }
      educations[education].count++
      educations[education].satisfactionSum += satisfaction

      // Purok - try both sources
      const purok = row.rd_purok || row.respondent_purok || 'Not specified'
      if (!puroks[purok]) {
        puroks[purok] = { count: 0, satisfactionSum: 0 }
      }
      puroks[purok].count++
      puroks[purok].satisfactionSum += satisfaction
    })

    // Format response
    const response = {
      totalRespondents: result.rows.length,
      ageDistribution: Object.entries(ageGroups).map(([ageGroup, data]) => ({
        ageGroup,
        count: data.count,
        satisfaction: data.count > 0 ? data.satisfactionSum / data.count : 0
      })).sort((a, b) => {
        const order = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Unknown']
        return order.indexOf(a.ageGroup) - order.indexOf(b.ageGroup)
      }),
      genderDistribution: Object.entries(genders).map(([gender, data]) => ({
        gender,
        count: data.count,
        satisfaction: data.count > 0 ? data.satisfactionSum / data.count : 0
      })),
      incomeDistribution: Object.entries(incomes).map(([incomeRange, data]) => ({
        incomeRange,
        count: data.count,
        satisfaction: data.count > 0 ? data.satisfactionSum / data.count : 0
      })).sort((a, b) => {
        // Sort income from lowest to highest
        const order = ['Below 10,000', '10,001-20,000', '20,001-50,000', 'Above 50,000', 'Not specified']
        return order.indexOf(a.incomeRange) - order.indexOf(b.incomeRange)
      }),
      educationDistribution: Object.entries(educations).map(([education, data]) => ({
        education,
        count: data.count,
        satisfaction: data.count > 0 ? data.satisfactionSum / data.count : 0
      })).sort((a, b) => {
        // Sort education from elementary to post graduate
        const order = ['Elementary', 'High School', 'College', 'Post Graduate', 'Not specified']
        return order.indexOf(a.education) - order.indexOf(b.education)
      }),
      purokDistribution: Object.entries(puroks).map(([purok, data]) => ({
        purok,
        count: data.count,
        satisfaction: data.count > 0 ? data.satisfactionSum / data.count : 0
      })).sort((a, b) => {
        // Sort puroks naturally (Purok 1, Purok 2, etc.)
        const extractNumber = (str: string) => {
          const match = str.match(/\d+/)
          return match ? parseInt(match[0]) : 999
        }
        return extractNumber(a.purok) - extractNumber(b.purok)
      })
    }

    console.log('[Demographics] Processed data:', {
      ageGroups: response.ageDistribution.length,
      genders: response.genderDistribution.length,
      incomes: response.incomeDistribution.length,
      educations: response.educationDistribution.length,
      puroks: response.purokDistribution.length
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Demographics] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch demographics data' },
      { status: 500 }
    )
  } finally {
    if (client) client.release()
  }
}
