"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Tag, Users, CalendarDays } from "lucide-react";
import type { B2BTour } from "@/lib/b2b-tours";

interface BookingFormProps {
  tour: B2BTour;
  commissionRate: number;
  commissionPerPax: number;
}

function formatCRC(amount: number) {
  return `₡${amount.toLocaleString("es-CR")}`;
}

export default function BookingForm({ tour, commissionRate, commissionPerPax }: BookingFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    pax: 1,
    date: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pax" ? Math.max(1, Number(value)) : value,
    }));
  }

  const totalRetail = tour.retailPricePerPax * form.pax;
  const totalCommission = commissionPerPax * form.pax;
  const totalNet = totalRetail - totalCommission;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/b2b/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId: tour.id, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create booking.");
        return;
      }

      router.push(`/b2b/bookings?success=1`);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Form */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-5 font-semibold text-zinc-900 dark:text-zinc-50">
            Datos del cliente
          </h2>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="clientName"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Nombre completo del cliente *
              </label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                required
                value={form.clientName}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-emerald-900"
                placeholder="María García"
              />
            </div>

            <div>
              <label
                htmlFor="clientEmail"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Correo del cliente *
              </label>
              <input
                id="clientEmail"
                name="clientEmail"
                type="email"
                required
                value={form.clientEmail}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-emerald-900"
                placeholder="cliente@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="clientPhone"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Teléfono del cliente *
              </label>
              <input
                id="clientPhone"
                name="clientPhone"
                type="tel"
                required
                value={form.clientPhone}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-emerald-900"
                placeholder="+506 8888-0000"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="pax"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Número de pax *
                  </span>
                </label>
                <input
                  id="pax"
                  name="pax"
                  type="number"
                  required
                  min={tour.minPax}
                  max={tour.maxPax}
                  value={form.pax}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-emerald-900"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Fecha preferida *
                  </span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  min={today}
                  value={form.date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-emerald-900"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Notas adicionales
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-emerald-900"
                placeholder="Requerimientos especiales, alergias, etc."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/b2b/tours"
                className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {loading ? "Enviando..." : "Confirmar reserva"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Price summary */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">
            Resumen de precio
          </h2>

          <div className="mb-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
              {tour.name.split("–")[0].trim()}
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {form.pax} × {formatCRC(tour.retailPricePerPax)}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatCRC(totalRetail)}
                </span>
              </div>

              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Tu comisión ({commissionRate}%)
                </span>
                <span className="font-semibold">+ {formatCRC(totalCommission)}</span>
              </div>

              <div className="border-t border-zinc-200 pt-2.5 dark:border-zinc-700">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Total al público</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-50">
                    {formatCRC(totalRetail)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-zinc-400">
                  <span>Tu precio neto</span>
                  <span>{formatCRC(totalNet)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Ganarás{" "}
              <strong className="text-emerald-700 dark:text-emerald-300">
                {formatCRC(totalCommission)}
              </strong>{" "}
              de comisión cuando la reserva sea confirmada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
