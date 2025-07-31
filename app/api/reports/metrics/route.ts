// app/api/reports/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { getPrismaClient } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate user (no user creation needed for reports)
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get enhanced Prisma client
        const prisma = await getPrismaClient();

        // 3. Parse time range parameters
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

        console.log(`[METRICS] Fetching metrics for time range: ${timeRange}, startDate: ${startDate.toISOString()}`);

        // 4. Try daily metrics first, then fall back to real-time
        const dataSource = 'real_time';
        let totalTasks: number;
        let completedTasks: number;
        let avgTurnaroundTime = 0;

        try {
            // TEMPORARY: Skip daily metrics and force real-time calculation
            // until daily_metrics table is properly populated
            console.log(`[METRICS] Forcing real-time calculation (daily metrics disabled)`);
            throw new Error('Forcing real-time calculation');
        } catch (dailyMetricsError) {
            console.log(`[METRICS] Daily metrics unavailable, using real-time calculation`);

            // Fallback to real-time calculation
            totalTasks = await prisma.serviceTask.count({
                where: {
                    createdAt: {
                        gte: startDate,
                    },
                },
            });

            console.log(`[METRICS] Real-time total tasks: ${totalTasks}`);

            // Get completed tasks (both COMPLETED and CLOSED count as completed)
            completedTasks = await prisma.serviceTask.count({
                where: {
                    createdAt: {
                        gte: startDate,
                    },
                    status: {
                        in: ['COMPLETED', 'CLOSED']
                    },
                },
            });

            console.log(`[METRICS] Real-time completed tasks: ${completedTasks}`);

            // Calculate average turnaround time for completed tasks
            const completedTasksWithTimes = await prisma.serviceTask.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                    },
                    status: {
                        in: ['COMPLETED', 'CLOSED']
                    },
                    actualCompletion: {
                        not: null,
                    },
                },
                select: {
                    createdAt: true,
                    actualCompletion: true,
                },
            });

            console.log(`[METRICS] Tasks with completion times: ${completedTasksWithTimes.length}`);

            if (completedTasksWithTimes.length > 0) {
                const totalTurnaroundDays = completedTasksWithTimes.reduce((sum, task) => {
                    const turnaroundMs = task.actualCompletion!.getTime() - task.createdAt.getTime();
                    const turnaroundDays = turnaroundMs / (1000 * 60 * 60 * 24);
                    return sum + turnaroundDays;
                }, 0);

                avgTurnaroundTime = Math.round((totalTurnaroundDays / completedTasksWithTimes.length) * 10) / 10;
            }
        }

        // Calculate completion rate
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const response = {
            totalTasks,
            completedTasks,
            avgTurnaroundTime,
            completionRate,
            dataSource, // For debugging
        };

        console.log(`[METRICS] Final response:`, response);

        return NextResponse.json(response);

    } catch (error) {
        console.error('[METRICS] Error fetching metrics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch metrics', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}