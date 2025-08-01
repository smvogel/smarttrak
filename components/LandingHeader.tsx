// components/LandingHeader.tsx
"use client";

import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {User} from '@supabase/supabase-js';

interface LandingHeaderProps {
    user: User | null;
}

export default function LandingHeader({user}: LandingHeaderProps) {
    // Get user display info
    const getUserDisplayInfo = () => {
        if (!user) return {name: 'User', initials: 'U'};

        const name = user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'User';

        const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return {name, initials};
    };

    const {name, initials} = getUserDisplayInfo();

    return (
        <header
            className="glass-nav sticky top-0 z-50 border-b border-opacity-20 border-white dark:border-gray-600 relative overflow-hidden">
            {/* Floating decorative elements */}
            <div
                className="absolute top-0 left-1/4 w-12 h-12 glass-effect rounded-full opacity-5 floating-element pointer-events-none"></div>
            <div
                className="absolute top-0 right-1/3 w-8 h-8 glass-effect rounded-full opacity-10 floating-slow pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center group">
                            <div
                                className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 group-hover:scale-105">
                                🔧 ServiceTracker Pro
                            </div>
                        </Link>
                    </div>

                    {/* Right side navigation */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            // Authenticated user - show welcome message and dashboard button
                            <>
                                {/* Welcome Message with Glass Effect */}
                                <div
                                    className="glass-effect rounded-full px-4 py-2 hidden sm:flex items-center space-x-3 hover:scale-105 transition-all duration-200">
                                    <div
                                        className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-xs font-medium shadow-lg">
                                        {initials}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        Welcome back, {name}! 👋
                                    </span>
                                </div>

                                {/* Dashboard Button */}
                                <Button
                                    asChild
                                    className="glass-button bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:scale-105 transition-all duration-200 border-0"
                                >
                                    <Link href="/protected/dashboard" className="flex items-center space-x-2">
                                        <span>📋</span>
                                        <span>Dashboard</span>
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            // Unauthenticated user - show login/signup buttons
                            <div className="flex items-center space-x-3">
                                {/* Sign In Button */}
                                <Button
                                    variant="outline"
                                    asChild
                                    className="glass-button border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 hover:scale-105"
                                >
                                    <Link href="/auth/login" className="flex items-center space-x-2">
                                        <span>🚪</span>
                                        <span>Sign In</span>
                                    </Link>
                                </Button>

                                {/* Sign Up Button */}
                                <Button
                                    asChild
                                    className="glass-button bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:scale-105 transition-all duration-200 border-0"
                                >
                                    <Link href="/auth/sign-up" className="flex items-center space-x-2">
                                        <span>✨</span>
                                        <span>Sign Up</span>
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </header>
    );
}