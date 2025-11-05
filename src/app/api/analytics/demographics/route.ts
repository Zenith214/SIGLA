import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getActiveCycle } from "@/utils/surveyCycleHelpers";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');
    const cycleId = searchParams.get('cycleId');

    client = await pool.connect();

    // Get active cycle if not specified
    let targetCycleId = cycleId;
    if (!targetCycleId) {
      const activeCycle = await getActiveCycle();
      if (!activeCycle) {
        return NextResponse.json({ error: "No active cycle found" }, { status: 400 });
      }
      targetCycleId = activeCycle.cycle_id.toString();
    }

    // Build WHERE clause
    let whereClause = `WHERE sr.survey_cycle_id = $1`;
    const queryParams: any[] = [parseInt(targetCycleId)];
    let paramIndex = 2;

    if (barangayId) {
      whereClause += ` AND sr.barangay_id = $${paramIndex}`;
      queryParams.push(parseInt(barangayId));
      paramIndex++;
    }

    // Gender Distribution
    const genderQuery = `
      SELECT 
        respondent_gender as gender,
        COUNT(*) as count
      FROM survey_response sr
      ${whereClause}
      GROUP BY respondent_gender
      ORDER BY count DESC
    `;
    const genderResult = await client.query(genderQuery, queryParams);

    // Age Group Distribution
    const ageGroupQuery = `
      SELECT 
        age_group,
        COUNT(*) as count
      FROM (
        SELECT 
          CASE 
            WHEN respondent_age < 18 THEN 'Under 18'
            WHEN respondent_age BETWEEN 18 AND 24 THEN '18-24'
            WHEN respondent_age BETWEEN 25 AND 34 THEN '25-34'
            WHEN respondent_age BETWEEN 35 AND 44 THEN '35-44'
            WHEN respondent_age BETWEEN 45 AND 54 THEN '45-54'
            WHEN respondent_age BETWEEN 55 AND 64 THEN '55-64'
            WHEN respondent_age >= 65 THEN '65+'
            ELSE 'Unknown'
          END as age_group
        FROM survey_response sr
        ${whereClause}
      ) age_data
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN 'Under 18' THEN 1
          WHEN '18-24' THEN 2
          WHEN '25-34' THEN 3
          WHEN '35-44' THEN 4
          WHEN '45-54' THEN 5
          WHEN '55-64' THEN 6
          WHEN '65+' THEN 7
          ELSE 8
        END
    `;
    const ageGroupResult = await client.query(ageGroupQuery, queryParams);

    // Educational Attainment Distribution
    const educationQuery = `
      SELECT 
        respondent_educational_attainment as education,
        COUNT(*) as count
      FROM survey_response sr
      ${whereClause}
      GROUP BY respondent_educational_attainment
      ORDER BY count DESC
    `;
    const educationResult = await client.query(educationQuery, queryParams);

    // Household Income Distribution
    const incomeQuery = `
      SELECT 
        respondent_household_income as income,
        COUNT(*) as count
      FROM survey_response sr
      ${whereClause}
      GROUP BY respondent_household_income
      ORDER BY count DESC
    `;
    const incomeResult = await client.query(incomeQuery, queryParams);

    // Purok Distribution
    const purokQuery = `
      SELECT 
        COALESCE(respondent_purok, 'Not specified') as purok,
        COUNT(*) as count
      FROM survey_response sr
      ${whereClause}
      GROUP BY respondent_purok
      ORDER BY count DESC
    `;
    const purokResult = await client.query(purokQuery, queryParams);

    // Total respondents
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM survey_response sr
      ${whereClause}
    `;
    const totalResult = await client.query(totalQuery, queryParams);
    const total = parseInt(totalResult.rows[0].total);

    // Calculate percentages and format data
    const formatDistribution = (rows: any[]) => {
      return rows.map(row => ({
        label: row.gender || row.age_group || row.education || row.income || row.purok || 'Unknown',
        count: parseInt(row.count),
        percentage: total > 0 ? ((parseInt(row.count) / total) * 100).toFixed(1) : '0.0'
      }));
    };

    return NextResponse.json({
      success: true,
      cycleId: parseInt(targetCycleId),
      barangayId: barangayId ? parseInt(barangayId) : null,
      totalRespondents: total,
      demographics: {
        gender: formatDistribution(genderResult.rows),
        ageGroups: formatDistribution(ageGroupResult.rows),
        education: formatDistribution(educationResult.rows),
        income: formatDistribution(incomeResult.rows),
        purok: formatDistribution(purokResult.rows)
      }
    });

  } catch (error) {
    console.error("Error fetching demographics:", error);
    return NextResponse.json(
      { error: "Failed to fetch demographics data" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
