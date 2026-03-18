import { redirect } from "next/navigation";
import Link from "next/link";
import { getOperatorFromCookies } from "@/lib/b2b-auth";
import { findBookingsByOperator } from "@/lib/models/booking";
import { findOperatorById, serializeGuideProfile } from "@/lib/models/operator";
import B2BNav from "@/app/components/b2b/B2BNav";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Globe,
  Sparkles,
  BadgeCheck,
  ShieldCheck,
  FileText,
} from "lucide-react";

function formatCRC(amount: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default async function B2BDashboardPage() {
  const operator = await getOperatorFromCookies();
  if (!operator) redirect("/b2b/login");
  if (operator.status === "pending") redirect("/b2b/pending");

  const account = await findOperatorById(operator.id);
  if (!account) redirect("/b2b/login");

  const isGuide = (account.accountType || "operator") === "guide";

  if (isGuide) {
    const guideProfile = serializeGuideProfile(account.guideProfile);
    const certifications = guideProfile?.certifications || [];
    const trainingRecords = guideProfile?.trainingRecords || [];
    const activeCertifications = certifications.filter((cert) => cert.status === "vigente").length;
    const expiringCertifications = certifications.filter((cert) => cert.status === "por_vencer").length;

    return (
      <div className="min-h-screen bg-zinc-50/80 dark:bg-zinc-950">
        <B2BNav operatorName={operator.name} company={operator.company} accountType={operator.accountType} />

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <section className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-900/20 md:p-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-100"><BadgeCheck className="h-3.5 w-3.5" />Portal interno de guías</p>
            <h1 className="mt-3 text-2xl font-bold md:text-4xl">Expediente individual de {operator.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50 md:text-base">Revisa certificaciones, simulacros y talleres documentados para auditorías ICT y renovaciones de licencia.</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs md:text-sm">
              <span className="rounded-full bg-white/15 px-3 py-1 font-medium">Cuenta: Guía</span>
              <span className="rounded-full bg-white/15 px-3 py-1 font-medium">Base: {operator.company}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 font-medium">Certificaciones: {certifications.length}</span>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Certificaciones vigentes", value: activeCertifications, icon: ShieldCheck, accent: "text-emerald-600" },
              { title: "Por vencer", value: expiringCertifications, icon: Clock3, accent: "text-amber-500" },
              { title: "Capacitaciones registradas", value: trainingRecords.length, icon: CalendarCheck, accent: "text-sky-600" },
              { title: "Expediente ICT", value: "Disponible", icon: FileText, accent: "text-violet-600" },
            ].map((card) => (
              <article key={card.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{card.title}</p><card.icon className={`h-5 w-5 ${card.accent}`} /></div>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{card.value}</p>
              </article>
            ))}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Certificaciones del guía</h2>
              <div className="mt-4 space-y-3">
                {certifications.map((cert) => (
                  <div key={cert.id} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <div className="flex items-center justify-between gap-3"><p className="font-semibold text-zinc-900 dark:text-zinc-100">{cert.title}</p><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{cert.status.replace("_", " ")}</span></div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{cert.issuer}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Vence: {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString("es-CR") : "Sin fecha"}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Registro de capacitaciones</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Cada capacitación, simulacro y taller queda documentado en el expediente individual de cada guía. Este registro está disponible para auditorías del ICT y es requerido para renovaciones de licencia.</p>
              <div className="mt-4 space-y-3">
                {trainingRecords.map((record) => (
                  <div key={record.id} className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between gap-3"><p className="font-semibold text-zinc-900 dark:text-zinc-100">{record.title}</p><span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold uppercase text-emerald-700 dark:bg-zinc-900 dark:text-emerald-300">{record.type}</span></div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{record.notes}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{new Date(record.completedAt).toLocaleDateString("es-CR")} · {record.issuer || "La Vieja Adventures"}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>
      </div>
    );
  }

  const allBookings = await findBookingsByOperator(operator.id);
  const pending = allBookings.filter((b) => b.status === "pending").length;
  const confirmed = allBookings.filter((b) => b.status === "confirmed").length;
  const cancelled = allBookings.filter((b) => b.status === "cancelled").length;
  const totalCommission = allBookings.filter((b) => b.status !== "cancelled").reduce((acc, booking) => acc + booking.commissionAmount, 0);
  const totalSales = allBookings.filter((b) => b.status !== "cancelled").reduce((acc, booking) => acc + booking.totalPrice, 0);
  const avgTicket = allBookings.length > 0 ? totalSales / allBookings.length : 0;
  const conversionRate = allBookings.length > 0 ? (confirmed / allBookings.length) * 100 : 0;
  const cancellationRate = allBookings.length > 0 ? (cancelled / allBookings.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-50/80 dark:bg-zinc-950">
      <B2BNav operatorName={operator.name} company={operator.company} accountType={operator.accountType} />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-900/20 md:p-8">
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-100"><Sparkles className="h-3.5 w-3.5" />Ciudad Esmeralda · La Vieja Adventures</p>
              <h1 className="mt-3 text-2xl font-bold md:text-4xl">Centro de operaciones B2B global</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50 md:text-base">Administra reservas, seguimiento comercial y crecimiento de aliados para nuestros tours desde un solo panel.</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs md:text-sm">
                <span className="rounded-full bg-white/15 px-3 py-1 font-medium">Operador: {operator.name}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 font-medium">Empresa: {operator.company}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 font-medium">Comisión: {operator.commissionRate}%</span>
              </div>
            </div>
            <div className="grid gap-2 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">Acciones clave</p>
              <Link href="/b2b/tours" className="inline-flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">Nueva reserva<ArrowRight className="h-4 w-4" /></Link>
              <Link href="/b2b/bookings" className="inline-flex items-center justify-between rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/25">Revisar operación completa<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { title: "Reservas totales", value: allBookings.length, icon: CalendarCheck, accent: "text-sky-600" },
            { title: "Pendientes", value: pending, icon: Clock3, accent: "text-amber-500" },
            { title: "Confirmadas", value: confirmed, icon: CheckCircle2, accent: "text-emerald-600" },
            { title: "Comisión acumulada", value: formatCRC(totalCommission), icon: CircleDollarSign, accent: "text-violet-600" },
            { title: "Venta total", value: formatCRC(totalSales), icon: BriefcaseBusiness, accent: "text-blue-600" },
          ].map((card) => (
            <article key={card.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{card.title}</p><card.icon className={`h-5 w-5 ${card.accent}`} /></div><p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{card.value}</p></article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Salud del negocio</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60"><p className="text-xs uppercase tracking-wide text-zinc-500">Conversión a confirmadas</p><p className="mt-1 text-2xl font-bold text-emerald-600">{formatPercent(conversionRate)}</p></div>
              <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60"><p className="text-xs uppercase tracking-wide text-zinc-500">Tasa de cancelación</p><p className="mt-1 text-2xl font-bold text-rose-600">{formatPercent(cancellationRate)}</p></div>
              <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60"><p className="text-xs uppercase tracking-wide text-zinc-500">Ticket promedio</p><p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatCRC(avgTicket)}</p></div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30"><p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"><Globe className="h-3.5 w-3.5" />Operación global</p><p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-200/80">Mantén estándares altos de respuesta para agencias internacionales y viajeros corporativos.</p></div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
