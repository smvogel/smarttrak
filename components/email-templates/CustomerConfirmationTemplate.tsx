// components/email-templates/CustomerConfirmationTemplate.tsx
import * as React from 'react';

interface CustomerConfirmationTemplateProps {
    name: string;
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    ticketId?: string;
}

export function CustomerConfirmationTemplate({
                                                 name,
                                                 subject,
                                                 priority,
                                                 ticketId
                                             }: CustomerConfirmationTemplateProps) {
    const expectedResponse = {
        urgent: '2-4 hours',
        high: '4-8 hours',
        medium: '8-24 hours',
        low: '24-48 hours'
    };

    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '40px 20px'
        }}>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '32px',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '20px'
            }}>
                <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px'
                }}>
                    🔧 ServiceTracker Pro
                </div>
                <div style={{
                    fontSize: '16px',
                    color: '#6b7280'
                }}>
                    Support Request Received
                </div>
            </div>

            {/* Success Message */}
            <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#166534',
                    marginBottom: '8px'
                }}>
                    ✅ Thank you for contacting us!
                </div>
                <div style={{
                    fontSize: '14px',
                    color: '#166534'
                }}>
                    We&#39;ve received your support request and will respond shortly.
                </div>
            </div>

            {/* Greeting */}
            <div style={{
                fontSize: '16px',
                color: '#374151',
                marginBottom: '24px',
                lineHeight: '1.6'
            }}>
                Hi {name},
                <br /><br />
                Thank you for reaching out to our support team. We&#39;ve received your request and wanted to confirm the details with you.
            </div>

            {/* Ticket Summary */}
            <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '16px',
                    marginTop: '0'
                }}>
                    Your Support Request
                </h3>

                {ticketId && (
                    <div style={{ marginBottom: '12px' }}>
            <span style={{
                fontSize: '12px',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                padding: '4px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace'
            }}>
              Ticket ID: {ticketId}
            </span>
                    </div>
                )}

                <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '8px'
                }}>
                    <strong>Subject:</strong> {subject}
                </div>

                <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '8px'
                }}>
                    <strong>Priority:</strong>
                    <span style={{
                        marginLeft: '8px',
                        backgroundColor: priority === 'urgent' ? '#fecaca' : priority === 'high' ? '#fed7aa' : priority === 'medium' ? '#fef3c7' : '#dcfce7',
                        color: priority === 'urgent' ? '#dc2626' : priority === 'high' ? '#9a3412' : priority === 'medium' ? '#92400e' : '#166534',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
            {priority}
          </span>
                </div>
            </div>

            {/* Response Time */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    marginBottom: '8px',
                    marginTop: '0'
                }}>
                    What happens next?
                </h3>
                <div style={{
                    fontSize: '14px',
                    color: '#1e3a8a',
                    lineHeight: '1.6'
                }}>
                    Our support team will review your request and respond within <strong>{expectedResponse[priority]}</strong>.
                    <br /><br />
                    If you have any additional information or questions, simply reply to this email.
                </div>
            </div>

            {/* Quick Links */}
            <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '16px',
                    marginTop: '0'
                }}>
                    While you wait...
                </h3>
                <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.6'
                }}>
                    • Check out our <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>documentation</a> for quick answers
                    <br />
                    • Visit our <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>FAQ section</a> for common questions
                    <br />
                    • Join our <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>community forum</a> for tips and discussions
                </div>
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb',
                fontSize: '12px',
                color: '#6b7280'
            }}>
                <p style={{ margin: '0 0 8px 0' }}>
                    Need urgent assistance? Call us at <strong>(555) 123-4567</strong>
                </p>
                <p style={{ margin: '0' }}>
                    ServiceTracker Pro Support Team • support@yourdomain.com
                </p>
            </div>
        </div>
    );
}