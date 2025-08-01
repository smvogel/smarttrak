// app/protected/support/page.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

    // Custom Select Component
    const CustomSelect = ({ value, onValueChange, options, placeholder }: {
        value: string;
        onValueChange: (value: string) => void;
        options: { value: string; label: string; color?: string }[];
        placeholder?: string;
    }) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="glass-button w-full px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white text-left"
                >
                    {options.find(opt => opt.value === value)?.label || placeholder}
                </button>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                        className={`w-4 h-4 text-gray-400 dark:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-1 glass-modal rounded-lg shadow-xl border border-white/20 dark:border-gray-600/30 w-full z-50">
                        <div className="py-1">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onValueChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                                        value === option.value
                                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/20'
                                    } flex items-center space-x-2`}
                                >
                                    {option.color && (
                                        <div className={`w-2 h-2 ${option.color} rounded-full`}></div>
                                    )}
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

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

    if (success) {
        return (
            <div className="min-h-screen py-8 relative overflow-hidden">
                {/* Floating decorative elements */}
                <div className="absolute top-10 left-10 w-40 h-40 glass-effect rounded-full floating-element opacity-10"></div>
                <div className="absolute top-1/2 right-10 w-32 h-32 glass-effect rounded-full floating-slow opacity-15"></div>
                <div className="absolute bottom-20 left-1/4 w-24 h-24 glass-effect rounded-full floating-fast opacity-20"></div>

                <div className="max-w-2xl mx-auto space-y-6 px-4 relative z-10">
                    <div className="glass-card rounded-xl text-center p-8">
                        <div className="mx-auto w-16 h-16 glass-effect bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ticket Submitted Successfully!</h2>

                        {ticketId && (
                            <div className="glass-effect rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your ticket ID:</p>
                                <code className="text-lg font-mono glass-dark px-3 py-2 rounded text-blue-600 dark:text-blue-400 font-bold">
                                    {ticketId}
                                </code>
                            </div>
                        )}

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            We've received your support request and sent a confirmation email.
                            Our team will get back to you within the expected timeframe based on your priority level.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => setSuccess(false)}
                                className="glass-button w-full text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                            >
                                Submit Another Ticket
                            </button>
                            <Link href="/protected/dashboard">
                                <button className="glass-button bg-blue-600 dark:bg-blue-500 text-white w-full px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105">
                                    Return to Dashboard
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 relative overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-10 left-10 w-40 h-40 glass-effect rounded-full floating-element opacity-10"></div>
            <div className="absolute top-1/2 right-10 w-32 h-32 glass-effect rounded-full floating-slow opacity-15"></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 glass-effect rounded-full floating-fast opacity-20"></div>
            <div className="absolute top-20 right-1/4 w-28 h-28 glass-effect rounded-full floating-element opacity-12"></div>

            <div className="max-w-4xl mx-auto space-y-6 px-4 relative z-10">
                {/* Header */}
                <div className="glass-card rounded-xl p-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Center</h1>
                    <p className="text-gray-600 dark:text-gray-300">Get help with ServiceTracker Pro or report an issue</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Quick Help Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Quick Help</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">Common support resources</p>

                            <div className="space-y-3">
                                <div className="glass-effect rounded-lg p-3 hover:bg-white/10 dark:hover:bg-gray-700/20 cursor-pointer transition-all duration-200 group">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Documentation</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">User guides and tutorials</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-effect rounded-lg p-3 hover:bg-white/10 dark:hover:bg-gray-700/20 cursor-pointer transition-all duration-200 group">
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Live Chat</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Available 9 AM - 5 PM EST</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-effect rounded-lg p-3 hover:bg-white/10 dark:hover:bg-gray-700/20 cursor-pointer transition-all duration-200 group">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Phone Support</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">(555) 123-4567</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Response Times</h3>

                            <div className="space-y-3">
                                <div className="glass-effect rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-sm text-gray-900 dark:text-white">Urgent</span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">2-4 hours</span>
                                    </div>
                                </div>

                                <div className="glass-effect rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <span className="text-sm text-gray-900 dark:text-white">High</span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">4-8 hours</span>
                                    </div>
                                </div>

                                <div className="glass-effect rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span className="text-sm text-gray-900 dark:text-white">Medium</span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">8-24 hours</span>
                                    </div>
                                </div>

                                <div className="glass-effect rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-gray-900 dark:text-white">Low</span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">24-48 hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Ticket Form */}
                    <div className="lg:col-span-2">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Submit a Support Ticket</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Describe your issue and we'll get back to you as soon as possible
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Error Message */}
                                {error && (
                                    <div className="glass-card rounded-lg border border-red-200 dark:border-red-800 p-4">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            <span className="text-red-700 dark:text-red-300">{error}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">Full Name</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">Email Address</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-gray-900 dark:text-white mb-2 block">Subject</Label>
                                    <Input
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Brief description of your issue"
                                        required
                                        className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">Category</Label>
                                        <CustomSelect
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                                            options={[
                                                { value: 'technical', label: 'Technical Issue' },
                                                { value: 'billing', label: 'Billing Question' },
                                                { value: 'feature', label: 'Feature Request' },
                                                { value: 'bug', label: 'Bug Report' },
                                                { value: 'other', label: 'Other' }
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">Priority</Label>
                                        <CustomSelect
                                            value={formData.priority}
                                            onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                                            options={[
                                                { value: 'low', label: 'Low Priority', color: 'bg-green-500' },
                                                { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-500' },
                                                { value: 'high', label: 'High Priority', color: 'bg-orange-500' },
                                                { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-gray-900 dark:text-white mb-2 block">Message</Label>
                                    <Textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Please provide detailed information about your issue..."
                                        className="min-h-[120px] glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>

                                <div className="glass-effect rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                            Expected response time: {
                                            formData.priority === 'urgent' ? '2-4 hours' :
                                                formData.priority === 'high' ? '4-8 hours' :
                                                    formData.priority === 'medium' ? '8-24 hours' : '24-48 hours'
                                        }
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="glass-button bg-blue-600 dark:bg-blue-500 text-white w-full px-4 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 hover:scale-105 flex items-center justify-center space-x-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}