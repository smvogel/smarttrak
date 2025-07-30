// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get current user record
        const currentUser = await prisma.user.findUnique({
            where: { supabaseId: user.id }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user has admin/manager permissions
        if (!['ADMIN', 'MANAGER'].includes(currentUser.role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const isActive = searchParams.get('isActive');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where clause
        const where: any = {};
        if (role) where.role = role;
        if (isActive !== null) where.isActive = isActive === 'true';

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            createdTasks: true,
                            assignedTasks: true,
                            statusUpdates: true,
                            activityLogs: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.user.count({ where })
        ]);

        // Format users for response (exclude sensitive data)
        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            stats: {
                tasksCreated: user._count.createdTasks,
                tasksAssigned: user._count.assignedTasks,
                statusUpdates: user._count.statusUpdates,
                activityLogs: user._count.activityLogs
            }
        }));

        return NextResponse.json({
            users: formattedUsers,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
