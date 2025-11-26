// app/payment/success/SuccessClient.tsx

type SuccessClientProps = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  date?: string | null;
  tickets?: string | number | null;
  amount?: string | number | null;
  currency?: string | null;
  orderId?: string | null;
  captureId?: string | null;
  status?: string | null;
  error?: string | null;
};

export function SuccessClient({
  email,
  name,
  phone,
  date,
  tickets,
  amount,
  currency,
  orderId,
  captureId,
  status,
  error,
}: SuccessClientProps) {
  if (error) {
    return (
      <section className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-8 border border-red-200 dark:border-red-600">
          <h1 className="text-3xl font-bold mb-4 text-red-700 dark:text-red-300">
            Hubo un problema ❌
          </h1>

          <p className="text-red-700 dark:text-red-300 font-medium">
            {error}
          </p>

          <a
            href="/"
            className="mt-8 inline-block px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
          >
            Volver al inicio
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-20">
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900 p-8 shadow-xl border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-4 text-teal-600">
          ¡Reserva Confirmada! 🎉
        </h1>

        <p className="text-zinc-700 dark:text-zinc-300">
          Gracias <strong>{name ?? "Cliente"}</strong>, tu reserva fue
          procesada correctamente.
        </p>

        <p className="mt-4 text-zinc-700 dark:text-zinc-300">
          Hemos enviado una confirmación a{" "}
          <strong>{email ?? "tu correo electrónico"}</strong>.
        </p>

        {/* Main details */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-left">
            <h2 className="font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              Detalles de la reserva
            </h2>

            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">Fecha:</span>{" "}
              {date ?? "N/A"}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">Tickets:</span>{" "}
              {tickets ?? "N/A"}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">Total:</span>{" "}
              {amount ? `${amount} ${currency || "USD"}` : "N/A"}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-left">
            <h2 className="font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              Datos de contacto
            </h2>

            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">Nombre:</span>{" "}
              {name ?? "N/A"}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">Email:</span>{" "}
              {email ?? "N/A"}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">Teléfono:</span>{" "}
              {phone || "N/A"}
            </p>
          </div>
        </div>

        {/* Payment / technical info */}
        <div className="mt-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 text-xs text-left text-zinc-600 dark:text-zinc-400 space-y-1">
          <p>
            <span className="font-semibold">Estado del pago:</span>{" "}
            {status || "N/A"}
          </p>
          <p>
            <span className="font-semibold">ID de la orden:</span>{" "}
            {orderId || "N/A"}
          </p>
          <p>
            <span className="font-semibold">ID de la transacción:</span>{" "}
            {captureId || "N/A"}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </section>
  );
}
