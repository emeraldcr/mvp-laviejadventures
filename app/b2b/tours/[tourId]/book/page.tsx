import { redirect, notFound } from "next/navigation";
import { getOperatorFromCookies } from "@/lib/b2b-auth";
import { B2B_TOURS } from "@/lib/b2b-tours";
import B2BNav from "@/app/components/b2b/B2BNav";
import BookingForm from "./BookingForm";

export default async function BookTourPage({
  params,
}: {
  params: Promise<{ tourId: string }>;
}) {
  const operator = await getOperatorFromCookies();
  if (!operator) redirect("/b2b/login");
  if (operator.status === "pending") redirect("/b2b/pending");

  const { tourId } = await params;
  const tour = B2B_TOURS.find((t) => t.id === tourId);
  if (!tour) notFound();

  const commissionPerPax = Math.round(tour.retailPricePerPax * (operator.commissionRate / 100));

  return (
    <div>
      <B2BNav operatorName={operator.name} company={operator.company} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Nueva reserva</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{tour.name}</p>
        </div>

        <BookingForm
          tour={tour}
          commissionRate={operator.commissionRate}
          commissionPerPax={commissionPerPax}
        />
      </main>
    </div>
  );
}
