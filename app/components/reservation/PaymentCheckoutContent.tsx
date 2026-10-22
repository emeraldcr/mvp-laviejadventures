"use client";

import React, { useMemo, useState } from "react";
import { Building2, CalendarDays, Clock3, CreditCard, Mail, MessageCircle, Phone, ShieldCheck, Ticket, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import type { OrderDetails } from "@/lib/types/index";
import LocalPaymentOptions, { type LocalPaymentMethod } from "@/app/components/reservation/LocalPaymentOptions";
import { useCheckoutQuote } from "@/app/components/reservation/hooks/useCheckoutQuote";
import { ADDON_DATA } from "@/lib/reservation/addons";
import { usePendingBooking } from "@/lib/reservation/use-pending-booking";
import { usePayPalCheckout } from "@/app/components/reservation/hooks/usePayPalCheckout";
import { buildBookingAnalyticsMetadata } from "@/app/components/reservation/checkoutUtils";
import SafetyBookingNotice from "@/app/components/reservation/SafetyBookingNotice";

const SummaryRow = ({
  icon,
  label,
  value,
  prominent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  prominent?: boolean;
}) => (
  <div className="lva-card-muted flex items-start gap-3 rounded-xl p-3">
    <span className="lva-icon-surface mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="lva-muted text-[11px] font-bold uppercase tracking-[0.16em]">{label}</p>
      <p className={`lva-heading mt-0.5 break-words leading-snug ${prominent ? "text-lg font-black" : "text-sm font-semibold"}`}>
        {value}
      </p>
    </div>
  </div>
);

type PaymentMethod = "paypal" | LocalPaymentMethod;

type Props = {
  orderDetails: OrderDetails;
  onSuccess: (orderData: unknown) => void;
};

export default function PaymentCheckoutContent({ orderDetails, onSuccess }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paypal");
  const { lang } = useLanguage();
  const tr = translations[lang].payment;

  const {
    name,
    email,
    phone,
    tickets,
    total: initialTotal,
    date,
    tourTime,
    tourPackage,
    tourName,
    packagePrice,
  } = orderDetails;

  const checkoutQuote = useCheckoutQuote(orderDetails, lang);
  const total = checkoutQuote.total;
  const checkoutOrderDetails = useMemo(
    () => ({
      ...orderDetails,
      total: checkoutQuote.total,
      addonsPrice: checkoutQuote.addonsPrice,
      addonsPricePerPerson: checkoutQuote.addonsPricePerPerson,
      addonsBreakdown: checkoutQuote.addonsBreakdown,
      transportQuote: checkoutQuote.transportQuote,
    }),
    [checkoutQuote, orderDetails],
  );

  const packageName = (tr.packages as Record<string, string>)[tourPackage] ?? tourPackage;
  const formattedTime = tr.timeLabels[tourTime] ?? tourTime;
  const {
    referenceCode,
    reservationId,
    isSaving: isPendingSaving,
    saveError: pendingSaveError,
    savePendingBooking,
  } = usePendingBooking(checkoutOrderDetails, lang);
  const {
    paypalRef,
    paypalLoadError, retryPayPal, paymentError, isCapturing, pendingOrderId, retryCapture,
    isPaypalLoading: isPayPalSdkLoading,
  } = usePayPalCheckout({
    enabled: paymentMethod === "paypal" && checkoutQuote.synced && !checkoutQuote.syncing && !checkoutQuote.error,
    orderDetails: checkoutOrderDetails,
    lang,
    errorMessage: tr.error,
    onSuccess,
  });
  const resumePath = checkoutQuote.resumePath;
  const isPaypalLoading = checkoutQuote.syncing || isPayPalSdkLoading;
  const localPaymentAnalyticsMetadata = useMemo(
    () => ({
      ...buildBookingAnalyticsMetadata(checkoutOrderDetails, lang),
      addonsBreakdown: checkoutQuote.addonsBreakdown,
    }),
    [checkoutOrderDetails, checkoutQuote.addonsBreakdown, lang],
  );

  const paymentCopy = {
    contactTitle: lang === "es" ? "Datos del viajero" : "Traveler details",
    bookingTitle: lang === "es" ? "Resumen de reserva" : "Booking summary",
    paymentTitle: lang === "es" ? "Elija cómo pagar" : "Choose how to pay",
    paymentSubtitle: lang === "es"
      ? "Primero verá el pago inmediato con tarjeta o PayPal. Si prefiere pagar localmente, puede solicitar una revisión por WhatsApp o SINPE."
      : "You’ll see instant card or PayPal payment first. If you prefer local payment, request a review through WhatsApp or SINPE.",
    checkoutHint: lang === "es"
      ? "Pagar no sustituye la confirmación operativa de disponibilidad. PayPal procesa el pago al instante; WhatsApp y SINPE requieren revisión del equipo antes de quedar confirmados."
      : "Payment does not replace operational availability confirmation. PayPal processes payment instantly; WhatsApp and SINPE require team review before they are confirmed.",
    instantTitle: lang === "es" ? "Pago inmediato" : "Instant payment",
    instantDescription: lang === "es" ? "La opción recomendada para pagar ahora con tarjeta o PayPal." : "The recommended option to pay now by card or PayPal.",
    manualTitle: lang === "es" ? "Pago local / revisión del equipo" : "Local payment / team review",
    manualDescription: lang === "es" ? "WhatsApp y SINPE no confirman disponibilidad automáticamente." : "WhatsApp and SINPE do not confirm availability automatically.",
    recommended: lang === "es" ? "Recomendado" : "Recommended",
    manualReview: lang === "es" ? "Revisión manual" : "Manual review",
    dateLabel: lang === "es" ? "Fecha" : "Date",
    guestsLabel: lang === "es" ? "Personas" : "Guests",
    tourLabel: lang === "es" ? "Experiencia" : "Experience",
    packagePriceLabel: lang === "es" ? "Tarifa" : "Rate",
    methods: {
      paypal: lang === "es" ? "PayPal / Tarjeta" : "PayPal / Card",
      whatsapp: "WhatsApp",
      sinpe: "SINPE",
    },
  };

  const addonSummaryLines = useMemo(() => {
    const breakdown = checkoutQuote.addonsBreakdown;
    if (!breakdown.length) return [];

    return breakdown.map((item) => {
      const addon = ADDON_DATA.find((entry) => entry.id === item.id);
      const label = addon ? (lang === "es" ? addon.nameEs : addon.nameEn) : item.id;
      return `${label} (+$${item.pricePerPerson}/${lang === "es" ? "persona" : "person"})`;
    });
  }, [checkoutQuote.addonsBreakdown, lang]);

  const paymentTabs: Array<{ id: PaymentMethod; label: string; icon: React.ReactNode }> = [
    { id: "paypal", label: paymentCopy.methods.paypal, icon: <CreditCard className="h-4 w-4" aria-hidden /> },
    { id: "whatsapp", label: paymentCopy.methods.whatsapp, icon: <MessageCircle className="h-4 w-4" aria-hidden /> },
    { id: "sinpe", label: paymentCopy.methods.sinpe, icon: <Building2 className="h-4 w-4" aria-hidden /> },
  ];

  return (
    <div className="checkout-content grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)]">
      <aside className="order-2 space-y-4 lg:order-1">
        <section className="lva-card rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <UserRound className="lva-accent h-4 w-4" aria-hidden />
            <h2 className="lva-heading text-sm font-black uppercase tracking-[0.16em]">{paymentCopy.contactTitle}</h2>
          </div>
          <div className="space-y-3">
            <SummaryRow icon={<UserRound className="h-4 w-4" aria-hidden />} label={tr.nameLabel} value={name} />
            <SummaryRow icon={<Mail className="h-4 w-4" aria-hidden />} label={tr.emailLabel} value={email} />
            <SummaryRow icon={<Phone className="h-4 w-4" aria-hidden />} label={tr.phoneLabel} value={phone} />
          </div>
        </section>

        <section className="lva-card rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Ticket className="lva-accent h-4 w-4" aria-hidden />
            <h2 className="lva-heading text-sm font-black uppercase tracking-[0.16em]">{paymentCopy.bookingTitle}</h2>
          </div>
          <div className="space-y-3">
            <SummaryRow icon={<Ticket className="h-4 w-4" aria-hidden />} label={paymentCopy.tourLabel} value={tourName} />
            <SummaryRow icon={<CalendarDays className="h-4 w-4" aria-hidden />} label={paymentCopy.dateLabel} value={date} />
            <SummaryRow icon={<Clock3 className="h-4 w-4" aria-hidden />} label={tr.tourTime} value={formattedTime} />
            <SummaryRow
              icon={<UserRound className="h-4 w-4" aria-hidden />}
              label={paymentCopy.guestsLabel}
              value={`${tickets} ${tickets === 1 ? tr.person : tr.persons}`}
            />
            <SummaryRow
              icon={<CreditCard className="h-4 w-4" aria-hidden />}
              label={paymentCopy.packagePriceLabel}
              value={`${packageName} ($${packagePrice} USD/${tr.pricePerPersonUnit})`}
            />
            {addonSummaryLines.length > 0 && (
              <SummaryRow
                icon={<Ticket className="h-4 w-4" aria-hidden />}
                label={lang === "es" ? "Extras" : "Add-ons"}
                value={(
                  <span className="block space-y-1">
                    {addonSummaryLines.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </span>
                )}
              />
            )}
          </div>
        </section>
      </aside>

      <section className="lva-payment-panel order-1 rounded-2xl p-4 sm:p-5 lg:order-2">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="lva-chip mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {paymentCopy.paymentTitle}
            </div>
            <p className="lva-muted max-w-xl text-sm leading-relaxed">{paymentCopy.paymentSubtitle}</p>
          </div>
          <div className="lva-card-accent rounded-2xl px-4 py-3 text-right">
            <p className="lva-accent text-[11px] font-bold uppercase tracking-[0.16em]">{tr.total}</p>
            <p className="lva-heading text-3xl font-black leading-none">
              {checkoutQuote.syncing ? "…" : `$${total.toFixed(2)}`}
            </p>
            {checkoutQuote.syncing && (
              <p className="lva-muted mt-1 text-xs font-medium">
                {lang === "es" ? "Validando extras..." : "Validating add-ons..."}
              </p>
            )}
            {checkoutQuote.error && (
              <p className="lva-alert-error mt-1 rounded-lg px-2 py-1 text-xs font-medium">{checkoutQuote.error}</p>
            )}
            {!checkoutQuote.syncing && !checkoutQuote.error && Math.abs(initialTotal - total) >= 0.02 && (
              <p className="lva-status-warning mt-1 rounded-lg px-2 py-1 text-xs font-medium">
                {lang === "es" ? "Total actualizado con extras." : "Total updated with add-ons."}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4 space-y-3" role="tablist" aria-label={paymentCopy.paymentTitle}>
          <div>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="lva-heading text-sm font-black">{paymentCopy.instantTitle}</h3>
              <p className="lva-muted text-xs">{paymentCopy.instantDescription}</p>
            </div>
            {paymentTabs.slice(0, 1).map((tab) => {
              const isActive = paymentMethod === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setPaymentMethod(tab.id)}
                  data-active={isActive}
                  className={["lva-control flex min-h-[4.5rem] w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition", isActive ? "" : "lva-muted"].join(" ")}
                >
                  <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em]">
                    {tab.icon}{tab.label}
                  </span>
                  <span className="lva-chip shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em]">{paymentCopy.recommended}</span>
                </button>
              );
            })}
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="lva-heading text-sm font-black">{paymentCopy.manualTitle}</h3>
              <p className="lva-muted text-xs">{paymentCopy.manualDescription}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {paymentTabs.slice(1).map((tab) => {
                const isActive = paymentMethod === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setPaymentMethod(tab.id)}
                    data-active={isActive}
                    className={["lva-control flex min-h-[4.5rem] items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-left transition", isActive ? "" : "lva-muted"].join(" ")}
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.08em]">{tab.icon}{tab.label}</span>
                    <span className="lva-muted text-right text-[10px] font-bold">{paymentCopy.manualReview}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lva-card-muted mb-4 rounded-xl px-4 py-3 text-sm font-medium">
          {paymentCopy.checkoutHint}
        </div>

        <SafetyBookingNotice lang={lang} className="mb-4" />

        {resumePath && (
          <div className="lva-status-success mb-4 flex flex-col gap-2 rounded-xl px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>{lang === "es" ? "¿Vas a terminar después? Guardá este enlace seguro para retomar la reserva." : "Finishing later? Save this secure link to resume your booking."}</span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${resumePath}`)}
              className="lva-button-secondary shrink-0 px-3 py-1.5 text-xs"
            >
              {lang === "es" ? "Copiar enlace" : "Copy link"}
            </button>
          </div>
        )}

        {checkoutQuote.error ? (
          <div className="lva-alert-error rounded-2xl px-4 py-5 text-center text-sm" role="alert">
            <p className="font-semibold">{checkoutQuote.error}</p>
            <button
              type="button"
              onClick={checkoutQuote.retry}
              className="lva-button-secondary mt-3 px-4 py-2 text-xs"
            >
              {lang === "es" ? "Validar de nuevo" : "Validate again"}
            </button>
          </div>
        ) : paymentMethod === "paypal" ? (
          <div className="lva-card-muted relative min-h-[160px] w-full overflow-hidden rounded-2xl p-3">
            {isPaypalLoading && (
              <div
                className="lva-card-accent absolute inset-3 z-10 flex min-h-[140px] items-center justify-center rounded-xl px-4 text-center text-sm font-medium shadow-sm"
                role="status"
                aria-live="polite"
              >
                <span className="lva-accent mr-3 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                {tr.loadingPaymentInfo}
              </div>
            )}
            {paypalLoadError && (
              <div
                className="lva-alert-error min-h-[140px] rounded-xl px-4 py-5 text-sm shadow-sm"
                role="alert"
              >
                <p className="font-semibold">{tr.error}</p>
                <p className="mt-2 break-words text-xs opacity-90">{paypalLoadError}</p>
                <button type="button" onClick={retryPayPal} className="mt-3 rounded-lg border border-current px-4 py-2 font-bold">{lang === "es" ? "Intentar de nuevo" : "Try again"}</button>
              </div>
            )}
            <div ref={paypalRef} hidden={Boolean(pendingOrderId) || Boolean(paypalLoadError)} className="min-h-[140px] w-full" />
            {(paymentError || isCapturing) && <div role={paymentError ? "alert" : "status"} className="mt-3 text-sm">
              <p>{isCapturing ? (lang === "es" ? "Verificando el pago…" : "Checking payment…") : paymentError}</p>
              {pendingOrderId && !isCapturing && <button type="button" onClick={retryCapture} className="mt-2 rounded-lg border px-4 py-2 font-bold">{lang === "es" ? "Verificar este pago" : "Check this payment"}</button>}
            </div>}
          </div>
        ) : (
          <LocalPaymentOptions
            method={paymentMethod}
            orderDetails={checkoutOrderDetails}
            lang={lang}
            packageLabel={packageName}
            timeLabel={formattedTime}
            analyticsMetadata={localPaymentAnalyticsMetadata}
            referenceCode={referenceCode}
            reservationId={reservationId}
            isSaving={isPendingSaving}
            saveError={pendingSaveError}
            savePendingBooking={savePendingBooking}
          />
        )}
      </section>
    </div>
  );
}
