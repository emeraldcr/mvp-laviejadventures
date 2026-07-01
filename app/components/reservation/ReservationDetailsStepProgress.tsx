import type { BookingStepId } from "@/lib/reservation/types";

interface ReservationDetailsStepProgressProps {
  steps: Array<{ id: BookingStepId; label: string }>;
  currentStep: BookingStepId;
}

export default function ReservationDetailsStepProgress({
  steps,
  currentStep,
}: ReservationDetailsStepProgressProps) {
  return (
    <div className="mb-8 border-y border-zinc-200 py-3 dark:border-zinc-800" aria-label="Booking progress">
      <div className="flex items-center gap-2">
        {steps.map((step) => {
          const isCurrent = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <div key={step.id} className="flex flex-1 items-center gap-2" aria-current={isCurrent ? "step" : undefined}>
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                  isCurrent
                    ? "border-emerald-400 bg-emerald-500 text-zinc-950"
                    : isDone
                    ? "border-teal-400 bg-teal-400/20 text-teal-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-500"
                }`}
              >
                {step.id}
              </span>
              <span className={`hidden min-w-0 truncate text-xs font-semibold sm:inline ${isCurrent ? "text-emerald-300" : isDone ? "text-teal-300" : "text-zinc-500"}`}>
                {step.label}
              </span>
              {step.id < steps.length && (
                <span className={`h-px flex-1 ${isDone ? "bg-teal-500/60" : "bg-zinc-800"}`} aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
