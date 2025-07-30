// app/api/reports/status-distribution/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { getPrismaClient } from '@/app/lib/prisma';
import { TaskStatus } from '@prisma/client';

// Map database enum values to display names and colors
const statusConfig: Record<TaskStatus, { displayName: string; color: string }> = {
    FUTURE: { displayName: 'Future', color: 'bg-gray-500' },
    IN_SHOP: { displayName: 'In Shop', color: 'bg-blue-500' },
    IN_PROGRESS: { displayName: 'In Progress', color: 'bg-yellow-500' },
    COMPLETED: { displayName: 'Completed', color: 'bg-green-500' },
    CLOSED: { displayName: 'Closed', color: 'bg-gray-600' },
    CANCELLED: { displayName: 'Cancelled', color: 'bg-red-500' },
    ON_HOLD: { displayName: 'On Hold', color: 'bg-orange-500' }
};

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Optional: Check if user has permission to view reports
        // You could add role-based access control here if needed
        // const userRecord = await prisma.user.findUnique({
        //     where: { supabaseId: user.id },
        //     select: { role: true }
        // });
        // if (userRecord?.role === 'EMPLOYEE') {
        //     return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        // }

        // 3. Get enhanced Prisma client
        const prisma = await getPrismaClient();

        // 4. Parse request parameters
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

        console.log(`Fetching status distribution for time range: ${timeRange}, startDate: ${startDate.toISOString()}`);

        // 5. Fetch the actual data (no user management needed)
        const statusCounts = await prisma.serviceTask.groupBy({
            by: ['status'],
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            _count: {
                status: true,
            },
            orderBy: {
                _count: {
                    status: 'desc',
                },
            },
        });

        // Calculate total for percentages
        const totalTasks = statusCounts.reduce((sum, item) => sum + item._count.status, 0);

        // Format the response
        const statusDistribution = statusCounts.map(item => ({
            status: statusConfig[item.status].displayName,
            count: item._count.status,
            color: statusConfig[item.status].color,
            percentage: totalTasks > 0 ? Math.round((item._count.status / totalTasks) * 100) : 0,
        }));

        console.log('Status distribution response:', { statusDistribution, totalTasks });

        return NextResponse.json({ statusDistribution, totalTasks });

    } catch (error) {
        console.error('Error fetching status distribution:', error);
        return NextResponse.json(
            { error: 'Failed to fetch status distribution', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}