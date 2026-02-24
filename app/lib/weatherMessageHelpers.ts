/**
 * weatherMessageHelpers.ts
 * Helper functions for building Anthropic prompts and processing
 * weather data into funny/witty tour guide messages.
 */

export type WeatherSnapshot = {
  risk: "green" | "yellow" | "red";
  riskLabel: string;
  last1h_mm: number;
  last3h_mm: number;
  last6h_mm: number;
  last24h_mm: number;
  intensity: string;
  trend: string;
  consensusMm: number;
  confidence: string;
  wetStreak: number;
  dryStreak: number;
  avgTemp24h: number | null;
  avgHR24h: number | null;
};

/** Build a rich system prompt for the weather comedian persona */
export function buildSystemPrompt(): string {
  return `Eres el guía de tours más gracioso de Costa Rica, experto en el tiempo de las montañas de San Carlos.
Tu misión: dar un comentario corto (máx. 2 oraciones), MUY gracioso y original sobre las condiciones actuales del tiempo.

Reglas:
- Varía SIEMPRE el tono y el tipo de humor: a veces sarcástico, a veces optimista ridículo, a veces dramático, a veces filosófico, a veces con metáforas locas.
- Usa vocabulario tico ocasionalmente (mae, tuanis, diay, pura vida, etc.).
- Haz referencia específica a los datos numéricos del tiempo de forma creativa.
- NUNCA empieces dos respuestas igual. Cambia estructura y vocabulario radicalmente cada vez.
- No uses emojis. Solo texto plano.
- Máximo 2 oraciones. Sin introducción, sin conclusión, solo el comentario gracioso.`;
}

/** Build the user message with real weather data + a random seed for variety */
export function buildUserPrompt(snap: WeatherSnapshot): string {
  const condicion =
    snap.risk === "red" ? "lluvia intensa - NO recomendado salir" :
    snap.risk === "yellow" ? "precaución - salir con cuidado" :
    "condiciones favorables - luz verde para tours";

  const rachaTexto =
    snap.wetStreak > 0 ? `${snap.wetStreak} horas seguidas lloviendo` :
    snap.dryStreak > 0 ? `${snap.dryStreak} horas secas seguidas` :
    "sin racha definida";

  const tempTexto = snap.avgTemp24h != null ? `${snap.avgTemp24h}°C promedio` : "sin datos de temperatura";
  const hrTexto   = snap.avgHR24h   != null ? `${snap.avgHR24h}% humedad`    : "sin datos de humedad";

  // Random seed phrase injected so the LLM doesn't repeat itself
  const seeds = [
    "Empieza con una analogía absurda.",
    "Empieza comparándolo con una película de terror.",
    "Empieza con una queja exagerada.",
    "Empieza con una frase motivacional ridícula.",
    "Empieza como si fuera un pronóstico de noticias dramático.",
    "Empieza con una metáfora gastronómica.",
    "Empieza con una referencia a la naturaleza costarricense.",
    "Empieza con una exageración cómica.",
    "Empieza con filosofía barata.",
    "Empieza como si hablaras con un turista desconcertado.",
    "Empieza con un refrán inventado.",
    "Empieza con ironía pura.",
    "Empieza como si fuera un informe policial oficial.",
    "Empieza como una reseña de restaurante que sale muy mal.",
    "Empieza hablándole directamente a la lluvia.",
    "Empieza con un chiste de papá (dad joke) climático.",
    "Empieza describiendo el clima como un personaje de telenovela.",
    "Empieza como anuncio de radio de los años 80.",
    "Empieza con un haiku muy malo sobre el tiempo.",
    "Empieza con una conspiración ridícula sobre la lluvia.",
    "Empieza como si fuera una carta de amor al sol.",
    "Empieza con una negación dramática de la realidad climática.",
    "Empieza comparando la lluvia con el comportamiento de los turistas.",
    "Empieza con un consejo de abuela tico absolutamente inútil.",
    "Empieza como comentario deportivo de un partido de lluvia.",
    "Empieza con una amenaza cómica dirigida a las nubes.",
    "Empieza como si el clima necesitara terapia urgente.",
    "Empieza con una sinopsis de película basada en este momento climático.",
    "Empieza con una predicción del fin del mundo claramente exagerada.",
    "Empieza con una referencia a algo completamente no relacionado, conectándolo al clima.",
  ];
  const seed = seeds[Math.floor(Math.random() * seeds.length)];

  return `Datos del tiempo AHORA en Montaña Sagrada, San Carlos:
- Condición general: ${condicion}
- Última hora: ${snap.last1h_mm} mm
- Últimas 3h: ${snap.last3h_mm} mm
- Últimas 6h: ${snap.last6h_mm} mm
- Últimas 24h: ${snap.last24h_mm} mm
- Intensidad actual: ${snap.intensity}
- Tendencia: ${snap.trend}
- Pronóstico próxima hora: ${snap.consensusMm} mm/h (confianza ${snap.confidence})
- Racha: ${rachaTexto}
- Temperatura: ${tempTexto}
- Humedad: ${hrTexto}

${seed}`;
}
