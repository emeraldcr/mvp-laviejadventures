import { PANEL_SIZE_SPECS } from "./measurements";
import type { Copy, PanelSizeKey } from "./types";

/**
 * Referencia preliminar de FC Rótulos: adhesivo impreso, lámina de 2 × 1 m a
 * ¢25.000 + IVA. Los demás montos son estimaciones proporcionales, no precios
 * confirmados por tamaño ni un alcance final de fabricación.
 */
export const VENDOR = "FC Rotulos";
export const IVA_RATE = 0.13;

const REFERENCE_QUOTE = { width: 2, height: 1, base: 25000 };
export const PRICE_PER_M2 = REFERENCE_QUOTE.base / (REFERENCE_QUOTE.width * REFERENCE_QUOTE.height);

export const BUDGET_CRC = 300000;

export type SizeKey = PanelSizeKey;

export type SizeTier = {
  key: SizeKey;
  label: Copy;
  width: number;
  height: number;
  /** Precio sin IVA. */
  base: number;
  /** Estimación interna con IVA; no equivale a una cotización recibida. */
  total: number;
};

function tier(key: SizeKey, label: Copy, width: number, height: number): SizeTier {
  const base = Math.round(width * height * PRICE_PER_M2);
  // Se calcula sobre centavos de IVA en enteros: base * 1.13 en punto
  // flotante puede quedar en 21187.499999999996 en vez de 21187.5.
  const total = Math.round((base * (100 + IVA_RATE * 100)) / 100);
  return { key, label, width, height, base, total };
}

/** Los tres tamaños que el admin puede combinar, en orden de precio. */
export const SIZE_TIERS: SizeTier[] = [
  tier(
    "grande",
    PANEL_SIZE_SPECS.grande.label,
    PANEL_SIZE_SPECS.grande.widthM,
    PANEL_SIZE_SPECS.grande.heightM,
  ),
  tier(
    "mediano",
    PANEL_SIZE_SPECS.mediano.label,
    PANEL_SIZE_SPECS.mediano.widthM,
    PANEL_SIZE_SPECS.mediano.heightM,
  ),
  tier(
    "pequeno",
    PANEL_SIZE_SPECS.pequeno.label,
    PANEL_SIZE_SPECS.pequeno.widthM,
    PANEL_SIZE_SPECS.pequeno.heightM,
  ),
];

/** Estimación interna con IVA de cada tamaño, para planificación en data.ts. */
export const TIER_PRICE: Record<SizeKey, number> = SIZE_TIERS.reduce(
  (acc, t) => ({ ...acc, [t.key]: t.total }),
  {} as Record<SizeKey, number>,
);

export type Distribution = Record<SizeKey, number>;

export function distributionTotal(dist: Distribution): number {
  return SIZE_TIERS.reduce((sum, t) => sum + t.total * (dist[t.key] ?? 0), 0);
}

export function distributionCount(dist: Distribution): number {
  return SIZE_TIERS.reduce((sum, t) => sum + (dist[t.key] ?? 0), 0);
}

export type BudgetProposal = {
  id: string;
  name: Copy;
  description: Copy;
  distribution: Distribution;
  recommended?: boolean;
};

/** Tres formas de repartir el presupuesto de ¢300.000, de más austera a tope. */
export const BUDGET_PROPOSALS: BudgetProposal[] = [
  {
    id: "esencial",
    name: { es: "Esencial", en: "Essential" },
    description: {
      es: "Las siete láminas físicas del plan actual, agrupadas en R-01 a R-06, con la referencia preliminar para adhesivo impreso.",
      en: "The current plan's seven physical panels, grouped as R-01 to R-06, using the preliminary printed-adhesive reference.",
    },
    distribution: { grande: 5, mediano: 0, pequeno: 2 },
  },
  {
    id: "recomendada",
    name: { es: "Recomendada", en: "Recommended" },
    description: {
      es: "Suma dos rótulos medianos para reforzar orientación interna y remates, sin disparar el gasto.",
      en: "Adds two medium signs to reinforce internal wayfinding and closers, without blowing the budget.",
    },
    distribution: { grande: 5, mediano: 2, pequeno: 2 },
    recommended: true,
  },
  {
    id: "maxima",
    name: { es: "Cobertura máxima", en: "Maximum coverage" },
    description: {
      es: "Usa casi todo el presupuesto: más rótulos grandes y refuerzo en los anticipos lejanos.",
      en: "Uses almost the entire budget: more large signs and reinforced far-out teasers.",
    },
    distribution: { grande: 6, mediano: 3, pequeno: 4 },
  },
];
