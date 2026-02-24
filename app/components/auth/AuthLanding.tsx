'use client';

// src/components/AuthLanding.tsx
import { Chrome } from 'lucide-react'; // Use Chrome as Google stand-in
import { signIn } from 'next-auth/react'; // For real Google login (assuming Auth.js/NextAuth setup)

export default function AuthLanding() {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
            {/* Top right corner link – customize to your main app */}
            <div className="absolute top-6 right-6">
                <a
                    href="/" // ← e.g. https://laviejaadventures.com or your chat/app home
                    className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2 transition-colors"
                >
                    Go to La Vieja Adventures →
                </a>
            </div>

            <div className="w-full max-w-md space-y-10 text-center">
                {/* Logo / Brand – customize name & star color */}
                <div className="flex justify-center">
                    <div className="text-5xl font-bold tracking-tight">
                        <span className="text-purple-500">★</span> La Vieja
                    </div>
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                    Build on the
                    <br />
                    La Vieja Developer Platform
                </h1>

                <p className="text-gray-400 text-lg">
                    Sign in or create a developer account to build with the La Vieja API
                </p>

                {/* Google Button – using Chrome icon from lucide-react */}
                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })} // Redirect after login (change path as needed)
                    className="w-full bg-white text-gray-900 hover:bg-gray-100 font-medium py-3.5 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-md"
                >
                    <Chrome className="h-7 w-7" /> {/* Slightly larger for better visibility */}
                    Continue with Google
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gray-950 text-gray-500">OR</span>
                    </div>
                </div>

                {/* Email input + button – placeholder for now */}
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />

                    <button
                        type="button"
                        onClick={() => alert('Email/magic link coming soon – implement your auth flow here!')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3.5 px-6 rounded-lg transition-colors"
                    >
                        Continue with email
                    </button>
                </div>

                <p className="text-sm text-gray-500 mt-8">
                    By continuing, you agree to La Vieja Adventures's{' '}
                    <a href="/terms" className="text-purple-400 hover:underline">
                        Terms of Service
                    </a>
                    ,{' '}
                    <a href="/usage-policy" className="text-purple-400 hover:underline">
                        Usage Policy
                    </a>
                    , and acknowledge our{' '}
                    <a href="/privacy" className="text-purple-400 hover:underline">
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}