// app/protected/settings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/app/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Bell,
    Shield,
    User,
    Monitor,
    Mail,
    Smartphone,
    Save,
    AlertTriangle,
    Eye,
    EyeOff,
    Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Settings {
    // Notification Settings
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;

    // Display Settings
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    dateFormat: string;
    language: string;

    // Security Settings
    twoFactorEnabled: boolean;
    sessionTimeout: number;

    // Business Settings
    businessName: string;
    businessType: string;
    defaultServiceDuration: number;
}

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [settings, setSettings] = useState<Settings>({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        marketingEmails: false,
        theme: 'system',
        timezone: 'America/New_York',
        dateFormat: 'MM/dd/yyyy',
        language: 'en',
        twoFactorEnabled: false,
        sessionTimeout: 30,
        businessName: '',
        businessType: 'repair',
        defaultServiceDuration: 3
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const router = useRouter();

    const supabase = createClient();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user) {
            loadSettings();
        }
    }, [user, authLoading, router]);

    const loadSettings = async () => {
        try {
            setLoading(true);

            // In a real app, you'd load these from a database
            // For now, we'll use user metadata and localStorage
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            }

            // Load business info from user metadata
            if (user?.user_metadata) {
                setSettings(prev => ({
                    ...prev,
                    businessName: user.user_metadata.business_name || '',
                    businessType: user.user_metadata.business_type || 'repair'
                }));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Save to localStorage (in real app, save to database)
            localStorage.setItem('userSettings', JSON.stringify(settings));

            // Update user metadata for business settings
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    business_name: settings.businessName,
                    business_type: settings.businessType,
                }
            });

            if (updateError) throw updateError;

            setSuccess('Settings saved successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setError(error instanceof Error ? error.message : 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        // In a real app, you'd implement account deletion
        alert('Account deletion would be implemented here. This requires server-side logic.');
        setShowDeleteConfirm(false);
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-black">Settings</h1>
                    <p className="text-gray-600">Manage your account preferences and configuration</p>
                </div>
                <Button onClick={saveSettings} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
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
                {/* Settings Navigation */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className={"text-black"}>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <a href="#business" className="block p-2 rounded hover:bg-gray-100 text-sm text-gray-900 hover:text-blue-600">
                                <User className="w-4 h-4 inline mr-2" />
                                Business Settings
                            </a>
                            <a href="#notifications" className="block p-2 rounded hover:bg-gray-100 text-sm text-gray-900 hover:text-blue-600">
                                <Bell className="w-4 h-4 inline mr-2" />
                                Notifications
                            </a>
                            <a href="#display" className="block p-2 rounded hover:bg-gray-100 text-sm text-gray-900 hover:text-blue-600">
                                <Monitor className="w-4 h-4 inline mr-2" />
                                Display & Language
                            </a>
                            <a href="#security" className="block p-2 rounded hover:bg-gray-100 text-sm text-gray-900 hover:text-blue-600">
                                <Shield className="w-4 h-4 inline mr-2" />
                                Security & Privacy
                            </a>
                            <a href="#danger" className="block p-2 rounded hover:bg-red-50 text-sm text-red-600 hover:text-red-700">
                                <AlertTriangle className="w-4 h-4 inline mr-2" />
                                Danger Zone
                            </a>
                        </CardContent>
                    </Card>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Business Settings */}
                    <Card id="business">
                        <CardHeader>
                            <CardTitle className={"text-black"}>Business Settings</CardTitle>
                            <CardDescription className={"text-black"}>Configure your business information and defaults</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="businessName" className="text-gray-900">Business Name</Label>
                                <Input
                                    id="businessName"
                                    value={settings.businessName}
                                    onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                                    className={"text-black"}
                                    placeholder="Your Business Name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="businessType" className="text-gray-900 ">Business Type</Label>
                                <Select value={settings.businessType} onValueChange={(value) => setSettings({...settings, businessType: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={" bg-gray-500"}>
                                        <SelectItem className={" bg-gray-500"} value="repair">Repair Services</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="automotive">Automotive</SelectItem>
                                        <SelectItem value="electronics">Electronics</SelectItem>
                                        <SelectItem value="appliance">Appliance Repair</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="serviceDuration" className="text-gray-900">Default Service Duration (days)</Label>
                                <Input
                                    id="serviceDuration"
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={settings.defaultServiceDuration}
                                    onChange={(e) => setSettings({...settings, defaultServiceDuration: parseInt(e.target.value)})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card id="notifications">
                        <CardHeader>
                            <CardTitle className={"text-black"}>Notification Preferences</CardTitle>
                            <CardDescription className={"text-black"}>Choose how you want to be notified</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-xs text-gray-600">Receive updates via email</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.emailNotifications}
                                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Smartphone className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                                        <p className="text-xs text-gray-600">Receive text messages</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.smsNotifications}
                                    onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Bell className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                                        <p className="text-xs text-gray-600">Browser notifications</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.pushNotifications}
                                    onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Marketing Emails</p>
                                        <p className="text-xs text-gray-600">Product updates and tips</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.marketingEmails}
                                    onCheckedChange={(checked) => setSettings({...settings, marketingEmails: checked})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Display Settings */}
                    <Card id="display">
                        <CardHeader>
                            <CardTitle className={"text-black"}>Display & Language</CardTitle>
                            <CardDescription className={"text-black"}>Customize your interface preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="theme" className="text-gray-900">Theme</Label>
                                <Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'system') => setSettings({...settings, theme: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="timezone" className="text-gray-900">Timezone</Label>
                                <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="dateFormat" className="text-gray-900">Date Format</Label>
                                <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                                        <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                                        <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card id="security">
                        <CardHeader>
                            <CardTitle className={"text-black"}>Security & Privacy</CardTitle>
                            <CardDescription className={"text-black"}>Manage your account security settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                                    <p className="text-xs text-gray-600">Add an extra layer of security</p>
                                </div>
                                <Switch
                                    checked={settings.twoFactorEnabled}
                                    onCheckedChange={(checked) => setSettings({...settings, twoFactorEnabled: checked})}
                                />
                            </div>

                            <div>
                                <Label htmlFor="sessionTimeout" className="text-gray-900">Session Timeout (minutes)</Label>
                                <Select value={settings.sessionTimeout.toString()} onValueChange={(value) => setSettings({...settings, sessionTimeout: parseInt(value)})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="60">1 hour</SelectItem>
                                        <SelectItem value="240">4 hours</SelectItem>
                                        <SelectItem value="480">8 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-sm font-medium mb-2 text-gray-900">Change Password</h4>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Input
                                            type={passwordVisible ? "text" : "password"}
                                            placeholder="New password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                        >
                                            {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <Input type="password" placeholder="Confirm new password" />
                                    <Button variant="outline" size="sm">Update Password</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card id="danger" className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription className={"text-red-600"}>Irreversible and destructive actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 border border-red-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-red-600">Delete Account</h4>
                                            <p className="text-xs text-gray-700">Permanently delete your account and all data</p>
                                        </div>
                                        <Button
                                            className={"text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-200"}
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(true)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </div>

                                    {showDeleteConfirm && (
                                        <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                                            <p className="text-sm text-red-700 mb-3">
                                                Are you sure? This action cannot be undone.
                                            </p>
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="destructive" onClick={handleDeleteAccount}>
                                                    Yes, Delete Account
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}