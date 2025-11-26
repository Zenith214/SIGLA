import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// In-memory cache for ML predictions
interface CacheEntry {
  data: any;
  timestamp: number;
}

const predictionCache = new Map<string, CacheEntry>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(barangayId: string): string {
  return `ml-predict-${barangayId}`;
}

function getCachedPrediction(barangayId: string): any | null {
  const key = getCacheKey(barangayId);
  const entry = predictionCache.get(key);
  
  if (!entry) return null;
  
  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    predictionCache.delete(key);
    return null;
  }
  
  console.log(`✅ Cache hit for ML prediction: barangay ${barangayId}`);
  return entry.data;
}

function setCachedPrediction(barangayId: string, data: any): void {
  const key = getCacheKey(barangayId);
  predictionCache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 Cached ML prediction for barangay ${barangayId}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barangayId } = body;

    if (!barangayId) {
      return NextResponse.json(
        { error: "barangayId is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedResult = getCachedPrediction(barangayId);
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true
      });
    }

    // Call the ML analysis Python script
    const mlScriptPath = path.join(process.cwd(), 'ml', 'analyze_barangay.py');
    
    // Use the virtual environment's Python interpreter
    const venvPython = process.platform === 'win32' 
      ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
      : path.join(process.cwd(), '.venv', 'bin', 'python');
    const pythonCommand = `"${venvPython}" "${mlScriptPath}" --barangay_id ${barangayId}`;

    console.log(`Running ML analysis for barangay ${barangayId}...`);
    
    const { stdout, stderr } = await execAsync(pythonCommand);

    if (stderr) {
      console.error('ML Prediction Error:', stderr);
    }

    let predictions;
    try {
      predictions = JSON.parse(stdout);
    } catch (parseError) {
      console.error('Failed to parse ML predictions:', parseError);
      return NextResponse.json(
        { error: "Failed to parse ML prediction results" },
        { status: 500 }
      );
    }

    const result = {
      barangay_id: parseInt(barangayId),
      model_type: predictions?.model_type || 'unknown',
      predictions: predictions,
      timestamp: new Date().toISOString()
    };

    // Cache the result
    setCachedPrediction(barangayId, result);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in ML prediction:", error);
    return NextResponse.json(
      { error: "Failed to generate ML predictions" },
      { status: 500 }
    );
  }
}

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

    // Check cache first
    const cachedResult = getCachedPrediction(barangayId);
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true
      });
    }

    // Call the ML analysis Python script
    const mlScriptPath = path.join(process.cwd(), 'ml', 'analyze_barangay.py');
    
    // Use the virtual environment's Python interpreter
    const venvPython = process.platform === 'win32' 
      ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
      : path.join(process.cwd(), '.venv', 'bin', 'python');
    const pythonCommand = `"${venvPython}" "${mlScriptPath}" --barangay_id ${barangayId}`;

    console.log(`Running ML analysis for barangay ${barangayId}...`);
    
    const { stdout, stderr } = await execAsync(pythonCommand);

    if (stderr) {
      console.error('ML Prediction Error:', stderr);
    }

    let predictions;
    try {
      predictions = JSON.parse(stdout);
    } catch (parseError) {
      console.error('Failed to parse ML predictions:', parseError);
      return NextResponse.json(
        { error: "Failed to parse ML prediction results" },
        { status: 500 }
      );
    }

    const result = {
      barangay_id: parseInt(barangayId),
      model_type: predictions?.model_type || 'unknown',
      predictions: predictions,
      timestamp: new Date().toISOString()
    };

    // Cache the result
    setCachedPrediction(barangayId, result);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in ML prediction:", error);
    return NextResponse.json(
      { error: "Failed to generate ML predictions" },
      { status: 500 }
    );
  }
}