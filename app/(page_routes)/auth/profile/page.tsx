"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { User, Mail, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 text-center gap-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    Sign in to view your profile
                </h1>
                <button
                    onClick={() => signIn(undefined, { callbackUrl: "/auth/profile" })}
                    className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/20 active:translate-y-0 active:scale-[0.99] cursor-pointer"
                >
                    Log In
                </button>
                <Link href="/" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    <ArrowLeft size={14} /> Go back home
                </Link>
            </div>
        );
    }

    const { name, email, image } = session.user;

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-200 dark:border-emerald-800">
                        {image ? (
                            <Image
                                src={image}
                                alt={name || "User"}
                                fill
                                className="object-cover"
                                sizes="64px"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                <User size={28} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{name}</h1>
                        <p className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                            <Mail size={13} /> {email}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Go to Dashboard
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <LogOut size={15} /> Log Out
                    </button>
                </div>
            </div>
        </main>
    );
}
