// app/api/labels/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/labels - Get label printing history
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');
        const labelType = searchParams.get('labelType');
        const success = searchParams.get('success');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where clause
        const where: any = {};
        if (taskId) where.taskId = taskId;
        if (labelType) where.labelType = labelType;
        if (success !== null) where.success = success === 'true';

        const [printedLabels, totalCount] = await Promise.all([
            prisma.printedLabel.findMany({
                where,
                include: {
                    printedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    task: {
                        select: {
                            id: true,
                            customerName: true,
                            serviceType: true,
                            itemModel: true,
                            serialNumber: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.printedLabel.count({ where })
        ]);

        const formattedLabels = printedLabels.map(label => ({
            id: label.id,
            labelType: label.labelType,
            printerName: label.printerName,
            success: label.success,
            errorMsg: label.errorMsg,
            createdAt: label.createdAt.toISOString(),
            printedBy: {
                id: label.printedBy.id,
                name: label.printedBy.name || label.printedBy.email,
                email: label.printedBy.email
            },
            task: label.task
        }));

        return NextResponse.json({
            printedLabels: formattedLabels,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching printed labels:', error);
        return NextResponse.json(
            { error: 'Failed to fetch printed labels' },
            { status: 500 }
        );
    }
}

// POST /api/labels - Print a label
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
        const { taskId, labelType = 'SERVICE_TAG', printerName } = body;

        // Validate required fields
        if (!taskId) {
            return NextResponse.json(
                { error: 'Missing required field: taskId' },
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

        // TODO: Integrate with actual label printing system
        // For now, we'll simulate the printing process
        let success = true;
        let errorMsg = null;

        try {
            // Simulate label printing
            const labelData = generateLabelData(task, labelType);
            await simulatePrintLabel(labelData, printerName);

            console.log(`Label printed successfully for task ${taskId}:`, {
                labelType,
                printerName,
                customerName: task.customerName,
                itemModel: task.itemModel
            });

        } catch (printError) {
            success = false;
            errorMsg = printError instanceof Error ? printError.message : 'Print failed';
            console.error('Label printing failed:', printError);
        }

        // Record the print attempt
        const printedLabel = await prisma.printedLabel.create({
            data: {
                taskId,
                labelType,
                printedById: userRecord.id,
                printerName: printerName || null,
                success,
                errorMsg
            },
            include: {
                printedBy: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                task: {
                    select: {
                        customerName: true,
                        serviceType: true,
                        itemModel: true
                    }
                }
            }
        });

        // Log the activity
        await prisma.activityLog.create({
            data: {
                taskId,
                action: 'LABEL_PRINTED',
                description: success
                    ? `${labelType} label printed successfully`
                    : `${labelType} label printing failed: ${errorMsg}`,
                metadata: {
                    labelType,
                    printerName,
                    success,
                    errorMsg
                },
                performedById: userRecord.id,
            }
        });

        if (success) {
            return NextResponse.json({
                message: 'Label printed successfully',
                printedLabel
            }, { status: 201 });
        } else {
            return NextResponse.json({
                message: 'Label printing failed',
                printedLabel,
                error: errorMsg
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error processing label print request:', error);
        return NextResponse.json(
            { error: 'Failed to process label print request' },
            { status: 500 }
        );
    }
}

// POST /api/labels/batch - Print multiple labels
export async function POST_BATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRecord = await prisma.user.findUnique({
            where: { supabaseId: user.id }
        });

        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { taskIds, labelType = 'SERVICE_TAG', printerName } = body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return NextResponse.json(
                { error: 'Missing or invalid taskIds array' },
                { status: 400 }
            );
        }

        // Get all tasks
        const tasks = await prisma.serviceTask.findMany({
            where: {
                id: {
                    in: taskIds
                }
            }
        });

        if (tasks.length !== taskIds.length) {
            return NextResponse.json(
                { error: 'Some tasks not found' },
                { status: 404 }
            );
        }

        const results = [];

        // Process each label
        for (const task of tasks) {
            let success = true;
            let errorMsg = null;

            try {
                const labelData = generateLabelData(task, labelType);
                await simulatePrintLabel(labelData, printerName);
            } catch (printError) {
                success = false;
                errorMsg = printError instanceof Error ? printError.message : 'Print failed';
            }

            // Record the print attempt
            const printedLabel = await prisma.printedLabel.create({
                data: {
                    taskId: task.id,
                    labelType,
                    printedById: userRecord.id,
                    printerName: printerName || null,
                    success,
                    errorMsg
                }
            });

            // Log the activity
            await prisma.activityLog.create({
                data: {
                    taskId: task.id,
                    action: 'LABEL_PRINTED',
                    description: success
                        ? `${labelType} label printed successfully (batch)`
                        : `${labelType} label printing failed (batch): ${errorMsg}`,
                    metadata: {
                        labelType,
                        printerName,
                        success,
                        errorMsg,
                        batchOperation: true
                    },
                    performedById: userRecord.id,
                }
            });

            results.push({
                taskId: task.id,
                customerName: task.customerName,
                success,
                errorMsg,
                printedLabelId: printedLabel.id
            });
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        return NextResponse.json({
            message: `Batch printing completed: ${successCount} successful, ${failureCount} failed`,
            results,
            summary: {
                total: results.length,
                successful: successCount,
                failed: failureCount
            }
        });

    } catch (error) {
        console.error('Error processing batch label printing:', error);
        return NextResponse.json(
            { error: 'Failed to process batch label printing' },
            { status: 500 }
        );
    }
}

// Helper functions
function generateLabelData(task: any, labelType: string) {
    const baseData = {
        taskId: task.id,
        customerName: task.customerName,
        phone: task.phone,
        serviceType: task.serviceType,
        itemModel: task.itemModel,
        serialNumber: task.serialNumber,
        createdAt: task.createdAt
    };

    switch (labelType) {
        case 'SERVICE_TAG':
            return {
                ...baseData,
                title: 'Service Tag',
                qrCode: `${process.env.NEXT_PUBLIC_APP_URL}/task/${task.id}`,
                instructions: 'Scan QR code to view task details'
            };

        case 'CUSTOMER_RECEIPT':
            return {
                ...baseData,
                title: 'Service Receipt',
                receiptNumber: task.id.slice(-8).toUpperCase(),
                estimatedCompletion: task.estimatedCompletion
            };

        case 'INTERNAL_TAG':
            return {
                ...baseData,
                title: 'Internal Tag',
                priority: task.priority,
                assignedTo: task.assignedTo
            };

        default:
            return baseData;
    }
}

async function simulatePrintLabel(labelData: any, printerName?: string) {
    // TODO: Replace with actual printer integration
    // This could integrate with:
    // - Zebra printers via ZPL
    // - Brother printers via P-touch SDK
    // - Generic printers via PDF generation

    // Simulate print delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate occasional print failures (5% failure rate)
    if (Math.random() < 0.05) {
        throw new Error(`Printer ${printerName || 'default'} is out of paper`);
    }

    console.log('Label printed:', {
        printer: printerName || 'default',
        data: labelData
    });
}