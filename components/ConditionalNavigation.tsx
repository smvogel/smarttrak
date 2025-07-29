"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

import LandingHeader from "@/components/LandingHeader";
import MainNavigation from "@/components/navigation/Navigation";

export default function ConditionalNavigation() {
    const { user, loading, isAuthenticated } = useAuth();
    const pathname = usePathname();

    // Don't render anything while loading
    if (loading) {
        return null;
    }

    // Check if we're on a protected route
    const isProtectedRoute = pathname.startsWith('/protected') ||
        pathname.startsWith('/dashboard') ||
        pathname === '/intake' ||
        pathname === '/reports';

    // Show full navigation on protected routes when authenticated
    if (isAuthenticated && isProtectedRoute) {
        return <MainNavigation user={user} />;
    }

    // Show landing header on home page
    if (pathname === '/') {
        return <LandingHeader user={user} />;
    }

    // Don't show navigation on auth pages
    if (pathname.startsWith('/auth')) {
        return null;
    }

    return null;
}