// app/protected/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/app/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-red-600">Failed to load profile</p>
                            <Button onClick={loadProfile} className="mt-4">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600">Manage your account information</p>
                </div>
                {!editing && (
                    <Button onClick={() => setEditing(true)} variant="outline">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    {success}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Avatar className="w-24 h-24 mx-auto mb-4">
                            <AvatarImage
                                src={editing ? formData.avatar_url : profile.avatar_url}
                                alt={profile.full_name || 'User'}
                            />
                            <AvatarFallback className="text-lg">
                                {getInitials(profile.full_name || profile.email)}
                            </AvatarFallback>
                        </Avatar>

                        {editing && (
                            <div className="space-y-2">
                                <Label htmlFor="avatar_url">Avatar URL</Label>
                                <Input
                                    id="avatar_url"
                                    type="url"
                                    placeholder="https://example.com/avatar.jpg"
                                    value={formData.avatar_url}
                                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                />
                            </div>
                        )}

                        {!editing && (
                            <div>
                                <h3 className="text-lg font-semibold">{profile.full_name || 'No name set'}</h3>
                                <p className="text-gray-600">{profile.email}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Profile Information */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            {editing ? 'Update your personal details' : 'Your account information'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {editing ? (
                            // Edit Form
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="full_name">Full Name</Label>
                                        <Input
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">Email (Read-only)</Label>
                                    <Input
                                        id="email"
                                        value={profile.email}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Email cannot be changed here. Contact support if needed.
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleSave} disabled={saving}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button variant="outline" onClick={handleCancel} disabled={saving}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                                        <p className="text-gray-900">{profile.full_name || 'Not set'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-gray-900">{profile.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Phone</p>
                                        <p className="text-gray-900">{profile.phone || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Account Information */}
            {!editing && (
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Account creation and security details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                                    <p className="text-gray-900">{formatDate(profile.created_at)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email Verified</p>
                                    <p className="text-gray-900">
                                        {profile.email_confirmed_at ? formatDate(profile.email_confirmed_at) : 'Not verified'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Last Sign In</p>
                                    <p className="text-gray-900">{formatDate(profile.last_sign_in_at)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}