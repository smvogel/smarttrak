// components/LandingHeader.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

interface LandingHeaderProps {
    user: User | null;
}

export default function LandingHeader({ user }: LandingHeaderProps) {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <div className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition duration-200">
                                🔧 ServiceTracker Pro
                            </div>
                        </Link>
                    </div>

                    {/* Right side navigation */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            // Authenticated user - show dashboard button
                            <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}!
                </span>
                                <Button asChild>
                                    <Link href="/protected/dashboard">
                                        📋 Dashboard
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            // Unauthenticated user - show login/signup buttons
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" asChild>
                                    <Link href="/auth/login">
                                        Sign In
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/auth/sign-up">
                                        Sign Up
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