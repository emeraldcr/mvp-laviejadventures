"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

type Reservation = {
  id: string; name: string | null; email: string | null; phone: string | null; date: string | null;
  tickets: number | string | null; amount: number | string | null; currency: string | null;
  status: string | null; paymentStatus: string | null; paymentMethod: string | null;
  tourName: string | null; tourPackage: string | null; tourTime: string | null;
  referenceCode: string | null; specialRequests: string | null; createdAt: string | null;
};
type Result = { reservations: Reservation[]; total: number; page: number; pageSize: number };
const display = (value: unknown) => value === null || value === undefined || value === "" ? "—" : String(value);
const created = (value: string | null) => {
  if (!value || Number.isNaN(new Date(value).getTime())) return "—";
  return new Date(value).toLocaleString("es-CR", { timeZone: "America/Costa_Rica", dateStyle: "medium", timeStyle: "short" });
};

export default function ReservationsPanel() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/reservations?page=${page}`, { cache: "no-store", signal });
      if (!response.ok) throw new Error(response.status === 403 ? "Acceso restringido. Inicie sesión con una cuenta administrativa verificada." : "No se pudieron cargar las reservas. Inténtelo de nuevo.");
      setData(await response.json() as Result);
    } catch (err) {
      if (signal?.aborted) return;
      setData(null); setError(err instanceof Error ? err.message : "No se pudieron cargar las reservas.");
    } finally { if (!signal?.aborted) setLoading(false); }
  }, [page]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);

  return <main className="min-h-screen bg-[#090b0b] px-4 py-8 text-white sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">La Vieja Adventures · administración</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Panel de reservas</h1><p className="mt-2 text-sm text-zinc-400">Reservas registradas, incluidas las pendientes de pago.</p></div><div className="flex gap-2"><Link href="/analytics" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10">Analítica</Link><button type="button" onClick={() => void load()} disabled={loading} className="flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-2 text-sm font-bold text-teal-950 disabled:opacity-50"><RefreshCw size={16} /> Actualizar</button></div></header>
    {error && <div role="alert" className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-5 text-sm text-rose-200">{error}</div>}
    {loading && <p role="status" className="py-8 text-zinc-400">Cargando reservas…</p>}
    {!loading && data && <><div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400"><p><strong className="text-white">{data.total.toLocaleString("es-CR")}</strong> reservas registradas</p><p>Más recientes primero · página {data.page} de {Math.max(1, Math.ceil(data.total / data.pageSize))}</p></div>
      {!data.reservations.length ? <div className="rounded-2xl border border-white/10 p-8 text-center text-zinc-400">No hay reservas en esta página.</div> : <div className="grid gap-4 md:grid-cols-2">{data.reservations.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-teal-300">{display(item.referenceCode)}</p><h2 className="mt-1 text-xl font-bold">{display(item.tourName)}</h2><p className="mt-1 text-sm text-zinc-400">{display(item.tourPackage)}</p></div><span className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold">{display(item.status)}</span></div><div className="mt-4 flex items-center gap-2 text-sm font-bold text-teal-100"><CalendarDays size={16} /> {display(item.date)} · {display(item.tourTime)} · {display(item.tickets)} personas</div><dl className="mt-4 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2"><div><dt className="text-zinc-500">Cliente</dt><dd className="break-words">{display(item.name)}</dd></div><div><dt className="text-zinc-500">Contacto</dt><dd className="break-all">{display(item.email)}<br />{display(item.phone)}</dd></div><div><dt className="text-zinc-500">Monto · pago</dt><dd>{display(item.currency)} {display(item.amount)} · {display(item.paymentStatus ?? item.paymentMethod)}</dd></div><div><dt className="text-zinc-500">Registrada</dt><dd>{created(item.createdAt)}</dd></div>{item.specialRequests && <div className="sm:col-span-2"><dt className="text-zinc-500">Solicitudes especiales</dt><dd className="whitespace-pre-wrap break-words">{item.specialRequests}</dd></div>}</dl></article>)}</div>}
      <nav aria-label="Paginación de reservas" className="mt-6 flex justify-between gap-4"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="flex items-center gap-1 rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-40"><ChevronLeft size={16} /> Anterior</button><button type="button" disabled={page * data.pageSize >= data.total} onClick={() => setPage(page + 1)} className="flex items-center gap-1 rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-40">Siguiente <ChevronRight size={16} /></button></nav></>}
  </div></main>;
}
