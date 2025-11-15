"use client";

import React, { useState } from "react";

type PaymentModalProps = {
  tickets: number;
  date: string;
  onClose: () => void;
  onConfirm: (data: { name: string; email: string }) => void;
};

export default function PaymentModal({
  tickets,
  date,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ name, email });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
        
        {/* Header */}
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

        {/* Details */}
        <p className="mb-4 text-lg text-zinc-700 dark:text-zinc-300">
          Estás reservando <strong>{tickets} tickets</strong> para el día{" "}
          <strong>{date}</strong>.
        </p>

        <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 dark:bg-yellow-900/20 dark:border-yellow-700">
          <p className="font-semibold text-yellow-800 dark:text-yellow-300">
            Serás redirigido a un <strong>pago seguro con Stripe</strong>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nombre Completo
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-zinc-900 focus:border-teal-500 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Correo Electrónico
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-zinc-900 focus:border-teal-500 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
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
