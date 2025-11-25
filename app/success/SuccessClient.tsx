
type SuccessClientProps = {
  email?: string | null
  name?: string | null
  date?: string | null
  tickets?: string | number | null
}

export function SuccessClient({ email, name, date, tickets }: SuccessClientProps) {
  return (
    <section className="max-w-xl mx-auto py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">¡Reserva Confirmada! 🎉</h1>

      <p className="text-zinc-700 dark:text-zinc-300">
        Gracias <strong>{name ?? 'Cliente'}</strong>, tu reserva fue procesada correctamente.
      </p>

      <p className="mt-4">
        Hemos enviado una confirmación a{' '}
        <strong>{email ?? 'tu correo electrónico'}</strong>.
      </p>

      <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        <p><strong>Fecha:</strong> {date ?? 'N/A'}</p>
        <p><strong>Tickets:</strong> {tickets ?? 'N/A'}</p>
      </div>

      <a
        href="/"
        className="mt-8 inline-block px-6 py-3 bg-teal-600 text-white rounded-xl"
      >
        Volver al inicio
      </a>
    </section>
  )
}
