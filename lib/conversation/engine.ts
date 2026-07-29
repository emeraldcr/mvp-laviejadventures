import type { Collection, Db } from "mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import type {
  ConversationInputType,
  ConversationReservation,
  ConversationResponse,
  ConversationSession,
  ConversationStep,
  PublicConversationStep,
} from "./types";

const SESSION_TTL_DAYS = 30;
const STEP_SEED_VERSION = 2;
let setupPromise: Promise<void> | null = null;

const EMPTY_RESERVATION: ConversationReservation = {
  tour: null,
  date: null,
  people: null,
  ages: [],
  fitness: null,
  package: null,
  transport: null,
  lunch: null,
  name: null,
  email: null,
  phone: null,
};

const STEP_SEEDS: Omit<ConversationStep, "updatedAt">[] = [
  {
    id: "first",
    message: "¡Hola! 👋 Bienvenido a La Vieja Adventures. Soy Vero, su asistente virtual. ¿Cómo puedo ayudarle?",
    kind: "menu",
    options: [
      { key: "A", label: "Reservar un tour", next: "reservation_tour" },
      { key: "B", label: "Hacer una pregunta", next: "questions_menu" },
      { key: "C", label: "Hablar con un agente", next: "human_name" },
    ],
    active: true,
  },
  {
    id: "reservation_tour",
    message: "¡Vamos a armar su aventura! ¿Cuál experiencia le interesa?",
    kind: "menu",
    options: [
      { key: "A", label: "Ciudad Esmeralda", next: "reservation_date", set: { path: "reservation.tour", value: "tour-ciudad-esmeralda" } },
      { key: "B", label: "Pozas Cristalinas", next: "reservation_date", set: { path: "reservation.tour", value: "cascadas-secretas-rio-la-vieja" } },
      { key: "C", label: "Cloud Forest Explorer", next: "reservation_date", set: { path: "reservation.tour", value: "caminata-volcanes-dormidos" } },
      { key: "D", label: "ATV, caballo o aves", next: "human_name" },
      { key: "E", label: "Volver", next: "first" },
    ],
    active: true,
  },
  {
    id: "reservation_date",
    message: "¿Para qué fecha desea reservar? Use el formato AAAA-MM-DD.",
    kind: "input",
    capture: { path: "reservation.date", type: "date", next: "reservation_people", invalidMessage: "Esa fecha no me calza 😅 Escríbala como AAAA-MM-DD y que no sea una fecha pasada." },
    active: true,
  },
  {
    id: "reservation_people",
    message: "¿Cuántas personas vienen?",
    kind: "input",
    capture: { path: "reservation.people", type: "integer", min: 1, max: 20, next: "reservation_ages", invalidMessage: "Indíqueme un número de personas entre 1 y 20." },
    active: true,
  },
  {
    id: "reservation_ages",
    message: "Indíqueme las edades separadas por comas. Ejemplo: 34, 32, 12.",
    kind: "input",
    capture: { path: "reservation.ages", type: "ages", next: "reservation_fitness", invalidMessage: "Escriba edades válidas separadas por comas; debe coincidir con la cantidad de personas." },
    active: true,
  },
  {
    id: "reservation_fitness",
    message: "¿Cómo describiría la condición física del grupo?",
    kind: "menu",
    options: [
      { key: "A", label: "Activa / buena", next: "reservation_package", set: { path: "reservation.fitness", value: "active" } },
      { key: "B", label: "Moderada", next: "reservation_package", set: { path: "reservation.fitness", value: "moderate" } },
      { key: "C", label: "Limitada o hay una condición médica", next: "human_name", set: { path: "reservation.fitness", value: "needs-review" } },
    ],
    active: true,
  },
  {
    id: "reservation_package",
    message: "¿Cuál paquete prefiere? El configurador confirmará el precio vigente.",
    kind: "menu",
    options: [
      { key: "A", label: "Esencial", next: "reservation_transport", set: { path: "reservation.package", value: "essential-package" } },
      { key: "B", label: "Con almuerzo", next: "reservation_transport", set: { path: "reservation.package", value: "lunch-package" } },
      { key: "C", label: "Privado", next: "reservation_transport", set: { path: "reservation.package", value: "private-package" } },
    ],
    active: true,
  },
  {
    id: "reservation_transport",
    message: "¿Necesita ayuda con transporte?",
    kind: "menu",
    options: [
      { key: "A", label: "Sí, necesito transporte", next: "reservation_lunch", set: { path: "reservation.transport", value: "required" } },
      { key: "B", label: "No, llego por mi cuenta", next: "reservation_lunch", set: { path: "reservation.transport", value: "self" } },
    ],
    active: true,
  },
  {
    id: "reservation_lunch",
    message: "¿Desea incluir almuerzo?",
    kind: "menu",
    options: [
      { key: "A", label: "Sí", next: "reservation_name", set: { path: "reservation.lunch", value: "yes" } },
      { key: "B", label: "No", next: "reservation_name", set: { path: "reservation.lunch", value: "no" } },
    ],
    active: true,
  },
  {
    id: "reservation_name",
    message: "¿A nombre de quién preparamos la solicitud?",
    kind: "input",
    capture: { path: "reservation.name", type: "text", min: 2, max: 120, next: "reservation_email", invalidMessage: "Necesito un nombre de al menos dos caracteres." },
    active: true,
  },
  {
    id: "reservation_email",
    message: "¿A qué correo enviamos la confirmación y el comprobante?",
    kind: "input",
    capture: { path: "reservation.email", type: "email", next: "reservation_phone", invalidMessage: "Ese correo no parece válido. Revíselo e inténtelo nuevamente." },
    active: true,
  },
  {
    id: "reservation_phone",
    message: "¿Cuál es su teléfono con código de país? Ejemplo: +506 8888-9999.",
    kind: "input",
    capture: { path: "reservation.phone", type: "phone", next: "reservation_review", invalidMessage: "Necesito un teléfono válido con entre 8 y 15 dígitos." },
    active: true,
  },
  {
    id: "reservation_review",
    message: "Ya reuní la solicitud. ¿Desea enviarla al configurador oficial para revisar horario, cupos y precio antes de confirmar?",
    kind: "menu",
    options: [
      { key: "A", label: "Confirmar y continuar", next: "reservation_ready" },
      { key: "B", label: "Comenzar de nuevo", next: "reservation_tour" },
      { key: "C", label: "Hablar con un agente", next: "human_ready" },
    ],
    active: true,
  },
  {
    id: "reservation_ready",
    message: "¡Excelente! Su solicitud está lista. El siguiente paso valida disponibilidad, horario y tarifa; todavía no se ha creado ni cobrado una reserva.",
    kind: "terminal",
    options: [{ key: "A", label: "Ir al configurador", next: "reservation_ready" }, { key: "B", label: "Menú principal", next: "first" }],
    statusOnEnter: "ready_for_checkout",
    active: true,
  },
  {
    id: "questions_menu",
    message: "¡Claro! 😊 ¿Qué desea saber?",
    kind: "menu",
    options: [
      { key: "A", label: "¿Qué debo llevar?", next: "faq_what_to_bring" },
      { key: "B", label: "¿Cuánto dura?", next: "faq_duration" },
      { key: "C", label: "¿Cuánto cuesta?", next: "faq_price" },
      { key: "D", label: "¿Dónde están ubicados?", next: "faq_location" },
      { key: "E", label: "¿Qué pasa si llueve?", next: "faq_weather" },
      { key: "F", label: "¿Pueden ir niños?", next: "faq_children" },
      { key: "G", label: "Volver al menú principal", next: "first" },
    ],
    active: true,
  },
  {
    id: "faq_what_to_bring",
    message: "Traiga ropa para mojar, zapatos cerrados con buen agarre, cambio de ropa, toalla, agua, bloqueador y repelente.",
    kind: "menu",
    options: [{ key: "A", label: "Reservar", next: "reservation_tour" }, { key: "B", label: "Otra pregunta", next: "questions_menu" }, { key: "C", label: "Hablar con un agente", next: "human_name" }],
    active: true,
  },
  {
    id: "faq_duration",
    message: "Ciudad Esmeralda dura aproximadamente de 3 a 4 horas, según el ritmo del grupo y las condiciones seguras.",
    kind: "menu",
    options: [{ key: "A", label: "Reservar", next: "reservation_tour" }, { key: "B", label: "Otra pregunta", next: "questions_menu" }, { key: "C", label: "Hablar con un agente", next: "human_name" }],
    active: true,
  },
  {
    id: "faq_price",
    message: "El precio depende del tour, paquete, fecha, personas y extras. El configurador oficial muestra la tarifa vigente antes del pago.",
    kind: "menu",
    options: [{ key: "A", label: "Cotizar una reserva", next: "reservation_tour" }, { key: "B", label: "Otra pregunta", next: "questions_menu" }, { key: "C", label: "Hablar con un agente", next: "human_name" }],
    active: true,
  },
  {
    id: "faq_location",
    message: "Estamos en Sucre de San Carlos, Alajuela. En Google Maps o Waze puede buscar “La Vieja Adventures”.",
    kind: "menu",
    options: [{ key: "A", label: "Reservar", next: "reservation_tour" }, { key: "B", label: "Otra pregunta", next: "questions_menu" }, { key: "C", label: "Menú principal", next: "first" }],
    active: true,
  },
  {
    id: "faq_weather",
    message: "Seguridad primero: con lluvia fuerte, río crecido o terreno inestable no se ingresa al cañón. El equipo evalúa y propone reprogramar o una alternativa segura.",
    kind: "menu",
    options: [{ key: "A", label: "Ver alternativas", next: "reservation_tour" }, { key: "B", label: "Otra pregunta", next: "questions_menu" }, { key: "C", label: "Hablar con un agente", next: "human_name" }],
    active: true,
  },
  {
    id: "faq_children",
    message: "Depende de la edad, condición física y experiencia. Para Ciudad Esmeralda el equipo debe revisar el grupo antes de aceptar la solicitud.",
    kind: "menu",
    options: [{ key: "A", label: "Solicitar revisión", next: "human_name" }, { key: "B", label: "Otra pregunta", next: "questions_menu" }, { key: "C", label: "Menú principal", next: "first" }],
    active: true,
  },
  {
    id: "human_name",
    message: "Con gusto le paso la solicitud al equipo. ¿Cuál es su nombre?",
    kind: "input",
    capture: { path: "customer.name", type: "text", min: 2, max: 120, next: "human_phone" },
    active: true,
  },
  {
    id: "human_phone",
    message: "¿Cuál es su teléfono con código de país?",
    kind: "input",
    capture: { path: "customer.phone", type: "phone", next: "human_ready" },
    active: true,
  },
  {
    id: "human_ready",
    message: "Listo, su solicitud quedó marcada para seguimiento humano. Si es urgente, también puede escribirnos por WhatsApp.",
    kind: "terminal",
    options: [{ key: "A", label: "Volver al menú", next: "first" }],
    statusOnEnter: "human_requested",
    active: true,
  },
];

