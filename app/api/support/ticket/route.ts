// app/api/support/ticket/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { Resend } from 'resend';
import { SupportTicketTemplate } from '@/components/email-templates/SupportTicketTemplate';
import { CustomerConfirmationTemplate } from '@/components/email-templates/CustomerConfirmationTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SupportTicket {
    name: string;
    email: string;
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'technical' | 'billing' | 'feature' | 'bug' | 'other';
    message: string;
}

// POST /api/support/ticket - Create new support ticket with Resend integration
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: SupportTicket = await request.json();
        const { name, email, subject, priority, category, message } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, subject, message' },
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

        // Validate priority and category
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        const validCategories = ['technical', 'billing', 'feature', 'bug', 'other'];

        if (priority && !validPriorities.includes(priority)) {
            return NextResponse.json(
                { error: 'Invalid priority level' },
                { status: 400 }
            );
        }

        if (category && !validCategories.includes(category)) {
            return NextResponse.json(
                { error: 'Invalid category' },
                { status: 400 }
            );
        }

        // Generate timestamp and ticket ID
        const timestamp = new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        const ticketId = `ST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create ticket data for storage
        const ticketData = {
            ticketId,
            name,
            email,
            subject,
            priority: priority || 'medium',
            category: category || 'technical',
            message,
            userId: user.id,
            status: 'open',
            createdAt: new Date().toISOString(),
            timestamp
        };

        // Store ticket in user metadata (temporary solution)
        // TODO: Create a proper support_tickets table in your Prisma schema for production
        try {
            const { data: currentUser } = await supabase.auth.getUser();
            const existingTickets = currentUser.user?.user_metadata?.support_tickets || [];
            const updatedTickets = [...existingTickets, ticketData].slice(-50); // Keep last 50 tickets

            await supabase.auth.updateUser({
                data: {
                    support_tickets: updatedTickets
                }
            });
        } catch (updateError) {
            console.warn('Could not save ticket to user metadata:', updateError);
            // Continue anyway - the email notification is more important
        }

        // Check if Resend is configured
        if (!process.env.RESEND_API_KEY) {
            console.log('Support Ticket Submitted (Resend not configured):', {
                ...ticketData,
                timestamp: new Date().toISOString()
            });

            return NextResponse.json({
                success: true,
                message: 'Ticket submitted successfully (logged to console - configure Resend API key for email delivery)',
                ticketId
            });
        }

        try {
            // Send support ticket email to your team
            const { data: supportEmailData, error: supportEmailError } = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'sam.vogel@hotmail.com',
                subject: `[Support - ${priority.toUpperCase()}] ${subject}`,
                react: SupportTicketTemplate({
                    name,
                    email,
                    subject,
                    priority,
                    category,
                    message,
                    timestamp
                }),
                // Fallback text version
                text: `
Support Ticket Submission - ${ticketId}
========================================

Name: ${name}
Email: ${email}
Subject: ${subject}
Priority: ${priority.toUpperCase()}
Category: ${category.toUpperCase()}

Message:
${message}

========================================
Submitted: ${timestamp}
User ID: ${user.id}
        `
            });

            if (supportEmailError) {
                console.error('Error sending support team email:', supportEmailError);
                throw supportEmailError;
            }

            // Send confirmation email to customer
            const { data: confirmationEmailData, error: confirmationEmailError } = await resend.emails.send({
                from: process.env.SUPPORT_FROM_EMAIL || 'ServiceTracker Pro <onboarding@resend.dev>',
                to: [email],
                subject: `Support Request Received - ${subject}`,
                react: CustomerConfirmationTemplate({
                    name,
                    subject,
                    priority,
                    ticketId
                }),
                // Fallback text version
                text: `
Hi ${name},

Thank you for contacting ServiceTracker Pro support!

We've received your support request:
- Subject: ${subject}
- Priority: ${priority.toUpperCase()}
- Ticket ID: ${ticketId}

Expected response time: ${getResponseTime(priority)}

Our team will review your request and respond shortly. If you have any additional information, simply reply to this email.

Best regards,
ServiceTracker Pro Support Team
        `
            });

            if (confirmationEmailError) {
                console.error('Error sending customer confirmation email:', confirmationEmailError);
                // Don't throw here - we still want to report success since the main ticket was sent
            }

            console.log('Support ticket emails sent successfully:', {
                supportEmail: supportEmailData?.id,
                confirmationEmail: confirmationEmailData?.id,
                ticketId,
                userId: user.id
            });

            return NextResponse.json({
                success: true,
                message: 'Support ticket submitted successfully',
                ticketId,
                expectedResponseTime: getResponseTime(priority),
                emailIds: {
                    support: supportEmailData?.id,
                    confirmation: confirmationEmailData?.id
                }
            });

        } catch (emailError) {
            console.error('Resend error:', emailError);
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error processing support ticket:', error);
        return NextResponse.json(
            { error: 'Failed to submit ticket' },
            { status: 500 }
        );
    }
}

// GET /api/support/ticket - Get user's support tickets
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get tickets from user metadata
        const tickets = user.user_metadata?.support_tickets || [];

        // Sort by creation date (newest first)
        const sortedTickets = tickets.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({
            tickets: sortedTickets
        });

    } catch (error) {
        console.error('Error fetching support tickets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch support tickets' },
            { status: 500 }
        );
    }
}

function getResponseTime(priority: string): string {
    switch (priority) {
        case 'urgent': return '2-4 hours';
        case 'high': return '4-8 hours';
        case 'medium': return '8-24 hours';
        case 'low': return '24-48 hours';
        default: return '24-48 hours';
    }
}