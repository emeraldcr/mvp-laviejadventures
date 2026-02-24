"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle,
  Clock,
  CreditCard,
  Hash,
  LogOut,
  Mail,
  Phone,
  Sparkles,
  Ticket,
  User,
  XCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";

type Booking = {
  id: string;
  orderId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  date: string | null;
  tickets: number | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  tourTime: string | null;
  tourPackage: string | null;
  packagePrice: number | null;
  createdAt: string | null;
};

type Props = {
  bookings: Booking[];
  userName: string | null;
  userEmail: string | null;
};

function isUpcoming(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= new Date(new Date().toDateString());
}

function StatusBadge({ status, lang }: { status: string | null; lang: string }) {
  const s = (status ?? "").toUpperCase();
  if (s === "COMPLETED" || s === "CAPTURED" || s === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <CheckCircle size={12} />
        {lang === "es" ? "Confirmada" : "Confirmed"}
      </span>
    );
  }
  if (s === "CANCELLED" || s === "VOIDED" || s === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
        <XCircle size={12} />
        {lang === "es" ? "Cancelada" : "Cancelled"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
      <Clock size={12} />
      {status ?? (lang === "es" ? "Pendiente" : "Pending")}
    </span>
  );
}

function BookingCard({ booking, lang }: { booking: Booking; lang: string }) {
  return (
    <li className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-white">
            {booking.tourPackage ?? (lang === "es" ? "Tour Ciudad Esmeralda" : "Ciudad Esmeralda Tour")}
          </p>
          {booking.date && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {booking.date}
              {booking.tourTime ? ` · ${booking.tourTime}` : ""}
            </p>
          )}
        </div>
        <StatusBadge status={booking.status} lang={lang} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        {booking.tickets != null && (
          <span className="flex items-center gap-1">
            <Ticket size={12} className="text-emerald-600" />
            {booking.tickets} {lang === "es" ? "ticket(s)" : "ticket(s)"}
          </span>
        )}
        {booking.amount != null && (
          <span className="flex items-center gap-1">
            <CreditCard size={12} className="text-emerald-600" />
            {booking.amount} {booking.currency ?? "USD"}
          </span>
        )}
        {booking.phone && (
          <span className="flex items-center gap-1">
            <Phone size={12} className="text-emerald-600" />
            {booking.phone}
          </span>
        )}
        {booking.orderId && (
          <span className="flex items-center gap-1 col-span-2 truncate">
            <Hash size={12} className="text-emerald-600 shrink-0" />
            <span className="truncate">{booking.orderId}</span>
          </span>
        )}
      </div>
    </li>
  );
}

export function BookingClient({ bookings, userName, userEmail }: Props) {
  const { lang } = useLanguage();

  const upcoming = bookings.filter((b) => isUpcoming(b.date));
  const past = bookings.filter((b) => !isUpcoming(b.date));

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader />

      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header card */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
                <Sparkles size={16} />
                {lang === "es" ? "Bienvenido de vuelta" : "Welcome back"}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
                {lang === "es" ? "Mis Reservas" : "My Bookings"}
              </h1>
              <div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                {userName && (
                  <span className="flex items-center gap-1">
                    <User size={14} /> {userName}
                  </span>
                )}
                {userEmail && (
                  <span className="flex items-center gap-1">
                    <Mail size={14} /> {userEmail}
                  </span>
                )}
              </div>
            </div>

            <div className="grid w-full gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 md:max-w-xs">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-700"
              >
                {lang === "es" ? "Reservar Nuevo Tour" : "Book New Tour"}
                <ArrowRight size={16} />
              </a>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <LogOut size={16} />
                {lang === "es" ? "Cerrar sesión" : "Sign out"}
              </button>
            </div>
          </div>
        </section>

        {/* Bookings summary */}
        {bookings.length === 0 ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <CalendarDays size={40} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <p className="text-zinc-600 dark:text-zinc-400">
              {lang === "es"
                ? "Aún no tienes reservas. ¡Reserva tu primera aventura!"
                : "You have no bookings yet. Book your first adventure!"}
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {lang === "es" ? "Ver tours" : "Browse tours"}
              <ArrowRight size={16} />
            </a>
          </section>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upcoming */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
                <CalendarDays size={20} className="text-emerald-600" />
                {lang === "es" ? "Próximas" : "Upcoming"}
                <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {upcoming.length}
                </span>
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {lang === "es" ? "Sin reservas próximas." : "No upcoming bookings."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.map((b) => (
                    <BookingCard key={b.id} booking={b} lang={lang} />
                  ))}
                </ul>
              )}
            </article>

            {/* Past */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
                <CalendarClock size={20} className="text-emerald-600" />
                {lang === "es" ? "Historial" : "Past"}
                <span className="ml-auto rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {past.length}
                </span>
              </h2>
              {past.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {lang === "es" ? "Sin reservas anteriores." : "No past bookings."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {past.map((b) => (
                    <BookingCard key={b.id} booking={b} lang={lang} />
                  ))}
                </ul>
              )}
            </article>
          </div>
        )}
      </div>
    </main>
  );
}
