type Props = {
  lang?: "es" | "en";
  className?: string;
};

export default function SafetyBookingNotice({ lang = "es", className = "" }: Props) {
  const isSpanish = lang === "es";

  return (
    <aside
      className={`rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm dark:border-amber-400/30 dark:bg-amber-950/30 dark:text-amber-100 ${className}`}
      role="note"
      aria-label={isSpanish ? "Confirmación de seguridad de la reserva" : "Booking safety confirmation"}
    >
      <div className="flex gap-3">
        <span className="mt-0.5 text-lg" aria-hidden="true">🛟</span>
        <p className="leading-relaxed">
          {isSpanish
            ? "La disponibilidad se confirma antes del pago. Si la lluvia o el nivel del río no permiten operar con seguridad, le ofrecemos reprogramación o una alternativa."
            : "Availability is confirmed before payment. If rain or river levels make it unsafe to operate, we will offer rescheduling or a safe alternative."}
        </p>
      </div>
    </aside>
  );
}
