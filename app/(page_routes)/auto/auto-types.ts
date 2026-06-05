// =====================================================
// IMPROVED TYPES - Step 1: Stronger foundation for realistic 3D
// =====================================================

export interface CarParams {
  wheelbase: number;
  overallLength: number;
  width: number;
  bodyHeight: number;
  roofHeight: number;
  frontOverhang: number;
  rearOverhang: number;
  groundClearance: number;
  wheelRadius: number;
  wheelWidth: number;
  bodyTaper: number;
  roofCurve: number;
  cabinLengthRatio: number;
  frontLightHeight: number;
  rearLightHeight: number;
  hasFastback: boolean;
  scale: number;
  bodyStyle?: VehicleBodyStyle;

  // === NEW: High-quality rendering parameters (for realistic game look) ===
  clearcoat?: number;              // 0.8–1.0 for modern car paint
  clearcoatRoughness?: number;     // 0.05–0.15 (lower = more mirror-like)
  sheen?: number;                  // Subtle fabric-like sheen on some plastics
  anisotropy?: number;             // 0–1 for brushed metal / directional highlights
  envMapIntensity?: number;        // How strongly environment reflects (key for realism)
  toneMappingExposure?: number;    // 0.8–1.4 typical for nice car renders
}

export type CarPreset = {
  name: string;
  params: CarParams;
  designSchema?: CarDesignSchema;
  visualControls?: unknown;
  blockoutConfig?: unknown;
  blockoutStyle?: VehicleBodyStyle;
  rendering?: RenderingConfig;     // NEW - controls visual fidelity
};

export type VehicleBodyStyle = "sedan" | "boxyCompact" | "suv" | "truck" | "teslaEv";

export type CarDesignSchema = {
  metadata: Record<string, unknown>;
  dimensions: Record<string, unknown>;
  coordinateSystem: Record<string, unknown>;
  wheelGeometry: Record<string, unknown>;
  bodyVolumes: Record<string, unknown>;
  silhouetteCurves: Record<string, unknown>;
  topViewProfile: Record<string, unknown>;
  pillars: Record<string, unknown>;
  windows: Record<string, unknown>;
  characterLines: Record<string, unknown>;
  hood: Record<string, unknown>;
  frontDesign: Record<string, unknown>;
  headlights: Record<string, unknown>;
  doors: Record<string, unknown>;
  mirrors: Record<string, unknown>;
  rearDesign: Record<string, unknown>;
  taillights: Record<string, unknown>;
  wheels: Record<string, unknown>;
  materials: Record<string, unknown>;
  colors: Record<string, unknown>;
  interiorVisible: Record<string, unknown>;
  panelDetails: Record<string, unknown>;
  semanticRules: Record<string, unknown>;
  rendering?: RenderingConfig;     // NEW
};

// =====================================================
// NEW: Rendering & Material Quality System
// =====================================================

export interface RenderingConfig {
  /** Overall quality tier - drives shadows, materials, post-processing */
  quality: 'low' | 'medium' | 'high' | 'cinematic' | 'ultra';

  /** How realistic the car paint should feel */
  paintQuality: 'standard' | 'premium' | 'showroom' | 'game-ultra';

  /** Enable advanced PBR features */
  useClearcoat: boolean;
  useAnisotropy: boolean;
  useIridescence: boolean;        // subtle color shift on some angles (futuristic touch)

  /** Environment & lighting */
  envMapIntensity: number;        // 0.6–1.2 recommended
  toneMapping: 'ACESFilmic' | 'Reinhard' | 'Cineon' | 'Linear';
  toneMappingExposure: number;

  /** Shadows & performance */
  shadowMapSize: 512 | 1024 | 2048 | 4096;
  shadowCascadeCount?: number;    // for better distant shadows
  receiveShadows: boolean;
  castShadows: boolean;

  /** Post-processing hints (for future bloom, SSR, etc.) */
  bloom: boolean;
  bloomStrength?: number;
  bloomThreshold?: number;
  ssr?: boolean;                  // Screen Space Reflections (expensive but beautiful on car)
}

export interface PBRMaterialOptions {
  color?: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  sheen?: number;
  anisotropy?: number;
  iridescence?: number;
  iridescenceIOR?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  transmission?: number;
  ior?: number;
  envMapIntensity?: number;
  side?: 0 | 1 | 2;
}

export type AccessoryId = "leds" | "neon" | "spoiler" | "wheels" | "roofRack" | "sideSkirts";
export type PaintId = "white" | "graphite" | "red" | "blue";

export type Accessory = {
  id: AccessoryId;
  name: string;
  category: string;
  price: number;
  install: number;
  description: string;
  /** NEW: Visual impact on 3D model */
  affectsGeometry?: boolean;
  affectsMaterial?: boolean;
};

export type Vec3 = [number, number, number];

export type MaterialOptions = PBRMaterialOptions; // alias for backward compatibility

export type PartProps = {
  position?: Vec3;
  rotation?: Vec3;
  castShadow?: boolean;
  receiveShadow?: boolean;
  material: MaterialOptions;
};

export const accessories: Accessory[] = [
  { id: "leds", name: "Kit LED frontal", category: "Luces", price: 89, install: 35, description: "Faros blancos y detalle ambar para vista nocturna." },
  { id: "neon", name: "Underglow neon", category: "Estilo", price: 145, install: 55, description: "Luz inferior azul para look de garage arcade." },
  { id: "spoiler", name: "Spoiler deportivo", category: "Body kit", price: 210, install: 80, description: "Aleron trasero aerodinamico con difusor." },
  { id: "wheels", name: "Aros sport negros", category: "Ruedas", price: 360, install: 45, description: "Cambio visual rapido con aros oscuros y centro cromado." },
  { id: "roofRack", name: "Rack superior", category: "Utilidad", price: 175, install: 65, description: "Base para barras, canasta o equipo de viaje." },
  { id: "sideSkirts", name: "Faldones laterales", category: "Body kit", price: 125, install: 40, description: "Faldones deportivos con canal de aire." },
];

export const paints: Record<PaintId, { name: string; color: string; accent: string }> = {
  white: { name: "Blanco perlado", color: "#f8fafc", accent: "#cbd5e1" },
  graphite: { name: "Grafito", color: "#27272a", accent: "#71717a" },
  red: { name: "Rojo rally", color: "#dc2626", accent: "#7f1d1d" },
  blue: { name: "Azul street", color: "#2563eb", accent: "#1e3a8a" },
};

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
