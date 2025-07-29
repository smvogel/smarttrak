// app/api/support/ticket/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
    try {
        const body: SupportTicket = await request.json();

        // Validate required fields
        if (!body.name || !body.email || !body.subject || !body.message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if Resend is configured
        if (!process.env.RESEND_API_KEY) {
            console.log('Support Ticket Submitted (Resend not configured):', {
                ...body,
                timestamp: new Date().toISOString()
            });

            return NextResponse.json({
                success: true,
                message: 'Ticket submitted successfully (logged to console - configure Resend API key for email delivery)'
            });
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

        // Generate a simple ticket ID
        const ticketId = `ST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        try {
            // Send support ticket email to your team
            const { data: supportEmailData, error: supportEmailError } = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'sam.vogel@hotmail.com',
                subject: `[Support - ${body.priority.toUpperCase()}] ${body.subject}`,
                react: SupportTicketTemplate({
                    name: body.name,
                    email: body.email,
                    subject: body.subject,
                    priority: body.priority,
                    category: body.category,
                    message: body.message,
                    timestamp: timestamp
                }),
                // Fallback text version
                text: `
Support Ticket Submission - ${ticketId}
========================================

Name: ${body.name}
Email: ${body.email}
Subject: ${body.subject}
Priority: ${body.priority.toUpperCase()}
Category: ${body.category.toUpperCase()}

Message:
${body.message}

========================================
Submitted: ${timestamp}
        `
            });

            if (supportEmailError) {
                console.error('Error sending support team email:', supportEmailError);
                throw supportEmailError;
            }

            // Send confirmation email to customer
            const { data: confirmationEmailData, error: confirmationEmailError } = await resend.emails.send({
                from: process.env.SUPPORT_FROM_EMAIL || 'ServiceTracker Pro <onboarding@resend.dev>',
                to: [body.email],
                subject: `Support Request Received - ${body.subject}`,
                react: CustomerConfirmationTemplate({
                    name: body.name,
                    subject: body.subject,
                    priority: body.priority,
                    ticketId: ticketId
                }),
                // Fallback text version
                text: `
Hi ${body.name},

Thank you for contacting ServiceTracker Pro support!

We've received your support request:
- Subject: ${body.subject}
- Priority: ${body.priority.toUpperCase()}
- Ticket ID: ${ticketId}

Expected response time: ${
                    body.priority === 'urgent' ? '2-4 hours' :
                        body.priority === 'high' ? '4-8 hours' :
                            body.priority === 'medium' ? '8-24 hours' : '24-48 hours'
                }

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
                ticketId
            });

            return NextResponse.json({
                success: true,
                message: 'Support ticket submitted successfully',
                ticketId: ticketId,
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