
// app/api/users/[id]/route.ts
import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/app/lib/supabase/server";
import {prisma} from "@/app/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Get current user to check permissions
        const currentUser = await prisma.user.findUnique({
            where: { supabaseId: user.id }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Users can view their own profile, or admins/managers can view any profile
        const targetUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (currentUser.id !== id && !['ADMIN', 'MANAGER'].includes(currentUser.role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Get detailed user info with activity
        const userWithDetails = await prisma.user.findUnique({
            where: { id },
            include: {
                createdTasks: {
                    select: {
                        id: true,
                        customerName: true,
                        serviceType: true,
                        status: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                assignedTasks: {
                    select: {
                        id: true,
                        customerName: true,
                        serviceType: true,
                        status: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                activityLogs: {
                    select: {
                        id: true,
                        action: true,
                        description: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 20
                },
                _count: {
                    select: {
                        createdTasks: true,
                        assignedTasks: true,
                        statusUpdates: true,
                        activityLogs: true,
                        printedLabels: true
                    }
                }
            }
        });

        return NextResponse.json({
            user: {
                id: userWithDetails?.id,
                email: userWithDetails?.email,
                name: userWithDetails?.name,
                role: userWithDetails?.role,
                isActive: userWithDetails?.isActive,
                createdAt: userWithDetails?.createdAt.toISOString(),
                updatedAt: userWithDetails?.updatedAt.toISOString(),
                recentCreatedTasks: userWithDetails?.createdTasks,
                recentAssignedTasks: userWithDetails?.assignedTasks,
                recentActivity: userWithDetails?.activityLogs,
                stats: userWithDetails?._count
            }
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user details' },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update user (admin only or self)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { name, role, isActive } = body;

        // Get current user to check permissions
        const currentUser = await prisma.user.findUnique({
            where: { supabaseId: user.id }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
        }

        // Permission checks
        const isSelf = currentUser.id === id;
        const isAdmin = currentUser.role === 'ADMIN';
        const isManager = currentUser.role === 'MANAGER';

        // Only allow self-updates for name, or admin/manager for role/status changes
        if (!isSelf && !isAdmin && !isManager) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Role changes require admin privileges
        if (role && role !== targetUser.role && !isAdmin) {
            return NextResponse.json({ error: 'Only admins can change user roles' }, { status: 403 });
        }

        // Active status changes require admin/manager privileges
        if (isActive !== undefined && isActive !== targetUser.isActive && !isAdmin && !isManager) {
            return NextResponse.json({ error: 'Only admins/managers can change user status' }, { status: 403 });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(role !== undefined && isAdmin && { role }),
                ...(isActive !== undefined && (isAdmin || isManager) && { isActive })
            }
        });

        return NextResponse.json({
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                isActive: updatedUser.isActive,
                updatedAt: updatedUser.updatedAt.toISOString()
            }
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}