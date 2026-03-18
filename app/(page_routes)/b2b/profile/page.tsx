import { redirect } from "next/navigation";
import { Mail, Building2, UserRound, BadgeCheck, CalendarCheck, ShieldCheck } from "lucide-react";
import B2BNav from "@/app/components/b2b/B2BNav";
import { getOperatorFromCookies } from "@/lib/b2b-auth";
import { findOperatorById, serializeGuideProfile } from "@/lib/models/operator";
import NotificationsSettings from "./NotificationsSettings";

const DEFAULT_NOTIFICATION_PREFERENCES = {
  bookingCreated: true,
  bookingReminder24h: true,
  bookingStatusChanges: true,
  weeklyPerformanceDigest: true,
  partnerNetworkUpdates: true,
};

export default async function B2BProfilePage() {
  const operatorToken = await getOperatorFromCookies();
  if (!operatorToken) redirect("/b2b/login");
  if (operatorToken.status === "pending") redirect("/b2b/pending");

  const operator = await findOperatorById(operatorToken.id);
  if (!operator) redirect("/b2b/login");

  const preferences = operator.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
  const guideProfile = serializeGuideProfile(operator.guideProfile);
  const isGuide = (operator.accountType || "operator") === "guide";

  return (
    <div>
      <B2BNav operatorName={operatorToken.name} company={operatorToken.company} accountType={operatorToken.accountType} />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <section className="h-fit rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Perfil B2B</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Configuración de cuenta</h1>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70"><p className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"><UserRound className="h-3.5 w-3.5" />Nombre</p><p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{operator.name}</p></div>
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70"><p className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"><Building2 className="h-3.5 w-3.5" />Empresa</p><p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{operator.company}</p></div>
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70"><p className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"><Mail className="h-3.5 w-3.5" />Email</p><p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{operator.email}</p></div>
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70"><p className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"><BadgeCheck className="h-3.5 w-3.5" />Tipo de cuenta</p><p className="mt-1 text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">{isGuide ? "Guía" : "Operador / Agencia"}</p></div>
          </div>
        </section>

        <div className="space-y-6">
          {isGuide && guideProfile ? (
            <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900/50 dark:bg-zinc-900">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Expediente del guía</p>
                  <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Capacitaciones y certificaciones</h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Consulta tu expediente individual y el historial requerido para auditorías ICT y renovaciones.</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <p className="font-semibold">{guideProfile.certifications.length} certificaciones</p>
                  <p>{guideProfile.trainingRecords.length} actividades registradas</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {guideProfile.certifications.map((cert) => (
                  <article key={cert.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/70">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"><ShieldCheck className="h-4 w-4 text-emerald-600" />{cert.title}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{cert.issuer}</p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Completada: {new Date(cert.completedAt).toLocaleDateString("es-CR")}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Vence: {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString("es-CR") : "Sin fecha"}</p>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300"><CalendarCheck className="h-4 w-4" />Registro de Capacitaciones</p>
                <p className="mt-2 text-sm text-emerald-900/80 dark:text-emerald-200/80">Cada capacitación, simulacro y taller queda documentado en el expediente individual de cada guía. Este registro está disponible para auditorías del ICT y es requerido para renovaciones de licencia.</p>
                <div className="mt-4 space-y-3">
                  {guideProfile.trainingRecords.map((record) => (
                    <div key={record.id} className="rounded-xl bg-white/80 p-3 dark:bg-zinc-900/60">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{record.title}</p>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{record.type}</span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{record.notes}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{new Date(record.completedAt).toLocaleDateString("es-CR")} · {record.issuer || "La Vieja Adventures"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <NotificationsSettings initialPreferences={preferences} />
        </div>
      </main>
    </div>
  );
}
