"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import {
    ArrowRight,
    Bird,
    CalendarClock,
    CalendarDays,
    Compass,
    Mail,
    MapPin,
    Mountain,
    Phone,
    ShieldCheck,
    Sparkles,
    TreePine,
    User,
    LogOut,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useUser } from "@auth0/nextjs-auth0/client";
import LoginButton from "../../../src/components/LoginButton";
import LogoutButton from "../../../src/components/LogoutButton";
import Profile from "../../../src/components/Profile";

// Mock data for bookings (replace with actual API fetch in production)
const mockBookings = [
    {
        id: 1,
        tour: "Ciudad Esmeralda Tour",
        date: "2026-03-15",
        time: "09:00 AM",
        status: "Upcoming",
        participants: 4,
    },
    {
        id: 2,
        tour: "Rio La Vieja Adventure",
        date: "2026-02-28",
        time: "10:00 AM",
        status: "Upcoming",
        participants: 2,
    },
    {
        id: 3,
        tour: "Parque Nacional Hike",
        date: "2026-01-10",
        time: "08:00 AM",
        status: "Past",
        participants: 3,
    },
];

export default function DashboardPage() {
    const { lang } = useLanguage();
    const tr = translations[lang].dashboard || translations[lang].info; // Fallback to info if dashboard translations not available

    const { user, error, isLoading } = useUser();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (user) {
            // TODO: Replace with actual API call to fetch user's bookings
            // e.g., fetch('/api/bookings').then(res => res.json()).then(setBookings);
            setBookings(mockBookings);
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-zinc-700 dark:text-zinc-300">
                {lang === "es" ? "Cargando..." : "Loading..."}
            </div>
        );
    }

    if (error) {
        console.error("Auth error:", error);
        return (
            <div className="flex justify-center items-center h-screen text-red-600">
                {lang === "es" ? "Error de autenticación" : "Authentication error"}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
            <DynamicHeroHeader />

            <div className="mx-auto w-full max-w-6xl space-y-6">
                {!user ? (
                    <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
                        <div className="text-center space-y-4">
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
                                {lang === "es" ? "Inicia sesión en tu dashboard" : "Log in to your dashboard"}
                            </h1>
                            <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                                {lang === "es"
                                    ? "Accede para ver tus reservas, perfil y más."
                                    : "Access to view your bookings, profile, and more."}
                            </p>
                            <LoginButton />
                        </div>
                    </section>
                ) : (
                    <>
                        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
                            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                <div className="max-w-3xl space-y-4">
                                    <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
                                        <Sparkles size={16} />
                                        {lang === "es" ? "Bienvenido de vuelta" : "Welcome back"}
                                    </p>
                                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
                                        {lang === "es" ? "Tu Dashboard de Tours" : "Your Tours Dashboard"}
                                    </h1>
                                    <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                                        {lang === "es"
                                            ? "Gestiona tus reservas, ve detalles de tours y actualiza tu perfil."
                                            : "Manage your bookings, view tour details, and update your profile."}
                                    </p>
                                </div>

                                <div className="grid w-full gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 md:max-w-xs">
                                    <a
                                        href="/booking"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 dark:focus-visible:ring-emerald-700"
                                    >
                                        {lang === "es" ? "Reservar Nuevo Tour" : "Book New Tour"}
                                        <ArrowRight size={16} />
                                    </a>
                                    <LogoutButton />
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-6 md:grid-cols-2">
                            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                                <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
                                    <CalendarDays size={20} className="text-emerald-600" />
                                    {lang === "es" ? "Reservas Próximas" : "Upcoming Bookings"}
                                </h2>
                                <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                                    {bookings.filter(b => b.status === "Upcoming").map((booking) => (
                                        <li key={booking.id} className="flex flex-col gap-1 border-b border-zinc-200 pb-2 last:border-b-0 dark:border-zinc-800">
                                            <span className="font-semibold">{booking.tour}</span>
                                            <span className="text-sm">{booking.date} at {booking.time}</span>
                                            <span className="text-sm">{lang === "es" ? "Participantes:" : "Participants:"} {booking.participants}</span>
                                        </li>
                                    ))}
                                    {bookings.filter(b => b.status === "Upcoming").length === 0 && (
                                        <p>{lang === "es" ? "No hay reservas próximas." : "No upcoming bookings."}</p>
                                    )}
                                </ul>
                            </article>

                            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                                <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
                                    <CalendarClock size={20} className="text-emerald-600" />
                                    {lang === "es" ? "Reservas Pasadas" : "Past Bookings"}
                                </h2>
                                <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                                    {bookings.filter(b => b.status === "Past").map((booking) => (
                                        <li key={booking.id} className="flex flex-col gap-1 border-b border-zinc-200 pb-2 last:border-b-0 dark:border-zinc-800">
                                            <span className="font-semibold">{booking.tour}</span>
                                            <span className="text-sm">{booking.date} at {booking.time}</span>
                                            <span className="text-sm">{lang === "es" ? "Participantes:" : "Participants:"} {booking.participants}</span>
                                        </li>
                                    ))}
                                    {bookings.filter(b => b.status === "Past").length === 0 && (
                                        <p>{lang === "es" ? "No hay reservas pasadas." : "No past bookings."}</p>
                                    )}
                                </ul>
                            </article>
                        </section>

                        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
                            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                                <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
                                    <User size={20} className="text-emerald-600" />
                                    {lang === "es" ? "Tu Perfil" : "Your Profile"}
                                </h2>
                                <Profile />
                            </article>

                            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                                <h2 className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-white">
                                    {lang === "es" ? "Contacto y Soporte" : "Contact & Support"}
                                </h2>
                                <ul className="mb-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                                    <li className="flex items-start gap-2">
                                        <Phone size={16} className="mt-1 text-emerald-600" />
                                        <span><strong>{lang === "es" ? "Teléfono:" : "Phone:"}</strong> +506 8643-0807</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Mail size={16} className="mt-1 text-emerald-600" />
                                        <span><strong>{lang === "es" ? "Email:" : "Email:"}</strong> ciudadesmeraldacr@gmail.com</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <MapPin size={16} className="mt-1 text-emerald-600" />
                                        <span>
                                            <strong>{lang === "es" ? "Ubicación:" : "Location:"}</strong>{" "}
                                            {lang === "es" ? "Zona Norte, Costa Rica" : "Northern Zone, Costa Rica"}
                                        </span>
                                    </li>
                                </ul>
                            </article>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}