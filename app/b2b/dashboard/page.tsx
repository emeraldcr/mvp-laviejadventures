import { redirect } from "next/navigation";
import Link from "next/link";
import { getOperatorFromCookies } from "@/lib/b2b-auth";
import { getBookingStats, findBookingsByOperator } from "@/lib/models/booking";
import B2BNav from "@/app/components/b2b/B2BNav";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Map,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";

function formatCRC(amount: number) {
  return `₡${amount.toLocaleString("es-CR")}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    confirmed:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    cancelled:
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  };
  const labels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] || styles.pending
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

export default async function B2BDashboardPage() {
  const operator = await getOperatorFromCookies();
  if (!operator) redirect("/b2b/login");
  if (operator.status === "pending") redirect("/b2b/pending");

  const [stats, recentBookings] = await Promise.all([
    getBookingStats(operator.id),
    findBookingsByOperator(operator.id),
  ]);

  const recent = recentBookings.slice(0, 5);

  return (
    <div>
      <B2BNav operatorName={operator.name} company={operator.company} />

      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-6xl">
          <section className="mb-8 rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-lg">
              <p className="text-sm font-medium text-emerald-200">Bienvenido de vuelta,</p>
              <h1 className="mt-1 text-2xl font-bold">{operator.name}</h1>
              <p className="mt-0.5 text-emerald-200">{operator.company}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <TrendingUp className="h-4 w-4" />
                Tu comisión: {operator.commissionRate}% por reserva
              </div>
            </div>
          </section>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Total reservas
                </p>
                <CalendarCheck className="h-5 w-5 text-zinc-400" />
              </div>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.total}</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pendientes</p>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {stats.pending}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Confirmadas</p>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {stats.confirmed}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Comisión total
                </p>
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatCRC(stats.totalCommission)}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Reservas recientes</h2>
                  <Link
                    href="/b2b/bookings"
                    className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    Ver todas
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {recent.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Aún no tienes reservas</p>
                    <Link
                      href="/b2b/tours"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <Map className="h-4 w-4" />
                      Ver tours disponibles
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800">
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                            Cliente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                            Tour
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((booking) => (
                          <tr
                            key={booking._id?.toString()}
                            className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/50"
                          >
                            <td className="px-6 py-4">
                              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                                {booking.clientName}
                              </p>
                              <p className="text-xs text-zinc-400">{booking.pax} pax</p>
                            </td>
                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                              {booking.tourName.split("–")[0].trim()}
                            </td>
                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                              {new Date(booking.date).toLocaleDateString("es-CR")}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={booking.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">Acciones rápidas</h2>
                <div className="space-y-3">
                  <Link
                    href="/b2b/tours"
                    className="flex items-center justify-between rounded-xl border border-zinc-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-zinc-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <Map className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        Nueva reserva
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                  <Link
                    href="/b2b/bookings"
                    className="flex items-center justify-between rounded-xl border border-zinc-100 p-3 transition hover:border-blue-200 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarCheck className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        Mis reservas
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Tu comisión
                </p>
                <p className="mt-1 text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {operator.commissionRate}%
                </p>
                <p className="mt-1 text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  por cada reserva confirmada
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
