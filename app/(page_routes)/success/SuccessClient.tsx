"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import Link from "next/link";
import type { SuccessClientProps } from "@/lib/types";

export function SuccessClient(props: SuccessClientProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].success;

  return props.error ? (
    <ErrorState error={props.error} translations={tr} />
  ) : (
    <SuccessState {...props} translations={tr} />
  );
}

// ==================== Sub Components ====================

function ErrorState({
  error,
  translations: tr,
}: {
  error: string;
  translations: any;
}) {
  return (
    <section className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-8 border border-red-200 dark:border-red-600">
        <h1 className="text-3xl font-bold mb-4 text-red-700 dark:text-red-300">
          {tr.errorTitle}
        </h1>

        <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>

        <BackButton label={tr.backBtn} />
      </div>
    </section>
  );
}

function SuccessState({
  name,
  email,
  phone,
  date,
  tickets,
  amount,
  currency,
  orderId,
  captureId,
  status,
  translations: tr,
}: SuccessClientProps & { translations: any }) {
  const displayName = name || (tr.defaultCustomer || "Cliente");

  return (
    <section className="max-w-2xl mx-auto px-4 py-20">
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900 p-8 shadow-xl border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-4 text-teal-600">{tr.title}</h1>

        <ThankYouMessage name={displayName} translations={tr} />
        <EmailConfirmationMessage email={email} translations={tr} />

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <BookingDetails
            date={date}
            tickets={tickets}
            amount={amount}
            currency={currency}
            translations={tr}
          />
          <ContactDetails
            name={name}
            email={email}
            phone={phone}
            translations={tr}
          />
        </div>

        <PaymentInfo
          status={status}
          orderId={orderId}
          captureId={captureId}
          translations={tr}
        />

        <div className="mt-8 flex justify-center">
          <BackButton label={tr.backBtn} />
        </div>
      </div>
    </section>
  );
}

// ==================== Small Reusable Pieces ====================

function ThankYouMessage({
  name,
  translations: tr,
}: { name: string; translations: any }) {
  return (
    <p className="text-zinc-700 dark:text-zinc-300">
      {tr.thanksPrefix} <strong>{name}</strong>
      {tr.thanksSuffix}
    </p>
  );
}

function EmailConfirmationMessage({
  email,
  translations: tr,
}: { email?: string; translations: any }) {
  return (
    <p className="mt-4 text-zinc-700 dark:text-zinc-300">
      {tr.emailSentPrefix}{" "}
      <strong>{email || (tr.defaultEmail || "tu correo electrónico")}</strong>.
    </p>
  );
}

function BookingDetails({
  date,
  tickets,
  amount,
  currency,
  translations: tr,
}: any) {
  return (
    <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-left">
      <h2 className="font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
        {tr.detailsTitle}
      </h2>
      <DetailLine label={tr.dateLabel} value={date ?? "N/A"} />
      <DetailLine label={tr.ticketsLabel} value={tickets ?? "N/A"} />
      <DetailLine
        label={tr.totalLabel}
        value={amount ? `${amount} ${currency || "USD"}` : "N/A"}
      />
    </div>
  );
}

function ContactDetails({ name, email, phone, translations: tr }: any) {
  return (
    <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-left">
      <h2 className="font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
        {tr.contactTitle}
      </h2>
      <DetailLine label={tr.nameLabel} value={name ?? "N/A"} />
      <DetailLine label={tr.emailLabel} value={email ?? "N/A"} />
      <DetailLine label={tr.phoneLabel} value={phone || "N/A"} />
    </div>
  );
}

function PaymentInfo({ status, orderId, captureId, translations: tr }: any) {
  return (
    <div className="mt-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 text-xs text-left text-zinc-600 dark:text-zinc-400 space-y-1">
      <DetailLine label={tr.paymentStatus} value={status || "N/A"} />
      <DetailLine label={tr.orderId} value={orderId || "N/A"} />
      <DetailLine label={tr.transactionId} value={captureId || "N/A"} />
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="text-sm text-zinc-700 dark:text-zinc-300">
      <span className="font-semibold">{label}</span> {value}
    </p>
  );
}

function BackButton({ label }: { label: string }) {
  return (
    <Link
      href="/"
      className="inline-block px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
    >
      {label}
    </Link>
  );
}