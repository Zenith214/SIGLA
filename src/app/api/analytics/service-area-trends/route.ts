import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

/**
 * GET /api/analytics/service-area-trends
 * Get performance trends for all service areas across all cycles
 */
export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: 401 });
  }

  try {
    const serviceAreas = [
      { key: 'financial', name: 'Financial Administration' },
      { key: 'disaster', name: 'Disaster Preparedness' },
      { key: 'safety', name: 'Safety & Peace Order' },
      { key: 'social', name: 'Social Protection' },
      { key: 'business', name: 'Business Friendliness' },
      { key: 'environmental', name: 'Environmental Management' }
    ];

    // Placeholder data - in production, this would aggregate from all cycles
    const trends = serviceAreas.map(service => ({
      service_area: service.key,
      service_name: service.name,
      average_satisfaction: Math.floor(Math.random() * 30) + 60, // 60-90%
      cycles_tracked: 2,
      trend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as 'improving' | 'declining' | 'stable',
      change_percentage: Math.floor(Math.random() * 20) - 10 // -10 to +10
    }));

    return NextResponse.json(trends);

  } catch (error) {
    console.error('Error fetching service area trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service area trends' },
      { status: 500 }
    );
  }
}
