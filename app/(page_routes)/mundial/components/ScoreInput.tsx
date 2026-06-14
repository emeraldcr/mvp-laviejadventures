import { clampScore, cn } from "../utils";

type ScoreInputProps = {
  label: string;
  value: number;
  disabled: boolean;
  featured?: boolean;
  onChange: (value: number) => void;
};

const inputBase = cn(
  "min-w-0 rounded-lg border bg-[#070907] text-center font-black tabular-nums outline-none transition-all",
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  "border-[#365136] text-amber-200 shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]",
  "focus:border-emerald-400 focus:text-amber-100 focus:ring-2 focus:ring-emerald-500/20",
  "disabled:cursor-not-allowed disabled:border-[#1e2b1e] disabled:bg-[#0e140e] disabled:text-[#607160]"
);

const btnBase = cn(
  "flex select-none items-center justify-center rounded-lg border font-black transition-all active:scale-95",
  "border-[#365136] bg-[#070907] text-[#607160] shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]",
  "hover:border-emerald-600 hover:bg-[#0f1f0f] hover:text-emerald-400",
  "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#365136] disabled:hover:bg-[#070907] disabled:hover:text-[#607160]"
);

export function ScoreInput({ label, value, disabled, featured = false, onChange }: ScoreInputProps) {
  if (featured) {
    return (
      <div className="flex w-20 flex-col items-stretch gap-1 min-[380px]:w-24 sm:w-28 sm:gap-1.5">
        <button
          type="button"
          onClick={() => onChange(clampScore(value + 1))}
          disabled={disabled}
          aria-label={`Sumar gol de ${label}`}
          className={cn(btnBase, "h-7 w-full text-base sm:h-9 sm:text-lg")}
        >
          +
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={30}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(clampScore(Number(event.target.value)))}
          aria-label={`Goles de ${label}`}
          className={cn(
            inputBase,
            "w-full h-16 text-4xl min-[380px]:h-20 min-[380px]:text-5xl sm:h-24 sm:text-6xl"
          )}
        />
        <button
          type="button"
          onClick={() => onChange(clampScore(value - 1))}
          disabled={disabled || value <= 0}
          aria-label={`Restar gol de ${label}`}
        className={cn(btnBase, "h-7 w-full text-base sm:h-9 sm:text-lg")}
      >
          -
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(clampScore(value - 1))}
        disabled={disabled || value <= 0}
        aria-label={`Restar gol de ${label}`}
        className={cn(btnBase, "h-12 w-8 shrink-0 text-sm")}
      >
        -
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={30}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clampScore(Number(event.target.value)))}
        aria-label={`Goles de ${label}`}
        className={cn(inputBase, "h-12 w-[52px] text-2xl")}
      />
      <button
        type="button"
        onClick={() => onChange(clampScore(value + 1))}
        disabled={disabled}
        aria-label={`Sumar gol de ${label}`}
        className={cn(btnBase, "h-12 w-8 shrink-0 text-sm")}
      >
        +
      </button>
    </div>
  );
}
