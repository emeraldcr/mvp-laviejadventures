"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { BOOKING_COMPLETION_STORAGE_KEY, trackAnalyticsEvent } from "@/lib/analytics/client";
import { translations } from "@/lib/translations";
import { localizeHref } from "@/lib/i18n";
import { LA_VIEJA_GOOGLE_MAPS_URL, LA_VIEJA_LOCATION_LABEL } from "@/lib/constants/location";
import { BUSINESS_WHATSAPP_URL } from "@/lib/site-config";
import Link from "next/link";
import { useEffect } from "react";
import type { SuccessClientProps } from "@/lib/types/types";
import { EditorialFinalCta, EditorialTrust } from "@/app/components/layouts/EditorialPageBlocks";

const PURCHASE_CONVERSION_SEND_TO = "AW-18010006901/uUBECMPq76kcEPXK64tD";

type GtagArguments = [
  command: "event",
  eventName: string,
  params: Record<string, unknown>,
];

type SuccessTranslations = (typeof translations)[keyof typeof translations]["success"];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArguments) => void;
  }
}

export function SuccessClient(props: SuccessClientProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].success;

  useEffect(() => {
    if (props.error || !props.orderId) return;

    trackAnalyticsEvent("booking_completed", {
      metadata: {
        orderId: props.orderId,
        captureId: props.captureId,
        status: props.status,
        date: props.date,
        tickets: props.tickets,
        amount: props.amount,
        currency: props.currency,
        language: lang,
      },
    });
    sessionStorage.removeItem(BOOKING_COMPLETION_STORAGE_KEY);

    const transactionId = props.captureId || props.orderId || "";
    const conversionStorageKey = `google-ads-purchase-conversion:${transactionId}`;

    if (typeof window !== "undefined" && !sessionStorage.getItem(conversionStorageKey)) {
      sessionStorage.setItem(conversionStorageKey, "sent");

      const gtag =
        window.gtag ??
        ((...args: GtagArguments) => {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push(args);
        });

      gtag("event", "conversion", {
        send_to: PURCHASE_CONVERSION_SEND_TO,
        transaction_id: transactionId,
      });
    }
  }, [lang, props.amount, props.captureId, props.currency, props.date, props.error, props.orderId, props.status, props.tickets]);

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
  translations: SuccessTranslations;
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
  tourName,
  tourPackage,
  tourTime,
  tickets,
  amount,
  currency,
  orderId,
  captureId,
  reservationId,
  status,
  translations: tr,
}: SuccessClientProps & { translations: SuccessTranslations }) {
  const defaultCustomer = tr.title.startsWith("Booking") ? "Customer" : "Cliente";
  const displayName = name || defaultCustomer;
  const isEnglish = tr.title.startsWith("Booking");

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-zinc-200 bg-white/95 p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-teal-600">La Vieja Adventures</p>
            <h1 className="text-3xl font-bold text-teal-600 sm:text-4xl">{tr.title}</h1>
          </div>
          <div className="rounded-2xl bg-teal-50 px-4 py-3 text-left dark:bg-teal-950/40 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{tr.referenceLabel}</p>
            <p className="mt-1 break-all font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{orderId || reservationId || "N/A"}</p>
          </div>
        </div>

        <ThankYouMessage name={displayName} translations={tr} />
        <EmailConfirmationMessage email={email ?? undefined} translations={tr} />
        <EditorialTrust>{isEnglish ? "Your reference keeps the booking traceable. Keep it handy when contacting our team." : "Su referencia mantiene la reserva identificada. Téngala a mano si necesita contactar al equipo."}</EditorialTrust>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <BookingDetails
            date={date}
            tourName={tourName}
            tourPackage={tourPackage}
            tourTime={tourTime}
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

        <PreparationHub date={date} tourName={tourName} tourTime={tourTime} reference={orderId || reservationId} translations={tr} />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <SupportAction name={displayName} reference={orderId || reservationId} date={date} label={tr.supportAction} />
          <BackButton label={tr.backBtn} />
        </div>
        <div className="mt-8">
          <EditorialFinalCta title={isEnglish ? "Keep exploring San Carlos" : "Siga explorando San Carlos"} body={isEnglish ? "When you are ready, discover another local experience with us." : "Cuando esté listo, descubra otra experiencia local con nosotros."} label={isEnglish ? "Explore tours" : "Explorar tours"} href={localizeHref("/tours", isEnglish ? "en" : "es")} />
        </div>
      </div>
    </section>
  );
}

