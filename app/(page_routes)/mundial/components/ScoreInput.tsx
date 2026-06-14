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
          ? "h-16 w-20 text-4xl sm:h-20 sm:w-24 sm:text-5xl"
          : "h-10 w-14 text-xl"
      )}
    />
  );
}
