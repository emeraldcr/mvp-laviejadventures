export const getPayPalMode = () =>
  (process.env.NEXT_PUBLIC_PAYPAL_MODE?.toLowerCase() === "live" ? "live" : "sandbox");

export const getPayPalClientId = () => {
  const mode = getPayPalMode();

  if (mode === "live") {
    return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ?? "";
  }

  return (
    process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ||
    ""
  );
};

export const getPayPalSdkUrl = ({
  currency = "USD",
  intent = "capture",
  components = ["buttons"],
}: {
  currency?: string;
  intent?: "capture";
  components?: string[];
} = {}) => {
  const clientId = getPayPalClientId();

  if (!clientId) {
    return null;
  }

  const params = new URLSearchParams({
    "client-id": clientId,
    currency,
    intent,
    components: components.join(","),
  });

  return `https://www.paypal.com/sdk/js?${params.toString()}`;
};
