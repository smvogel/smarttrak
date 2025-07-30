// app/api/customers/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/customers/search - Quick search for autocomplete in intake form
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ customers: [] });
        }

        const customers = await prisma.customer.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                preferredContact: true
            },
            take: 10,
            orderBy: {
                name: 'asc'
            }
        });

        // Get bikes/items for each customer by looking at their service tasks
        const customersWithItems = await Promise.all(
            customers.map(async (customer) => {
                const serviceTasks = await prisma.serviceTask.findMany({
                    where: { email: customer.email },
                    select: {
                        id: true,
                        itemModel: true,
                        serialNumber: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });

                // Create "bikes" array from unique items in their service history
                const uniqueItems = serviceTasks
                    .filter(task => task.itemModel) // Only include tasks with items
                    .reduce((unique: any[], task) => {
                        const exists = unique.find(item =>
                            item.model === task.itemModel &&
                            item.serialNumber === task.serialNumber
                        );

                        if (!exists) {
                            // Split itemModel into brand and model (rough approach)
                            const parts = task.itemModel?.split(' ') || [];
                            const brand = parts[0] || '';
                            const model = parts.slice(1).join(' ') || task.itemModel;

                            unique.push({
                                id: task.id, // Use task ID as item ID
                                model: task.itemModel || '',
                                brand,
                                serialNumber: task.serialNumber || ''
                            });
                        }
                        return unique;
                    }, [])
                    .slice(0, 3); // Limit to 3 most recent unique items

                return {
                    ...customer,
                    bikes: uniqueItems // Create "bikes" property for UI compatibility
                };
            })
        );

        return NextResponse.json({ customers: customersWithItems });

    } catch (error) {
        console.error('Error searching customers:', error);
        return NextResponse.json(
            { error: 'Failed to search customers' },
            { status: 500 }
        );
    }
}