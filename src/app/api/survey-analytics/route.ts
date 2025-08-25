import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "summary";
    const barangayId = searchParams.get("barangayId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const section = searchParams.get("section");

    // Build where clause for filtering
    const whereClause: any = {
      status: "completed", // Only include completed surveys
    };

    if (barangayId) {
      whereClause.barangay_id = parseInt(barangayId);
    }

    if (startDate || endDate) {
      whereClause.completed_at = {};
      if (startDate) {
        whereClause.completed_at.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.completed_at.lte = new Date(endDate);
      }
    }

    switch (format) {
      case "summary":
        return await getSummaryAnalytics(whereClause);

      case "detailed":
        return await getDetailedAnalytics(whereClause, section);

      case "export":
        return await getExportData(whereClause);

      case "aggregated":
        return await getAggregatedAnalytics(whereClause);

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
    await prisma.$disconnect();
  }
}

async function getSummaryAnalytics(whereClause: any) {
  // Get basic statistics
  const totalResponses = await prisma.survey_response.count({
    where: whereClause,
  });

  const avgProgress = await prisma.survey_response.aggregate({
    where: whereClause,
    _avg: { progress: true },
  });

  // Responses by barangay
  const responsesByBarangay = await prisma.survey_response.groupBy({
    where: whereClause,
    by: ["barangay_id"],
    _count: { response_id: true },
  });

  const barangayStats = await Promise.all(
    responsesByBarangay.map(async (group) => {
      const barangay = await prisma.barangay.findUnique({
        where: { barangay_id: group.barangay_id },
        select: { barangay_name: true, population: true, households: true },
      });
      return {
        barangayId: group.barangay_id,
        barangayName: barangay?.barangay_name,
        population: barangay?.population,
        households: barangay?.households,
        responses: group._count.response_id,
      };
    })
  );

  // Responses over time
  const responsesOverTime = await prisma.survey_response.groupBy({
    where: whereClause,
    by: ["completed_at"],
    _count: { response_id: true },
    orderBy: { completed_at: "asc" },
  });

  const timeSeriesData = responsesOverTime.map((item) => ({
    date: item.completed_at?.toISOString().split("T")[0],
    count: item._count.response_id,
  }));

  return NextResponse.json({
    summary: {
      totalResponses,
      averageProgress: avgProgress._avg.progress,
      barangayStats,
      timeSeriesData,
    },
  });
}

async function getDetailedAnalytics(
  whereClause: any,
  sectionFilter?: string | null
) {
  const responses = await prisma.survey_response.findMany({
    where: whereClause,
    include: {
      barangay: {
        select: {
          barangay_name: true,
          population: true,
          households: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      survey_section: sectionFilter
        ? {
            where: { section_key: sectionFilter },
          }
        : true,
    },
    orderBy: { completed_at: "desc" },
  });

  const detailedData = responses.map((response) => ({
    responseId: response.response_id,
    surveyNumber: response.survey_number,
    barangay: {
      id: response.barangay_id,
      name: response.barangay?.barangay_name,
      population: response.barangay?.population,
      households: response.barangay?.households,
    },
    interviewer: {
      name: `${response.user?.firstName} ${response.user?.lastName}`,
      email: response.user?.email,
    },
    respondent: {
      name: response.respondent_name,
      age: response.respondent_age,
      gender: response.respondent_gender,
    },
    location: {
      lat: parseFloat(response.location_lat.toString()),
      lng: parseFloat(response.location_lng.toString()),
      address: response.location_address,
      barangay: response.location_barangay,
      municipality: response.location_municipality,
      province: response.location_province,
      accuracy: response.location_accuracy
        ? parseFloat(response.location_accuracy.toString())
        : null,
    },
    progress: response.progress,
    completedAt: response.completed_at,
    submittedAt: response.submitted_at,
    sections: response.survey_section.map((section) => ({
      name: section.section_name,
      key: section.section_key,
      status: section.status,
      data: section.data ? JSON.parse(section.data) : null,
      completedAt: section.completed_at,
    })),
  }));

  return NextResponse.json({
    detailed: {
      responses: detailedData,
      count: detailedData.length,
    },
  });
}

async function getExportData(whereClause: any) {
  const responses = await prisma.survey_response.findMany({
    where: whereClause,
    include: {
      barangay: true,
      user: true,
      survey_section: true,
    },
    orderBy: { completed_at: "desc" },
  });

  // Flatten data for CSV export
  const exportData = [];

  for (const response of responses) {
    const baseData = {
      response_id: response.response_id,
      survey_number: response.survey_number,
      barangay_name: response.barangay?.barangay_name,
      barangay_population: response.barangay?.population,
      interviewer_name: `${response.user?.firstName} ${response.user?.lastName}`,
      interviewer_email: response.user?.email,
      respondent_name: response.respondent_name,
      respondent_age: response.respondent_age,
      respondent_gender: response.respondent_gender,
      location_lat: response.location_lat,
      location_lng: response.location_lng,
      location_address: response.location_address,
      location_barangay: response.location_barangay,
      location_municipality: response.location_municipality,
      location_province: response.location_province,
      progress: response.progress,
      completed_at: response.completed_at,
      submitted_at: response.submitted_at,
    };

    // Add section data as columns
    const sectionData: any = {};
    response.survey_section.forEach((section) => {
      if (section.data) {
        try {
          const parsedData = JSON.parse(section.data);
          Object.keys(parsedData).forEach((key) => {
            sectionData[`${section.section_key}_${key}`] = parsedData[key];
          });
        } catch (e) {
          sectionData[`${section.section_key}_raw`] = section.data;
        }
      }
    });

    exportData.push({ ...baseData, ...sectionData });
  }

  return NextResponse.json({
    export: {
      data: exportData,
      count: exportData.length,
      columns: exportData.length > 0 ? Object.keys(exportData[0]) : [],
    },
  });
}

async function getAggregatedAnalytics(whereClause: any) {
  // Get all responses with section data
  const responses = await prisma.survey_response.findMany({
    where: whereClause,
    include: {
      barangay: true,
      survey_section: true,
    },
  });

  // Aggregate section responses
  const sectionAggregations: any = {};
  const questionAggregations: any = {};

  responses.forEach((response) => {
    response.survey_section.forEach((section) => {
      if (!sectionAggregations[section.section_key]) {
        sectionAggregations[section.section_key] = {
          name: section.section_name,
          totalResponses: 0,
          completedResponses: 0,
          questions: {},
        };
      }

      sectionAggregations[section.section_key].totalResponses++;

      if (section.status === "completed") {
        sectionAggregations[section.section_key].completedResponses++;
      }

      if (section.data) {
        try {
          const sectionData = JSON.parse(section.data);
          Object.keys(sectionData).forEach((questionKey) => {
            const fullKey = `${section.section_key}_${questionKey}`;

            if (!questionAggregations[fullKey]) {
              questionAggregations[fullKey] = {
                section: section.section_key,
                question: questionKey,
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
          // Handle non-JSON data
        }
      }
    });
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

  return NextResponse.json({
    aggregated: {
      sections: sectionAggregations,
      questions: questionAggregations,
      totalResponses: responses.length,
    },
  });
}
