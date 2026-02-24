// app/payment/success/SuccessClient.tsx
"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

type SuccessClientProps = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  date?: string | null;
  tickets?: string | number | null;
  amount?: string | number | null;
  currency?: string | null;
  orderId?: string | null;
  captureId?: string | null;
  status?: string | null;
  error?: string | null;
};

export function SuccessClient({
  email,
  name,
  phone,
  date,
  tickets,
  amount,
  currency,
  orderId,
  captureId,
  status,
  error,
}: SuccessClientProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].success;

  if (error) {
    return (
      <section className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-8 border border-red-200 dark:border-red-600">
          <h1 className="text-3xl font-bold mb-4 text-red-700 dark:text-red-300">
            {tr.errorTitle}
          </h1>

          <p className="text-red-700 dark:text-red-300 font-medium">
            {error}
          </p>

          <a
            href="/"
            className="mt-8 inline-block px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
          >
            {tr.backBtn}
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-20">
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900 p-8 shadow-xl border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-4 text-teal-600">
          {tr.title}
        </h1>

        <p className="text-zinc-700 dark:text-zinc-300">
          {tr.thanksPrefix} <strong>{name ?? (lang === "es" ? "Cliente" : "Customer")}</strong>
          {tr.thanksSuffix}
        </p>

        <p className="mt-4 text-zinc-700 dark:text-zinc-300">
          {tr.emailSentPrefix}{" "}
          <strong>{email ?? (lang === "es" ? "tu correo electrónico" : "your email address")}</strong>.
        </p>

        {/* Main details */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-left">
            <h2 className="font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              {tr.detailsTitle}
            </h2>

            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">{tr.dateLabel}</span>{" "}
              {date ?? "N/A"}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">{tr.ticketsLabel}</span>{" "}
              {tickets ?? "N/A"}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">{tr.totalLabel}</span>{" "}
              {amount ? `${amount} ${currency || "USD"}` : "N/A"}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-left">
            <h2 className="font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              {tr.contactTitle}
            </h2>

            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">{tr.nameLabel}</span>{" "}
              {name ?? "N/A"}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">{tr.emailLabel}</span>{" "}
              {email ?? "N/A"}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">{tr.phoneLabel}</span>{" "}
              {phone || "N/A"}
            </p>
          </div>
        </div>

        {/* Payment / technical info */}
        <div className="mt-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 text-xs text-left text-zinc-600 dark:text-zinc-400 space-y-1">
          <p>
            <span className="font-semibold">{tr.paymentStatus}</span>{" "}
            {status || "N/A"}
          </p>
          <p>
            <span className="font-semibold">{tr.orderId}</span>{" "}
            {orderId || "N/A"}
          </p>
          <p>
            <span className="font-semibold">{tr.transactionId}</span>{" "}
            {captureId || "N/A"}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
          >
            {tr.backBtn}
          </a>
        </div>
      </div>
    </section>
  );
}
