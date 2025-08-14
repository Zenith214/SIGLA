"use client";

interface AISummarySectionProps {
  summary: string;
  className?: string;
}

export default function AISummarySection({ summary, className = "" }: AISummarySectionProps) {
  return (
    <div className={`bg-white px-6 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide mb-4">
            AI Generated Summary and Insights
          </h2>
          <hr className="border-gray-300" />
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed text-justify text-base lg:text-lg">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}