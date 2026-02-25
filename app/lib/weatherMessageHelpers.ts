/**
 * weatherMessageHelpers.ts
 * Versión chill: vacilón tico ligero, corto y sin ser despiadado.
 */

export type WeatherSnapshot = {
  risk: "green" | "yellow" | "red";
  riskLabel?: string;
  last1h_mm: number;
  last3h_mm?: number;
  last6h_mm?: number;
  last24h_mm: number;
  intensity: string;
  trend: string;
  consensusMm: number;
  confidence?: string;
  wetStreak?: number;
  dryStreak?: number;
  avgTemp24h: number | null;
  avgHR24h?: number | null;
};

export function buildSystemPrompt(): string {
  return `Sos una persona guía local en Costa Rica.
Escribí SOLO 1 o 2 oraciones cortas sobre el clima actual.
Tiene que ser gracioso pero buena nota (no cruel).
Meté al menos un dato (mm, °C, tendencia o intensidad) dentro del chiste.
Sin emojis. Sin sonar como reporte.
Usá un español neutro y natural, sin depender de chistes demasiado locales.`;
}

function trendLabel(trendRaw: string): "up" | "down" | "flat" {
  const t = (trendRaw || "").toLowerCase();
  if (t.includes("up") || t.includes("sub")) return "up";
  if (t.includes("down") || t.includes("baj")) return "down";
  return "flat";
}

export function buildUserPrompt(snap: WeatherSnapshot): string {
  const condicion =
    snap.risk === "red"
      ? "está fuerte la cosa"
      : snap.risk === "yellow"
        ? "medio mojadito"
        : "bastante tranquilo";

  const lluvia =
    snap.last24h_mm > 10
      ? `${Math.round(snap.last24h_mm)}mm en 24h`
      : snap.last1h_mm > 2
        ? `${Math.round(snap.last1h_mm)}mm en la última hora`
        : "poquita lluvia";

  const temp =
    snap.avgTemp24h != null
      ? `${Math.round(snap.avgTemp24h)}°C promedio`
      : "temperatura rara";

  const trend = trendLabel(snap.trend);
  const trendTexto =
    trend === "up"
      ? "va aumentando"
      : trend === "down"
        ? "va bajando"
        : "anda parejo";

  const angles = [
    "Suena como comentario casual de pulpería.",
    "Que parezca que el sol y las nubes están peleando.",
    "Decí que hoy es día oficial de café o birra según el clima.",
    "Hacelo como mini drama pero simpático.",
    "Comparalo con algo cotidiano y simple.",
  ];

  const angle = angles[Math.floor(Math.random() * angles.length)];

  return `Clima actual en zona de cañón:
- General: ${condicion}
- Lluvia: ${lluvia}
- Temp: ${temp}
- Tendencia: ${trendTexto}
- Intensidad: ${snap.intensity}

Estilo: ${angle}
Recordá: 1-2 oraciones, corto y vacilón suave. Evitá frases demasiado personalizadas de un solo pueblo.`;
}
