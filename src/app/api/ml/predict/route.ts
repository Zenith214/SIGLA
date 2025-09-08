import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Path to the Python script
const ML_SCRIPT_PATH = path.join(process.cwd(), 'ml', 'predict.py');

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Create a temporary JSON file to pass data to Python
    const tempInputPath = path.join(process.cwd(), 'temp_input.json');
    const tempOutputPath = path.join(process.cwd(), 'temp_output.json');
    
    // Write input data to temporary file
    fs.writeFileSync(tempInputPath, JSON.stringify(body));
    
    // Execute the Python script
    const command = `python ${ML_SCRIPT_PATH} --input ${tempInputPath} --output ${tempOutputPath}`;
    await execAsync(command);
    
    // Read the results
    const resultJson = fs.readFileSync(tempOutputPath, 'utf-8');
    const result = JSON.parse(resultJson);
    
    // Clean up temporary files
    fs.unlinkSync(tempInputPath);
    fs.unlinkSync(tempOutputPath);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in ML prediction:', error);
    return NextResponse.json(
      { error: 'Failed to process ML prediction' },
      { status: 500 }
    );
  }
}