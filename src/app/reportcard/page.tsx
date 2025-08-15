"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ReportHeader from "@/components/reportcard/ReportHeader";
import MetadataRow from "@/components/reportcard/MetadataRow";
import AISummarySection from "@/components/reportcard/AISummarySection";
import PerformanceSnapshot from "@/components/reportcard/PerformanceSnapshot";
import ServiceAreaTable from "@/components/reportcard/ServiceAreaTable";
import KeyFindingsSection from "@/components/reportcard/KeyFindingsSection";
import ReportFooter from "@/components/reportcard/ReportFooter";
import "./print.css";

// Mock data - replace with actual data from your API/database
const mockData = {
    metadata: {
        barangay: "Tanwalang",
        municipality: "Sulop",
        reportDate: "December 2024"
    },
    aiSummary: "Based on comprehensive citizen feedback and performance metrics, Barangay Tanwalang demonstrates strong performance in safety and peace & order initiatives, with 85% citizen satisfaction. However, significant opportunities exist in disaster preparedness and social protection services, where only 45% of residents express satisfaction. The community has voiced particular concerns about emergency response capabilities and access to social services. Key strengths include effective local governance, community engagement programs, and business-friendly policies that have fostered local economic growth. Priority areas requiring immediate attention include infrastructure development, environmental management, and enhanced disaster risk reduction measures.",
    performance: {
        satisfaction: {
            percentage: 81,
            label: "High"
        },
        needForAction: {
            percentage: 35,
            label: "Moderate"
        }
    },
    serviceAreas: [
        {
            name: "Safety, Peace & Order",
            satisfied: { percentage: 85, level: "High" as const },
            needForAction: { percentage: 15, level: "Low" as const },
            priority: "Strength" as const
        },
        {
            name: "Business Friendliness",
            satisfied: { percentage: 78, level: "High" as const },
            needForAction: { percentage: 22, level: "Low" as const },
            priority: "Strength" as const
        },
        {
            name: "Disaster Preparedness",
            satisfied: { percentage: 45, level: "Low" as const },
            needForAction: { percentage: 75, level: "High" as const },
            priority: "Opportunity" as const
        },
        {
            name: "Social Protection",
            satisfied: { percentage: 42, level: "Low" as const },
            needForAction: { percentage: 78, level: "High" as const },
            priority: "Opportunity" as const
        },
        {
            name: "Environmental Management",
            satisfied: { percentage: 38, level: "Low" as const },
            needForAction: { percentage: 35, level: "Low" as const },
            priority: "Priority" as const
        },
        {
            name: "Finance Administration",
            satisfied: { percentage: 35, level: "Low" as const },
            needForAction: { percentage: 82, level: "High" as const },
            priority: "Priority" as const
        }
    ],
    keyFindings: {
        priorityAreas: [
            {
                text: "Emergency response systems need immediate improvement",
                quote: "When the flood came last year, it took hours for help to arrive. We need better emergency preparedness."
            },
            {
                text: "Limited access to social protection programs",
                quote: "Many elderly residents don't know how to access government benefits and support programs."
            },
            {
                text: "Environmental concerns affecting daily life",
                quote: "The waste management system needs improvement. Our streets are not as clean as they should be."
            }
        ],
        keyStrengths: [
            {
                text: "Effective community policing and safety measures",
                quote: "I feel safe walking in our barangay even at night. The tanods are always visible and helpful."
            },
            {
                text: "Supportive business environment for local entrepreneurs",
                quote: "Getting permits for my small business was straightforward. The barangay officials are very supportive."
            },
            {
                text: "Strong community engagement and participation",
                quote: "Our barangay captain always listens to our concerns and involves us in decision-making."
            }
        ]
    }
};

function ReportCardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get data from URL parameters or use mock data as fallback
    const barangayName = searchParams.get('barangay') || mockData.metadata.barangay;
    const satisfaction = parseInt(searchParams.get('satisfaction') || '65');

    // Update mock data with URL parameters
    const reportData = {
        ...mockData,
        metadata: {
            ...mockData.metadata,
            barangay: barangayName,
            reportDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            })
        },
        performance: {
            satisfaction: {
                percentage: satisfaction,
                label: satisfaction >= 58 ? "High" : "Low"
            },
            needForAction: {
                percentage: Math.max(10, 100 - satisfaction - 20),
                label: satisfaction >= 58 ? "Moderate" : "High"
            }
        }
    };

    const handleExportPDF = () => {
        window.print();
    };

    const handleBackToDashboard = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 print:min-h-0">
            {/* Action Buttons - Hidden when printing */}
            <div className="fixed top-4 right-4 z-50 print:hidden flex flex-col gap-3">
                <Button
                    onClick={handleBackToDashboard}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
                <Button
                    onClick={handleExportPDF}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    Export PDF
                </Button>
            </div>

            {/* Header */}
            <ReportHeader className="print:break-inside-avoid" />

            {/* Metadata */}
            <MetadataRow
                barangay={reportData.metadata.barangay}
                municipality={reportData.metadata.municipality}
                reportDate={reportData.metadata.reportDate}
                className="print:break-inside-avoid"
            />

            {/* AI Summary */}
            <AISummarySection
                summary={reportData.aiSummary}
                className="border-b border-gray-200 print:break-inside-avoid"
            />

            {/* Performance Snapshot */}
            <PerformanceSnapshot
                satisfactionPercentage={reportData.performance.satisfaction.percentage}
                satisfactionLabel={reportData.performance.satisfaction.label}
                actionPercentage={reportData.performance.needForAction.percentage}
                actionLabel={reportData.performance.needForAction.label}
                className="border-b border-gray-200 print:break-inside-avoid"
            />

            {/* Service Area Table */}
            <ServiceAreaTable
                serviceAreas={reportData.serviceAreas}
                className="border-b border-gray-200 print:break-inside-avoid"
            />

            {/* Key Findings */}
            <KeyFindingsSection
                priorityAreas={reportData.keyFindings.priorityAreas}
                keyStrengths={reportData.keyFindings.keyStrengths}
                className="border-b border-gray-200 print:break-inside-avoid"
            />

            {/* Footer */}
            <ReportFooter className="print:break-inside-avoid" />
        </div>
    );
}

export default function ReportCard() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading report...</div>
            </div>}>
                <ReportCardContent />
            </Suspense>
        </ProtectedRoute>
    );
}