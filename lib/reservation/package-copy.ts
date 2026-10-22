import type { TourPackageOption } from "@/lib/types/index";

const INCLUDE_TRANSLATIONS: Record<string, string> = {
  "Everything in Essential Package": "Todo lo del Paquete Esencial",
  "Everything in Lunch Package": "Todo lo del Paquete con Almuerzo",
  "Everything in Plus Package": "Todo lo del Paquete Plus",
  "Everything in Adventure Plus Package": "Todo lo del Paquete Aventura Plus",
  "Everything in Explorer Package": "Todo lo del Paquete Explorador",
  "Everything in Full Tasting Package": "Todo lo del Paquete de Degustación Completa",
  "Everything in Sensory Plus Package": "Todo lo del Paquete Sensorial Plus",
  "Everything in Night Explorer Package": "Todo lo del Paquete Explorador Nocturno",
  "Everything in Extreme Package": "Todo lo del Paquete Extremo",
  "Everything in Summit Package": "Todo lo del Paquete Cumbre",
  "Private guide": "Guía privado",
  "Private guide for your group only": "Guía privado exclusivo para su grupo",
  "Private certified guide for your group only": "Guía certificado exclusivo para su grupo",
  "Local guide": "Guía local",
  "Certified guide": "Guía certificado",
  "Naturalist guide": "Guía naturalista",
  "Professional guide": "Guía profesional",
  "Entrance fee": "Entrada incluida",
  "Bilingual professional guide": "Guía profesional bilingüe",
  "Typical Costa Rican casado (chicken, beef or vegetarian)": "Casado típico costarricense (pollo, res o vegetariano)",
  "Natural drink and dessert": "Bebida natural y postre",
  "Relaxation time after the tour": "Tiempo para relajarse después del tour",
  "Shared binoculars": "Binoculares compartidos",
  "Observed species checklist": "Lista de especies observadas",
  "Typical Costa Rican lunch": "Almuerzo típico costarricense",
  "Natural drink": "Bebida natural",
  "Hot natural drink": "Bebida natural caliente",
  "Traditional dessert": "Postre tradicional",
  "Breakfast": "Desayuno",
  "Refreshment": "Refrigerio",
  "Refreshment stop": "Parada para refrigerio",
  "Safety equipment (helmet)": "Equipo de seguridad (casco)",
  "Complete safety equipment": "Equipo completo de seguridad",
  "Professional rappelling equipment": "Equipo profesional de rápel",
  "Professional photos": "Fotos profesionales",
  "Professional photos during the tour": "Fotos profesionales durante el tour",
  "Photography guidance": "Guía de fotografía",
  "Flexible schedule": "Horario flexible",
  "Flexible route and pace": "Ruta y ritmo flexibles",
  "Group experience": "Experiencia en grupo",
  "Local host": "Anfitrión local",
  "Traditional dish tasting": "Degustación de platillos tradicionales",
  "Cultural experience": "Experiencia cultural",
};

export function getPackageIncludes(pkg: TourPackageOption | null | undefined, isEs: boolean): string[] {
  if (!pkg) return [];
  const includes = pkg.includes ?? [];
  if (!isEs) return includes;
  return pkg.includesEs?.length ? pkg.includesEs : includes.map((item) => INCLUDE_TRANSLATIONS[item] ?? item);
}