// ==================== Small Reusable Pieces ====================

function ThankYouMessage({
  name,
  translations: tr,
}: { name: string; translations: SuccessTranslations }) {
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
}: { email?: string; translations: SuccessTranslations }) {
  return (
    <p className="mt-4 text-zinc-700 dark:text-zinc-300">
      {tr.emailSentPrefix}{" "}
      <strong>{email || (tr.title.startsWith("Booking") ? "your email" : "tu correo electrónico")}</strong>.
    </p>
  );
}

function BookingDetails({
  date,
  tourName,
  tourPackage,
  tourTime,
  tickets,
  amount,
  currency,
  translations: tr,
}: Pick<SuccessClientProps, "date" | "tourName" | "tourPackage" | "tourTime" | "tickets" | "amount" | "currency"> & {
  translations: SuccessTranslations;
}) {
  return (
    <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-left">
      <h2 className="font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
        {tr.detailsTitle}
      </h2>
      <DetailLine label={tr.tourLabel} value={tourName ?? "N/A"} />
      <DetailLine label={tr.packageLabel} value={tourPackage ?? "N/A"} />
      <DetailLine label={tr.timeLabel} value={tourTime ?? "N/A"} />
      <DetailLine label={tr.dateLabel} value={date ?? "N/A"} />
      <DetailLine label={tr.ticketsLabel} value={tickets ?? "N/A"} />
      <DetailLine
        label={tr.totalLabel}
        value={amount ? `${amount} ${currency || "USD"}` : "N/A"}
      />
    </div>
  );
}

function PreparationHub({
  date,
  tourName,
  tourTime,
  reference,
  translations: tr,
}: Pick<SuccessClientProps, "date" | "tourName" | "tourTime"> & {
  reference?: string | null;
  translations: SuccessTranslations;
}) {
  const calendarLink = buildGoogleCalendarLink({ date, tourName, tourTime, reference });

  return (
    <section className="mt-8 rounded-3xl bg-[#f4f0e7] p-5 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-100 sm:p-6">
      <h2 className="text-2xl font-bold">{tr.preparationTitle}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{tr.preparationIntro}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-white/80 p-4 dark:bg-zinc-900/70">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">{tr.meetingPointTitle}</p>
          <p className="mt-2 font-semibold">{LA_VIEJA_LOCATION_LABEL}</p>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{tr.arrivalCopy}</p>
          <a href={LA_VIEJA_GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-teal-700 px-5 font-bold text-white transition hover:bg-teal-800">{tr.directions}</a>
        </div>

        <div className="rounded-2xl bg-white/80 p-4 dark:bg-zinc-900/70">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">{tr.arrivalTitle}</p>
          <p className="mt-2 text-2xl font-black">{arrivalLabel(tourTime)}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{date || "N/A"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-teal-700 px-4 text-sm font-bold text-teal-800 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/40">{tr.addToGoogleCalendar}</a>
            <button type="button" onClick={() => downloadCalendar({ date, tourName, tourTime, reference })} className="inline-flex min-h-10 items-center rounded-full border border-zinc-300 px-4 text-sm font-bold hover:bg-white dark:border-zinc-600 dark:hover:bg-zinc-800">{tr.downloadCalendar}</button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white/80 p-4 dark:bg-zinc-900/70">
          <h3 className="font-bold">{tr.packingTitle}</h3>
          <ul className="mt-3 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            {tr.packingItems.map((item) => <li key={item} className="flex gap-2"><span aria-hidden>✓</span><span>{item}</span></li>)}
          </ul>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
          <h3 className="font-bold">{tr.calendarTitle}</h3>
          <p className="mt-2 text-sm leading-6">{tr.calendarCopy}</p>
        </div>
      </div>
    </section>
  );
}

function arrivalLabel(tourTime?: string | null) {
  if (!tourTime) return "Confirmar con el equipo";
  const match = tourTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return `30 min antes de ${tourTime}`;
  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]) - 30);
  return `30 min antes · ${date.toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit" })}`;
}

