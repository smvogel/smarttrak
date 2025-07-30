// app/api/service-tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/service-tasks - Fetch all service tasks for Kanban board
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get or create user record
        let userRecord = await prisma.user.findUnique({
            where: { supabaseId: user.id }
        });

        if (!userRecord) {
            // Create user record if it doesn't exist
            userRecord = await prisma.user.create({
                data: {
                    supabaseId: user.id,
                    email: user.email || '',
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    role: 'EMPLOYEE'
                }
            });
        }

        // Get search params
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const customerId = searchParams.get('customerId');

        // Build where clause
        const where: any = {};
        if (status) where.status = status;

        const serviceTasks = await prisma.serviceTask.findMany({
            where,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                statusUpdates: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 3
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform data to match your existing UI format
        const transformedTasks = serviceTasks.map(task => ({
            id: task.id,
            customerName: task.customerName,
            email: task.email,
            phone: task.phone,
            bikeModel: task.itemModel || '', // Map itemModel to bikeModel for UI
            serialNumber: task.serialNumber || '',
            serviceType: mapServiceTypeToDisplay(task.serviceType),
            status: task.status,
            createdAt: task.createdAt.toISOString(),
            notes: task.notes || '',
            estimatedCost: task.estimatedCost?.toString(),
            actualCost: task.actualCost?.toString(),
            priority: task.priority,
            assignedTo: task.assignedTo?.name,
            statusHistory: task.statusUpdates
        }));

        return NextResponse.json({ serviceJobs: transformedTasks });

    } catch (error) {
        console.error('Error fetching service tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service tasks' },
            { status: 500 }
        );
    }
}

// POST /api/service-tasks - Create new service task from intake form
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        const body = await request.json();
        const {
            customerName,
            email,
            phone,
            bikeModel, // Will map to itemModel
            serialNumber,
            serviceType,
            notes,
            estimatedCost,
            priority
        } = body;

        // Validate required fields
        if (!customerName || !email || !phone || !serviceType) {
            return NextResponse.json(
                { error: 'Missing required fields: customerName, email, phone, serviceType' },
                { status: 400 }
            );
        }

        // Create or update customer record
        await prisma.customer.upsert({
            where: { email },
            update: {
                name: customerName,
                phone,
            },
            create: {
                name: customerName,
                email,
                phone,
            }
        });

        // Create service task
        const serviceTask = await prisma.serviceTask.create({
            data: {
                customerName,
                email,
                phone,
                itemModel: bikeModel || null,
                serialNumber: serialNumber || null,
                serviceType: mapDisplayToServiceType(serviceType),
                customService: serviceType === 'Other' ? notes : null,
                description: notes,
                notes,
                estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
                status: 'FUTURE',
                priority: (priority?.toUpperCase() as any) || 'NORMAL',
                createdById: userRecord.id,
            },
            include: {
                createdBy: true,
            }
        });

        // Log the creation
        await prisma.activityLog.create({
            data: {
                taskId: serviceTask.id,
                action: 'TASK_CREATED',
                description: `Service task created for ${customerName}`,
                metadata: {
                    serviceType,
                    itemModel: bikeModel,
                    estimatedCost
                },
                performedById: userRecord.id,
            }
        });

        return NextResponse.json({
            message: 'Service task created successfully',
            serviceJob: { // Keep serviceJob for UI compatibility
                id: serviceTask.id,
                customerName: serviceTask.customerName,
                email: serviceTask.email,
                phone: serviceTask.phone,
                bikeModel: serviceTask.itemModel || '',
                serialNumber: serviceTask.serialNumber || '',
                serviceType: mapServiceTypeToDisplay(serviceTask.serviceType),
                status: serviceTask.status,
                createdAt: serviceTask.createdAt.toISOString(),
                notes: serviceTask.notes || '',
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating service task:', error);
        return NextResponse.json(
            { error: 'Failed to create service task' },
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

function mapServiceTypeToDisplay(enumValue: any): string {
    const mapping: Record<string, string> = {
        'BASIC_TUNE_UP': 'Basic Tune-Up',
        'FULL_SERVICE': 'Full Service',
        'BRAKE_ADJUSTMENT': 'Brake Adjustment',
        'GEAR_ADJUSTMENT': 'Gear Adjustment',
        'WHEEL_TRUE': 'Wheel True',
        'CHAIN_CASSETTE_REPLACEMENT': 'Chain/Cassette Replacement',
        'FLAT_TIRE_REPAIR': 'Flat Tire Repair',
        'CUSTOM_BUILD': 'Custom Build',
        'OTHER': 'Other'
    };
    return mapping[enumValue] || 'Other';
}