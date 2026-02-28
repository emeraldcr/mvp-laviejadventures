// dashboard/components/RainStatusCard.tsx
import { TrendingUp, TrendingDown } from "lucide-react";
import type { RainStatusCardProps } from "@/lib/types/index";

const colorMap = {
  green: "bg-green-600/30 border-green-500 text-green-300",
  yellow: "bg-yellow-600/30 border-yellow-500 text-yellow-300",
  red: "bg-red-600/30 border-red-500 text-red-300",
};

export default function RainStatusCard({
  risk,
  riskLabel,
  riskEmoji,
  intensity,
  lastHour_mm,
  trend,
}: RainStatusCardProps) {
  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-sm ${colorMap[risk as keyof typeof colorMap]}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          {riskEmoji} Estado Actual
        </h2>
        <span className="text-4xl">{riskEmoji}</span>
      </div>

      <p className="text-3xl font-semibold mb-2">{riskLabel}</p>

      <div className="space-y-3 mt-6">
        <div className="flex justify-between items-center">
          <span>Lluvia última hora:</span>
          <span className="font-bold">{lastHour_mm.toFixed(1)} mm</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Intensidad:</span>
          <span className="capitalize font-medium">{intensity}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Tendencia:</span>
          <div className="flex items-center gap-2">
            {trend === "subiendo" && <TrendingUp className="text-red-400" />}
            {trend === "bajando" && <TrendingDown className="text-green-400" />}
            <span className="capitalize">{trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
}