// app/api/reports/service-types/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { getPrismaClient } from '@/app/lib/prisma'; // Changed from { prisma }
import { ServiceType } from '@prisma/client';

// Map database enum values to display names
const serviceTypeDisplayNames: Record<ServiceType, string> = {
    BASIC_TUNE_UP: 'Basic Tune-Up',
    FULL_SERVICE: 'Full Service',
    BRAKE_ADJUSTMENT: 'Brake Adjustment',
    GEAR_ADJUSTMENT: 'Gear Adjustment',
    WHEEL_TRUE: 'Wheel True',
    CHAIN_CASSETTE_REPLACEMENT: 'Chain/Cassette Replacement',
    FLAT_TIRE_REPAIR: 'Flat Tire Repair',
    CUSTOM_BUILD: 'Custom Build',
    DIAGNOSTIC: 'Diagnostic',
    WARRANTY_WORK: 'Warranty Work',
    OTHER: 'Other'
};

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get enhanced Prisma client
        const prisma = await getPrismaClient();

        // 3. Parse request parameters
        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') || '30d';

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        console.log(`Fetching service types for time range: ${timeRange}, startDate: ${startDate.toISOString()}`);

        // 4. Get service type counts
        const serviceTypeCounts = await prisma.serviceTask.groupBy({
            by: ['serviceType'],
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            _count: { // Fixed: was *count
                serviceType: true,
            },
            orderBy: {
                _count: { // Fixed: was *count
                    serviceType: 'desc',
                },
            },
        });

        // Calculate total for percentages
        const totalTasks = serviceTypeCounts.reduce((sum, item) => sum + item._count.serviceType, 0);

        // Format the response
        const serviceTypes = serviceTypeCounts.map(item => ({
            type: serviceTypeDisplayNames[item.serviceType],
            count: item._count.serviceType,
            percentage: totalTasks > 0 ? Math.round((item._count.serviceType / totalTasks) * 100) : 0,
        }));

        console.log('Service types response:', { serviceTypes, totalTasks });

        return NextResponse.json({ serviceTypes, totalTasks });

    } catch (error) {
        console.error('Error fetching service types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service types', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}