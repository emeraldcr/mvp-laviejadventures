export function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? "#fff" }} className="font-bold">
          {p.name}: {p.value?.toFixed ? p.value.toFixed(1) : p.value} {p.unit ?? "mm"}
        </p>
      ))}
    </div>
  );
}
