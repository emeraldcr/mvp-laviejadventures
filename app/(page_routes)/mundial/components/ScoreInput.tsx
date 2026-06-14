import { clampScore, cn } from "../utils";

type ScoreInputProps = {
  label: string;
  value: number;
  disabled: boolean;
  featured?: boolean;
  onChange: (value: number) => void;
};

export function ScoreInput({ label, value, disabled, featured = false, onChange }: ScoreInputProps) {
  return (
    <input
      type="number"
      min={0}
      max={30}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(clampScore(Number(event.target.value)))}
      aria-label={`Goles de ${label}`}
      className={cn(
        "rounded-xl border bg-[#0a1408] text-center font-black tabular-nums outline-none transition-all",
        "border-[#1e3a1e] text-amber-400",
        "focus:border-green-500 focus:text-amber-300",
        "disabled:text-[#2a4020] disabled:border-[#121e12] disabled:cursor-not-allowed",
        featured
          ? "h-14 w-[4.5rem] text-3xl sm:h-16 sm:w-20 sm:text-4xl"
          : "h-10 w-14 text-xl"
      )}
    />
  );
}