function calendarParts(date?: string | null, tourTime?: string | null) {
  const normalized = date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const time = tourTime?.match(/^(\d{1,2}):(\d{2})$/);
  if (!normalized) return null;
  const [, year, month, day] = normalized;
  const hour = Number(time?.[1] ?? 8);
  const minute = Number(time?.[2] ?? 0);
  const start = `${year}${month}${day}T${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}00`;
  const endDate = new Date(Number(year), Number(month) - 1, Number(day), hour, minute + 120);
  const end = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, "0")}${String(endDate.getDate()).padStart(2, "0")}T${String(endDate.getHours()).padStart(2, "0")}${String(endDate.getMinutes()).padStart(2, "0")}00`;
  return { start, end };
}

function buildGoogleCalendarLink({ date, tourName, tourTime, reference }: Pick<SuccessClientProps, "date" | "tourName" | "tourTime"> & { reference?: string | null }) {
  const parts = calendarParts(date, tourTime);
  const params = new URLSearchParams({ action: "TEMPLATE", text: tourName || "La Vieja Adventures", details: `Reserva: ${reference || "N/A"}. Llegar 30 minutos antes.`, location: LA_VIEJA_LOCATION_LABEL });
  if (parts) params.set("dates", `${parts.start}/${parts.end}`);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadCalendar({ date, tourName, tourTime, reference }: Pick<SuccessClientProps, "date" | "tourName" | "tourTime"> & { reference?: string | null }) {
  const parts = calendarParts(date, tourTime);
  if (!parts) return;
  const ics = [`BEGIN:VCALENDAR`, `VERSION:2.0`, `PRODID:-//La Vieja Adventures//Booking//EN`, `BEGIN:VEVENT`, `UID:${reference || `${date}-${tourName}`}`, `DTSTAMP:${parts.start}`, `DTSTART:${parts.start}`, `DTEND:${parts.end}`, `SUMMARY:${tourName || "La Vieja Adventures"}`, `LOCATION:${LA_VIEJA_LOCATION_LABEL}`, `DESCRIPTION:Reserva ${reference || "N/A"}. Llegar 30 minutos antes.`, `END:VEVENT`, `END:VCALENDAR`].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "la-vieja-adventures-reserva.ics";
  link.click();
  URL.revokeObjectURL(url);
}

function SupportAction({ name, reference, date, label }: { name: string; reference?: string | null; date?: string | null; label: string }) {
  const message = `Hola, soy ${name}. Mi referencia de reserva es ${reference || "N/A"} y la fecha es ${date || "N/A"}. Necesito ayuda con mi aventura.`;
  return <a href={`${BUSINESS_WHATSAPP_URL}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-xl bg-[#25D366] px-6 font-bold text-white transition hover:bg-[#1ebe5b]">{label}</a>;
}

function ContactDetails({
  name,
  email,
  phone,
  translations: tr,
}: Pick<SuccessClientProps, "name" | "email" | "phone"> & {
  translations: SuccessTranslations;
}) {
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

function PaymentInfo({
  status,
  orderId,
  captureId,
  translations: tr,
}: Pick<SuccessClientProps, "status" | "orderId" | "captureId"> & {
  translations: SuccessTranslations;
}) {
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
