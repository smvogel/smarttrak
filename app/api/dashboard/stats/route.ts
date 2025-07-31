// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { getPrismaClient } from '@/app/lib/prisma'; // Changed from { prisma }

// Service type display mapping
const serviceTypeDisplayNames: Record<string, string> = {
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

// Status display mapping
const statusDisplayNames: Record<string, string> = {
    FUTURE: 'Future',
    IN_SHOP: 'In Shop',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
    ON_HOLD: 'On Hold'
};

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get enhanced Prisma client
        const prisma = await getPrismaClient();

        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('range') || '30'; // days
        const daysAgo = parseInt(timeRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        console.log(`Fetching dashboard stats for ${daysAgo} days, startDate: ${startDate.toISOString()}`);

        // Get service task statistics (changed from serviceJob to serviceTask)
        const [
            totalTasks,
            tasksByStatus,
            tasksByServiceType,
            recentTasks,
            completedTasksWithTiming,
            totalCustomers
        ] = await Promise.all([
            // Total tasks count
            prisma.serviceTask.count({
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),

            // Tasks by status
            prisma.serviceTask.groupBy({
                by: ['status'],
                _count: {
                    status: true
                },
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),

            // Tasks by service type
            prisma.serviceTask.groupBy({
                by: ['serviceType'],
                _count: {
                    serviceType: true
                },
                where: {
                    createdAt: {
                        gte: startDate
                    }
                },
                orderBy: {
                    _count: {
                        serviceType: 'desc'
                    }
                },
                take: 10
            }),

            // Recent tasks for activity feed
            prisma.serviceTask.findMany({
                take: 10,
                orderBy: {
                    updatedAt: 'desc'
                },
                include: {
                    createdBy: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    assignedTo: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),

            // Completed tasks with timing data (using actualCompletion field)
            prisma.serviceTask.findMany({
                where: {
                    status: {
                        in: ['COMPLETED', 'CLOSED'] // Both count as completed
                    },
                    createdAt: {
                        gte: startDate
                    },
                    actualCompletion: {
                        not: null
                    }
                },
                select: {
                    createdAt: true,
                    actualCompletion: true,
                    estimatedCost: true,
                    actualCost: true
                }
            }),

            // Total customers from Customer table
            prisma.customer.count()
        ]);

        // Calculate total revenue from completed tasks
        const revenueResult = await prisma.serviceTask.aggregate({
            _sum: {
                actualCost: true
            },
            where: {
                status: {
                    in: ['COMPLETED', 'CLOSED']
                },
                createdAt: {
                    gte: startDate
                }
            }
        });

        // Calculate average turnaround time
        let avgTurnaroundDays = 0;
        if (completedTasksWithTiming.length > 0) {
            const totalDays = completedTasksWithTiming.reduce((sum, task) => {
                if (task.actualCompletion && task.createdAt) {
                    const diffTime = new Date(task.actualCompletion).getTime() - new Date(task.createdAt).getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return sum + diffDays;
                }
                return sum;
            }, 0);
            avgTurnaroundDays = totalDays / completedTasksWithTiming.length;
        }

        // Format status distribution
        const statusDistribution = tasksByStatus.map(item => ({
            status: statusDisplayNames[item.status] || item.status,
            statusKey: item.status,
            count: item._count.status,
            percentage: totalTasks > 0 ? Math.round((item._count.status / totalTasks) * 100) : 0
        }));

        // Format service type distribution
        const serviceTypeDistribution = tasksByServiceType.map(item => ({
            serviceType: serviceTypeDisplayNames[item.serviceType] || item.serviceType,
            serviceTypeKey: item.serviceType,
            count: item._count.serviceType,
            percentage: totalTasks > 0 ? Math.round((item._count.serviceType / totalTasks) * 100) : 0
        }));

        // Format recent activity
        const recentActivity = recentTasks.map(task => ({
            id: task.id,
            customerName: task.customerName,
            serviceType: serviceTypeDisplayNames[task.serviceType] || task.serviceType,
            status: statusDisplayNames[task.status] || task.status,
            itemModel: task.itemModel || '',
            updatedAt: task.updatedAt.toISOString(),
            createdAt: task.createdAt.toISOString(),
            assignedTo: task.assignedTo?.name || 'Unassigned'
        }));

        // Calculate daily volume for the last 30 days
        const dailyVolume = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const dayCount = await prisma.serviceTask.count({
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

        // Calculate completed tasks (both COMPLETED and CLOSED)
        const completedTasks = statusDistribution
            .filter(s => s.statusKey === 'COMPLETED' || s.statusKey === 'CLOSED')
            .reduce((sum, s) => sum + s.count, 0);

        const stats = {
            summary: {
                totalTasks,
                completedTasks,
                avgTurnaroundDays: Number(avgTurnaroundDays.toFixed(1)),
                totalCustomers,
                totalRevenue: revenueResult._sum.actualCost || 0,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
            },
            statusDistribution,
            serviceTypeDistribution,
            recentActivity,
            dailyVolume,
            timeRange: daysAgo
        };

        console.log('Dashboard stats response:', {
            totalTasks,
            completedTasks,
            statusCount: statusDistribution.length
        });

        return NextResponse.json({ stats });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}