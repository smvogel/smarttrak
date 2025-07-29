// components/email-templates/SupportTicketTemplate.tsx
import * as React from 'react';

interface SupportTicketTemplateProps {
    name: string;
    email: string;
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'technical' | 'billing' | 'feature' | 'bug' | 'other';
    message: string;
    timestamp: string;
}

export function SupportTicketTemplate({
                                          name,
                                          email,
                                          subject,
                                          priority,
                                          category,
                                          message,
                                          timestamp
                                      }: SupportTicketTemplateProps) {
    const priorityColors = {
        low: { bg: '#dcfce7', color: '#166534' },
        medium: { bg: '#fef3c7', color: '#92400e' },
        high: { bg: '#fed7aa', color: '#9a3412' },
        urgent: { bg: '#fecaca', color: '#dc2626' }
    };

    const categoryLabels = {
        technical: 'Technical Issue',
        billing: 'Billing Question',
        feature: 'Feature Request',
        bug: 'Bug Report',
        other: 'Other'
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
                    New Support Ticket Received
                </div>
            </div>

            {/* Priority Badge */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <span style={{
            display: 'inline-block',
            backgroundColor: priorityColors[priority].bg,
            color: priorityColors[priority].color,
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }}>
          {priority} Priority
        </span>
            </div>

            {/* Ticket Details */}
            <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '16px',
                    marginTop: '0'
                }}>
                    Ticket Details
                </h2>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tr>
                        <td style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#374151',
                            width: '120px',
                            verticalAlign: 'top'
                        }}>
                            Subject:
                        </td>
                        <td style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#1f2937'
                        }}>
                            {subject}
                        </td>
                    </tr>

                    <tr>
                        <td style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#374151',
                            verticalAlign: 'top'
                        }}>
                            Category:
                        </td>
                        <td style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#1f2937'
                        }}>
                            {categoryLabels[category]}
                        </td>
                    </tr>

                    <tr>
                        <td style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#374151',
                            verticalAlign: 'top'
                        }}>
                            From:
                        </td>
                        <td style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#1f2937'
                        }}>
                            {name} ({email})
                        </td>
                    </tr>

                    <tr>
                        <td style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#374151',
                            verticalAlign: 'top'
                        }}>
                            Submitted:
                        </td>
                        <td style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#1f2937'
                        }}>
                            {timestamp}
                        </td>
                    </tr>
                </table>
            </div>

            {/* Message */}
            <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '12px',
                    marginTop: '0'
                }}>
                    Message:
                </h3>
                <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                }}>
                    {message}
                </div>
            </div>

            {/* Response Time Info */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
            }}>
                <div style={{
                    fontSize: '14px',
                    color: '#1e40af',
                    fontWeight: 'bold',
                    marginBottom: '4px'
                }}>
                    Expected Response Time:
                </div>
                <div style={{
                    fontSize: '14px',
                    color: '#1e3a8a'
                }}>
                    {priority === 'urgent' ? '2-4 hours' :
                        priority === 'high' ? '4-8 hours' :
                            priority === 'medium' ? '8-24 hours' : '24-48 hours'}
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
                    This email was sent from ServiceTracker Pro Support System
                </p>
                <p style={{ margin: '0' }}>
                    Reply to this email to respond to the customer
                </p>
            </div>
        </div>
    );
}