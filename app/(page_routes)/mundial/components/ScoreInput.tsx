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
        "rounded-lg border border-slate-300 bg-white text-center font-black tabular-nums text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500",
        featured ? "h-16 w-20 text-3xl" : "h-10 w-14 text-lg"
      )}
    />
  );
}
