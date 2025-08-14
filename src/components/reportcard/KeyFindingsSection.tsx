"use client";

interface Finding {
  text: string;
  quote?: string;
}

interface KeyFindingsSectionProps {
  priorityAreas: Finding[];
  keyStrengths: Finding[];
  className?: string;
}

export default function KeyFindingsSection({ 
  priorityAreas, 
  keyStrengths, 
  className = "" 
}: KeyFindingsSectionProps) {
  return (
    <div className={`bg-white px-6 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide mb-8 text-center">
          Key Findings & Citizen Voice
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Priority Areas for Action */}
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-6">
              Priority Areas for Action
            </h3>
            <ul className="space-y-4">
              {priorityAreas.map((area, index) => (
                <li key={index} className="flex flex-col space-y-2">
                  <div className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">•</span>
                    <span className="text-gray-800 font-medium">{area.text}</span>
                  </div>
                  {area.quote && (
                    <blockquote className="ml-4 pl-4 border-l-2 border-red-300 italic text-gray-700 text-sm">
                      "{area.quote}"
                    </blockquote>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Strengths to Maintain */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-6">
              Key Strengths to Maintain
            </h3>
            <ul className="space-y-4">
              {keyStrengths.map((strength, index) => (
                <li key={index} className="flex flex-col space-y-2">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-gray-800 font-medium">{strength.text}</span>
                  </div>
                  {strength.quote && (
                    <blockquote className="ml-4 pl-4 border-l-2 border-green-300 italic text-gray-700 text-sm">
                      "{strength.quote}"
                    </blockquote>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}