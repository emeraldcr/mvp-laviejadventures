// dashboard/components/AccumulationStats.tsx
export default function AccumulationStats({
  stats,
  forecast,
}: {
  stats: any;
  forecast: any;
}) {
  const items = [
    { label: "Última hora", value: stats.last1h_mm, color: "text-blue-400" },
    { label: "Últimas 3 h", value: stats.last3h_mm, color: "text-cyan-400" },
    { label: "Últimas 6 h", value: stats.last6h_mm, color: "text-teal-400" },
    { label: "Últimas 24 h", value: stats.last24h_mm, color: "text-purple-400" },
    { label: "Próxima hora (est)", value: forecast.nextHour_mm, color: "text-amber-400 italic" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {items.map((item, i) => (
        <div key={i} className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">{item.label}</p>
          <p className={`text-2xl font-bold ${item.color}`}>
            {item.value.toFixed(1)} <span className="text-lg">mm</span>
          </p>
        </div>
      ))}
    </div>
  );
}