// app/api/service-tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

// PUT /api/service-tasks/[id] - Update service task
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

        // Get user record
        const userRecord = await prisma.user.findUnique({
            where: { supabaseId: user.id }
        });

        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { id } = await params;

        // Handle status updates (from drag & drop)
        if (body.status) {
            const currentTask = await prisma.serviceTask.findUnique({
                where: { id }
            });

            if (!currentTask) {
                return NextResponse.json({ error: 'Service task not found' }, { status: 404 });
            }

            const updatedTask = await prisma.serviceTask.update({
                where: { id },
                data: {
                    status: body.status,
                    actualCompletion: body.status === 'COMPLETED' ? new Date() : undefined,
                },
                include: {
                    createdBy: true,
                    assignedTo: true,
                }
            });

            // Log status change
            await prisma.statusUpdate.create({
                data: {
                    taskId: id,
                    fromStatus: body.fromStatus || currentTask.status,
                    toStatus: body.status,
                    notes: body.notes || `Status changed via drag & drop`,
                    updatedById: userRecord.id,
                }
            });

            // Log activity
            await prisma.activityLog.create({
                data: {
                    taskId: id,
                    action: 'STATUS_CHANGED',
                    description: `Status changed from ${currentTask.status} to ${body.status}`,
                    metadata: {
                        fromStatus: currentTask.status,
                        toStatus: body.status,
                        method: 'drag_drop'
                    },
                    performedById: userRecord.id,
                }
            });

            return NextResponse.json({
                message: 'Status updated successfully',
                serviceTask: updatedTask
            });
        }

        // Handle full task updates (from edit modal)
        const {
            customerName,
            email,
            phone,
            bikeModel, // Maps to itemModel
            serialNumber,
            serviceType,
            notes,
            estimatedCost,
            priority
        } = body;

        const currentTask = await prisma.serviceTask.findUnique({
            where: { id }
        });

        if (!currentTask) {
            return NextResponse.json({ error: 'Service task not found' }, { status: 404 });
        }

        // Update customer record if email changed
        if (email && email !== currentTask.email) {
            await prisma.customer.upsert({
                where: { email },
                update: {
                    name: customerName || currentTask.customerName,
                    phone: phone || currentTask.phone,
                },
                create: {
                    name: customerName || currentTask.customerName,
                    email,
                    phone: phone || currentTask.phone,
                }
            });
        } else if (customerName || phone) {
            // Update existing customer
            await prisma.customer.upsert({
                where: { email: currentTask.email },
                update: {
                    ...(customerName && { name: customerName }),
                    ...(phone && { phone }),
                },
                create: {
                    name: customerName || currentTask.customerName,
                    email: currentTask.email,
                    phone: phone || currentTask.phone,
                }
            });
        }

        // Update service task
        const updatedTask = await prisma.serviceTask.update({
            where: { id },
            data: {
                ...(customerName && { customerName }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(bikeModel !== undefined && { itemModel: bikeModel }),
                ...(serialNumber !== undefined && { serialNumber }),
                ...(serviceType && {
                    serviceType: mapDisplayToServiceType(serviceType),
                    customService: serviceType === 'Other' ? notes : null
                }),
                ...(notes !== undefined && { notes }),
                ...(estimatedCost !== undefined && {
                    estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null
                }),
                ...(priority && { priority: priority.toUpperCase() as any }),
            },
            include: {
                createdBy: true,
                assignedTo: true,
            }
        });

        // Log the update
        await prisma.activityLog.create({
            data: {
                taskId: id,
                action: 'TASK_UPDATED',
                description: `Service task updated`,
                metadata: {
                    updatedFields: Object.keys(body),
                    previousValues: {
                        customerName: currentTask.customerName,
                        email: currentTask.email,
                        phone: currentTask.phone,
                        itemModel: currentTask.itemModel,
                        serviceType: currentTask.serviceType,
                    }
                },
                performedById: userRecord.id,
            }
        });

        return NextResponse.json({
            message: 'Service task updated successfully',
            serviceTask: updatedTask
        });

    } catch (error) {
        console.error('Error updating service task:', error);
        return NextResponse.json(
            { error: 'Failed to update service task' },
            { status: 500 }
        );
    }
}

// GET /api/service-tasks/[id] - Get single service task with full details
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

        const serviceTask = await prisma.serviceTask.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                statusUpdates: {
                    include: {
                        updatedBy: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                activityLogs: {
                    include: {
                        performedBy: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 20
                },
                printedLabels: {
                    include: {
                        printedBy: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                attachments: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!serviceTask) {
            return NextResponse.json(
                { error: 'Service task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ serviceTask });

    } catch (error) {
        console.error('Error fetching service task:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service task' },
            { status: 500 }
        );
    }
}

// DELETE /api/service-tasks/[id] - Delete service task
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = await params;

        // Check if service task exists
        const existingTask = await prisma.serviceTask.findUnique({
            where: { id }
        });

        if (!existingTask) {
            return NextResponse.json(
                { error: 'Service task not found' },
                { status: 404 }
            );
        }

        // Prevent deletion if task is completed (business rule)
        if (existingTask.status === 'COMPLETED' || existingTask.status === 'CLOSED') {
            return NextResponse.json(
                { error: 'Cannot delete completed or closed service tasks' },
                { status: 409 }
            );
        }

        // Log the deletion before deleting
        await prisma.activityLog.create({
            data: {
                taskId: id,
                action: 'TASK_UPDATED', // Using TASK_UPDATED since we can't log after deletion
                description: `Service task deleted`,
                metadata: {
                    deletedTask: {
                        customerName: existingTask.customerName,
                        serviceType: existingTask.serviceType,
                        status: existingTask.status
                    }
                },
                performedById: userRecord.id,
            }
        });

        await prisma.serviceTask.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Service task deleted successfully' });

    } catch (error) {
        console.error('Error deleting service task:', error);
        return NextResponse.json(
            { error: 'Failed to delete service task' },
            { status: 500 }
        );
    }
}

// Helper functions to map between display names and enum values
function mapDisplayToServiceType(display: string): any {
    const mapping: Record<string, any> = {
        'Basic Tune-Up': 'BASIC_TUNE_UP',
        'Full Service': 'FULL_SERVICE',
        'Brake Adjustment': 'BRAKE_ADJUSTMENT',
        'Gear Adjustment': 'GEAR_ADJUSTMENT',
        'Wheel True': 'WHEEL_TRUE',
        'Chain/Cassette Replacement': 'CHAIN_CASSETTE_REPLACEMENT',
        'Flat Tire Repair': 'FLAT_TIRE_REPAIR',
        'Custom Build': 'CUSTOM_BUILD',
        'Other': 'OTHER'
    };
    return mapping[display] || 'OTHER';
}