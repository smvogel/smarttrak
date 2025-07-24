'use client'

import { signInWithGoogle } from '@/app/auth/actions'

export default function GoogleSignInButton() {
    return (
        <button
            type="submit"
            formAction={signInWithGoogle}            // override the form’s action
            className="w-full flex items-center justify-center gap-3
                 px-4 py-2 border border-gray-300 rounded-md shadow-sm
                 bg-white text-sm font-medium text-gray-700
                 hover:bg-gray-50 focus:outline-none focus:ring-2
                 focus:ring-offset-2 focus:ring-indigo-500"
        >
            {/* svg icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">…</svg>
            Continue with Google
        </button>
    )
}
