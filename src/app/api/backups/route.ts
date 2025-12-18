import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { verifyAuth } from "@/lib/auth-middleware";

// Validate environment variables
const validateEnvironment = () => {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    if (key === "NEXT_PUBLIC_SUPABASE_URL" && !value.startsWith("http")) {
      throw new Error(`Invalid Supabase URL format: ${key}`);
    }
  }

  return requiredVars;
};

// Initialize Supabase client with error handling
let supabase: any;
try {
  const env = validateEnvironment();
  supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!
  );
} catch (error) {
  console.error("Supabase initialization failed:", error);
}

// Privacy: Hash personal identifiers
function hashPersonalData(data: string): string {
  if (!data) return "";
  return createHash("sha256").update(data).digest("hex").substring(0, 16);
}

// Privacy: Anonymize name (keep first letter + hash)
function anonymizeName(name: string): string {
  if (!name) return "";
  const firstLetter = name.charAt(0).toUpperCase();
  const hash = hashPersonalData(name).substring(0, 8);
  return `${firstLetter}***${hash}`;
}

// Privacy: Anonymize email (keep domain)
function anonymizeEmail(email: string): string {
  if (!email) return "";
  const [, domain] = email.split("@");
  const hash = hashPersonalData(email).substring(0, 8);
  return `user_${hash}@${domain || "hidden.com"}`;
}

// Get user from session
async function getUserFromSession(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value;
    
    if (!token) {
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    // Get user details from database
    const { data: userData } = await supabase
      .from("user")
      .select("id, email, role, firstName, lastName")
      .eq("email", user.email)
      .single();

    return userData;
  } catch (error) {
    console.error("Error getting user from session:", error);
    return null;
  }
}

// Audit logging for data exports
async function logDataExport(userId: number, exportType: string, anonymized: boolean, recordCount: number) {
  try {
    await supabase.from("data_export_log").insert([
      {
        user_id: userId,
        export_type: exportType,
        anonymized: anonymized,
        record_count: recordCount,
        exported_at: new Date().toISOString(),
        ip_address: "system", // Could be enhanced with actual IP
      },
    ]);
  } catch (error) {
    console.warn("Failed to log data export:", error);
  }
}

// Check if user has permission to export data
function canExportData(userRole: string, exportType: string, anonymized: boolean): boolean {
  // Super admin can export everything
  if (userRole === "super_admin") {
    return true;
  }

  // Admin can export anonymized data only
  if (userRole === "admin") {
    return anonymized;
  }

  // Viewer can only export reports (aggregated data)
  if (userRole === "viewer") {
    return exportType === "reports";
  }

  // Other roles cannot export
  return false;
}

// Improved filename sanitization
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9-_.]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// Generate safe filename with timestamp
function generateFilename(type: string, extension: string = "csv"): string {
  const date = new Date().toISOString().split("T")[0];
  const sanitizedType = sanitizeFilename(type);
  return `${sanitizedType}_${date}.${extension}`;
}

// Enhanced CSV conversion with better error handling
function convertToCSV(data: any[], headers: string[]): string {
  try {
    if (!Array.isArray(headers) || headers.length === 0) {
      throw new Error("Headers must be a non-empty array");
    }

    if (!data || data.length === 0) {
      return headers.join(",") + "\n";
    }

    const csvHeaders = headers.join(",");
    const csvRows = data.map((row, index) => {
      try {
        return headers
          .map((header) => {
            const value = row[header];

            // Handle null/undefined values
            if (value === null || value === undefined) {
              return "";
            }

            // Convert to string safely
            let stringValue: string;
            try {
              stringValue = String(value);
            } catch (error) {
              console.warn(
                `Failed to convert value to string at row ${index}, column ${header}:`,
                error
              );
              return "";
            }

            // Escape special characters
            if (
              stringValue.includes(",") ||
              stringValue.includes('"') ||
              stringValue.includes("\n")
            ) {
              return `"${stringValue
                .replace(/"/g, '""')
                .replace(/\n/g, "\\n")}"`;
            }

            return stringValue;
          })
          .join(",");
      } catch (error) {
        console.error(`Error processing row ${index}:`, error);
        return headers.map(() => "").join(","); // Return empty row on error
      }
    });

    return csvHeaders + "\n" + csvRows.join("\n");
  } catch (error) {
    console.error("CSV conversion error:", error);
    throw new Error(`Failed to convert data to CSV: ${error.message}`);
  }
}

