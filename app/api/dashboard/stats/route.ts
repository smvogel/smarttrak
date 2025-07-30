// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('range') || '30'; // days
        const daysAgo = parseInt(timeRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // Get service job statistics
        const [
            totalJobs,
            jobsByStatus,
            jobsByServiceType,
            recentJobs,
            completedJobsWithTiming,
            totalCustomers,
            totalRevenue
        ] = await Promise.all([
            // Total jobs count
            prisma.serviceJob.count({
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),

            // Jobs by status
            prisma.serviceJob.groupBy({
                by: ['status'],
                _count: {
                    _all: true
                },
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),

            // Jobs by service type
            prisma.serviceJob.groupBy({
                by: ['serviceType'],
                _count: {
                    _all: true
                },
                where: {
                    createdAt: {
                        gte: startDate
                    }
                },
                orderBy: {
                    _count: {
                        _all: 'desc'
                    }
                },
                take: 10
            }),

            // Recent jobs for activity feed
            prisma.serviceJob.findMany({
                take: 10,
                orderBy: {
                    updatedAt: 'desc'
                },
                include: {
                    customer: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    bike: {
                        select: {
                            model: true,
                            brand: true
                        }
                    }
                },
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),

            // Completed jobs with timing data
            prisma.serviceJob.findMany({
                where: {
                    status: 'COMPLETED',
                    createdAt: {
                        gte: startDate
                    },
                    completedAt: {
                        not: null
                    }
                },
                select: {
                    createdAt: true,
                    completedAt: true,
                    estimatedCost: true,
                    actualCost: true
                }
            }),

            // Total customers
            prisma.customer.count(),

            // Total revenue from completed jobs
            prisma.serviceJob.aggregate({
                _sum: {
                    actualCost: true
                },
                where: {
                    status: 'COMPLETED',
                    createdAt: {
                        gte: startDate
                    }
                }
            })
        ]);

        // Calculate average turnaround time
        let avgTurnaroundDays = 0;
        if (completedJobsWithTiming.length > 0) {
            const totalDays = completedJobsWithTiming.reduce((sum, job) => {
                if (job.completedAt && job.createdAt) {
                    const diffTime = new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return sum + diffDays;
                }
                return sum;
            }, 0);
            avgTurnaroundDays = totalDays / completedJobsWithTiming.length;
        }

        // Format status distribution
        const statusDistribution = jobsByStatus.map(item => ({
            status: item.status,
            count: item._count._all,
            percentage: Math.round((item._count._all / totalJobs) * 100)
        }));

        // Format service type distribution
        const serviceTypeDistribution = jobsByServiceType.map(item => ({
            serviceType: item.serviceType,
            count: item._count._all,
            percentage: Math.round((item._count._all / totalJobs) * 100)
        }));

        // Format recent activity
        const recentActivity = recentJobs.map(job => ({
            id: job.id,
            customerName: job.customer.name,
            serviceType: job.serviceType,
            status: job.status,
            bikeModel: job.bike ? `${job.bike.brand || ''} ${job.bike.model || ''}`.trim() : '',
            updatedAt: job.updatedAt.toISOString(),
            createdAt: job.createdAt.toISOString()
        }));

        // Calculate daily volume for the last 30 days
        const dailyVolume = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const dayCount = await prisma.serviceJob.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });

            dailyVolume.push({
                date: startOfDay.toISOString().split('T')[0],
                count: dayCount
            });
        }

        const stats = {
            summary: {
                totalJobs,
                completedJobs: statusDistribution.find(s => s.status === 'COMPLETED')?.count || 0,
                avgTurnaroundDays: Number(avgTurnaroundDays.toFixed(1)),
                totalCustomers,
                totalRevenue: totalRevenue._sum.actualCost || 0,
                completionRate: totalJobs > 0 ? Math.round(((statusDistribution.find(s => s.status === 'COMPLETED')?.count || 0) / totalJobs) * 100) : 0
            },
            statusDistribution,
            serviceTypeDistribution,
            recentActivity,
            dailyVolume,
            timeRange: daysAgo
        };

        return NextResponse.json({ stats });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}