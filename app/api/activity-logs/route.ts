// app/api/activity-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/activity-logs - Get activity logs with filtering
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where clause
        const where: any = {};
        if (taskId) where.taskId = taskId;
        if (action) where.action = action;
        if (userId) where.performedById = userId;

        const [activityLogs, totalCount] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                include: {
                    performedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    task: {
                        select: {
                            id: true,
                            customerName: true,
                            serviceType: true,
                            status: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.activityLog.count({ where })
        ]);

        // Format the logs for display
        const formattedLogs = activityLogs.map(log => ({
            id: log.id,
            action: log.action,
            description: log.description,
            metadata: log.metadata,
            createdAt: log.createdAt.toISOString(),
            performedBy: {
                id: log.performedBy.id,
                name: log.performedBy.name || log.performedBy.email,
                email: log.performedBy.email,
                role: log.performedBy.role
            },
            task: log.task ? {
                id: log.task.id,
                customerName: log.task.customerName,
                serviceType: log.task.serviceType,
                status: log.task.status
            } : null
        }));

        return NextResponse.json({
            activityLogs: formattedLogs,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity logs' },
            { status: 500 }
        );
    }
}

// POST /api/activity-logs - Create new activity log entry
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user record
        const userRecord = await prisma.user.findUnique({
            where: { supabaseId: user.id }
        });

        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { taskId, action, description, metadata } = body;

        // Validate required fields
        if (!taskId || !action || !description) {
            return NextResponse.json(
                { error: 'Missing required fields: taskId, action, description' },
                { status: 400 }
            );
        }

        // Validate that task exists
        const task = await prisma.serviceTask.findUnique({
            where: { id: taskId }
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Service task not found' },
                { status: 404 }
            );
        }

        const activityLog = await prisma.activityLog.create({
            data: {
                taskId,
                action,
                description,
                metadata: metadata || null,
                performedById: userRecord.id,
            },
            include: {
                performedBy: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json({
            message: 'Activity log created successfully',
            activityLog
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating activity log:', error);
        return NextResponse.json(
            { error: 'Failed to create activity log' },
            { status: 500 }
        );
    }
}