export function StatPill({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-0.5 px-3 py-2 rounded-xl border ${
        highlight ? "bg-white/5 border-white/15" : "bg-white/[0.03] border-white/8"
      }`}
    >
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</span>
      <span className="text-sm font-bold text-white tabular-nums">
        {value}
        <span className="text-xs text-zinc-400 font-normal ml-0.5">{unit}</span>
      </span>
    </div>
  );
}
