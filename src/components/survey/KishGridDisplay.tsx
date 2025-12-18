"use client";

import { Users, CheckCircle } from "lucide-react";

interface HouseholdMember {
  name: string;
  birthdate: string;
  gender: string;
  age: number;
}

interface KishGridDisplayProps {
  members: HouseholdMember[];
  selectedIndex: number;
  questionnaireNumber: string;
  lookupRow?: number;
  lookupColumn?: number;
  gridValue?: number;
}

// Official CSIS Kish Grid (12 rows × 10 columns)
const KISH_GRID_TABLE: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],           // 1 eligible member
  [1, 2, 1, 1, 2, 2, 1, 1, 2, 2],           // 2 eligible members
  [1, 2, 3, 1, 2, 3, 1, 2, 3, 1],           // 3 eligible members
  [1, 2, 3, 4, 1, 2, 3, 4, 1, 2],           // 4 eligible members
  [1, 2, 3, 4, 5, 1, 2, 3, 4, 5],           // 5 eligible members
  [1, 2, 3, 4, 5, 6, 1, 2, 3, 4],           // 6 eligible members
  [1, 2, 3, 4, 5, 6, 7, 1, 2, 3],           // 7 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 1, 2],           // 8 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 1],           // 9 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],          // 10 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],          // 11 eligible members (capped at 10)
  [1, 3, 7, 5, 6, 4, 8, 10, 12, 9]          // 12+ eligible members
];

/**
 * Extract numeric questionnaire number from full survey number
 */
const extractQuestionnaireNumber = (surveyNumber: string): number => {
  if (surveyNumber.includes('-')) {
    const parts = surveyNumber.split('-')
    if (parts.length === 3) {
      return parseInt(parts[2], 10)
    }
  }
  return parseInt(surveyNumber, 10)
}

export function KishGridDisplay({
  members,
  selectedIndex,
  questionnaireNumber,
  lookupRow: providedLookupRow,
  lookupColumn: providedLookupColumn,
  gridValue: providedGridValue,
}: KishGridDisplayProps) {
  // Use provided values if available, otherwise calculate
  let numericQuestionnaire: number;
  let lookupColumn: number;
  let lookupRow: number;
  let gridValue: number;
  
  if (providedLookupRow && providedLookupColumn && providedGridValue) {
    // Use the actual values from the selection result
    lookupRow = providedLookupRow;
    lookupColumn = providedLookupColumn;
    gridValue = providedGridValue;
    numericQuestionnaire = lookupColumn; // For display purposes
  } else {
    // Fallback: calculate from questionnaire number
    numericQuestionnaire = extractQuestionnaireNumber(questionnaireNumber);
    
    // Calculate lookup column (1-10)
    lookupColumn = numericQuestionnaire % 10;
    if (lookupColumn === 0) lookupColumn = 10;
    
    // Calculate lookup row (1-12, capped)
    lookupRow = members.length;
    if (lookupRow > 12) lookupRow = 12;
    
    // Get grid value
    gridValue = KISH_GRID_TABLE[lookupRow - 1][lookupColumn - 1];
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          CSIS Kish Grid Selection
        </h4>
        <p className="text-sm text-blue-700 mb-3">
          Using the official DILG CSIS Kish Grid methodology for standardized random selection
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2 rounded">
            <span className="text-gray-600">Questionnaire #:</span>
            <span className="font-semibold text-gray-900 ml-1">{numericQuestionnaire}</span>
          </div>
          <div className="bg-white p-2 rounded">
            <span className="text-gray-600">Lookup Column:</span>
            <span className="font-semibold text-gray-900 ml-1">{lookupColumn}</span>
          </div>
          <div className="bg-white p-2 rounded">
            <span className="text-gray-600">Eligible Members:</span>
            <span className="font-semibold text-gray-900 ml-1">{members.length}</span>
          </div>
          <div className="bg-white p-2 rounded">
            <span className="text-gray-600">Lookup Row:</span>
            <span className="font-semibold text-gray-900 ml-1">{lookupRow}</span>
          </div>
        </div>
      </div>

      {/* Kish Grid Matrix Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Kish Grid Matrix (12×10)</h4>
        <div className="inline-block min-w-full">
          {/* Column headers */}
          <div className="flex mb-1">
            <div className="w-12 text-xs font-medium text-gray-500 flex items-center justify-center">
              Row
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((col) => (
              <div
                key={col}
                className={`w-10 h-8 text-xs font-medium flex items-center justify-center ${
                  col === lookupColumn ? 'bg-blue-100 text-blue-900' : 'text-gray-500'
                }`}
              >
                {col}
              </div>
            ))}
          </div>
          
          {/* Grid rows */}
          {KISH_GRID_TABLE.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              <div
                className={`w-12 h-8 text-xs font-medium flex items-center justify-center ${
                  rowIndex + 1 === lookupRow ? 'bg-blue-100 text-blue-900' : 'text-gray-500'
                }`}
              >
                {rowIndex + 1}
              </div>
              {row.map((cell, colIndex) => {
                const isSelected = rowIndex + 1 === lookupRow && colIndex + 1 === lookupColumn;
                return (
                  <div
                    key={colIndex}
                    className={`w-10 h-8 text-xs flex items-center justify-center border border-gray-200 ${
                      isSelected
                        ? 'bg-green-500 text-white font-bold'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Selected cell (Row {lookupRow}, Column {lookupColumn}): <span className="font-semibold text-green-600">{gridValue}</span>
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Eligible Household Members (18+)</h4>
        {members.map((member, index) => {
          const isSelected = index === selectedIndex;
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {member.name}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Age: {member.age} • Gender: {member.gender}
                  </div>
                </div>
                {isSelected && (
                  <div className="ml-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> The respondent is automatically selected using the official CSIS Kish Grid
          methodology to ensure random and unbiased selection. This selection cannot be changed.
        </p>
      </div>
    </div>
  );
}
