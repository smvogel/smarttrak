// app/protected/support/page.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Mail,
    MessageCircle,
    Clock,
    CheckCircle,
    AlertCircle,
    Phone,
    FileText
} from 'lucide-react';
import Link from "next/link";

interface SupportTicket {
    name: string;
    email: string;
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'technical' | 'billing' | 'feature' | 'bug' | 'other';
    message: string;
}

export default function SupportPage() {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<SupportTicket>({
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        email: user?.email || '',
        subject: '',
        priority: 'medium',
        category: 'technical',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/support/ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit ticket');
            }

            const result = await response.json();
            setSuccess(true);
            setTicketId(result.ticketId || null);
            setFormData({
                ...formData,
                subject: '',
                message: ''
            });

            setTimeout(() => {
                setSuccess(false);
                setTicketId(null);
            }, 10000); // Show success message for 10 seconds
        } catch (error) {
            console.error('Error submitting ticket:', error);
            setError('Failed to submit support ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorityColors = {
        low: 'text-green-600 bg-green-50',
        medium: 'text-yellow-600 bg-yellow-50',
        high: 'text-orange-600 bg-orange-50',
        urgent: 'text-red-600 bg-red-50'
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="text-center p-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ticket Submitted Successfully!</h2>

                    {ticketId && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600 mb-2">Your ticket ID:</p>
                            <code className="text-lg font-mono bg-white px-3 py-2 rounded border text-blue-600 font-bold">
                                {ticketId}
                            </code>
                        </div>
                    )}

                    <p className="text-gray-600 mb-6">
                        We&#39;ve received your support request and sent a confirmation email.
                        Our team will get back to you within the expected timeframe based on your priority level.
                    </p>

                    <div className="space-y-3">
                        <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
                            Submit Another Ticket
                        </Button>
                        <Button asChild className="w-full">
                            <Link href="/protected/dashboard">
                                Return to Dashboard
                            </Link>
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
                <p className="text-gray-600">Get help with ServiceTracker Pro or report an issue</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Quick Help Cards */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Help</CardTitle>
                            <CardDescription>Common support resources</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">Documentation</p>
                                    <p className="text-xs text-gray-500">User guides and tutorials</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <MessageCircle className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">Live Chat</p>
                                    <p className="text-xs text-gray-500">Available 9 AM - 5 PM EST</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <Phone className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium">Phone Support</p>
                                    <p className="text-xs text-gray-500">(555) 123-4567</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Response Times</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-sm">Urgent</span>
                                </div>
                                <span className="text-sm text-gray-600">2-4 hours</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <span className="text-sm">High</span>
                                </div>
                                <span className="text-sm text-gray-600">4-8 hours</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm">Medium</span>
                                </div>
                                <span className="text-sm text-gray-600">8-24 hours</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm">Low</span>
                                </div>
                                <span className="text-sm text-gray-600">24-48 hours</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Support Ticket Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Submit a Support Ticket</CardTitle>
                        <CardDescription>
                            Describe your issue and we&#39;ll get back to you as soon as possible
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="Brief description of your issue"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technical">Technical Issue</SelectItem>
                                            <SelectItem value="billing">Billing Question</SelectItem>
                                            <SelectItem value="feature">Feature Request</SelectItem>
                                            <SelectItem value="bug">Bug Report</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    Low Priority
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                    Medium Priority
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="high">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                    High Priority
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="urgent">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    Urgent
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Please provide detailed information about your issue..."
                                    className="min-h-[120px]"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>
                  Expected response time: {
                                    formData.priority === 'urgent' ? '2-4 hours' :
                                        formData.priority === 'high' ? '4-8 hours' :
                                            formData.priority === 'medium' ? '8-24 hours' : '24-48 hours'
                                }
                </span>
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                <Mail className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}