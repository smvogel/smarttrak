// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/customers - Search and list customers
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build search conditions
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [customers, totalCount] = await Promise.all([
            prisma.customer.findMany({
                where,
                orderBy: {
                    updatedAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.customer.count({ where })
        ]);

        // Get service task counts and recent tasks for each customer
        const customersWithDetails = await Promise.all(
            customers.map(async (customer) => {
                const [serviceTaskCount, recentTasks] = await Promise.all([
                    prisma.serviceTask.count({
                        where: { email: customer.email }
                    }),
                    prisma.serviceTask.findMany({
                        where: { email: customer.email },
                        select: {
                            id: true,
                            serviceType: true,
                            status: true,
                            createdAt: true,
                            itemModel: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 3
                    })
                ]);

                return {
                    ...customer,
                    serviceTaskCount,
                    recentTasks: recentTasks.map(task => ({
                        id: task.id,
                        serviceType: mapServiceTypeToDisplay(task.serviceType),
                        status: task.status,
                        createdAt: task.createdAt,
                        itemModel: task.itemModel
                    }))
                };
            })
        );

        return NextResponse.json({
            customers: customersWithDetails,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            notifications = true,
            preferredContact = 'email'
        } = body;

        // Validate required fields
        if (!name || !email || !phone) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, phone' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check if customer with email already exists
        const existingCustomer = await prisma.customer.findUnique({
            where: { email }
        });

        if (existingCustomer) {
            return NextResponse.json(
                { error: 'Customer with this email already exists' },
                { status: 409 }
            );
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                address: address || null,
                city: city || null,
                state: state || null,
                zipCode: zipCode || null,
                notifications,
                preferredContact,
            }
        });

        return NextResponse.json({
            message: 'Customer created successfully',
            customer
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json(
            { error: 'Failed to create customer' },
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