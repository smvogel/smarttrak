// components/UserDropdownMenu.tsx
"use client";

import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/logout-button";
import { User as UserIcon, Settings, LogOut } from "lucide-react";

interface UserDropdownMenuProps {
    user: User;
}

export function UserDropdownMenu({ user }: UserDropdownMenuProps) {
    const getUserDisplayInfo = () => {
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:ring-2 hover:ring-blue-300 transition-all">
                    <span className="sr-only">Open user menu</span>
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={user.user_metadata?.avatar_url}
                            alt={name}
                        />
                        <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {email}
                        </p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/protected/profile" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/protected/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <LogoutButton
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-red-600 hover:text-red-700 hover:bg-transparent font-normal justify-start"
                        showIcon={false}
                        redirectTo="/auth/login"
                    />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}