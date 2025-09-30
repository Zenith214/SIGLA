import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';

// Convert exec to Promise-based
const execAsync = promisify(exec);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_SUPABASE_POSTGRES_URL,
});

/**
 * This API route checks if any survey targets have been fully met (100%)
 * and triggers the ML analysis process for those barangays.
 */
export async function GET(req: NextRequest) {
  let client;
  
  try {
    client = await pool.connect();
    
    // Get all survey targets that are at 100% completion
    const completedTargetsQuery = `
      SELECT st.*, b.barangay_name 
      FROM survey_target st
      JOIN barangay b ON st.barangay_id = b.barangay_id
      WHERE st.percentage >= 100 AND st.analyzed = false
    `;
    
    const completedTargetsResult = await client.query(completedTargetsQuery);
    const completedTargets = completedTargetsResult.rows;
    
    if (completedTargets.length === 0) {
      return NextResponse.json({
        message: "No newly completed survey targets found",
        analyzed: 0
      });
    }
    
    // Process each completed target
    const analysisResults = [];
    
    for (const target of completedTargets) {
      try {
        // Call the ML analysis process for this barangay
        const pythonScriptPath = process.env.NODE_ENV === 'production' 
          ? '/var/www/html/SIGLA-2/ml/analyze_barangay.py'
          : 'c:/xampp/htdocs/SIGLA-2/ml/analyze_barangay.py';
        
        const { stdout, stderr } = await execAsync(`python ${pythonScriptPath} --barangay_id ${target.barangay_id}`);
        
        if (stderr) {
          console.error(`Error analyzing barangay ${target.barangay_id}:`, stderr);
          analysisResults.push({
            barangay_id: target.barangay_id,
            barangay_name: target.barangay_name,
            success: false,
            error: stderr
          });
          continue;
        }
        
        // Mark this target as analyzed
        await client.query(
          'UPDATE survey_target SET analyzed = true, analysis_date = NOW() WHERE target_id = $1',
          [target.target_id]
        );
        
        // Parse the analysis results
        const analysisResult = JSON.parse(stdout);
        
        analysisResults.push({
          barangay_id: target.barangay_id,
          barangay_name: target.barangay_name,
          success: true,
          result: analysisResult
        });
        
        console.log(`✅ Successfully analyzed barangay ${target.barangay_name} (ID: ${target.barangay_id})`);
      } catch (error: any) {
        console.error(`Error processing barangay ${target.barangay_id}:`, error);
        analysisResults.push({
          barangay_id: target.barangay_id,
          barangay_name: target.barangay_name,
          success: false,
          error: error?.message || 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      message: `Analyzed ${analysisResults.filter(r => r.success).length} completed survey targets`,
      analyzed: analysisResults.filter(r => r.success).length,
      results: analysisResults
    });
    
  } catch (error) {
    console.error("Error checking survey target completion:", error);
    return NextResponse.json(
      { error: "Failed to check survey target completion" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}