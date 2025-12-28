"use client";

import React from 'react';

interface ServiceAreaDetail {
  key: string;
  label: string;
  score: number;
  need: number;
  quadrant: string;
  funnel?: {
    awareness: number;
    availment: number;
    satisfaction: number;
    bottleneck?: string;
    awareness_metrics?: {
      count: number;
      total: number;
    };
    availment_metrics?: {
      count: number;
      total: number;
    };
    satisfaction_metrics?: {
      count: number;
      total: number;
    };
    concerns?: string[];
    quotes?: {
      awareness?: string;
      availment?: string;
      satisfaction?: string;
    };
  };
  conditionalReasons?: {
    unawarenessReasons?: Array<{ reason: string; count: number }>;
    nonAvailmentReasons?: Array<{ reason: string; count: number }>;
  };
  recommendations?: {
    shortTerm?: string[];
    mediumTerm?: string[];
    longTerm?: string[];
  };
}

interface ComprehensivePrintViewProps {
  barangayName: string;
  cycleName: string;
  executiveSummary: any;
  serviceAreas: ServiceAreaDetail[];
  communityVoice: any;
  actionGrid: any;
  overallSatisfaction: number;
}

export function ComprehensivePrintView({
  barangayName,
  cycleName,
  executiveSummary,
  serviceAreas,
  communityVoice,
  actionGrid,
  overallSatisfaction
}: ComprehensivePrintViewProps) {
  // Debug logging
  console.log('📄 [PRINT VIEW] Rendering with data:', {
    barangayName,
    cycleName,
    hasExecutiveSummary: !!executiveSummary,
    executiveSummaryIncomplete: executiveSummary?.surveyIncomplete,
    serviceAreasCount: serviceAreas?.length,
    hasCommunityVoice: !!communityVoice,
    hasActionGrid: !!actionGrid
  });
  
  // Log first service area to see structure
  if (serviceAreas && serviceAreas.length > 0) {
    console.log('📄 [PRINT VIEW] First service area:', serviceAreas[0]);
  }
  
  return (
    <div className="comprehensive-print-view hidden print:block">
      <style jsx global>{`
        @media print {
          .comprehensive-print-view {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .print-page-break {
            page-break-after: always;
          }
          
          .print-avoid-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Title Page */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-center mb-4">
          Brgy {barangayName} Score Card
        </h1>
        <h2 className="text-xl text-center mb-4 text-gray-700">
          {cycleName}
        </h2>
        <div className="text-center text-4xl font-bold mb-4">
          Overall Satisfaction: {overallSatisfaction.toFixed(2)}%
        </div>
      </div>

      {/* Executive Summary */}
      {executiveSummary && !executiveSummary.surveyIncomplete && executiveSummary.executiveSummary && (
        <div className="print-avoid-break mb-6">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">
            Executive Summary
          </h2>
          <p className="mb-4 text-justify leading-relaxed">
            {executiveSummary.executiveSummary}
          </p>
          
          {executiveSummary.keyFindings && executiveSummary.keyFindings.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Key Findings:</h3>
              <ul className="list-disc ml-6 space-y-1">
                {executiveSummary.keyFindings.map((finding: string, idx: number) => (
                  <li key={idx}>{finding}</li>
                ))}
              </ul>
            </div>
          )}

          {executiveSummary.criticalIssues && executiveSummary.criticalIssues.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Critical Issues:</h3>
              <ul className="list-disc ml-6 space-y-1">
                {executiveSummary.criticalIssues.map((issue: any, idx: number) => (
                  <li key={idx}>
                    <strong>{issue.issue}</strong> - {issue.impact}
                    {issue.area && ` (${issue.area})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Service Performance - Detailed */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b-2 border-black pb-2">
          Service Performance
        </h2>

        {serviceAreas && serviceAreas.length > 0 ? (
          serviceAreas.map((service, index) => (
            <div key={service.key} className="mb-8 print-avoid-break">
              <h3 className="text-xl font-bold mb-3 bg-gray-100 p-2">
                {index + 1}. {service.label}
              </h3>
            
            {/* Scores */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border border-black p-3">
                <div className="text-sm text-gray-600">Overall Satisfaction</div>
                <div className="text-2xl font-bold">{service.score.toFixed(2)}%</div>
              </div>
              <div className="border border-black p-3">
                <div className="text-sm text-gray-600">Need for Action</div>
                <div className="text-2xl font-bold">{service.need.toFixed(2)}%</div>
              </div>
            </div>

            {/* Service Funnel Analysis - Detailed with Counts */}
            {service.funnel && (
              <div className="mb-4">
                <h4 className="font-semibold mb-3">Service Funnel Analysis:</h4>
                <div className="space-y-2">
                  {/* Awareness */}
                  <div className="bg-blue-100 p-3 rounded border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-blue-900">Awareness</span>
                      <span className="text-xl font-bold text-blue-900">{service.funnel.awareness.toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      {service.funnel.awareness_metrics ? (
                        <>
                          <strong>{service.funnel.awareness_metrics.count} out of {service.funnel.awareness_metrics.total}</strong> residents know about the service.
                        </>
                      ) : (
                        'Residents who know about the service.'
                      )}
                    </p>
                  </div>

                  {/* Availment */}
                  <div className="bg-green-100 p-3 rounded border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-green-900">Availment</span>
                      <span className="text-xl font-bold text-green-900">{service.funnel.availment.toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-green-800">
                      {service.funnel.availment_metrics && service.funnel.awareness_metrics ? (
                        <>
                          <strong>{service.funnel.availment_metrics.count} out of {service.funnel.awareness_metrics.count}</strong> aware residents actually used the service.
                        </>
                      ) : (
                        'Aware residents who actually used the service.'
                      )}
                    </p>
                  </div>

                  {/* Satisfaction */}
                  <div className="bg-purple-100 p-3 rounded border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-purple-900">Satisfaction</span>
                      <span className="text-xl font-bold text-purple-900">{(service.funnel.satisfaction || service.score).toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-purple-800">
                      {service.funnel.satisfaction_metrics && service.funnel.availment_metrics ? (
                        <>
                          <strong>{service.funnel.satisfaction_metrics.count} out of {service.funnel.availment_metrics.count}</strong> users were satisfied with the service.
                        </>
                      ) : (
                        'Users who were satisfied with the service.'
                      )}
                    </p>
                  </div>

                  {/* Skipped */}
                  <div className="bg-red-100 p-3 rounded border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-red-900">Skipped</span>
                      <span className="text-xl font-bold text-red-900">{(100 - service.funnel.awareness).toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-red-800">
                      {service.funnel.awareness_metrics ? (
                        <>
                          <strong>{service.funnel.awareness_metrics.total - service.funnel.awareness_metrics.count} out of {service.funnel.awareness_metrics.total}</strong> residents have no awareness of the service.
                        </>
                      ) : (
                        'Residents with no awareness of the service.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Bottleneck Analysis */}
            {service.funnel && service.funnel.bottleneck && (
              <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-3">
                <h4 className="font-semibold text-yellow-800 mb-2">🤖 AI Analysis: Bottleneck Identified</h4>
                <p className="text-sm text-yellow-700">
                  {(() => {
                    const bottleneck = service.funnel.bottleneck;
                    const awarenessMetrics = service.funnel.awareness_metrics;
                    const availmentMetrics = service.funnel.availment_metrics;
                    const satisfactionMetrics = service.funnel.satisfaction_metrics;
                    
                    if (bottleneck === 'awareness' && awarenessMetrics) {
                      const unaware = awarenessMetrics.total - awarenessMetrics.count;
                      return `The main bottleneck is in awareness. Only ${awarenessMetrics.count} out of ${awarenessMetrics.total} residents know about the service, leaving ${unaware} residents unaware. Focus on information campaigns and outreach programs.`;
                    } else if (bottleneck === 'availment' && availmentMetrics && awarenessMetrics) {
                      const notAvailed = awarenessMetrics.count - availmentMetrics.count;
                      return `The main bottleneck is in availment. While ${awarenessMetrics.count} residents are aware, only ${availmentMetrics.count} actually used the service (${notAvailed} aware residents did not avail). Improve service accessibility and reduce barriers to usage.`;
                    } else if (bottleneck === 'satisfaction' && satisfactionMetrics && availmentMetrics) {
                      const dissatisfied = availmentMetrics.count - satisfactionMetrics.count;
                      return `The main bottleneck is in satisfaction. While ${availmentMetrics.count} residents used the service, a significant portion (${dissatisfied} out of ${availmentMetrics.count}) were not satisfied. Enhance service quality and address user concerns.`;
                    } else {
                      return `The main bottleneck is in ${bottleneck}. ${
                        bottleneck === 'awareness' ? 'Focus on information campaigns and outreach programs.' :
                        bottleneck === 'availment' ? 'Improve service accessibility and reduce barriers to usage.' :
                        'Enhance service quality and address user concerns.'
                      }`;
                    }
                  })()}
                </p>
                <p className="text-xs text-yellow-600 italic mt-2">
                  Note: AI analysis is experimental and may occasionally produce incorrect or misleading insights. Always cross-reference with the raw data.
                </p>
              </div>
            )}

            {/* Conditional Insights */}
            {service.conditionalReasons && (
              <div className="mb-4">
                <h4 className="font-semibold mb-3">Conditional Insights:</h4>
                
                {((service.conditionalReasons.unawarenessReasons?.length ?? 0) > 0 || (service.conditionalReasons.nonAvailmentReasons?.length ?? 0) > 0) ? (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Unawareness Reasons */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                      <h5 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-1">
                        <span>📢</span> Top Unawareness Reasons
                      </h5>
                      <p className="text-xs text-blue-600 mb-2">Why residents don't know about this service</p>
                      {service.conditionalReasons.unawarenessReasons && service.conditionalReasons.unawarenessReasons.length > 0 ? (
                        <div className="space-y-1">
                          {service.conditionalReasons.unawarenessReasons.slice(0, 3).map((item: {reason: string, count: number}, i: number) => (
                            <div key={i} className="text-xs">
                              <span className="font-semibold">{i + 1}.</span> {item.reason}
                              <span className="text-blue-600 ml-1">({item.count} {item.count === 1 ? 'mention' : 'mentions'})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-blue-700 italic">No unawareness reasons reported.</p>
                      )}
                    </div>

                    {/* Non-Availment Reasons */}
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3">
                      <h5 className="font-semibold text-orange-800 text-sm mb-2 flex items-center gap-1">
                        <span>🚫</span> Top Non-Availment Reasons
                      </h5>
                      <p className="text-xs text-orange-600 mb-2">Why aware residents don't use this service</p>
                      {service.conditionalReasons.nonAvailmentReasons && service.conditionalReasons.nonAvailmentReasons.length > 0 ? (
                        <div className="space-y-1">
                          {service.conditionalReasons.nonAvailmentReasons.slice(0, 3).map((item: {reason: string, count: number}, i: number) => (
                            <div key={i} className="text-xs">
                              <span className="font-semibold">{i + 1}.</span> {item.reason}
                              <span className="text-orange-600 ml-1">({item.count} {item.count === 1 ? 'mention' : 'mentions'})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-orange-700 italic">No non-availment reasons reported.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-600 text-center">
                      No conditional insights data available for this service area.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Top 3 Citizen Concerns */}
            {service.funnel?.concerns && service.funnel.concerns.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Top 3 Citizen Concerns:</h4>
                <div className="space-y-2">
                  {service.funnel.concerns.slice(0, 3).map((concern, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">{i + 1}</span>
                      <span className="text-sm">{concern}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Public Perception - Resident Quotes */}
            {service.funnel?.quotes && Object.keys(service.funnel.quotes).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Public Perception:</h4>
                <div className="space-y-2">
                  {service.funnel.quotes.awareness && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2">
                      <div className="text-xs font-medium text-blue-600 mb-1">AWARENESS STAGE</div>
                      <p className="text-sm italic">"{service.funnel.quotes.awareness}"</p>
                    </div>
                  )}
                  {service.funnel.quotes.availment && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-2">
                      <div className="text-xs font-medium text-green-600 mb-1">AVAILMENT STAGE</div>
                      <p className="text-sm italic">"{service.funnel.quotes.availment}"</p>
                    </div>
                  )}
                  {service.funnel.quotes.satisfaction && (
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-2">
                      <div className="text-xs font-medium text-purple-600 mb-1">SATISFACTION STAGE</div>
                      <p className="text-sm italic">"{service.funnel.quotes.satisfaction}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {service.recommendations && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Recommendations:</h4>
                
                {service.recommendations.shortTerm && service.recommendations.shortTerm.length > 0 && (
                  <div className="mb-2">
                    <div className="text-sm font-medium">Short-term (0-3 months):</div>
                    <ul className="text-sm ml-4 list-disc">
                      {service.recommendations.shortTerm.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.recommendations.mediumTerm && service.recommendations.mediumTerm.length > 0 && (
                  <div className="mb-2">
                    <div className="text-sm font-medium">Medium-term (3-12 months):</div>
                    <ul className="text-sm ml-4 list-disc">
                      {service.recommendations.mediumTerm.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.recommendations.longTerm && service.recommendations.longTerm.length > 0 && (
                  <div>
                    <div className="text-sm font-medium">Long-term (1+ years):</div>
                    <ul className="text-sm ml-4 list-disc">
                      {service.recommendations.longTerm.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Grid Classification - Moved to bottom */}
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="text-xs text-gray-600">
                Action Grid Classification: <span className="font-semibold text-gray-800">{service.quadrant}</span>
              </div>
            </div>
          </div>
        ))
        ) : (
          <div className="p-4 bg-gray-50 rounded text-center text-gray-600">
            <p>No service area data available for printing.</p>
          </div>
        )}
      </div>

      {/* Community Voice */}
      {communityVoice && !communityVoice.surveyIncomplete && communityVoice.total_comments > 0 && (
        <div className="mb-8 print-page-break">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">
            Community Voice
          </h2>
          
          <p className="text-sm text-gray-600 mb-4">
            {communityVoice.total_comments} comments analyzed
          </p>

          {/* Top Insights */}
          {communityVoice.insights && communityVoice.insights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Key Insights:</h3>
              <div className="space-y-3">
                {communityVoice.insights.slice(0, 3).map((insight: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg border-l-4 print-avoid-break ${
                      insight.priority === 'high' ? 'bg-red-50 border-red-400' :
                      insight.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <h4 className={`font-semibold mb-2 ${
                      insight.priority === 'high' ? 'text-red-800' :
                      insight.priority === 'medium' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm mb-2 ${
                      insight.priority === 'high' ? 'text-red-700' :
                      insight.priority === 'medium' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {insight.description}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-600' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {insight.priority} priority
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment Distribution */}
          {communityVoice.categories?.percentages && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Overall Sentiment:</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="border-2 border-green-600 p-4 text-center rounded">
                  <div className="text-sm text-green-700 mb-1">Positive</div>
                  <div className="text-3xl font-bold text-green-600">
                    {communityVoice.categories.percentages.positive || 0}%
                  </div>
                </div>
                <div className="border-2 border-gray-600 p-4 text-center rounded">
                  <div className="text-sm text-gray-700 mb-1">Neutral</div>
                  <div className="text-3xl font-bold text-gray-600">
                    {communityVoice.categories.percentages.neutral || 0}%
                  </div>
                </div>
                <div className="border-2 border-red-600 p-4 text-center rounded">
                  <div className="text-sm text-gray-700 mb-1">Negative</div>
                  <div className="text-3xl font-bold text-red-600">
                    {communityVoice.categories.percentages.negative || 0}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sample Comments */}
          {communityVoice.sample_comments && communityVoice.sample_comments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Sample Community Feedback:</h3>
              <div className="space-y-2">
                {communityVoice.sample_comments.slice(0, 3).map((comment: string, idx: number) => {
                  const displayComment = comment === 'conditional_skip' || comment === '*conditional_skip*' ? 'N/A' : comment;
                  return (
                    <div key={idx} className="p-3 bg-gray-50 rounded border-l-2 border-gray-300">
                      <p className="text-sm italic text-gray-700">
                        {displayComment === 'N/A' ? displayComment : `"${displayComment}"`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Grid */}
      {actionGrid && (
        <div className="print-page-break">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">
            Action Grid
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Fix Now */}
            <div className="border-2 border-red-600 p-4 print-avoid-break">
              <h3 className="font-bold text-center mb-3 text-red-800">FIX NOW</h3>
              <p className="text-xs text-center mb-2">High Need, Low Satisfaction</p>
              <ul className="text-sm space-y-1">
                {serviceAreas
                  .filter(s => s.quadrant === 'FIX_NOW')
                  .map(s => (
                    <li key={s.key}>• {s.label}</li>
                  ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="border-2 border-yellow-600 p-4 print-avoid-break">
              <h3 className="font-bold text-center mb-3 text-yellow-800">OPPORTUNITIES</h3>
              <p className="text-xs text-center mb-2">High Need, High Satisfaction</p>
              <ul className="text-sm space-y-1">
                {serviceAreas
                  .filter(s => s.quadrant === 'OPPORTUNITIES')
                  .map(s => (
                    <li key={s.key}>• {s.label}</li>
                  ))}
              </ul>
            </div>

            {/* Monitor */}
            <div className="border-2 border-blue-600 p-4 print-avoid-break">
              <h3 className="font-bold text-center mb-3 text-blue-800">MONITOR</h3>
              <p className="text-xs text-center mb-2">Low Need, Low Satisfaction</p>
              <ul className="text-sm space-y-1">
                {serviceAreas
                  .filter(s => s.quadrant === 'MONITOR')
                  .map(s => (
                    <li key={s.key}>• {s.label}</li>
                  ))}
              </ul>
            </div>

            {/* Maintain */}
            <div className="border-2 border-green-600 p-4 print-avoid-break">
              <h3 className="font-bold text-center mb-3 text-green-800">MAINTAIN</h3>
              <p className="text-xs text-center mb-2">Low Need, High Satisfaction</p>
              <ul className="text-sm space-y-1">
                {serviceAreas
                  .filter(s => s.quadrant === 'MAINTAIN')
                  .map(s => (
                    <li key={s.key}>• {s.label}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
