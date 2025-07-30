// app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/customers/[id] - Get single customer with full details
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

        const customer = await prisma.customer.findUnique({
            where: { id }
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Get all service tasks for this customer
        const serviceTasks = await prisma.serviceTask.findMany({
            where: { email: customer.email },
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
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get unique items from service tasks
        const items = serviceTasks
            .filter(task => task.itemModel)
            .map(task => {
                // Split itemModel into brand and model
                const parts = task.itemModel?.split(' ') || [];
                const brand = parts[0] || '';
                const model = parts.slice(1).join(' ') || task.itemModel;

                return {
                    id: task.id,
                    model: task.itemModel,
                    brand,
                    serialNumber: task.serialNumber,
                    lastService: task.createdAt,
                    status: task.status
                };
            })
            .reduce((unique: any[], item) => {
                const exists = unique.find(u =>
                    u.model === item.model && u.serialNumber === item.serialNumber
                );
                if (!exists) {
                    unique.push(item);
                }
                return unique;
            }, []);

        // Calculate customer metrics
        const completedTasks = serviceTasks.filter(task => task.status === 'COMPLETED');
        const totalSpent = completedTasks.reduce((sum, task) => {
            return sum + (task.actualCost ? Number(task.actualCost) : 0);
        }, 0);

        const customerWithDetails = {
            ...customer,
            serviceTasks: serviceTasks.map(task => ({
                id: task.id,
                serviceType: mapServiceTypeToDisplay(task.serviceType),
                status: task.status,
                itemModel: task.itemModel,
                serialNumber: task.serialNumber,
                estimatedCost: task.estimatedCost,
                actualCost: task.actualCost,
                createdAt: task.createdAt,
                createdBy: task.createdBy?.name,
                assignedTo: task.assignedTo?.name,
                notes: task.notes
            })),
            items,
            metrics: {
                totalTasks: serviceTasks.length,
                completedTasks: completedTasks.length,
                totalSpent,
                lastService: serviceTasks[0]?.createdAt || null,
                averageTaskValue: completedTasks.length > 0 ? totalSpent / completedTasks.length : 0
            }
        };

        return NextResponse.json({ customer: customerWithDetails });

    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        );
    }
}

// PUT /api/customers/[id] - Update customer
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

        const body = await request.json();
        const { id } = params;
        const {
            name,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            notifications,
            preferredContact
        } = body;

        // Check if customer exists
        const existingCustomer = await prisma.customer.findUnique({
            where: { id }
        });

        if (!existingCustomer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Check if email is being changed and if it conflicts with another customer
        if (email && email !== existingCustomer.email) {
            const emailConflict = await prisma.customer.findUnique({
                where: { email }
            });

            if (emailConflict) {
                return NextResponse.json(
                    { error: 'Another customer with this email already exists' },
                    { status: 409 }
                );
            }
        }

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(state !== undefined && { state }),
                ...(zipCode !== undefined && { zipCode }),
                ...(notifications !== undefined && { notifications }),
                ...(preferredContact !== undefined && { preferredContact }),
            }
        });

        // If email changed, update all related service tasks
        if (email && email !== existingCustomer.email) {
            await prisma.serviceTask.updateMany({
                where: { email: existingCustomer.email },
                data: { email }
            });
        }

        return NextResponse.json({
            message: 'Customer updated successfully',
            customer
        });

    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
}

// DELETE /api/customers/[id] - Delete customer
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

        const { id } = params;

        const customer = await prisma.customer.findUnique({
            where: { id }
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Check if customer has active service tasks
        const activeTasks = await prisma.serviceTask.findMany({
            where: {
                email: customer.email,
                status: {
                    in: ['FUTURE', 'IN_SHOP', 'IN_PROGRESS', 'ON_HOLD']
                }
            }
        });

        if (activeTasks.length > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete customer with active service tasks',
                    activeTasks: activeTasks.length
                },
                { status: 409 }
            );
        }

        await prisma.customer.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Customer deleted successfully' });

    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json(
            { error: 'Failed to delete customer' },
            { status: 500 }
        );
    }
}

// Helper function to map service types for display
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
        'DIAGNOSTIC': 'Diagnostic',
        'WARRANTY_WORK': 'Warranty Work',
        'OTHER': 'Other'
    };
    return mapping[enumValue] || 'Other';
}