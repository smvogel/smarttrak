// components/ConditionalNavigation.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import LandingHeader from "@/components/LandingHeader";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

interface ConditionalNavigationProps {
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export default function ConditionalNavigation({
                                                  children,
                                                  defaultOpen = false
                                              }: ConditionalNavigationProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const pathname = usePathname();

    // Don't render anything while loading
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Check if we're on a protected route
    const isProtectedRoute = pathname.startsWith('/protected') ||
        pathname.startsWith('/dashboard') ||
        pathname === '/intake' ||
        pathname === '/reports';

    // Show sidebar layout on protected routes when authenticated
    if (isAuthenticated && isProtectedRoute) {
        return (
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar user={user} />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="ml-auto flex items-center space-x-2">
                            {/* Quick actions can go here */}
                            <span className="text-sm text-gray-600">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
              </span>
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    // Show landing header on home page
    if (pathname === '/') {
        return (
            <div className="min-h-screen bg-gray-50">
                <LandingHeader user={user} />
                <main>
                    {children}
                </main>
            </div>
        );
    }

    // Don't show navigation on auth pages
    if (pathname.startsWith('/auth')) {
        return (
            <main className="min-h-screen bg-gray-50">
                {children}
            </main>
        );
    }

    // Default fallback
    return (
        <main className="min-h-screen bg-gray-50">
            {children}
        </main>
    );
}