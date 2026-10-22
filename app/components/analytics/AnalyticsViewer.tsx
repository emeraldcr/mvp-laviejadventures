"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowDownLeft, ArrowUpRight, CalendarClock, CheckCircle2, CircleDollarSign, Eye, MousePointer2, RefreshCw, Route, Users, XCircle } from "lucide-react";

type Count = { label: string; count: number };
type AnalyticsData = {
  range: { days: number; since: string; until: string };
  sampledEvents: number;
  site: { sessions: number; pageViews: number; clicks: number; topPages: Count[]; devices: Count[] };
  reservation: { stepViews: number; progressions: number; backtracks: number; stepCompletions: number; blocked: number; abandoned: number; topSteps: Count[] };
  friction: { blocked: number; abandoned: number; averageExitSeconds: number; topMissingFields: Count[] };
  checkout: { started: number; orderCreated: number; approved: number; errors: number; completed: number; paymentMethods: Count[] };
  eventCounts: Count[];
  recentEvents: Array<{ event: string; path: string | null; happenedAt: string | null }>;
};

const nf = new Intl.NumberFormat("en-US");
const pct = (value: number, total: number) => total ? `${Math.round((value / total) * 100)}%` : "—";
const label = (value: string) => value.replaceAll("_", " ");

function Metric({ icon: Icon, label: metricLabel, value, tone = "teal" }: { icon: typeof Activity; label: string; value: string | number; tone?: "teal" | "amber" | "rose" | "blue" }) {
  const tones = { teal: "text-teal-300 bg-teal-400/10", amber: "text-amber-300 bg-amber-400/10", rose: "text-rose-300 bg-rose-400/10", blue: "text-sky-300 bg-sky-400/10" };
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"><div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={16} /></div><p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{metricLabel}</p><p className="mt-1 text-2xl font-black text-white">{typeof value === "number" ? nf.format(value) : value}</p></div>;
}

