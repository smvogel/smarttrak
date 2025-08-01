'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {LogoutButton} from "@/components/logout-button";
import {UserDropdownMenu} from "@/components/UserDropdownMenu";
import {ModeToggle} from "@/components/darkToggle";

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
    { name: 'Support', href: '/protected/support', icon: '🆘' },
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
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return { name, email, initials };
  };

  const { name, email, initials } = getUserDisplayInfo();

  return (
      <nav className="glass-nav sticky top-0 z-50 border-b border-opacity-20 border-white dark:border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition duration-200 group-hover:scale-105">
                  🔧 ServiceTracker Pro
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                {/* Render items up to and including Support */}
                {navigationItems.slice(0, 5).map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group ${
                            isActive(item.href)
                                ? 'glass-button bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                                : 'glass-button text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      <span className="group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                ))}

                {/* ModeToggle between Support and Profile */}
                <div className="flex items-center">
                  <ModeToggle />
                </div>

                {/* Render remaining items (Profile and Settings) */}
                {navigationItems.slice(5).map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group ${
                            isActive(item.href)
                                ? 'glass-button bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                                : 'glass-button text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      <span className="group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
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
                    className="glass-button bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 font-medium shadow-lg hover:scale-105"
                >
                  ⚡ Quick Intake
                </Link>
              </div>

              {/* User Profile */}
              <div className="hidden md:flex items-center space-x-3">
                <button className="glass-button text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 relative p-2 rounded-lg transition-all duration-200 group">
                  <span className="sr-only">Notifications</span>
                  <div className="text-lg group-hover:scale-110 transition-transform duration-200">🔔</div>
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs shadow-lg animate-pulse"></span>
                </button>

                {user ? (
                    <div className="glass-button p-1 rounded-lg">
                      <UserDropdownMenu user={user} />
                    </div>
                ) : (
                    <div className="relative">
                      <button className="glass-button flex text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-1 transition-all duration-200 hover:scale-105">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-sm font-medium shadow-lg">
                          U
                        </div>
                      </button>
                    </div>
                )}

                {/* Desktop Logout Button */}
                <div className="glass-button rounded-lg p-1">
                  <LogoutButton
                      variant="outline"
                      size="sm"
                      redirectTo="/auth/login"
                  />
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="glass-button text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-3 rounded-lg transition-all duration-200 hover:scale-105"
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
                <div className="glass-dark rounded-xl m-4 p-4 space-y-2 border border-opacity-20 border-white dark:border-gray-600">
                  {/* Render items up to and including Support */}
                  {navigationItems.slice(0, 5).map((item) => (
                      <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                              isActive(item.href)
                                  ? 'glass-button bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                                  : 'glass-button text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                      </Link>
                  ))}

                  {/* ModeToggle in mobile menu */}
                  <div className="flex justify-center py-2">
                    <ModeToggle />
                  </div>

                  {/* Render remaining items (Profile and Settings) */}
                  {navigationItems.slice(5).map((item) => (
                      <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                              isActive(item.href)
                                  ? 'glass-button bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                                  : 'glass-button text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                      </Link>
                  ))}

                  {/* Mobile user section */}
                  <div className="pt-4 border-t border-gray-300 dark:border-gray-600 border-opacity-30 mt-4">
                    <div className="glass-effect rounded-lg p-4 mb-3">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-sm font-medium mr-3 shadow-lg">
                          {initials}
                        </div>
                        <div>
                          <div className="text-base font-medium text-gray-800 dark:text-white">{name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{email}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link
                          href="/protected/settings"
                          className="glass-button block w-full text-left px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <span>⚙️</span>
                          <span>Settings</span>
                        </div>
                      </Link>

                      {/* Mobile Logout Button */}
                      <div className="p-2">
                        <LogoutButton
                            variant="outline"
                            size="sm"
                            className="w-full glass-button"
                            redirectTo="/auth/login"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
        {/* Floating decorative elements */}
        <div className="absolute top-0 left-1/4 w-16 h-16 glass-effect rounded-full opacity-10 floating-element pointer-events-none"></div>
        <div className="absolute top-0 right-1/3 w-12 h-12 glass-effect rounded-full opacity-5 floating-slow pointer-events-none"></div>


      </nav>
  );
}