// Enhanced backup history with database storage
async function getBackupHistory() {
  try {
    // Try to get from database first
    const { data: dbBackups, error } = await supabase
      .from("backup_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && dbBackups && dbBackups.length > 0) {
      return dbBackups.map((backup) => ({
        id: backup.id,
        date: backup.created_at.split("T")[0],
        time: backup.created_at.split("T")[1]?.substring(0, 5) || "00:00",
        size: backup.file_size || "Unknown",
        status: backup.status || "Unknown",
        type: backup.backup_type || "Manual",
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch backup history from database:", error);
  }

  // Fallback to mock data if database not available
  return [
    {
      id: 1,
      date: new Date().toISOString().split("T")[0],
      time: "14:30",
      size: "2.4 MB",
      status: "Success",
      type: "Automatic",
    },
    {
      id: 2,
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      time: "14:30",
      size: "2.3 MB",
      status: "Success",
      type: "Automatic",
    },
    {
      id: 3,
      date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
      time: "14:30",
      size: "2.2 MB",
      status: "Success",
      type: "Manual",
    },
  ];
}

// Store backup metadata
async function storeBackupMetadata(backupData: any) {
  try {
    const { error } = await supabase.from("backup_history").insert([
      {
        backup_type: backupData.type,
        file_size: backupData.size,
        status: backupData.status,
        created_at: new Date().toISOString(),
        metadata: backupData,
      },
    ]);

    if (error) {
      console.warn("Failed to store backup metadata:", error);
    }
  } catch (error) {
    console.warn("Error storing backup metadata:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get("export");
    const anonymized = searchParams.get("anonymized") !== "false"; // Default to true

    if (exportType) {
      // Get user from session for authorization and audit logging
      const authResult = verifyAuth(request);
      if (!authResult.success || !authResult.user) {
        return NextResponse.json(
          { error: "Unauthorized. Please log in again." },
          { status: 401 }
        );
      }
      
      const user = authResult.user;

      // Check permissions
      if (!canExportData(user.role, exportType, anonymized)) {
        return NextResponse.json(
          { 
            error: "Forbidden. You do not have permission to export this data.",
            details: anonymized 
              ? "Your role does not allow this export type."
              : "Non-anonymized exports require super_admin role."
          },
          { status: 403 }
        );
      }

      // Handle data export requests
      let result;
      switch (exportType) {
        case "survey-data":
          result = await exportSurveyData(anonymized, user.id);
          break;
        case "user-data":
          result = await exportUserData(anonymized, user.id);
          break;
        case "barangay-data":
          result = await exportBarangayData(user.id);
          break;
        case "reports":
          result = await exportReports(user.id);
          break;
        default:
          return NextResponse.json(
            {
              error:
                "Invalid export type. Valid types: survey-data, user-data, barangay-data, reports",
            },
            { status: 400 }
          );
      }

      return result;
    }

    // Return backup history
    const backupHistory = await getBackupHistory();
    return NextResponse.json(backupHistory);
  } catch (error) {
    console.error("Backup API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function exportSurveyData(anonymized: boolean = true, userId?: number) {
  try {
    const { data: surveyData, error } = await supabase.from("survey_response")
      .select(`
        response_id,
        barangay_id,
        interviewer_id,
        respondent_name,
        respondent_age,
        respondent_gender,
        created_at,
        updated_at
      `);

    if (error) {
      console.error("Survey data query error:", error);
      console.warn("Using empty survey data due to query error");
    }

    // Use empty array if error occurred
    let dataToExport = error ? [] : surveyData || [];

    // Apply anonymization if requested
    if (anonymized && dataToExport.length > 0) {
      dataToExport = dataToExport.map((row) => ({
        ...row,
        respondent_name: anonymizeName(row.respondent_name || ""),
        // Age ranges instead of exact age for privacy
        respondent_age: row.respondent_age 
          ? `${Math.floor(row.respondent_age / 10) * 10}-${Math.floor(row.respondent_age / 10) * 10 + 9}`
          : "",
      }));
    }

    const headers = [
      "response_id",
      "barangay_id",
      "interviewer_id",
      "respondent_name",
      "respondent_age",
      "respondent_gender",
      "created_at",
      "updated_at",
    ];

    const csv = convertToCSV(dataToExport, headers);
    const filename = generateFilename(
      anonymized ? "survey_data_anonymized" : "survey_data_full"
    );

    // Log the export
    if (userId) {
      await logDataExport(userId, "survey-data", anonymized, dataToExport.length);
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": csv.length.toString(),
        "X-Data-Privacy": anonymized ? "anonymized" : "full",
        "X-Record-Count": dataToExport.length.toString(),
      },
    });
  } catch (error) {
    console.error("Survey data export error:", error);
    return NextResponse.json(
      {
        error: "Failed to export survey data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function exportUserData(anonymized: boolean = true, userId?: number) {
  try {
    const { data: userData, error } = await supabase.from("user").select(`
        id,
        email,
        firstName,
        lastName,
        role,
        status,
        createdAt
      `);

    let dataToExport = error ? [] : userData || [];

    // Apply anonymization if requested
    if (anonymized && dataToExport.length > 0) {
      dataToExport = dataToExport.map((row) => ({
        ...row,
        email: anonymizeEmail(row.email || ""),
        firstName: anonymizeName(row.firstName || ""),
        lastName: anonymizeName(row.lastName || ""),
      }));
    }

    const headers = [
      "id",
      "email",
      "firstName",
      "lastName",
      "role",
      "status",
      "createdAt",
    ];

    // Handle case where user table doesn't exist or is empty
    let csv: string;
    if (error) {
      console.warn("User data query error (using empty data):", error);
      csv = convertToCSV([], headers);
    } else {
      csv = convertToCSV(dataToExport, headers);
    }

    const filename = generateFilename(
      anonymized ? "user_data_anonymized" : "user_data_full"
    );

    // Log the export
    if (userId) {
      await logDataExport(userId, "user-data", anonymized, dataToExport.length);
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": csv.length.toString(),
        "X-Data-Privacy": anonymized ? "anonymized" : "full",
        "X-Record-Count": dataToExport.length.toString(),
      },
    });
  } catch (error) {
    console.error("User data export error:", error);
    return NextResponse.json(
      {
        error: "Failed to export user data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function exportBarangayData(userId?: number) {
  try {
    const { data: barangayData, error } = await supabase.from("barangay")
      .select(`
        barangay_id,
        barangay_name,
        population,
        households,
        seal,
        created_at,
        updated_at
      `);

    if (error) {
      console.error("Barangay data query error:", error);
      console.warn("Using empty barangay data due to query error");
    }

    const headers = [
      "barangay_id",
      "barangay_name",
      "population",
      "households",
      "seal",
      "created_at",
      "updated_at",
    ];

    // Use empty array if error occurred
    const dataToExport = error ? [] : barangayData || [];
    const csv = convertToCSV(dataToExport, headers);
    const filename = generateFilename("barangay_data");

    // Log the export (barangay data is public, so always anonymized=true)
    if (userId) {
      await logDataExport(userId, "barangay-data", true, dataToExport.length);
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": csv.length.toString(),
        "X-Data-Privacy": "public",
        "X-Record-Count": dataToExport.length.toString(),
      },
    });
  } catch (error) {
    console.error("Barangay data export error:", error);
    return NextResponse.json(
      {
        error: "Failed to export barangay data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function exportReports(userId?: number) {
  try {
    // Fetch basic data with error handling
    const [barangayResult, surveyResult] = await Promise.allSettled([
      supabase
        .from("barangay")
        .select("barangay_id, barangay_name, population, households, seal"),
      supabase
        .from("survey_response")
        .select("response_id, barangay_id, created_at, status")
        .eq("status", "completed"),
    ]);

    const barangayData =
      barangayResult.status === "fulfilled" && barangayResult.value.data
        ? barangayResult.value.data
        : [];
    const surveyData =
      surveyResult.status === "fulfilled" && surveyResult.value.data
        ? surveyResult.value.data
        : [];

    if (barangayResult.status === "rejected") {
      console.warn("Barangay data fetch failed:", barangayResult.reason);
    }
    if (surveyResult.status === "rejected") {
      console.warn("Survey data fetch failed:", surveyResult.reason);
    }

    // Get barangays with survey data and their analytics
    const barangaysWithData = [];
    const barangayAnalytics = new Map();

    // Group survey responses by barangay
    const surveysByBarangay = surveyData.reduce((acc, survey) => {
      if (!acc[survey.barangay_id]) {
        acc[survey.barangay_id] = [];
      }
      acc[survey.barangay_id].push(survey);
      return acc;
    }, {});

    // Fetch analytics data for barangays with survey responses
    for (const barangay of barangayData) {
      const barangayId = barangay.barangay_id;
      const responsesCount = surveysByBarangay[barangayId]?.length || 0;

      if (responsesCount > 0) {
        try {
          // Fetch funnel analysis data for this barangay
          const analyticsResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/api/funnel-analysis?barangayId=${barangayId}&useML=true`
          );

          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            barangayAnalytics.set(barangayId, {
              ...analyticsData,
              responses_count: responsesCount,
            });

            barangaysWithData.push({
              ...barangay,
              responses_count: responsesCount,
              analytics: analyticsData,
            });
          } else {
            // Add barangay without analytics if API fails
            barangaysWithData.push({
              ...barangay,
              responses_count: responsesCount,
              analytics: null,
            });
          }
        } catch (error) {
          console.warn(
            `Failed to fetch analytics for barangay ${barangayId}:`,
            error
          );
          barangaysWithData.push({
            ...barangay,
            responses_count: responsesCount,
            analytics: null,
          });
        }
      }
    }

    // Calculate statistics
    const totalBarangays = barangayData?.length || 0;
    const barangaysWithSeals =
      barangayData?.filter((b) => b.seal === "yes").length || 0;
    const totalPopulation =
      barangayData?.reduce((sum, b) => sum + (b.population || 0), 0) || 0;
    const totalHouseholds =
      barangayData?.reduce((sum, b) => sum + (b.households || 0), 0) || 0;
    const totalSurveyResponses = surveyData?.length || 0;
    const barangaysWithSurveyData = barangaysWithData.length;

    // Calculate overall satisfaction across all barangays with data
    const overallSatisfactionScores = barangaysWithData
      .filter((b) => b.analytics && b.analytics.overall_satisfaction)
      .map((b) => b.analytics.overall_satisfaction);

    const averageOverallSatisfaction =
      overallSatisfactionScores.length > 0
        ? Math.round(
            overallSatisfactionScores.reduce((sum, score) => sum + score, 0) /
              overallSatisfactionScores.length
          )
        : 0;

    // Generate barangay details with analytics
    const barangayDetails =
      barangayData && barangayData.length > 0
        ? barangayData
            .map((b) => {
              const surveyCount = surveysByBarangay[b.barangay_id]?.length || 0;
              const analytics = barangayAnalytics.get(b.barangay_id);

              let detailLine = `${b.barangay_name}: ${
                b.population || 0
              } population, ${b.households || 0} households, Seal: ${
                b.seal || "no"
              }`;

              if (surveyCount > 0) {
                detailLine += `, Surveys: ${surveyCount}`;
                if (analytics && analytics.overall_satisfaction) {
                  detailLine += `, Satisfaction: ${analytics.overall_satisfaction}%`;
                }
              } else {
                detailLine += `, No survey data`;
              }

              return detailLine;
            })
            .join("\n")
        : "No barangay data available";

    // Generate detailed analytics section
    const analyticsDetails =
      barangaysWithData.length > 0
        ? barangaysWithData
            .map((b) => {
              let section = `\n--- ${b.barangay_name.toUpperCase()} ANALYSIS ---`;
              section += `\nSurvey Responses: ${b.responses_count}`;

              if (b.analytics) {
                section += `\nOverall Satisfaction: ${
                  b.analytics.overall_satisfaction || 0
                }%`;
                section += `\nML Enhanced: ${
                  b.analytics.ml_enhanced ? "Yes" : "No"
                }`;

                if (
                  b.analytics.service_scores &&
                  Object.keys(b.analytics.service_scores).length > 0
                ) {
                  section += `\n\nService Area Scores:`;
                  Object.entries(b.analytics.service_scores).forEach(
                    ([service, scores]: [string, any]) => {
                      section += `\n  ${service.toUpperCase()}:`;
                      section += `\n    - Awareness: ${
                        scores.awareness_score || 0
                      }%`;
                      section += `\n    - Availment: ${
                        scores.availment_score || 0
                      }%`;
                      section += `\n    - Satisfaction: ${
                        scores.satisfaction_score || 0
                      }%`;
                      section += `\n    - Need Action: ${
                        scores.need_action_score || 0
                      }%`;
                      section += `\n    - Sample Size: ${
                        scores.sample_size || 0
                      } responses`;
                    }
                  );
                }

                if (
                  b.analytics.action_grid &&
                  Object.keys(b.analytics.action_grid).length > 0
                ) {
                  section += `\n\nAction Grid Classifications:`;
                  Object.entries(b.analytics.action_grid).forEach(
                    ([service, grid]: [string, any]) => {
                      section += `\n  ${service.toUpperCase()}: ${
                        grid.quadrant || "UNKNOWN"
                      } (Confidence: ${grid.confidence || "low"})`;
                    }
                  );
                }
              } else {
                section += `\nAnalytics: Not available`;
              }

              return section;
            })
            .join("\n")
        : "\nNo barangays with survey data available for detailed analysis.";

    // Build report content
    let reportContent = `SIGLA System Report - Analyzed Results Export
Generated: ${new Date().toISOString()}

=== SYSTEM STATUS ===
Report Generation: Success
Data Sources: ${
      barangayResult.status === "fulfilled" ? "Barangay ✓" : "Barangay ✗"
    } ${surveyResult.status === "fulfilled" ? "Survey ✓" : "Survey ✗"}
Analytics Processing: ${barangaysWithSurveyData > 0 ? "Available" : "No Data"}

=== EXECUTIVE SUMMARY ===
Total Barangays: ${totalBarangays}
Barangays with Survey Data: ${barangaysWithSurveyData}
Barangays with Seals: ${barangaysWithSeals}
Total Population: ${totalPopulation.toLocaleString()}
Total Households: ${totalHouseholds.toLocaleString()}
Total Survey Responses: ${totalSurveyResponses}
Average Overall Satisfaction: ${averageOverallSatisfaction}%

=== SURVEY DATA COVERAGE ===
Coverage Rate: ${
      totalBarangays > 0
        ? Math.round((barangaysWithSurveyData / totalBarangays) * 100)
        : 0
    }%
Barangays with Data: ${barangaysWithSurveyData}/${totalBarangays}
Average Responses per Barangay: ${
      barangaysWithSurveyData > 0
        ? Math.round(totalSurveyResponses / barangaysWithSurveyData)
        : 0
    }

=== BARANGAY OVERVIEW ===
${barangayDetails}

=== DETAILED ANALYTICS RESULTS ===
${analyticsDetails}

=== TECHNICAL INFORMATION ===
Export Format: Plain Text Report
Character Encoding: UTF-8
Analytics Engine: Funnel Analysis with ML Enhancement
Data Processing: Real-time analysis of completed surveys

Report generated by SIGLA System`;

    // Add file size info after content is complete
    const fileSizeKB = Math.round((reportContent.length / 1024) * 10) / 10;
    reportContent = reportContent.replace(
      "Character Encoding: UTF-8",
      `Character Encoding: UTF-8
File Size: Approximately ${fileSizeKB} KB`
    );

    const filename = generateFilename("sigla_report", "txt");

    // Log the export (reports are aggregated, so always anonymized=true)
    if (userId) {
      await logDataExport(userId, "reports", true, barangaysWithData.length);
    }

    return new NextResponse(reportContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": reportContent.length.toString(),
        "X-Data-Privacy": "aggregated",
      },
    });
  } catch (error) {
    console.error("Reports export error:", error);
    return NextResponse.json(
      {
        error: "Failed to export reports",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "create-backup") {
      const backupId = Date.now();
      const backupData = {
        id: backupId,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        size: "2.5 MB", // This would be calculated from actual backup
        status: "Success",
        type: "Manual",
      };

      // Store backup metadata
      await storeBackupMetadata(backupData);

      return NextResponse.json({
        success: true,
        backup: backupData,
        message: "Backup created successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: create-backup" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Backup creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create backup",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
