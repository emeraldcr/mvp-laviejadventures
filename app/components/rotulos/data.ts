import { TIER_PRICE } from "./pricing";
import type { Rotulo } from "./types";

/**
 * Plan vial de La Vieja Adventures.
 *
 * Alcance acordado:
 * - 1 rótulo principal de 3 × 2 m.
 * - 2 alertas cercanas de 2 × 1 m, una por sentido de giro.
 * - 4 señales de aproximación de 1 × 1 m: 2 km y 1 km por cada sentido.
 *
 * Las señales de carretera priorizan destino, distancia y flecha. Los datos de
 * contacto, servicios y fotografía se concentran en la entrada principal,
 * donde el vehículo circula más despacio.
 */
export const ROTULOS: Rotulo[] = [
  {
    id: 1,
    code: "R-01",
    name: "Rótulo principal",
    kind: "entrada",
    placement: {
      es: "Entrada principal de La Vieja Adventures",
      en: "Main entrance to La Vieja Adventures",
    },
    purpose: {
      es: "Marcar claramente la llegada al destino.",
      en: "Clearly mark arrival at the destination.",
    },
    panels: [
      {
        layoutId: "r01-main",
        size: "grande",
        kicker: "Bienvenidos · Welcome",
        title: "La Vieja Adventures",
        titleEn: "Cañón del Río La Vieja",
        subtitle:
          "Tours · Cafetería y Restaurante · Senderos · Cascadas · Mirador · Baños",
        cta: {
          es: "ENTRADA",
          en: "ENTRANCE",
        },
        brands: ["lva"],
        arrow: "right",
        pictogram: "canon",
        photos: ["/image/IMG_4946.JPG"],
        price: TIER_PRICE.grande,
      },
    ],
  },
  {
    id: 2,
    code: "R-02",
    name: "Alerta cercana · giro a la izquierda",
    kind: "anticipo",
    placement: {
      es: "Aproximación cercana a la entrada, para el giro a la izquierda",
      en: "Near the entrance, for the left-turn approach",
    },
    purpose: {
      es: "Avisar con tiempo que la entrada está próxima y preparar el giro.",
      en: "Warn that the entrance is near and prepare drivers for the turn.",
    },
    panels: [
      {
        layoutId: "r02-alert-left",
        size: "mediano",
        kicker: "PRÓXIMA ENTRADA",
        title: "La Vieja Adventures",
        titleEn: "La Vieja River Canyon",
        subtitle: "Sucre · San Carlos",
        cta: {
          es: "ENTRADA",
          en: "ENTRANCE",
        },
        brands: ["lva"],
        brandForward: true,
        arrow: "left",
        pictogram: "canon",
        photos: [],
        price: TIER_PRICE.mediano,
      },
    ],
  },
  {
    id: 3,
    code: "R-03",
    name: "Alerta cercana · giro a la derecha",
    kind: "anticipo",
    placement: {
      es: "Aproximación cercana a la entrada, para el giro a la derecha",
      en: "Near the entrance, for the right-turn approach",
    },
    purpose: {
      es: "Avisar con tiempo que la entrada está próxima y preparar el giro.",
      en: "Warn that the entrance is near and prepare drivers for the turn.",
    },
    panels: [
      {
        layoutId: "r03-alert-right",
        size: "mediano",
        kicker: "PRÓXIMA ENTRADA",
        title: "La Vieja Adventures",
        titleEn: "La Vieja River Canyon",
        subtitle: "Sucre · San Carlos",
        cta: {
          es: "ENTRADA",
          en: "ENTRANCE",
        },
        brands: ["lva"],
        brandForward: true,
        arrow: "right",
        pictogram: "canon",
        photos: [],
        price: TIER_PRICE.mediano,
      },
    ],
  },
  {
    id: 4,
    code: "R-04",
    name: "Aproximación izquierda · 2 km",
    kind: "distancia",
    placement: {
      es: "A 2 km de la entrada, en el sentido que requiere giro a la izquierda",
      en: "2 km from the entrance, on the approach requiring a left turn",
    },
    purpose: {
      es: "Indicar la distancia restante y anticipar el sentido del giro final.",
      en: "Show the remaining distance and preview the direction of the final turn.",
    },
    panels: [
      {
        layoutId: "r04-distance-2km-left",
        size: "pequeno",
        kicker: "FALTAN",
        title: "La Vieja Adventures",
        titleEn: "La Vieja River Canyon",
        cta: {
          es: "A 2 KM",
          en: "2 KM AHEAD",
        },
        distance: "2 km",
        brands: ["lva"],
        arrow: "left",
        pictogram: "canon",
        photos: [],
        price: TIER_PRICE.pequeno,
      },
    ],
  },
  {
    id: 5,
    code: "R-05",
    name: "Aproximación izquierda · 1 km",
    kind: "distancia",
    placement: {
      es: "A 1 km de la entrada, en el sentido que requiere giro a la izquierda",
      en: "1 km from the entrance, on the approach requiring a left turn",
    },
    purpose: {
      es: "Repetir la distancia restante y confirmar el sentido del giro final.",
      en: "Repeat the remaining distance and confirm the direction of the final turn.",
    },
    panels: [
      {
        layoutId: "r05-distance-1km-left",
        size: "pequeno",
        kicker: "FALTAN",
        title: "La Vieja Adventures",
        titleEn: "La Vieja River Canyon",
        cta: {
          es: "A 1 KM",
          en: "1 KM AHEAD",
        },
        distance: "1 km",
        brands: ["lva"],
        arrow: "left",
        pictogram: "canon",
        photos: [],
        price: TIER_PRICE.pequeno,
      },
    ],
  },
  {
    id: 6,
    code: "R-06",
    name: "Aproximación derecha · 2 km",
    kind: "distancia",
    placement: {
      es: "A 2 km de la entrada, en el sentido que requiere giro a la derecha",
      en: "2 km from the entrance, on the approach requiring a right turn",
    },
    purpose: {
      es: "Indicar la distancia restante y anticipar el sentido del giro final.",
      en: "Show the remaining distance and preview the direction of the final turn.",
    },
    panels: [
      {
        layoutId: "r06-distance-2km-right",
        size: "pequeno",
        kicker: "FALTAN",
        title: "La Vieja Adventures",
        titleEn: "La Vieja River Canyon",
        cta: {
          es: "A 2 KM",
          en: "2 KM AHEAD",
        },
        distance: "2 km",
        brands: ["lva"],
        arrow: "right",
        pictogram: "canon",
        photos: [],
        price: TIER_PRICE.pequeno,
      },
    ],
  },
  {
    id: 7,
    code: "R-07",
    name: "Aproximación derecha · 1 km",
    kind: "distancia",
    placement: {
      es: "A 1 km de la entrada, en el sentido que requiere giro a la derecha",
      en: "1 km from the entrance, on the approach requiring a right turn",
    },
    purpose: {
      es: "Repetir la distancia restante y confirmar el sentido del giro final.",
      en: "Repeat the remaining distance and confirm the direction of the final turn.",
    },
    panels: [
      {
        layoutId: "r07-distance-1km-right",
        size: "pequeno",
        kicker: "FALTAN",
        title: "La Vieja Adventures",
        titleEn: "La Vieja River Canyon",
        cta: {
          es: "A 1 KM",
          en: "1 KM AHEAD",
        },
        distance: "1 km",
        brands: ["lva"],
        arrow: "right",
        pictogram: "canon",
        photos: [],
        price: TIER_PRICE.pequeno,
      },
    ],
  },
];
