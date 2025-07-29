'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {LogoutButton} from "@/components/logout-button";
import {UserDropdownMenu} from "@/components/UserDropdownMenu";

interface NavigationProps {
  user: User | null;
}

export default function MainNavigation({ user }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Dashboard', href: '/protected/dashboard', icon: '📋' },
    { name: 'New Service', href: '/protected/intake', icon: '➕' },
    { name: 'Reports', href: '/protected/reports', icon: '📊' },
    { name: 'Profile', href: '/protected/profile', icon: '👤' },
    { name: 'Settings', href: '/protected/settings', icon: '⚙️' }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Get user display info
  const getUserDisplayInfo = () => {
    if (!user) return { name: 'User', email: '', initials: 'U' };

    const name = user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'User';

    const email = user.email || '';

    const initials = name
        .split(' ')
        .map((n: string) => n[0])  // Fixed: Added type annotation
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return { name, email, initials };
  };

  const { name, email, initials } = getUserDisplayInfo();

  return (
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
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

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 flex items-center space-x-2 ${
                            isActive(item.href)
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                ))}
              </div>
            </div>

            {/* Right side - User menu and mobile button */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions - Desktop only */}
              <div className="hidden lg:flex items-center space-x-2">
                <Link
                    href="/protected/intake"
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition duration-200"
                >
                  Quick Intake
                </Link>
              </div>

              {/* User Profile */}
              <div className="hidden md:flex items-center space-x-3">
                <button className="text-gray-500 hover:text-gray-700 relative">
                  <span className="sr-only">Notifications</span>
                  <div className="text-lg">🔔</div>
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                </button>

                {user ? (
                    <UserDropdownMenu user={user} />
                ) : (
                    <div className="relative">
                      <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                          U
                        </div>
                      </button>
                    </div>
                )}

                {/* Desktop Logout Button */}
                <LogoutButton
                    variant="outline"
                    size="sm"
                    redirectTo="/auth/login"
                />
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                      <div className="text-xl">✕</div>
                  ) : (
                      <div className="text-xl">☰</div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
                  {navigationItems.map((item) => (
                      <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-3 py-2 rounded-md text-base font-medium transition duration-200 ${
                              isActive(item.href)
                                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                      </Link>
                  ))}

                  {/* Mobile user section */}
                  <div className="pt-4 border-t border-gray-300 mt-4">
                    <div className="flex items-center px-3 py-2">
                      <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium mr-3">
                        {initials}
                      </div>
                      <div>
                        <div className="text-base font-medium text-gray-800">{name}</div>
                        <div className="text-sm text-gray-500">{email}</div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <button className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                        Settings
                      </button>

                      {/* Mobile Logout Button */}
                      <div className="px-3 py-2">
                        <LogoutButton
                            variant="outline"
                            size="sm"
                            className="w-full"
                            redirectTo="/auth/login"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Live Status Bar */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex space-x-6">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span><strong>15</strong> Total</span>
              </span>
                <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span><strong>5</strong> In Progress</span>
              </span>
                <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span><strong>8</strong> Completed Today</span>
              </span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span>Last updated: 2 min ago</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
  );
}