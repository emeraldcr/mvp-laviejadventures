"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BOOKING_COMPLETION_STORAGE_KEY, trackAnalyticsEvent } from "@/lib/analytics/client";
import type { OrderDetails } from "@/lib/types/index";
import { RESERVATION_TRAVELER_DRAFT_KEY } from "@/lib/reservation/constants";
import {
  buildBookingAnalyticsMetadata,
  buildCheckoutKey,
  getBuyerCountryFromPhone,
} from "@/app/components/reservation/checkoutUtils";

import { loadPayPalSdk, type PayPalButtons } from "@/lib/paypal-sdk";

function trackCheckoutEvent(...args: Parameters<typeof trackAnalyticsEvent>) {
  try { void Promise.resolve(trackAnalyticsEvent(...args)).catch(() => {}); } catch { /* Optional analytics. */ }
}

function isLivePayPalMode(mode: string | undefined) {
  const normalizedMode = mode?.trim().toLowerCase();
  return normalizedMode === "live" || normalizedMode === "production" || normalizedMode === "prod";
}

function isConfiguredPayPalClientId(clientId: string | undefined): clientId is string {
  if (!clientId) return false;

  const normalizedClientId = clientId.trim().toLowerCase();
  return Boolean(normalizedClientId) && !normalizedClientId.startsWith("your-");
}

function getCheckoutErrorMessage(payload: { code?: string; message?: string }, fallback: string, lang: string) {
  const isEs = lang === "es";
  if (payload.code === "capacity") {
    return isEs
      ? "Esos cupos se acaban de ocupar. Vuelva a la reserva para elegir otra fecha o menos personas."
      : "Those spots were just taken. Return to booking to choose another date or fewer guests.";
  }
  if (payload.code === "total_mismatch") {
    return isEs
      ? "El total cambió antes del pago. Vuelva a revisar la reserva."
      : "The total changed before payment. Please review the booking again.";
  }
  if (payload.code === "booking_context_missing" || payload.code === "capture_validation_unavailable") {
    return isEs
      ? "No pudimos verificar la reserva antes de cobrar. Intentá nuevamente en un momento."
      : "We couldn't verify the booking before charging. Please try again in a moment.";
  }
  return payload.message || fallback;
}

