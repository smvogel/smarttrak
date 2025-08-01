// app/protected/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/app/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar, Shield, Edit2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    phone: string;
    created_at: string;
    email_confirmed_at: string;
    last_sign_in_at: string;
}

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        avatar_url: ''
    });

    const supabase = createClient();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user) {
            loadProfile();
        }
    }, [user, authLoading, router]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const { data: { user: currentUser }, error } = await supabase.auth.getUser();

            if (error) throw error;
            if (!currentUser) throw new Error('No user found');

            const profile: UserProfile = {
                id: currentUser.id,
                email: currentUser.email || '',
                full_name: currentUser.user_metadata?.full_name || '',
                avatar_url: currentUser.user_metadata?.avatar_url || '',
                phone: currentUser.user_metadata?.phone || currentUser.phone || '',
                created_at: currentUser.created_at,
                email_confirmed_at: currentUser.email_confirmed_at || '',
                last_sign_in_at: currentUser.last_sign_in_at || ''
            };

            setProfile(profile);
            setFormData({
                full_name: profile.full_name,
                phone: profile.phone,
                avatar_url: profile.avatar_url
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    avatar_url: formData.avatar_url
                }
            });

            if (error) throw error;

            // Reload profile to get updated data
            await loadProfile();
            setEditing(false);
            setSuccess('Profile updated successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                full_name: profile.full_name,
                phone: profile.phone,
                avatar_url: profile.avatar_url
            });
        }
        setEditing(false);
        setError(null);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
                {/* Floating decorative elements */}
                <div className="absolute top-20 left-20 w-32 h-32 glass-effect rounded-full floating-element opacity-20"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 glass-effect rounded-full floating-slow opacity-15"></div>

                <div className="glass-card rounded-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">👤 Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
                {/* Floating decorative elements */}
                <div className="absolute top-20 left-20 w-32 h-32 glass-effect rounded-full floating-element opacity-20"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 glass-effect rounded-full floating-slow opacity-15"></div>

                <div className="glass-card rounded-xl p-6 max-w-md w-full">
                    <div className="text-center">
                        <div className="glass-effect rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
                        </div>
                        <p className="text-red-600 dark:text-red-400 mb-4">Failed to load profile</p>
                        <button
                            onClick={loadProfile}
                            className="glass-button bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105"
                        >
                            🔄 Try Again
                        </button>
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
                <div className="flex items-center justify-between">
                    <div className="glass-card rounded-xl p-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">👤 Profile</h1>
                        <p className="text-gray-600 dark:text-gray-300">Manage your account information</p>
                    </div>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="glass-button text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span> Edit Profile</span>
                        </button>
                    )}
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="glass-card rounded-xl border border-green-200 dark:border-green-800 p-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-green-600 dark:text-green-400">✅</span>
                            <span className="text-green-700 dark:text-green-300">{success}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="glass-card rounded-xl border border-red-200 dark:border-red-800 p-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-red-600 dark:text-red-400">❌</span>
                            <span className="text-red-700 dark:text-red-300">{error}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6"> Profile Picture</h3>

                            <div className="text-center">
                                <div className="relative mb-6">
                                    <Avatar className="w-24 h-24 mx-auto glass-effect border-4 border-white/20 dark:border-gray-600/30">
                                        <AvatarImage
                                            src={editing ? formData.avatar_url : profile.avatar_url}
                                            alt={profile.full_name || 'User'}
                                        />
                                        <AvatarFallback className="text-lg glass-effect">
                                            {getInitials(profile.full_name || profile.email)}
                                        </AvatarFallback>
                                    </Avatar>

                                </div>

                                {editing && (
                                    <div className="space-y-2">
                                        <Label className="text-gray-900 dark:text-white text-sm">🔗 Avatar URL</Label>
                                        <Input
                                            type="url"
                                            placeholder="https://example.com/avatar.jpg"
                                            value={formData.avatar_url}
                                            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                            className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                )}

                                {!editing && (
                                    <div className="glass-effect rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.full_name || 'No name set'}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="lg:col-span-2">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">📝 Personal Information</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {editing ? 'Update your personal details' : 'Your account information'}
                            </p>

                            <div className="space-y-6">
                                {editing ? (
                                    // Edit Form
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-gray-900 dark:text-white mb-2 block"> Full Name</Label>
                                                <Input
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                    placeholder="Enter your full name"
                                                    className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-900 dark:text-white mb-2 block"> Phone Number</Label>
                                                <Input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="Enter your phone number"
                                                    className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-gray-900 dark:text-white mb-2 block"> Email (Read-only)</Label>
                                            <Input
                                                value={profile.email}
                                                disabled
                                                className="glass-dark text-gray-900 dark:text-white"
                                            />
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                📧 Email cannot be changed here. Contact support if needed.
                                            </p>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="glass-button bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 hover:scale-105 flex items-center space-x-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                <span>{saving ? ' Saving...' : ' Save Changes'}</span>
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="glass-button text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:text-gray-900 dark:hover:text-white transition-all duration-200 disabled:opacity-50 hover:scale-105 flex items-center space-x-2"
                                            >
                                                <X className="w-4 h-4" />
                                                <span> Cancel</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="space-y-4">
                                        <div className="glass-effect rounded-lg p-4">
                                            <div className="flex items-center space-x-3">
                                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400"> Full Name</p>
                                                    <p className="text-gray-900 dark:text-white">{profile.full_name || 'Not set'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="glass-effect rounded-lg p-4">
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400"> Email</p>
                                                    <p className="text-gray-900 dark:text-white">{profile.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="glass-effect rounded-lg p-4">
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400"> Phone</p>
                                                    <p className="text-gray-900 dark:text-white">{profile.phone || 'Not set'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                {!editing && (
                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">🛡️ Account Information</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Account creation and security details</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-effect rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400"> Member Since</p>
                                        <p className="text-gray-900 dark:text-white text-sm">{formatDate(profile.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-effect rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400"> Email Verified</p>
                                        <p className="text-gray-900 dark:text-white text-sm">
                                            {profile.email_confirmed_at ? formatDate(profile.email_confirmed_at) : 'Not verified'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-effect rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400"> Last Sign In</p>
                                        <p className="text-gray-900 dark:text-white text-sm">{formatDate(profile.last_sign_in_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}