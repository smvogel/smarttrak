"use client";

import { cn } from "@/app/lib/utils";
import { createClient } from "@/app/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function LoginForm({
                            className,
                            ...props
                          }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Setup Google Sign-in
  useEffect(() => {
    const supabase = createClient();

    // Make function available globally for Google's callback
    window.handleSignInWithGoogle = async (response: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });

        if (error) throw error;

        console.log('Successfully signed in with Google:', data);
        router.push("/protected/dashboard");
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Google sign-in failed");
      } finally {
        setIsLoading(false);
      }
    };

    // Load Google's client library
    if (!document.querySelector('script[src*="accounts.google.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      document.head.appendChild(script);
    }

    // Cleanup
    return () => {
      if (window.handleSignInWithGoogle) {
        delete window.handleSignInWithGoogle;
      }
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/protected/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };



  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                {/* Google's Pre-built Button */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center">
                    <div
                        id="g_id_onload"
                        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                        data-context="signin"
                        data-ux_mode="popup"
                        data-callback="handleSignInWithGoogle"
                        data-auto_select="false"
                        data-itp_support="true"
                        data-use_fedcm_for_prompt="true"
                    ></div>
                    <div
                        className="g_id_signin"
                        data-type="standard"
                        data-shape="pill"
                        data-theme="outline"
                        data-text="signin_with"
                        data-size="large"
                        data-logo_alignment="left"
                    ></div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                    </div>
                  </div>
                </div>

                {/* Email/Password Fields */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      className="placeholder:text-gray-500"
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href="/auth/forgot-password"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                    type="submit"
                    className="w-full border-blue-500"
                    disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                    href="/auth/sign-up"
                    className="underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}