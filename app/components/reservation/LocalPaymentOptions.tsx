"use client";

import { useMemo, useState } from "react";
import { Building2, CheckCircle2, Copy, MessageCircle, Smartphone } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import {
  buildReservationWhatsAppHref,
  type LocalPaymentMethod,
} from "@/lib/reservation/checkout-messages";
import type { OrderDetails } from "@/lib/types/index";

export type { LocalPaymentMethod };

type PendingBookingResult = {
  referenceCode: string;
  reservationId: string | null;
};

type Props = {
  method: LocalPaymentMethod;
  orderDetails: OrderDetails;
  lang: "es" | "en";
  packageLabel: string;
  timeLabel: string;
  analyticsMetadata: Record<string, unknown>;
  referenceCode: string | null;
  reservationId: string | null;
  isSaving: boolean;
  saveError: string | null;
  savePendingBooking: (paymentMethod: LocalPaymentMethod) => Promise<PendingBookingResult | null>;
};

const SINPE_PHONE_DISPLAY = "6233-2535";

export default function LocalPaymentOptions({
  method,
  orderDetails,
  lang,
  packageLabel,
  timeLabel,
  analyticsMetadata,
  referenceCode,
  reservationId,
  isSaving,
  saveError,
  savePendingBooking,
}: Props) {
  const isEs = lang === "es";
  const [copied, setCopied] = useState(false);

  const whatsappHref = useMemo(
    () =>
      buildReservationWhatsAppHref(orderDetails, lang, {
        packageLabel,
        timeLabel,
        referenceCode: referenceCode ?? undefined,
      }),
    [lang, orderDetails, packageLabel, referenceCode, timeLabel],
  );

  const handleWhatsAppClick = async () => {
    const saved = await savePendingBooking("whatsapp");
    if (!saved) return;

    trackAnalyticsEvent("whatsapp_checkout_click", {
      metadata: {
        ...analyticsMetadata,
        referenceCode: saved.referenceCode,
        reservationId: saved.reservationId,
      },
    });

    if (typeof window !== "undefined") {
      window.open(
        buildReservationWhatsAppHref(orderDetails, lang, {
          packageLabel,
          timeLabel,
          referenceCode: saved.referenceCode,
        }),
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const handleCopyReference = async () => {
    if (!referenceCode || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(referenceCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSinpeStart = async () => {
    trackAnalyticsEvent("sinpe_checkout_selected", { metadata: analyticsMetadata });
    await savePendingBooking("sinpe");
  };

  if (method === "whatsapp") {
    return (
      <div className="space-y-4">
        <div className="lva-status-success rounded-xl px-4 py-3 text-sm leading-relaxed">
          {isEs
            ? "Confirme su reserva por WhatsApp con Allan o Verónica. Guardamos su solicitud y le respondemos con disponibilidad y pago local si lo prefiere."
            : "Confirm your booking on WhatsApp with our team. We save your request and reply with availability and local payment options if you prefer."}
        </div>

        <div className="lva-card-muted rounded-xl p-4 text-sm">
          <p className="lva-muted mb-2 text-[11px] font-bold uppercase tracking-[0.16em]">
            {isEs ? "Mensaje listo para enviar" : "Ready-to-send message"}
          </p>
          <pre className="lva-body max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans text-xs leading-relaxed">
            {decodeURIComponent(whatsappHref.split("text=")[1] ?? "")}
          </pre>
        </div>

        {saveError && (
          <p className="lva-alert-error rounded-xl px-4 py-3 text-sm" role="alert">
            {saveError}
          </p>
        )}

        {referenceCode && (
          <div className="lva-status-success flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
            <CheckCircle2 className="lva-accent h-4 w-4 shrink-0" aria-hidden />
            <span>
              {isEs ? "Referencia guardada:" : "Reference saved:"}{" "}
              <strong>{referenceCode}</strong>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleWhatsAppClick()}
          disabled={isSaving}
          className="lva-button-whatsapp w-full"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          {isSaving
            ? isEs
              ? "Guardando solicitud..."
              : "Saving request..."
            : isEs
              ? "Confirmar por WhatsApp"
              : "Confirm via WhatsApp"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="lva-status-warning rounded-xl px-4 py-3 text-sm leading-relaxed">
        {isEs
          ? "Pagá con SINPE Móvil o transferencia bancaria. Usá la referencia en el detalle del pago y envianos el comprobante por WhatsApp para confirmar."
          : "Pay with SINPE Móvil or bank transfer. Use the reference in the payment detail and send us the receipt on WhatsApp to confirm."}
      </div>

      {!referenceCode && (
        <button
          type="button"
          onClick={() => void handleSinpeStart()}
          disabled={isSaving}
          className="lva-button-primary w-full"
        >
          {isSaving
            ? isEs ? "Generando referencia…" : "Generating reference…"
            : isEs ? "Generar referencia de pago" : "Generate payment reference"}
        </button>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="lva-card-muted rounded-xl p-4">
          <div className="lva-accent mb-2 flex items-center gap-2">
            <Smartphone className="h-4 w-4" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-[0.16em]">SINPE Móvil</p>
          </div>
          <p className="lva-heading text-lg font-black">{SINPE_PHONE_DISPLAY}</p>
          <p className="lva-muted mt-1 text-xs">
            {isEs ? "Al mismo número de WhatsApp de reservas." : "Same number as booking WhatsApp."}
          </p>
        </div>

        <div className="lva-card-muted rounded-xl p-4">
          <div className="lva-accent mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-[0.16em]">
              {isEs ? "Transferencia" : "Bank transfer"}
            </p>
          </div>
          <p className="lva-heading text-sm font-semibold">
            {isEs
              ? "Coordinamos los datos bancarios por WhatsApp al enviar tu referencia."
              : "We share bank details on WhatsApp once you send your reference."}
          </p>
        </div>
      </div>

      <div className="lva-card-accent rounded-xl p-4">
        <p className="lva-accent text-[11px] font-bold uppercase tracking-[0.16em]">
          {isEs ? "Monto a transferir" : "Amount to transfer"}
        </p>
        <p className="lva-heading mt-1 text-3xl font-black">${orderDetails.total.toFixed(2)} USD</p>
        <p className="lva-muted mt-1 text-xs">
          {isEs
            ? "Si pagás en colones, usá el tipo de cambio del día y mencioná la referencia."
            : "If paying in colones, use the day's exchange rate and include the reference."}
        </p>
      </div>

      {isSaving && (
        <p className="lva-muted text-sm" role="status">
          {isEs ? "Generando referencia de pago..." : "Generating payment reference..."}
        </p>
      )}

      {saveError && (
        <p className="lva-alert-error rounded-xl px-4 py-3 text-sm" role="alert">
          {saveError}
        </p>
      )}

      {referenceCode && (
        <div className="lva-card-muted rounded-xl p-4">
          <p className="lva-muted text-[11px] font-bold uppercase tracking-[0.16em]">
            {isEs ? "Referencia obligatoria" : "Required reference"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="lva-heading font-mono text-2xl font-black tracking-wider">{referenceCode}</span>
            <button
              type="button"
              onClick={() => void handleCopyReference()}
              className="lva-button-secondary px-3 py-1.5 text-xs"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {copied ? (isEs ? "Copiado" : "Copied") : isEs ? "Copiar" : "Copy"}
            </button>
          </div>
          <p className="lva-muted mt-2 text-xs">
            {isEs
              ? "Incluí esta referencia en el detalle del SINPE o transferencia."
              : "Include this reference in your SINPE or transfer detail."}
          </p>
        </div>
      )}

      <a
        href={referenceCode ? whatsappHref : "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          if (!referenceCode) {
            event.preventDefault();
            return;
          }
          trackAnalyticsEvent("whatsapp_checkout_click", {
            metadata: {
              ...analyticsMetadata,
              referenceCode,
              reservationId,
              surface: "sinpe_receipt",
            },
          });
        }}
        aria-disabled={!referenceCode}
        className={`lva-button-whatsapp-outline w-full ${!referenceCode ? "cursor-not-allowed opacity-45" : ""}`}
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        {isEs ? "Enviar comprobante por WhatsApp" : "Send receipt on WhatsApp"}
      </a>
    </div>
  );
}
