"use client";

import React, { JSX } from "react";
import Link from "next/link";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/errorBoundary";
import { CalendarProvider } from "@/app/context/CalendarContext";
import { motion } from "framer-motion";
import { CalendarDays, ClipboardList } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSession, signIn, signOut } from "next-auth/react";
import Profile from "@/src/components/Profile";
import styles from "./page.module.css";

function BookingSection() {
  const { lang } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="relative z-10 container mx-auto px-4 py-16 text-center md:px-8 md:py-28">
        <div className="text-lg text-zinc-400">
          {lang === "es" ? "Preparando tu panel de reserva..." : "Preparing your booking panel..."}
        </div>
      </div>
    );
  }

  return (
    <section id="booking" className={styles.bookingSection}>
      <div className={styles.backgroundGlowCenter} />
      <div className={styles.backgroundGlowLeft} />
      <div className={styles.backgroundGlowRight} />

      <div className={styles.sectionContainer}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mb-12 text-center"
        >
          <p className={styles.sectionEyebrow}>
            {lang === "es" ? "Reserva asistida por AI" : "AI assisted booking"}
          </p>
          <h2 className={styles.sectionTitle}>
            {lang === "es" ? "Tu próximo tour empieza aquí" : "Your next tour starts here"}
          </h2>
          <p className={styles.sectionDescription}>
            {lang === "es"
              ? "Elige la fecha, completa tus detalles y si tienes dudas usa el botón de AI para resolver todo al instante."
              : "Pick your date, complete your details, and use the AI button whenever you need instant help."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-12 flex items-center justify-center gap-3"
        >
          <div className={styles.stepChipActive}>
            <CalendarDays size={13} className="text-teal-400" />
            <span className={styles.stepLabelActive}>
              {lang === "es" ? "Paso 1 · Fecha" : "Step 1 · Date"}
            </span>
          </div>
          <div className={styles.stepDivider}>
            <div className={styles.stepDividerLine} />
            <div className={styles.stepDividerDot} />
            <div className={styles.stepDividerLine} />
          </div>
          <div className={styles.stepChipInactive}>
            <ClipboardList size={13} className="text-zinc-500" />
            <span className={styles.stepLabelInactive}>
              {lang === "es" ? "Paso 2 · Detalles" : "Step 2 · Details"}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 items-start gap-5 lg:grid-cols-7"
        >
          <div className={`${styles.glassCard} lg:col-span-4`}>
            <CalendarSection />
          </div>

          <div className="lg:sticky lg:top-24 lg:col-span-3">
            <div className={styles.glassCard}>
              <ReservationSection />
            </div>
          </div>
        </motion.div>
      </div>

      <div className={styles.bottomFade} />

      <div className={styles.actionWrapper}>
        {user ? (
          <div className={`${styles.statusCard} ${styles.statusCardLoggedIn}`}>
            <p className="logged-in-message mb-6 text-xl font-bold text-teal-400">
              {lang === "es" ? "¡Sesión iniciada con éxito!" : "Successfully logged in!"}
            </p>
            <Profile />
            <div className={styles.actionStack}>
              <a
                href="/dashboard"
                className={`${styles.actionButtonBase} ${styles.dashboardButton}`}
              >
                {lang === "es" ? "Ver mi dashboard" : "Go to Dashboard"}
              </a>
              <Link
                href="/ai"
                className={`${styles.actionButtonBase} ${styles.aiButton}`}
              >
                {lang === "es" ? "Abrir La Vieja AI" : "Open La Vieja AI"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={`${styles.actionButtonBase} ${styles.logoutButton}`}
              >
                {lang === "es" ? "Cerrar sesión" : "Log Out"}
              </button>
            </div>
          </div>
        ) : (
          <div className={`${styles.statusCard} ${styles.statusCardLoggedOut}`}>
            <p className="action-text mb-6 text-lg text-zinc-300">
              {lang === "es"
                ? "Inicia sesión para reservar tu tour."
                : "Log in to book your tour."}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className={styles.loginButton}
              >
                {lang === "es" ? "Iniciar sesión" : "Log In"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-screen items-center justify-center bg-black text-xl text-red-600">
          ⚠️ Critical System Failure: Cannot load the booking engine.
        </div>
      }
    >
      <CalendarProvider>
        <main className="min-h-screen overflow-x-hidden bg-black">
          <DynamicHeroHeader />
          <BookingSection />
        </main>
      </CalendarProvider>
    </ErrorBoundary>
  );
}
