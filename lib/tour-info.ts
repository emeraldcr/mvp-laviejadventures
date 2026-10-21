import { TourInfo } from "./types/types";
import { SOCIAL_URLS } from "./site-config";

export const TOUR_INFO: TourInfo = {
  name: "Tour Ciudad Esmeralda · Cañón del Río La Vieja",
  operator: "Operado por La Vieja Adventures",
  duration: "3–4 horas",
  price: "₡25,000 por persona",
  location: "Sucre de Ciudad Quesada, San Carlos, Alajuela, Costa Rica",
  inclusions: [
    "Acceso a las instalaciones y áreas del recorrido.",
    "Guía profesional bilingüe (español e inglés).",
    "Recorrido de 3.5 km entre senderos, río y cañón hasta la Cascada El Zafiro.",
    "Equipo de seguridad necesario durante toda la experiencia.",
  ],
  exclusions: [
    "Transporte hacia/desde el punto de encuentro, alimentos y bebidas no especificadas.",
  ],
  cancellationPolicy:
    "Cancelaciones con al menos 48 horas de anticipación aplican para reembolso completo.",
  details:
    "Experiencia guiada de 3–4 horas con recorrido de 3.5 km por senderos, río y cañón hacia Cascada El Zafiro.",
  restrictions:
    "Actividad recomendada para adultos en buena condición física. Si tienes una condición médica, contáctanos antes de reservar.",
  contact: {
    whatsapp: "6233-2535",
    email: "ciudadesmeraldacr@gmail.com",
    youtube: SOCIAL_URLS.youtube,
    facebook: SOCIAL_URLS.facebook,
    twitter: "https://x.com/adventuresvieja",
    instagram: SOCIAL_URLS.instagram,
  },
};
