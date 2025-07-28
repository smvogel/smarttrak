"use client";

import { createClient } from "@/app/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  scope?: 'global' | 'local' | 'others';
  redirectTo?: string;
  showIcon?: boolean;
}

export function LogoutButton({
                               className,
                               variant = "outline",
                               size = "default",
                               scope = 'global',
                               redirectTo = "/auth/login",
                               showIcon = true
                             }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope });

      if (error) {
        console.error('Logout error:', error);
        // You could show a toast notification here instead of alert
        alert(`Logout failed: ${error.message}`);
        return;
      }

      // Navigate to login page
      router.push(redirectTo);

      // Force a hard refresh to clear any cached data
      // This ensures all state is properly reset
      window.location.href = redirectTo;

    } catch (error) {
      console.error('Unexpected logout error:', error);
      alert('An unexpected error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Button
          onClick={logout}
          disabled={isLoading}
          className={className}
          variant={variant}
          size={size}
      >
        {showIcon && <LogOut className="mr-2 h-4 w-4" />}
        {isLoading ? "Signing out..." : "Logout"}
      </Button>
  );
}