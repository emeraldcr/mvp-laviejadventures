"use client";

import React, { useState } from "react";

type PaymentModalProps = {
  tickets: number;
  date: string;
  onClose: () => void;
};

export default function PaymentModal({ tickets, date, onClose }: PaymentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Finalizar Reserva 💳
          </h2>
          <button
            onClick={onClose}
            className="text-3xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            &times;
          </button>
        </div>

        <p className="mb-4 text-lg text-zinc-700 dark:text-zinc-300">
          Estás reservando <strong>{tickets} tickets</strong> para el día <strong>{date}</strong>.
        </p>

        {/* ⭐ NATIVE HTML FORM — lets the API route redirect directly */}
        <form action="/api/checkout_sessions" method="POST" className="space-y-4">

          {/* NAME */}
          <input type="hidden" name="tickets" value={tickets} />
          <input type="hidden" name="date" value={date} />

          <div>
            <label className="mb-1 block text-sm font-medium">Nombre Completo</label>
            <input
              required
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-1 block text-sm font-medium">Correo Electrónico</label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3"
              placeholder="Para recibir tu confirmación"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-teal-600 py-3 font-bold text-white shadow-md transition hover:bg-teal-700"
          >
            Confirmar Datos y Pagar con Stripe
          </button>
        </form>
      </div>
    </div>
  );
}