function sessions(db: Db): Collection<ConversationSession> {
  return db.collection<ConversationSession>(COLLECTIONS.CONVERSATION_SESSIONS);
}

function steps(db: Db): Collection<ConversationStep> {
  return db.collection<ConversationStep>(COLLECTIONS.CONVERSATION_STEPS);
}

async function setup(db: Db) {
  if (!setupPromise) {
    setupPromise = (async () => {
      await Promise.all([
        steps(db).createIndex({ id: 1 }, { unique: true, name: "unique_step_id" }),
        sessions(db).createIndex({ sessionId: 1 }, { unique: true, name: "unique_conversation_session" }),
        sessions(db).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "conversation_session_ttl" }),
        sessions(db).createIndex({ status: 1, updatedAt: -1 }, { name: "status_updated" }),
      ]);
      const now = new Date();
      const existing = await steps(db)
        .find({ id: { $in: STEP_SEEDS.map((step) => step.id) } })
        .project<{ id: string; seedVersion?: number }>({ id: 1, seedVersion: 1 })
        .toArray();
      const versions = new Map(existing.map((step) => [step.id, step.seedVersion ?? 0]));
      const pendingSeeds = STEP_SEEDS.filter((step) => (versions.get(step.id) ?? 0) < STEP_SEED_VERSION);
      if (pendingSeeds.length > 0) {
        await steps(db).bulkWrite(
          pendingSeeds.map((step) => ({
            updateOne: {
              filter: { id: step.id },
              update: { $set: { ...step, seedVersion: STEP_SEED_VERSION, updatedAt: now } },
              upsert: true,
            },
          })),
          { ordered: false },
        );
      }
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }
  await setupPromise;
}

function expiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + SESSION_TTL_DAYS);
  return date;
}

function createSession(sessionId: string): ConversationSession {
  const now = new Date();
  return {
    sessionId,
    currentStep: "first",
    customer: { name: null, phone: null, language: "es" },
    reservation: { ...EMPTY_RESERVATION },
    status: "active",
    createdAt: now,
    updatedAt: now,
    expiresAt: expiryDate(),
  };
}

function publicStep(step: ConversationStep): PublicConversationStep {
  return {
    id: step.id,
    message: step.message,
    kind: step.kind,
    inputType: step.capture?.type,
    options: (step.options ?? []).map(({ key, label }) => ({ key, label })),
  };
}

function setByPath(target: ConversationSession, path: string, value: unknown) {
  const parts = path.split(".");
  let cursor: Record<string, unknown> = target as unknown as Record<string, unknown>;
  for (const part of parts.slice(0, -1)) {
    const next = cursor[part];
    if (!next || typeof next !== "object") throw new Error(`Invalid conversation capture path: ${path}`);
    cursor = next as Record<string, unknown>;
  }
  cursor[parts.at(-1)!] = value;
}

function parseInput(type: ConversationInputType, raw: string, step: ConversationStep, session: ConversationSession) {
  const value = raw.trim();
  if (type === "text") {
    if (value.length < (step.capture?.min ?? 1) || value.length > (step.capture?.max ?? 500)) return null;
    return value;
  }
  if (type === "phone") {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15 ? value : null;
  }
  if (type === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254 ? value.toLowerCase() : null;
  }
  if (type === "integer") {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= (step.capture?.min ?? 0) && parsed <= (step.capture?.max ?? 999) ? parsed : null;
  }
  if (type === "ages") {
    const ages = value.split(/[,;\s]+/).filter(Boolean).map(Number);
    const valid = ages.length > 0 && ages.every((age) => Number.isInteger(age) && age >= 0 && age <= 100);
    return valid && (!session.reservation.people || ages.length === session.reservation.people) ? ages : null;
  }
  if (type === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const parsed = new Date(`${value}T12:00:00-06:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(parsed.getTime()) && parsed >= today ? value : null;
  }
  return null;
}

async function getStep(db: Db, id: string) {
  const step = await steps(db).findOne({ id, active: true });
  if (!step) throw new Error(`Conversation step not found: ${id}`);
  return step;
}

function response(step: ConversationStep, session: ConversationSession, reply = step.message): ConversationResponse {
  return {
    reply,
    step: publicStep(step),
    reservation: session.reservation,
    status: session.status,
    readyForCheckout: session.status === "ready_for_checkout",
  };
}

export async function runConversation(
  db: Db,
  input: { sessionId: string; message?: string; optionKey?: string; reset?: boolean },
): Promise<ConversationResponse> {
  await setup(db);
  const collection = sessions(db);
  let session = await collection.findOne({ sessionId: input.sessionId }) as ConversationSession | null;
  if (!session || input.reset) {
    session = createSession(input.sessionId);
    await collection.replaceOne({ sessionId: input.sessionId }, session, { upsert: true });
  }

  let currentStep = await getStep(db, session.currentStep);
  if (!input.message && !input.optionKey) return response(currentStep, session);

  let nextStepId: string | null = null;
  if (currentStep.kind === "menu" || currentStep.kind === "terminal") {
    const selected = currentStep.options?.find(
      (option) => option.key.toUpperCase() === (input.optionKey ?? input.message ?? "").trim().toUpperCase(),
    );
    if (!selected) {
      return response(currentStep, session, "No logré entender esa opción 😅 Seleccione una de las opciones disponibles.");
    }
    if (selected.set) setByPath(session, selected.set.path, selected.set.value);
    nextStepId = selected.next;
  } else if (currentStep.kind === "input" && currentStep.capture) {
    const parsed = parseInput(currentStep.capture.type, input.message ?? "", currentStep, session);
    if (parsed === null) {
      return response(currentStep, session, currentStep.capture.invalidMessage ?? "Ese dato no parece válido. Inténtelo nuevamente.");
    }
    setByPath(session, currentStep.capture.path, parsed);
    if (currentStep.capture.path === "reservation.name") session.customer.name = String(parsed);
    if (currentStep.capture.path === "reservation.phone") session.customer.phone = String(parsed);
    nextStepId = currentStep.capture.next;
  }

  if (!nextStepId) return response(currentStep, session);
  currentStep = await getStep(db, nextStepId);
  session.currentStep = currentStep.id;
  if (currentStep.statusOnEnter) session.status = currentStep.statusOnEnter;
  session.updatedAt = new Date();
  session.expiresAt = expiryDate();

  await collection.replaceOne({ sessionId: session.sessionId }, session, { upsert: true });
  return response(currentStep, session);
}
