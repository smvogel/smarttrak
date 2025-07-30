// app/api/reports/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { getPrismaClient } from '@/app/lib/prisma'; // Changed from { prisma }

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get enhanced Prisma client
        const prisma = await getPrismaClient();

        // Get or create user record
        let userRecord = await prisma.user.findUnique({
            where: { supabaseId: user.id }
        });

        if (!userRecord) {
            userRecord = await prisma.user.create({
                data: {
                    supabaseId: user.id,
                    email: user.email || '',
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    role: 'EMPLOYEE'
                }
            });
        }

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

        // Try to get metrics from DailyMetrics table first (optimized)
        let dataSource = 'real_time';
        let totalTasks = 0;
        let completedTasks = 0;
        let avgTurnaroundTime = 0;

        try {
            // Check if we have daily metrics data
            const dailyMetrics = await prisma.dailyMetrics.findMany({
                where: {
                    date: {
                        gte: startDate,
                    },
                },
            });

            if (dailyMetrics.length > 0) {
                // Use aggregated data
                totalTasks = dailyMetrics.reduce((sum, day) => sum + day.tasksCreated, 0);
                completedTasks = dailyMetrics.reduce((sum, day) => sum + day.tasksCompleted, 0);

                // Calculate weighted average turnaround time
                const totalHours = dailyMetrics.reduce((sum, day) =>
                    sum + ((day.avgTurnaroundHours || 0) * day.tasksCompleted), 0);
                const totalCompletedFromMetrics = dailyMetrics.reduce((sum, day) => sum + day.tasksCompleted, 0);

                if (totalCompletedFromMetrics > 0) {
                    avgTurnaroundTime = Math.round((totalHours / totalCompletedFromMetrics / 24) * 10) / 10;
                }

                dataSource = 'daily_metrics';

            } else {
                throw new Error('No daily metrics available, falling back to real-time');
            }
        } catch (dailyMetricsError) {
            console.log('Daily metrics unavailable, using real-time calculation:', dailyMetricsError);

            // Fallback to real-time calculation
            totalTasks = await prisma.serviceTask.count({
                where: {
                    createdAt: {
                        gte: startDate,
                    },
                },
            });

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



        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching metrics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch metrics', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}