function MiniList({ items, empty = "No data yet" }: { items: Count[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-zinc-500">{empty}</p>;
  return <div className="space-y-2">{items.map((item) => <div key={item.label} className="flex items-center justify-between gap-3 text-sm"><span className="truncate capitalize text-zinc-300">{label(item.label)}</span><span className="font-bold text-white">{nf.format(item.count)}</span></div>)}</div>;
}

export default function AnalyticsViewer() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/analytics/events?days=${days}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load analytics");
      setData(await response.json() as AnalyticsData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  return <main className="min-h-screen bg-[#090b0b] px-4 py-6 text-white sm:px-6 lg:px-10">
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-teal-300">La Vieja Adventures · observatorio</p><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Analytics Viewer</h1><p className="mt-2 max-w-2xl text-sm text-zinc-400">Una lectura rápida de lo que hacen las personas en el sitio y dónde se frena la reserva.</p></div>
        <div className="flex items-center gap-2"><select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-white outline-none"><option value={7} className="bg-zinc-900">Últimos 7 días</option><option value={30} className="bg-zinc-900">Últimos 30 días</option><option value={90} className="bg-zinc-900">Últimos 90 días</option></select><button type="button" onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/15"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar</button></div>
      </header>

      {error && <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">{error}. Confirmá que MongoDB esté disponible.</div>}
      {loading && !data ? <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-zinc-400">Cargando señales del sitio…</div> : data && <>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500"><span className="flex items-center gap-1.5"><CalendarClock size={14} /> {data.range.days} días</span><span>•</span><span>{nf.format(data.sampledEvents)} eventos analizados</span><span>•</span><span>Actualización manual</span></div>
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-teal-300/15 bg-gradient-to-br from-teal-950/70 to-zinc-950 p-5 shadow-2xl shadow-teal-950/20"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">01 · Sitio completo</p><h2 className="mt-1 text-xl font-black">Qué está pasando afuera</h2></div><Activity className="text-teal-300" /></div><div className="grid grid-cols-3 gap-2"><Metric icon={Users} label="Sesiones" value={data.site.sessions} /><Metric icon={Eye} label="Páginas" value={data.site.pageViews} tone="blue" /><Metric icon={MousePointer2} label="Clicks" value={data.site.clicks} tone="amber" /></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Páginas más vistas</p><MiniList items={data.site.topPages} /></div><div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Dispositivos</p><MiniList items={data.site.devices} /></div></div></article>

          <article className="rounded-3xl border border-sky-300/15 bg-gradient-to-br from-sky-950/60 to-zinc-950 p-5 shadow-2xl shadow-sky-950/20"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">02 · Reserva</p><h2 className="mt-1 text-xl font-black">Cómo avanzan en el wizard</h2></div><Route className="text-sky-300" /></div><div className="grid grid-cols-3 gap-2"><Metric icon={Eye} label="Vistas de paso" value={data.reservation.stepViews} tone="blue" /><Metric icon={ArrowUpRight} label="Avances" value={data.reservation.progressions} /><Metric icon={ArrowDownLeft} label="Retrocesos" value={data.reservation.backtracks} tone="amber" /></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Lectura del flujo</p><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-zinc-400">Pasos completados</span><b>{nf.format(data.reservation.stepCompletions)}</b></div><div className="flex justify-between"><span className="text-zinc-400">Transiciones hacia atrás</span><b>{pct(data.reservation.backtracks, data.reservation.progressions + data.reservation.backtracks)}</b></div><div className="flex justify-between"><span className="text-zinc-400">Salidas reales</span><b>{nf.format(data.reservation.abandoned)}</b></div></div></div><div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Pasos más visitados</p><MiniList items={data.reservation.topSteps.map((item) => ({ ...item, label: `Paso ${item.label}` }))} /></div></div></article>

          <article className="rounded-3xl border border-amber-300/15 bg-gradient-to-br from-amber-950/50 to-zinc-950 p-5 shadow-2xl shadow-amber-950/15"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">03 · Fricción</p><h2 className="mt-1 text-xl font-black">Dónde se quedan pegados</h2></div><AlertTriangle className="text-amber-300" /></div><div className="grid grid-cols-3 gap-2"><Metric icon={AlertTriangle} label="Bloqueos" value={data.friction.blocked} tone="amber" /><Metric icon={XCircle} label="Salidas" value={data.friction.abandoned} tone="rose" /><Metric icon={Activity} label="Seg. antes de salir" value={data.friction.averageExitSeconds} /></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Campos que bloquean</p><MiniList items={data.friction.topMissingFields} empty="Todavía no hay problemas de validación" /></div><div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Interpretación</p><p className="text-sm leading-6 text-zinc-400">Los bloqueos son intentos sin validación. Las salidas solo cuentan cuando la persona abandona la página; avanzar o volver de paso ya no se mezcla con abandono.</p></div></div></article>

          <article className="rounded-3xl border border-rose-300/15 bg-gradient-to-br from-rose-950/50 to-zinc-950 p-5 shadow-2xl shadow-rose-950/15"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-300">04 · Checkout</p><h2 className="mt-1 text-xl font-black">Del interés a la confirmación</h2></div><CircleDollarSign className="text-rose-300" /></div><div className="grid grid-cols-3 gap-2"><Metric icon={ArrowUpRight} label="Checkout" value={data.checkout.started} tone="blue" /><Metric icon={CheckCircle2} label="Aprobados" value={data.checkout.approved} /><Metric icon={CheckCircle2} label="Reservas" value={data.checkout.completed} /></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Estado de pago</p><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-zinc-400">Órdenes creadas</span><b>{nf.format(data.checkout.orderCreated)}</b></div><div className="flex justify-between"><span className="text-zinc-400">Errores</span><b className="text-rose-300">{nf.format(data.checkout.errors)}</b></div><div className="flex justify-between"><span className="text-zinc-400">Conversión checkout</span><b>{pct(data.checkout.completed, data.checkout.started)}</b></div></div></div><div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Métodos elegidos</p><MiniList items={data.checkout.paymentMethods} empty="Sin selecciones todavía" /></div></div></article>
        </section>
        <section className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Registro vivo</p><h2 className="mt-1 text-lg font-black">Eventos recientes y catálogo registrado</h2></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-zinc-400">{data.eventCounts.length} tipos detectados</span></div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{data.recentEvents.map((item, index) => <div key={`${item.event}-${item.happenedAt}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2.5 text-xs"><span className="truncate font-semibold capitalize text-zinc-300">{label(item.event)}</span><span className="shrink-0 text-zinc-600">{item.happenedAt ? new Date(item.happenedAt).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" }) : "—"}</span></div>)}</div><div className="mt-5 border-t border-white/10 pt-4"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Todos los eventos y volumen</p><div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">{data.eventCounts.map((item) => <div key={item.label} className="flex justify-between gap-2 text-sm"><span className="truncate capitalize text-zinc-400">{label(item.label)}</span><b>{nf.format(item.count)}</b></div>)}</div></div></section>
      </>}
    </div>
  </main>;
}
