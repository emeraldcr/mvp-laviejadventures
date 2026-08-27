// Tokens compartidos para que todos los gráficos de /tiempo se vean igual
// (fondo #0d0f0f, acento teal #00C4B0).

export const CHART = {
  grid: "rgba(255,255,255,0.05)",
  axisTick: { fontSize: 9, fill: "#71717a" },
  axisLine: false as const,
  tickLine: false as const,
  rain: "#38bdf8", // lluvia horaria — celeste
  rainSoft: "#38bdf833",
  accent: "#00C4B0", // acumulado — teal de marca
  accentSoft: "#00C4B033",
  warn: "#f59e0b", // umbral "moderada"
  danger: "#ef4444", // umbral "intensa" / "riesgo"
  caution: "#f97316", // umbral "caución"
  cursorFill: "rgba(255,255,255,0.04)",
} as const;

export const AXIS_LEFT_MARGIN = -18;
