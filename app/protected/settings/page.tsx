// app/protected/settings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/app/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    const [activeSection, setActiveSection] = useState('business');
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

    // Custom Select Component
    const CustomSelect = ({ value, onValueChange, options, placeholder }: {
        value: string;
        onValueChange: (value: string) => void;
        options: { value: string; label: string }[];
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
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
                {/* Floating decorative elements */}
                <div className="absolute top-20 left-20 w-32 h-32 glass-effect rounded-full floating-element opacity-20"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 glass-effect rounded-full floating-slow opacity-15"></div>

                <div className="glass-card rounded-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">⚙️ Loading settings...</p>
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Settings</h1>
                        <p className="text-gray-600 dark:text-gray-300">Manage your account preferences and configuration</p>
                    </div>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="glass-button bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 hover:scale-105 flex items-center space-x-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>{saving ? '💾 Saving...' : '💾 Save Changes'}</span>
                    </button>
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
                    {/* Settings Navigation */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Settings</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveSection('business')}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 ${
                                        activeSection === 'business'
                                            ? 'glass-button bg-blue-600 dark:bg-blue-500 text-white'
                                            : 'glass-button text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <User className="w-4 h-4" />
                                    <span> Business Settings</span>
                                </button>
                                <button
                                    onClick={() => setActiveSection('notifications')}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 ${
                                        activeSection === 'notifications'
                                            ? 'glass-button bg-blue-600 dark:bg-blue-500 text-white'
                                            : 'glass-button text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Bell className="w-4 h-4" />
                                    <span> Notifications</span>
                                </button>
                                <button
                                    onClick={() => setActiveSection('display')}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 ${
                                        activeSection === 'display'
                                            ? 'glass-button bg-blue-600 dark:bg-blue-500 text-white'
                                            : 'glass-button text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Monitor className="w-4 h-4" />
                                    <span> Display & Language</span>
                                </button>
                                <button
                                    onClick={() => setActiveSection('security')}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 ${
                                        activeSection === 'security'
                                            ? 'glass-button bg-blue-600 dark:bg-blue-500 text-white'
                                            : 'glass-button text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Shield className="w-4 h-4" />
                                    <span> Security & Privacy</span>
                                </button>
                                <button
                                    onClick={() => setActiveSection('danger')}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 ${
                                        activeSection === 'danger'
                                            ? 'glass-button bg-red-600 dark:bg-red-500 text-white'
                                            : 'glass-button text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
                                    }`}
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    <span> Danger Zone</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Business Settings */}
                        {activeSection === 'business' && (
                            <div className="glass-card rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">🏢 Business Settings</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">Configure your business information and defaults</p>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">Business Name</Label>
                                        <Input
                                            value={settings.businessName}
                                            onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                                            placeholder="Your Business Name"
                                            className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">Business Type</Label>
                                        <CustomSelect
                                            value={settings.businessType}
                                            onValueChange={(value) => setSettings({...settings, businessType: value})}
                                            options={[
                                                { value: 'repair', label: 'Repair Services' },
                                                { value: 'maintenance', label: 'Maintenance' },
                                                { value: 'automotive', label: 'Automotive' },
                                                { value: 'electronics', label: 'Electronics' },
                                                { value: 'appliance', label: 'Appliance Repair' },
                                                { value: 'other', label: 'Other' }
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">Default Service Duration (days)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={settings.defaultServiceDuration}
                                            onChange={(e) => setSettings({...settings, defaultServiceDuration: parseInt(e.target.value)})}
                                            className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeSection === 'notifications' && (
                            <div className="glass-card rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">🔔 Notification Preferences</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">Choose how you want to be notified</p>

                                <div className="space-y-4">
                                    <div className="glass-effect rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">📧 Email Notifications</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Receive updates via email</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={settings.emailNotifications}
                                                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                                            />
                                        </div>
                                    </div>

                                    <div className="glass-effect rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">📱 SMS Notifications</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Receive text messages</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={settings.smsNotifications}
                                                onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                                            />
                                        </div>
                                    </div>

                                    <div className="glass-effect rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">🔔 Push Notifications</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Browser notifications</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={settings.pushNotifications}
                                                onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                                            />
                                        </div>
                                    </div>

                                    <div className="glass-effect rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">📈 Marketing Emails</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Product updates and tips</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={settings.marketingEmails}
                                                onCheckedChange={(checked) => setSettings({...settings, marketingEmails: checked})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Display Settings */}
                        {activeSection === 'display' && (
                            <div className="glass-card rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">🎨 Display & Language</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">Customize your interface preferences</p>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">🌍 Timezone</Label>
                                        <CustomSelect
                                            value={settings.timezone}
                                            onValueChange={(value) => setSettings({...settings, timezone: value})}
                                            options={[
                                                { value: 'America/New_York', label: 'Eastern Time' },
                                                { value: 'America/Chicago', label: 'Central Time' },
                                                { value: 'America/Denver', label: 'Mountain Time' },
                                                { value: 'America/Los_Angeles', label: 'Pacific Time' },
                                                { value: 'UTC', label: 'UTC' }
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">📅 Date Format</Label>
                                        <CustomSelect
                                            value={settings.dateFormat}
                                            onValueChange={(value) => setSettings({...settings, dateFormat: value})}
                                            options={[
                                                { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
                                                { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
                                                { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeSection === 'security' && (
                            <div className="glass-card rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">🔒 Security & Privacy</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">Manage your account security settings</p>

                                <div className="space-y-6">
                                    <div className="glass-effect rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">🔐 Two-Factor Authentication</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                                            </div>
                                            <Switch
                                                checked={settings.twoFactorEnabled}
                                                onCheckedChange={(checked) => setSettings({...settings, twoFactorEnabled: checked})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-gray-900 dark:text-white mb-2 block">⏱️ Session Timeout</Label>
                                        <CustomSelect
                                            value={settings.sessionTimeout.toString()}
                                            onValueChange={(value) => setSettings({...settings, sessionTimeout: parseInt(value)})}
                                            options={[
                                                { value: '15', label: '15 minutes' },
                                                { value: '30', label: '30 minutes' },
                                                { value: '60', label: '1 hour' },
                                                { value: '240', label: '4 hours' },
                                                { value: '480', label: '8 hours' }
                                            ]}
                                        />
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>

                                    <div className="glass-effect rounded-lg p-4">
                                        <h4 className="text-sm font-medium mb-4 text-gray-900 dark:text-white">🔑 Change Password</h4>
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <Input
                                                    type={passwordVisible ? "text" : "password"}
                                                    placeholder="New password"
                                                    className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                                >
                                                    {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <Input
                                                type="password"
                                                placeholder="Confirm new password"
                                                className="glass-effect border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-white"
                                            />
                                            <button className="glass-button text-sm px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
                                                🔄 Update Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Danger Zone */}
                        {activeSection === 'danger' && (
                            <div className="glass-card rounded-xl p-6 border border-red-200 dark:border-red-800">
                                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">⚠️ Danger Zone</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">Irreversible and destructive actions</p>

                                <div className="glass-effect rounded-lg p-4 border border-red-200 dark:border-red-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-red-600 dark:text-red-400">🗑️ Delete Account</h4>
                                            <p className="text-xs text-gray-700 dark:text-gray-300">Permanently delete your account and all data</p>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="glass-button bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 text-sm flex items-center space-x-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete Account</span>
                                        </button>
                                    </div>

                                    {showDeleteConfirm && (
                                        <div className="mt-4 glass-dark rounded-lg p-4 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                                ⚠️ Are you sure? This action cannot be undone.
                                            </p>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    className="glass-button bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 text-sm"
                                                >
                                                    Yes, Delete Account
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="glass-button text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}