export function usePayPalCheckout({
  enabled,
  orderDetails,
  lang,
  errorMessage,
  onSuccess,
}: {
  enabled: boolean;
  orderDetails: OrderDetails;
  lang: string;
  errorMessage: string;
  onSuccess: (orderData: unknown) => void;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const paypalRef = useCallback((node: HTMLDivElement | null) => setContainer(node), []);
  const [retryVersion, setRetryVersion] = useState(0);
  const [loadState, setLoadState] = useState<{ key: string; loading: boolean; error: string | null }>({ key: "", loading: true, error: null });
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const pendingCapture = useRef<string | null>(null);
  const captureInFlight = useRef<Promise<void> | null>(null);
  const completedOrders = useRef(new Set<string>());
  const latest = useRef({ orderDetails, onSuccess });
  const router = useRouter();
  const checkoutKey = buildCheckoutKey(orderDetails, lang);
  const loadKey = `${checkoutKey}:${retryVersion}`;
  const paypalLoadError = loadState.key === loadKey ? loadState.error : null;
  const isPaypalLoading = enabled && (loadState.key !== loadKey || loadState.loading);

  useEffect(() => { latest.current = { orderDetails, onSuccess }; });

  const captureOrder = useCallback((orderID: string, actions?: { restart: () => Promise<void> }) => {
    if (completedOrders.current.has(orderID)) return Promise.resolve();
    if (captureInFlight.current) return captureInFlight.current;
    pendingCapture.current = orderID;
    setPendingOrderId(orderID);
    setIsCapturing(true);
    setPaymentError(null);
    const task = (async () => {
      try {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderID }),
          signal: AbortSignal.timeout(90_000),
        });
        const output = await res.json();
        if (output?.code === "INSTRUMENT_DECLINED" && actions) {
          pendingCapture.current = null;
          setPendingOrderId(null);
          return await actions.restart();
        }
        if (!res.ok || !output?.captureID || output?.status !== "COMPLETED") {
          throw new Error(getCheckoutErrorMessage(output ?? {}, errorMessage, lang));
        }
        completedOrders.current.add(orderID);
        pendingCapture.current = null;
        setPendingOrderId(null);
        trackCheckoutEvent("payment_approved", { metadata: {
          ...buildBookingAnalyticsMetadata(latest.current.orderDetails, lang),
          orderId: orderID, captureId: output.captureID, status: output.status,
        } });
        // Storage and parent callbacks are conveniences, never payment gates.
        try {
          sessionStorage.setItem(BOOKING_COMPLETION_STORAGE_KEY, "1");
          sessionStorage.removeItem("reservationOrderDetails");
          sessionStorage.removeItem(RESERVATION_TRAVELER_DRAFT_KEY);
        } catch { /* Storage may be unavailable in private browsers. */ }
        try { latest.current.onSuccess(output); } catch (error) { console.error("PayPal success callback:", error); }
        router.push(`${lang === "en" ? "/en" : ""}/reservar/voucher?orderId=${encodeURIComponent(output.id || orderID)}`);
      } catch (error) {
        setPaymentError(error instanceof Error && !(error instanceof SyntaxError) ? error.message : errorMessage);
        trackCheckoutEvent("payment_error", { metadata: { orderId: orderID, stage: "capture" } });
      } finally {
        setIsCapturing(false);
        captureInFlight.current = null;
      }
    })();
    captureInFlight.current = task;
    return task;
  }, [errorMessage, lang, router]);

  useEffect(() => {
    if (!enabled || !container || !container.isConnected) return;
    let active = true;
    let buttons: PayPalButtons | undefined;
    let failed = false;
    const host = document.createElement("div");
    let renderTimer: ReturnType<typeof setTimeout> | undefined;
    const orderDetails = latest.current.orderDetails;
    const bookingAnalyticsMetadata = buildBookingAnalyticsMetadata(orderDetails, lang);
    setLoadState({ key: loadKey, loading: true, error: null });
    setPaymentError(null);
    trackCheckoutEvent("booking_checkout_started", { metadata: bookingAnalyticsMetadata });
    const closeButtons = () => {
      try { Promise.resolve(buttons?.close()).catch(() => {}); } catch { /* Already closed. */ }
    };
    const failPayPalLoad = (error: unknown) => {
      if (!active || failed) return;
      failed = true;
      clearTimeout(renderTimer);
      closeButtons();
      const message = lang === "es"
        ? "No pudimos cargar PayPal. Revise su conexión e inténtelo de nuevo."
        : "We couldn't load PayPal. Check your connection and try again.";
      setLoadState({ key: loadKey, loading: false, error: message });
      trackCheckoutEvent("payment_error", { metadata: { ...bookingAnalyticsMetadata, stage: "paypal_sdk_load" } });
      console.error("PAYPAL SDK ERROR:", error);
    };
    const initialize = async () => {
      try {
        const isLive = isLivePayPalMode(process.env.NEXT_PUBLIC_PAYPAL_MODE);
        const clientId = (isLive ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID)?.trim();
        if (!isConfiguredPayPalClientId(clientId)) throw new Error("paypal_config_missing");
        const sdk = await loadPayPalSdk(clientId);
        if (!active || !container.isConnected) return;
        container.replaceChildren(host);
        buttons = sdk.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "pill",
            label: "paypal",
          },
          createOrder: async () => {
            if (!active || pendingCapture.current) throw new Error(errorMessage);
            setPaymentError(null);
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              signal: AbortSignal.timeout(60_000),
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingAttemptId: orderDetails.bookingAttemptId,
                name: orderDetails.name,
                email: orderDetails.email,
                phone: orderDetails.phone,
                tickets: orderDetails.tickets,
                date: orderDetails.dateIso ?? orderDetails.date,
                total: orderDetails.total,
                tourTime: orderDetails.tourTime,
                packageId: orderDetails.packageId,
                tourPackage: orderDetails.tourPackage,
                packagePrice: orderDetails.packagePrice,
                tourSlug: orderDetails.tourSlug,
                tourName: orderDetails.tourName,
                addons: orderDetails.addons,
                addonIds: orderDetails.addonIds,
                addonDetails: orderDetails.addonDetails,
                specialRequests: orderDetails.specialRequests,
                language: lang,
                countryCode: getBuyerCountryFromPhone(orderDetails.phone),
              }),
            });

            const data = await res.json();

            if (!res.ok || !data?.orderID) {
              const reason = getCheckoutErrorMessage(
                data ?? {},
                errorMessage,
                lang,
              );
              const minDate = typeof data?.minBookableDate === "string" ? data.minBookableDate : null;
              const message = minDate ? `${reason} ${lang === "es" ? "Primera fecha disponible" : "Earliest available date"}: ${minDate}.` : reason;
              setPaymentError(message);
              throw new Error(message);
            }

            trackCheckoutEvent("payment_order_created", {
              metadata: {
                ...bookingAnalyticsMetadata,
                orderId: data.orderID,
              },
            });

            return data.orderID as string;
          },
          onApprove: (data: { orderID: string }, actions: { restart: () => Promise<void> }) => captureOrder(data.orderID, actions),
          onError: (err: unknown) => {
            if (!active) return;
            setPaymentError((current) => current ?? errorMessage);
            trackCheckoutEvent("payment_error", {
              metadata: {
                ...bookingAnalyticsMetadata,
                stage: "paypal_buttons",
                reason: err instanceof Error ? err.message : "paypal_error",
              },
            });
            console.error("PAYPAL ERROR:", err);
          },
        });

        if (buttons.isEligible && !buttons.isEligible()) throw new Error("paypal_not_eligible");
        // Bound rendering time as well as script loading; never leave a spinner forever.
        renderTimer = setTimeout(() => failPayPalLoad(new Error("paypal_render_timeout")), 20_000);
        await buttons.render(host);
        clearTimeout(renderTimer);
        if (!active || failed) { closeButtons(); return; }
        setLoadState({ key: loadKey, loading: false, error: null });
      } catch (error) { failPayPalLoad(error); }
    };
    void initialize();
    return () => {
      active = false;
      clearTimeout(renderTimer);
      // PayPal owns its iframe subtree. Close this instance, never clear a
      // mutable ref that may already point to a newer checkout's container.
      closeButtons();
      host.remove();
    };
  }, [captureOrder, container, enabled, errorMessage, lang, loadKey]);

  const retryPayPal = useCallback(() => setRetryVersion((version) => version + 1), []);
  const retryCapture = useCallback(() => {
    if (pendingCapture.current) void captureOrder(pendingCapture.current);
  }, [captureOrder]);

  return { paypalRef, paypalLoadError, isPaypalLoading, retryPayPal, paymentError, isCapturing, pendingOrderId, retryCapture };
}
