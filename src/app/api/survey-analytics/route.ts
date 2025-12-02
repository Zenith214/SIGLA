import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';
import { getQuestionLabel, getQuestionMetadata } from '@/utils/questionLabels';

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "summary";
    const barangayId = searchParams.get("barangayId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const section = searchParams.get("section");
    const includeNonAwardees = searchParams.get("include_non_awardees") === 'true';

    // Get the active survey cycle ID
    const activeCycleId = await getActiveCycleId();

    if (!activeCycleId) {
      // If no active cycle, return empty data
      return NextResponse.json({
        [format]: {
          message: "No active survey cycle found",
          totalResponses: 0,
          data: []
        }
      });
    }

    // Get awardee barangay IDs for filtering (unless explicitly including non-awardees)
    let awardeeBarangayIds: number[] = [];
    if (!includeNonAwardees) {
      try {
        awardeeBarangayIds = await CycleAwardsService.getAwardeeBarangayIds(activeCycleId);
      } catch (error) {
        console.error('Error fetching awardee barangay IDs:', error);
        // If we can't get awardee data, fall back to showing all data
        awardeeBarangayIds = [];
      }
    }

    // Build where conditions for filtering - always include active cycle
    const whereConditions = ['sr.status IN (\'completed\', \'submitted\')', 'sr.survey_cycle_id = $1'];
    const queryParams: any[] = [activeCycleId];
    let paramIndex = 2;

    // Filter by awardee status (only include awardees unless explicitly requested otherwise)
    if (!includeNonAwardees && awardeeBarangayIds.length > 0) {
      const placeholders = awardeeBarangayIds.map((_, index) => `$${paramIndex + index}`).join(', ');
      whereConditions.push(`sr.barangay_id IN (${placeholders})`);
      queryParams.push(...awardeeBarangayIds);
      paramIndex += awardeeBarangayIds.length;
    } else if (!includeNonAwardees && awardeeBarangayIds.length === 0) {
      // No awardees found for this cycle, return empty results
      return NextResponse.json({
        [format]: {
          message: "No awardee barangays found for the active cycle",
          totalResponses: 0,
          data: []
        }
      });
    }

    if (barangayId) {
      whereConditions.push(`sr.barangay_id = $${paramIndex}`);
      queryParams.push(parseInt(barangayId));
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`sr.completed_at >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`sr.completed_at <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    switch (format) {
      case "summary":
        return await getSummaryAnalytics(client, whereClause, queryParams);

      case "detailed":
        return await getDetailedAnalytics(client, whereClause, queryParams, section);

      case "export":
        return await getExportData(client, whereClause, queryParams);

      case "aggregated":
        return await getAggregatedAnalytics(client, whereClause, queryParams);

      default:
        return NextResponse.json(
          { error: "Invalid format parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in survey analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey analytics" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function getSummaryAnalytics(client: any, whereClause: string, queryParams: any[]) {
  // Get basic statistics
  const totalResponsesQuery = `
    SELECT COUNT(*) as total_responses, AVG(progress) as avg_progress
    FROM survey_response sr
    WHERE ${whereClause}
  `;

  const totalResult = await client.query(totalResponsesQuery, queryParams);
  const totalResponses = parseInt(totalResult.rows[0].total_responses) || 0;
  const avgProgress = parseFloat(totalResult.rows[0].avg_progress) || 0;

  // Responses by barangay
  const barangayStatsQuery = `
    SELECT 
      sr.barangay_id,
      b.barangay_name,
      b.population,
      b.households,
      COUNT(sr.response_id) as responses
    FROM survey_response sr
    LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
    WHERE ${whereClause}
    GROUP BY sr.barangay_id, b.barangay_name, b.population, b.households
    ORDER BY b.barangay_name
  `;

  const barangayResult = await client.query(barangayStatsQuery, queryParams);
  const barangayStats = barangayResult.rows.map((row: any) => ({
    barangayId: row.barangay_id,
    barangayName: row.barangay_name,
    population: row.population,
    households: row.households,
    responses: parseInt(row.responses),
  }));

  // Responses over time
  const timeSeriesQuery = `
    SELECT 
      DATE(completed_at) as date,
      COUNT(*) as count
    FROM survey_response sr
    WHERE ${whereClause} AND completed_at IS NOT NULL
    GROUP BY DATE(completed_at)
    ORDER BY DATE(completed_at) ASC
  `;

  const timeSeriesResult = await client.query(timeSeriesQuery, queryParams);
  const timeSeriesData = timeSeriesResult.rows.map((row: any) => ({
    date: row.date,
    count: parseInt(row.count),
  }));

  return NextResponse.json({
    summary: {
      totalResponses,
      averageProgress: avgProgress,
      barangayStats,
      timeSeriesData,
    },
  });
}

async function getDetailedAnalytics(
  client: any,
  whereClause: string,
  queryParams: any[],
  sectionFilter?: string | null
) {
  let sectionCondition = '';
  let sectionParams = [...queryParams];

  if (sectionFilter) {
    sectionCondition = `AND ss.section_key = $${queryParams.length + 1}`;
    sectionParams.push(sectionFilter);
  }

  const detailedQuery = `
    SELECT 
      sr.response_id,
      sr.survey_number,
      sr.barangay_id,
      sr.respondent_name,
      sr.respondent_age,
      sr.biological_sex,
      sr.gender_identity,
      sr.location_lat,
      sr.location_lng,
      sr.location_address,
      sr.location_barangay,
      sr.location_municipality,
      sr.location_province,
      sr.location_accuracy,
      sr.progress,
      sr.completed_at,
      sr.submitted_at,
      b.barangay_name,
      b.population,
      b.households,
      u."firstName" as interviewer_first_name,
      u."lastName" as interviewer_last_name,
      u.email as interviewer_email,
      ss.section_name,
      ss.section_key,
      ss.status as section_status,
      ss.data as section_data,
      ss.completed_at as section_completed_at
    FROM survey_response sr
    LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
    LEFT JOIN "user" u ON sr.interviewer_id = u.id
    LEFT JOIN survey_section ss ON sr.response_id = ss.response_id ${sectionCondition}
    WHERE ${whereClause}
    ORDER BY sr.completed_at DESC
  `;

  const result = await client.query(detailedQuery, sectionParams);

  // Group sections by response
  const responseMap = new Map();

  result.rows.forEach((row: any) => {
    if (!responseMap.has(row.response_id)) {
      responseMap.set(row.response_id, {
        responseId: row.response_id,
        surveyNumber: row.survey_number,
        barangay: {
          id: row.barangay_id,
          name: row.barangay_name,
          population: row.population,
          households: row.households,
        },
        interviewer: {
          name: `${row.interviewer_first_name || ''} ${row.interviewer_last_name || ''}`.trim(),
          email: row.interviewer_email,
        },
        respondent: {
          name: row.respondent_name,
          age: row.respondent_age,
          sex: row.biological_sex,
          genderIdentity: row.gender_identity,
        },
        location: {
          lat: row.location_lat ? parseFloat(row.location_lat.toString()) : null,
          lng: row.location_lng ? parseFloat(row.location_lng.toString()) : null,
          address: row.location_address,
          barangay: row.location_barangay,
          municipality: row.location_municipality,
          province: row.location_province,
          accuracy: row.location_accuracy ? parseFloat(row.location_accuracy.toString()) : null,
        },
        progress: row.progress,
        completedAt: row.completed_at,
        submittedAt: row.submitted_at,
        sections: [],
      });
    }

    if (row.section_name) {
      responseMap.get(row.response_id).sections.push({
        name: row.section_name,
        key: row.section_key,
        status: row.section_status,
        // JSONB data is already an object, no need to parse
        data: row.section_data || null,
        completedAt: row.section_completed_at,
      });
    }
  });

  const detailedData = Array.from(responseMap.values());

  return NextResponse.json({
    detailed: {
      responses: detailedData,
      count: detailedData.length,
    },
  });
}

async function getExportData(client: any, whereClause: string, queryParams: any[]) {
  const exportQuery = `
    SELECT 
      sr.response_id,
      sr.survey_number,
      sr.respondent_name,
      sr.respondent_age,
      sr.biological_sex,
      sr.gender_identity,
      sr.location_lat,
      sr.location_lng,
      sr.location_address,
      sr.location_barangay,
      sr.location_municipality,
      sr.location_province,
      sr.progress,
      sr.completed_at,
      sr.submitted_at,
      b.barangay_name,
      b.population as barangay_population,
      u."firstName" as interviewer_first_name,
      u."lastName" as interviewer_last_name,
      u.email as interviewer_email,
      ss.section_key,
      ss.data as section_data
    FROM survey_response sr
    LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
    LEFT JOIN "user" u ON sr.interviewer_id = u.id
    LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
    WHERE ${whereClause}
    ORDER BY sr.completed_at DESC
  `;

  const result = await client.query(exportQuery, queryParams);

  // Group by response and flatten section data
  const responseMap = new Map();

  result.rows.forEach((row: any) => {
    if (!responseMap.has(row.response_id)) {
      responseMap.set(row.response_id, {
        response_id: row.response_id,
        survey_number: row.survey_number,
        barangay_name: row.barangay_name,
        barangay_population: row.barangay_population,
        interviewer_name: `${row.interviewer_first_name || ''} ${row.interviewer_last_name || ''}`.trim(),
        interviewer_email: row.interviewer_email,
        respondent_name: row.respondent_name,
        respondent_age: row.respondent_age,
        biological_sex: row.biological_sex,
        gender_identity: row.gender_identity,
        location_lat: row.location_lat,
        location_lng: row.location_lng,
        location_address: row.location_address,
        location_barangay: row.location_barangay,
        location_municipality: row.location_municipality,
        location_province: row.location_province,
        progress: row.progress,
        completed_at: row.completed_at,
        submitted_at: row.submitted_at,
      });
    }

    // Add section data as flattened columns
    if (row.section_data && row.section_key) {
      try {
        // PostgreSQL JSONB columns are already parsed as objects, no need to JSON.parse
        const parsedData = typeof row.section_data === 'string' 
          ? JSON.parse(row.section_data) 
          : row.section_data;
        
        // Scenario 8: Validate that parsed data is an object
        if (parsedData && typeof parsedData === 'object') {
          Object.keys(parsedData).forEach((key) => {
            responseMap.get(row.response_id)[`${row.section_key}_${key}`] = parsedData[key];
          });
        } else {
          console.warn(`Malformed JSONB data in section ${row.section_key} (response ${row.response_id}): not an object`);
          responseMap.get(row.response_id)[`${row.section_key}_error`] = 'malformed_data';
        }
      } catch (e) {
        // Scenario 8: Log and mark malformed data
        console.warn(`Failed to parse JSONB data in section ${row.section_key} (response ${row.response_id}):`, e);
        responseMap.get(row.response_id)[`${row.section_key}_error`] = 'parse_error';
      }
    }
  });

  const exportData = Array.from(responseMap.values());

  return NextResponse.json({
    export: {
      data: exportData,
      count: exportData.length,
      columns: exportData.length > 0 ? Object.keys(exportData[0]) : [],
    },
  });
}

async function getAggregatedAnalytics(client: any, whereClause: string, queryParams: any[]) {
  const aggregatedQuery = `
    SELECT 
      sr.response_id,
      ss.section_key,
      ss.section_name,
      ss.status as section_status,
      ss.data as section_data
    FROM survey_response sr
    LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
    WHERE ${whereClause}
    ORDER BY sr.response_id, ss.section_key
  `;

  const result = await client.query(aggregatedQuery, queryParams);

  // Aggregate section responses
  const sectionAggregations: any = {};
  const questionAggregations: any = {};
  let malformedDataCount = 0;

  result.rows.forEach((row: any) => {
    if (row.section_key) {
      if (!sectionAggregations[row.section_key]) {
        sectionAggregations[row.section_key] = {
          name: row.section_name,
          totalResponses: 0,
          completedResponses: 0,
          questions: {},
        };
      }

      sectionAggregations[row.section_key].totalResponses++;

      if (row.section_status === "completed") {
        sectionAggregations[row.section_key].completedResponses++;
      }

      if (row.section_data) {
        try {
          // PostgreSQL JSONB columns are already parsed as objects, no need to JSON.parse
          const sectionData = typeof row.section_data === 'string' 
            ? JSON.parse(row.section_data) 
            : row.section_data;
          
          // Scenario 8: Validate that parsed data is an object
          if (!sectionData || typeof sectionData !== 'object') {
            console.warn(`Malformed JSONB data in section ${row.section_key} (response ${row.response_id}): not an object, skipping`);
            malformedDataCount++;
            return;
          }
          
          Object.keys(sectionData).forEach((questionKey) => {
            const fullKey = `${row.section_key}_${questionKey}`;

            if (!questionAggregations[fullKey]) {
              const metadata = getQuestionMetadata(fullKey);
              questionAggregations[fullKey] = {
                section: row.section_key,
                question: questionKey,
                questionLabel: getQuestionLabel(fullKey),
                questionType: metadata?.type || 'other',
                sectionName: metadata?.section || row.section_name,
                description: metadata?.description || null,
                responses: [],
                valueCount: {},
              };
            }

            const value = sectionData[questionKey];
            questionAggregations[fullKey].responses.push(value);

            // Count occurrences of each value
            if (questionAggregations[fullKey].valueCount[value]) {
              questionAggregations[fullKey].valueCount[value]++;
            } else {
              questionAggregations[fullKey].valueCount[value] = 1;
            }
          });
        } catch (e) {
          // Scenario 8: Log and skip malformed JSONB data
          console.warn(`Failed to parse JSONB data in section ${row.section_key} (response ${row.response_id}), skipping:`, e);
          malformedDataCount++;
        }
      }
    }
  });

  // Calculate statistics for numeric questions
  Object.keys(questionAggregations).forEach((key) => {
    const question = questionAggregations[key];
    const numericValues = question.responses.filter(
      (val: any) => !isNaN(val) && val !== null && val !== ""
    );

    if (numericValues.length > 0) {
      const numbers = numericValues.map((val: any) => parseFloat(val));
      question.statistics = {
        count: numbers.length,
        mean:
          numbers.reduce((a: number, b: number) => a + b, 0) / numbers.length,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        median: numbers.sort((a: number, b: number) => a - b)[
          Math.floor(numbers.length / 2)
        ],
      };
    }
  });

  // Scenario 8: Include count of excluded responses in response
  const response: any = {
    aggregated: {
      sections: sectionAggregations,
      questions: questionAggregations,
      totalResponses: result.rows.length,
    },
  };

  if (malformedDataCount > 0) {
    response.aggregated.malformedDataCount = malformedDataCount;
    response.aggregated.warning = `Excluded ${malformedDataCount} responses with malformed JSONB data`;
  }

  return NextResponse.json(response);
}