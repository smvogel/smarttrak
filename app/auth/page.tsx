'use client'

import { useState } from 'react'
import GoogleOneTap from "@/app/components/auth/GoogleOneTap";
import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton";
import LoginForm from '@/app/components/auth/LoginForm'
import SignupForm from "@/app/components/auth/SignUpForm";

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <GoogleOneTap />

            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isSignUp ? 'Create your account' : 'Sign in to your account'}
                    </h2>
                </div>

                <div className="space-y-6">
                    {/* Google Sign In Button */}
                    <GoogleSignInButton />

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    {isSignUp ? <SignupForm /> : <LoginForm />}

                    {/* Toggle between Sign In and Sign Up */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                        >
                            {isSignUp
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Sign up"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}