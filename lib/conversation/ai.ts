import OpenAI from "openai";
import type { ConversationFaq, ConversationReservation } from "./types";

type AIInterpretation = {
  intent: "booking" | "question" | "human" | "unknown";
  reply: string;
  fields: {
    tour: string | null;
    date: string | null;
    time: string | null;
    people: number | null;
    ages: number[];
    fitness: string | null;
    package: string | null;
    transport: string | null;
    lunch: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
};

export type AssistantTourKnowledge = {
  slug: string;
  title: string;
  aliases: string[];
  description: string;
  duration?: string;
  difficulty?: string;
  location?: string;
  inclusions: string[];
  exclusions: string[];
  restrictions?: string;
  cancellationPolicy?: string;
  packages: Array<{
    id?: string;
    name: string;
    description?: string;
    includes: string[];
    departureTimes: string[];
    scheduleNote?: string;
  }>;
  highlights: string[];
  itinerary: Array<{ time?: string; title: string; description: string }>;
  whatToBring: string[];
  goodToKnow: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export type AssistantSiteKnowledge = {
  id: string;
  scope: string;
  locale: string;
  title: string;
  content: string;
  source: string;
};

const EMPTY_INTERPRETATION: AIInterpretation = {
  intent: "unknown",
  reply: "",
  fields: {
    tour: null,
    date: null,
    time: null,
    people: null,
    ages: [],
    fitness: null,
    package: null,
    transport: null,
    lunch: null,
    name: null,
    email: null,
    phone: null,
  },
};

const INTERPRETATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["intent", "reply", "fields"],
  properties: {
    intent: { type: "string", enum: ["booking", "question", "human", "unknown"] },
    reply: { type: "string" },
    fields: {
      type: "object",
      additionalProperties: false,
      required: ["tour", "date", "time", "people", "ages", "fitness", "package", "transport", "lunch", "name", "email", "phone"],
      properties: {
        tour: { type: ["string", "null"] },
        date: { anyOf: [{ type: "string", format: "date" }, { type: "null" }] },
        time: { type: ["string", "null"], enum: ["08:00", "09:00", "10:00", null] },
        people: { type: ["integer", "null"] },
        ages: { type: "array", items: { type: "integer" } },
        fitness: { type: ["string", "null"], enum: ["active", "moderate", "needs-review", null] },
        package: { type: ["string", "null"], enum: ["essential-package", "lunch-package", "private-package", null] },
        transport: { type: ["string", "null"], enum: ["required", "self", null] },
        lunch: { type: ["string", "null"], enum: ["yes", "no", null] },
        name: { type: ["string", "null"] },
        email: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
      },
    },
  },
} as const;

export async function interpretWithOpenAI(input: {
  message: string;
  currentStep: string;
  reservation: ConversationReservation;
  faqs: ConversationFaq[];
  tours: AssistantTourKnowledge[];
  siteKnowledge: AssistantSiteKnowledge[];
}): Promise<AIInterpretation | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENAI_ASSISTANT_MODEL?.trim()
    || process.env.OPENAI_MODEL?.trim()
    || "gpt-5.6-luna";
  const client = new OpenAI({ apiKey });
  const faqContext = input.faqs
    .map((faq) => `- ${faq.question}: ${faq.answer}`)
    .join("\n");
  const tourContext = JSON.stringify(input.tours);
  const siteContext = JSON.stringify(input.siteKnowledge);

  try {
    const response = await client.responses.create({
      model,
      reasoning: { effort: "none" },
      input: [
        {
          role: "system",
          content: `Role: interprete de reservas de La Vieja Adventures.

Goal: detecte la intención, extraiga únicamente datos explícitos y responda cálidamente en español.

Constraints:
- Nunca invente precio, disponibilidad, certificaciones, clima ni condiciones operativas.
- Para preguntas, use exclusivamente el catálogo y las FAQ verificadas incluidas abajo.
- Puede comparar tours y explicar dificultad, duración, ubicación, inclusiones, exclusiones, preparación, restricciones, itinerario, paquetes y políticas cuando esos datos estén presentes.
- Si el catálogo o las FAQ no respaldan una afirmación, indique brevemente que el equipo debe confirmarla.
- Seguridad primero: lluvia fuerte, río crecido o terreno inestable requieren revisión humana y alternativas seguras.
- No marque una reserva como confirmada ni pagada.
- Preserve exactamente correos, teléfonos, nombres y fechas proporcionados.
- Use ustedeo natural de Costa Rica; nunca tutee al visitante.
- Devuelva las fechas como AAAA-MM-DD, incluso cuando el visitante use palabras.
- Para seleccionar un tour, devuelva únicamente el slug exacto del catálogo.
- Si un dato no aparece con claridad, devuelva null o [].

Fecha actual en Costa Rica: ${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Costa_Rica" }).format(new Date())}
Paso actual: ${input.currentStep}
Datos ya guardados: ${JSON.stringify(input.reservation)}

FAQ verificadas:
${faqContext || "No hay FAQ disponibles."}

Catálogo completo verificado:
${tourContext || "No hay tours disponibles."}

Contenido relevante del sitio recuperado desde MongoDB:
${siteContext || "No se recuperó contenido adicional."}`,
        },
        { role: "user", content: input.message },
      ],
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "vero_interpretation",
          strict: true,
          schema: INTERPRETATION_SCHEMA,
        },
      },
    }, { signal: AbortSignal.timeout(10_000) });

    if (!response.output_text) return null;
    return { ...EMPTY_INTERPRETATION, ...JSON.parse(response.output_text) } as AIInterpretation;
  } catch (error) {
    console.error("[conversation/openai]", error);
    return null;
  }
}
