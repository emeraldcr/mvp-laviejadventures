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
    <div className="mb-4 border-y border-zinc-200 py-3 dark:border-zinc-800" aria-label="Booking progress">
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-black text-zinc-900 dark:text-zinc-50">{currentStep} / {steps.length}</p>
          <p className="min-w-0 truncate text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {steps.find((step) => step.id === currentStep)?.label}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
          {steps.map((step) => (
            <span key={step.id} className={`h-1.5 rounded-full ${currentStep >= step.id ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
          ))}
        </div>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
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
              <span className={`min-w-0 truncate text-xs font-semibold ${isCurrent ? "text-emerald-700 dark:text-emerald-300" : isDone ? "text-teal-700 dark:text-teal-300" : "text-zinc-500"}`}>
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
