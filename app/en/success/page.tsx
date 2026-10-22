import { redirect } from "next/navigation";

export default async function LegacyEnglishSuccessRedirect({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const orderId = params.orderId;
  if (typeof orderId === "string") query.set("orderId", orderId);
  redirect(`/en/reservar/voucher${query.toString() ? `?${query.toString()}` : ""}`);
}
