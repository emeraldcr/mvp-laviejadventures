'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Chrome, Mail, Shield, Sparkles } from 'lucide-react';

const highlights = [
  'Reservas y disponibilidad en tiempo real',
  'Panel optimizado para equipos y agencias',
  'Soporte dedicado para partners de La Vieja',
];

export default function AuthLanding() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,197,94,0.3),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-slate-200 transition hover:text-white"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
              <Sparkles className="h-4 w-4" />
            </span>
            La Vieja Adventures
          </Link>
          <Link
            href="/tours"
            className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-white/40 hover:bg-white/10 sm:inline-flex"
          >
            Explorar tours
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid items-center gap-8 py-10 md:grid-cols-2 md:gap-12 lg:py-14">
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-200">
              <Shield className="h-3.5 w-3.5" />
              Plataforma segura
            </span>

            <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              La plataforma moderna para gestionar experiencias memorables.
            </h1>

            <p className="max-w-xl text-pretty text-base text-slate-300 sm:text-lg">
              Administra operaciones, reservas y clientes desde un mismo lugar. Diseñada para ser rápida en
              escritorio y súper cómoda en móvil.
            </p>

            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-200 sm:text-base">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200/90">Acceso partner</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Entra a tu panel</h2>
              </div>

              <p className="text-sm text-slate-300 sm:text-base">
                Regístrate con correo, recupera tu contraseña o vincula Google en tu cuenta de Auth0.
              </p>

              <a
                href="/auth/login?screen_hint=signup"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 sm:text-base"
              >
                <Mail className="h-5 w-5" />
                Registrarme con correo
              </a>

              <a
                href="/auth/login"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:text-base"
              >
                Iniciar sesión con correo
              </a>

              <a
                href="/auth/login?connection=google-oauth2&prompt=login"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:text-base"
              >
                <Chrome className="h-5 w-5" />
                Conectar Google (Auth0)
              </a>

              <Link
                href="/auth/recover-password"
                className="block text-center text-sm text-emerald-200 underline-offset-4 transition hover:text-emerald-100 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>

              <p className="text-xs leading-relaxed text-slate-400">
                Al continuar aceptas nuestros{' '}
                <Link href="/terminos-y-condiciones" className="text-emerald-200 underline-offset-4 hover:underline">
                  Términos y Condiciones
                </Link>{' '}
                y nuestra{' '}
                <Link href="/politica-de-privacidad" className="text-emerald-200 underline-offset-4 hover:underline">
                  Política de Privacidad
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <footer className="pt-2 text-center text-xs text-slate-400 sm:text-sm">
          © {new Date().getFullYear()} La Vieja Adventures. Todos los derechos reservados.
        </footer>
      </div>
    </main>
  );
}
