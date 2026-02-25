"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import Link from "next/link";
import {
    ArrowRight,
    Bird,
    Building2,
    CalendarClock,
    CalendarDays,
    Compass,
    Home,
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
import { useSession, signIn } from "next-auth/react";
import LogoutButton from "../../../src/components/LogoutButton";
import Profile from "../../../src/components/Profile";

type Booking = {
    id: string;
    orderId: string | null;
    date: string | null;
    tourTime: string | null;
    tourPackage: string | null;
    tickets: number | null;
    amount: number | null;
    currency: string | null;
    status: string | null;
    createdAt: string | null;
};

function isUpcoming(dateStr: string | null): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) >= new Date(new Date().toDateString());
}

const PACKAGE_LABELS: Record<string, { es: string; en: string }> = {
    basic: { es: "Tour Básico", en: "Basic Tour" },
    "full-day": { es: "Tour Día Completo", en: "Full-Day Tour" },
    private: { es: "Tour Privado", en: "Private Tour" },
};

const DASHBOARD_LINKS = [
    { href: "/", es: "Ir al inicio", en: "Go to home", icon: Home, style: "from-emerald-500 to-emerald-600" },
    { href: "/dashboard", es: "Dashboard usuario", en: "User dashboard", icon: User, style: "from-zinc-700 to-zinc-900" },
    { href: "/booking", es: "Reservar tour", en: "Book tour", icon: CalendarDays, style: "from-teal-500 to-cyan-600" },
    { href: "/tours", es: "Ver tours", en: "View tours", icon: Compass, style: "from-purple-500 to-indigo-600" },
    { href: "/b2b/login", es: "Login B2B", en: "B2B login", icon: Building2, style: "from-amber-500 to-orange-600" },
    { href: "/b2b/admin", es: "Admin B2B", en: "B2B admin", icon: ShieldCheck, style: "from-indigo-500 to-violet-700" },
];

export default function DashboardPage() {
    const { lang } = useLanguage();
    const tr = translations[lang].dashboard || translations[lang].info; // Fallback to info if dashboard translations not available

    const { data: session, status } = useSession();
    const user = session?.user;
    const isLoading = status === "loading";
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setBookingsLoading(true);
            fetch("/api/bookings")
                .then((res) => res.json())
                .then((data) => setBookings(data.bookings ?? []))
                .catch(() => setBookings([]))
                .finally(() => setBookingsLoading(false));
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-zinc-700 dark:text-zinc-300">
                {lang === "es" ? "Cargando..." : "Loading..."}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
            <DynamicHeroHeader showHeroSlider={false} />

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
                            <button
                                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-800/30 active:translate-y-0 active:scale-[0.99]"
                            >
                                {lang === "es" ? "Iniciar sesión" : "Log In"}
                            </button>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {DASHBOARD_LINKS.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${link.style} px-4 py-3 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg`}
                                        >
                                            <Icon size={14} />
                                            {lang === "es" ? link.es : link.en}
                                        </Link>
                                    );
                                })}
                            </div>
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
                                    <Link
                                        href="/booking"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 dark:focus-visible:ring-emerald-700"
                                    >
                                        {lang === "es" ? "Reservar Nuevo Tour" : "Book New Tour"}
                                        <ArrowRight size={16} />
                                    </Link>
                                    <LogoutButton />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                                    {lang === "es" ? "Accesos rápidos" : "Quick links"}
                                </h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {lang === "es" ? "Todos conectados entre sí" : "All connected together"}
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {DASHBOARD_LINKS.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${link.style} px-4 py-4 text-white shadow-lg shadow-zinc-900/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
                                        >
                                            <span className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/20 blur-xl" />
                                            <span className="flex items-center gap-2 text-sm font-semibold">
                                                <Icon size={16} />
                                                {lang === "es" ? link.es : link.en}
                                            </span>
                                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-white/90">
                                                {lang === "es" ? "Abrir" : "Open"}
                                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="grid gap-6 md:grid-cols-2">
                            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                                <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
                                    <CalendarDays size={20} className="text-emerald-600" />
                                    {lang === "es" ? "Reservas Próximas" : "Upcoming Bookings"}
                                </h2>
                                {bookingsLoading ? (
                                    <p className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Cargando..." : "Loading..."}</p>
                                ) : (
                                    <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                                        {bookings.filter(b => isUpcoming(b.date)).map((booking) => (
                                            <li key={booking.id} className="flex flex-col gap-1 border-b border-zinc-200 pb-2 last:border-b-0 dark:border-zinc-800">
                                                <span className="font-semibold">
                                                    {booking.tourPackage
                                                        ? (PACKAGE_LABELS[booking.tourPackage]?.[lang] ?? booking.tourPackage)
                                                        : (lang === "es" ? "Tour Ciudad Esmeralda" : "Ciudad Esmeralda Tour")}
                                                </span>
                                                <span className="text-sm">{booking.date}{booking.tourTime ? ` — ${booking.tourTime}` : ""}</span>
                                                <span className="text-sm">{lang === "es" ? "Boletos:" : "Tickets:"} {booking.tickets ?? "—"}</span>
                                            </li>
                                        ))}
                                        {bookings.filter(b => isUpcoming(b.date)).length === 0 && (
                                            <p>{lang === "es" ? "No hay reservas próximas." : "No upcoming bookings."}</p>
                                        )}
                                    </ul>
                                )}
                            </article>

                            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                                <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
                                    <CalendarClock size={20} className="text-emerald-600" />
                                    {lang === "es" ? "Reservas Pasadas" : "Past Bookings"}
                                </h2>
                                {bookingsLoading ? (
                                    <p className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Cargando..." : "Loading..."}</p>
                                ) : (
                                    <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                                        {bookings.filter(b => !isUpcoming(b.date)).map((booking) => (
                                            <li key={booking.id} className="flex flex-col gap-1 border-b border-zinc-200 pb-2 last:border-b-0 dark:border-zinc-800">
                                                <span className="font-semibold">
                                                    {booking.tourPackage
                                                        ? (PACKAGE_LABELS[booking.tourPackage]?.[lang] ?? booking.tourPackage)
                                                        : (lang === "es" ? "Tour Ciudad Esmeralda" : "Ciudad Esmeralda Tour")}
                                                </span>
                                                <span className="text-sm">{booking.date}{booking.tourTime ? ` — ${booking.tourTime}` : ""}</span>
                                                <span className="text-sm">{lang === "es" ? "Boletos:" : "Tickets:"} {booking.tickets ?? "—"}</span>
                                            </li>
                                        ))}
                                        {bookings.filter(b => !isUpcoming(b.date)).length === 0 && (
                                            <p>{lang === "es" ? "No hay reservas pasadas." : "No past bookings."}</p>
                                        )}
                                    </ul>
                                )}
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