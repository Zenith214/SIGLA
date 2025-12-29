"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, Shield, AlertTriangle, MessageSquare, FileText } from 'lucide-react';

interface GovernanceData {
  corruptionExperienceRate: number;
  reportingFunnel: {
    experienced: number;
    reported: number;
    satisfied: number;
    experiencedCount: number;
    reportedCount: number;
    satisfiedCount: number;
  };
  topReasonsNotReporting: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  residentVoice: {
    corruptionTypes: Array<{
      type: string;
      count: number;
    }>;
    preventionSuggestions: string[];
  };
  totalRespondents: number;
  detailedResponses: Array<{
    responseNumber: number;
    experienced: string;
    reported: string;
    satisfaction: string;
    corruptionType: string;
    reasonNotReporting: string | null;
    suggestion: string | null;
    details: string | null;
  }>;
}

interface GovernanceIntegritySnapshotProps {
  barangayId: string;
  cycleId: number;
  barangayName: string;
}

export function GovernanceIntegritySnapshot({ barangayId, cycleId, barangayName }: GovernanceIntegritySnapshotProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<GovernanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResponsesModal, setShowResponsesModal] = useState(false);

  const handleToggle = async () => {
    if (!isExpanded && !data && !loading) {
      // Fetch data when expanding for the first time
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/governance-integrity?barangayId=${barangayId}&cycleId=${cycleId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch governance data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'No data available');
        }
      } catch (err) {
        console.error('Error fetching governance data:', err);
        setError('Failed to load governance integrity data');
      } finally {
        setLoading(false);
      }
    }
    
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 print:section">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-700" />
            <CardTitle className="text-red-900 text-base sm:text-lg">
              Governance Integrity Snapshot
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              Admin Only
            </Badge>
          </div>
          <button
            onClick={handleToggle}
            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100 rounded-lg transition-colors print:hidden"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span>Collapse</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Expand</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-red-600 mt-2">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          Confidential: This section contains sensitive governance data and is only visible to administrators.
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2 text-red-700">Loading governance data...</span>
            </div>
          )}

          {error && (
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">No Corruption Data Available</h4>
                  <p className="text-sm text-amber-700">{error}</p>
                  <p className="text-xs text-amber-600 mt-2">
                    <strong>Note:</strong> This section requires corruption-related questions in the Financial Administration 
                    section of the survey. If you're using mock/test data, corruption fields may not be populated yet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {data && !loading && !error && (
            <>
              {/* Corruption Experience Rate KPI */}
              <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Corruption Experience Rate</h4>
                  <div className={`text-4xl font-bold mb-2 ${data.corruptionExperienceRate > 10 ? 'text-red-600' : data.corruptionExperienceRate > 5 ? 'text-orange-600' : 'text-green-600'}`}>
                    {data.corruptionExperienceRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600">
                    {data.reportingFunnel.experiencedCount} out of {data.totalRespondents} residents reported experiencing corruption
                  </p>
                  <Badge 
                    variant={data.corruptionExperienceRate > 10 ? 'destructive' : data.corruptionExperienceRate > 5 ? 'default' : 'outline'}
                    className="mt-2"
                  >
                    {data.corruptionExperienceRate > 10 ? 'High Risk' : data.corruptionExperienceRate > 5 ? 'Moderate Risk' : 'Low Risk'}
                  </Badge>
                </div>
              </div>

              {/* Reporting Funnel */}
              <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                <h4 className="text-sm font-semibold text-red-900 mb-4">Corruption Reporting Funnel</h4>
                <div className="space-y-3">
                  {/* Experienced */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Experienced Corruption</span>
                      <span className="text-sm font-bold text-red-600">
                        {data.reportingFunnel.experiencedCount} ({data.reportingFunnel.experienced.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-red-500"
                        style={{ width: `${data.reportingFunnel.experienced}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Reported */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Reported to Authorities</span>
                      <span className="text-sm font-bold text-orange-600">
                        {data.reportingFunnel.reportedCount} ({data.reportingFunnel.reported.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width: `${data.reportingFunnel.reported}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.reportingFunnel.reported > 0 
                        ? `${((data.reportingFunnel.reportedCount / data.reportingFunnel.experiencedCount) * 100).toFixed(1)}% of those who experienced corruption reported it`
                        : 'No reports filed'}
                    </p>
                  </div>

                  {/* Satisfied with Response */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Satisfied with Response</span>
                      <span className="text-sm font-bold text-green-600">
                        {data.reportingFunnel.satisfiedCount} ({data.reportingFunnel.satisfied.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-green-500"
                        style={{ width: `${data.reportingFunnel.satisfied}%` }}
                      ></div>
                    </div>
                    {data.reportingFunnel.reportedCount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {((data.reportingFunnel.satisfiedCount / data.reportingFunnel.reportedCount) * 100).toFixed(1)}% of reporters were satisfied with the response
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Reasons for Not Reporting */}
              {data.topReasonsNotReporting.length > 0 && (
                <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                  <h4 className="text-sm font-semibold text-red-900 mb-3">Top Reasons for Not Reporting</h4>
                  <div className="space-y-2">
                    {data.topReasonsNotReporting.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Badge variant="outline" className="flex-shrink-0">
                          #{index + 1}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700">{item.reason}</span>
                            <span className="text-xs font-medium text-gray-600">
                              {item.count} ({item.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-red-400"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resident Voice on Corruption */}
              <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Resident Voice on Corruption
                </h4>
                
                {/* Corruption Types Witnessed */}
                {data.residentVoice.corruptionTypes.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Types of Corruption Witnessed:</h5>
                    <div className="flex flex-wrap gap-2">
                      {data.residentVoice.corruptionTypes.map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {item.type} ({item.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prevention Suggestions */}
                {data.residentVoice.preventionSuggestions.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Prevention Suggestions from Residents:</h5>
                    <ul className="space-y-1">
                      {data.residentVoice.preventionSuggestions.slice(0, 5).map((suggestion, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <span className="mr-2">•</span>
                          <span className="italic">"{suggestion}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.residentVoice.corruptionTypes.length === 0 && data.residentVoice.preventionSuggestions.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No specific resident feedback available</p>
                )}
              </div>

              {/* Confidentiality Notice */}
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-xs text-red-700">
                  <strong>Confidentiality Notice:</strong> This data is highly sensitive and should be handled with utmost care. 
                  Use this information to inform anti-corruption strategies and improve governance transparency. 
                  Do not share individual responses or identifying information.
                </p>
              </div>

              {/* View Detailed Responses Button */}
              {data.detailedResponses && data.detailedResponses.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowResponsesModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    View Detailed Responses ({data.detailedResponses.length})
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}

      {/* Detailed Responses Modal */}
      <Dialog open={showResponsesModal} onOpenChange={setShowResponsesModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-900">
              <Shield className="w-5 h-5" />
              Anonymized Corruption Reports - {barangayName}
            </DialogTitle>
            <p className="text-xs text-red-600 mt-2">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Confidential: Respondent names and identifying information have been removed
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {data?.detailedResponses.map((response, index) => (
              <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    Response #{response.responseNumber}
                  </Badge>
                  <Badge 
                    variant={response.reported.toLowerCase().includes('yes') || response.reported.toLowerCase().includes('oo') ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {response.reported.toLowerCase().includes('yes') || response.reported.toLowerCase().includes('oo') ? 'Reported' : 'Not Reported'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {/* Corruption Type */}
                  {response.corruptionType && response.corruptionType !== 'Not specified' && (
                    <div>
                      <span className="font-semibold text-red-900">Type of Corruption:</span>
                      <p className="text-gray-700 ml-4">{response.corruptionType}</p>
                    </div>
                  )}

                  {/* Details */}
                  {response.details && (
                    <div>
                      <span className="font-semibold text-red-900">Details:</span>
                      <p className="text-gray-700 ml-4 italic">"{response.details}"</p>
                    </div>
                  )}

                  {/* Reason for Not Reporting */}
                  {response.reasonNotReporting && (
                    <div>
                      <span className="font-semibold text-red-900">Reason for Not Reporting:</span>
                      <p className="text-gray-700 ml-4">{response.reasonNotReporting}</p>
                    </div>
                  )}

                  {/* Satisfaction (if reported) */}
                  {(response.reported.toLowerCase().includes('yes') || response.reported.toLowerCase().includes('oo')) && 
                   response.satisfaction !== 'Not answered' && (
                    <div>
                      <span className="font-semibold text-red-900">Satisfaction with Response:</span>
                      <p className="text-gray-700 ml-4">{response.satisfaction}</p>
                    </div>
                  )}

                  {/* Prevention Suggestion */}
                  {response.suggestion && (
                    <div>
                      <span className="font-semibold text-red-900">Prevention Suggestion:</span>
                      <p className="text-gray-700 ml-4 italic">"{response.suggestion}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(!data?.detailedResponses || data.detailedResponses.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No detailed responses available
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-xs text-red-600">
              <strong>Data Protection:</strong> This information is anonymized and should only be used for 
              aggregate analysis and policy development. Do not attempt to identify individual respondents.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
