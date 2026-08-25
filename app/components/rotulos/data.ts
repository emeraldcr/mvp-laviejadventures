import { TIER_PRICE } from "./pricing";
import type { Rotulo } from "./types";

/**
 * Señalización vial y de orientación de La Vieja Adventures.
 *
 * Principios:
 * - El destino siempre se llama igual: "La Vieja Adventures".
 * - "Cañón del Río La Vieja" funciona como atractivo principal.
 * - Máximo 3 niveles visuales de información.
 * - Distancia + flecha tienen prioridad sobre frases promocionales.
 * - Inglés únicamente como apoyo para visitantes internacionales.
 * - Las señales de carretera orientan; las señales en propiedad informan.
 */
export const ROTULOS: Rotulo[] = [
  {
    id: 1,
    code: "R-01",
    name: "Entrada Principal",
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
        size: "grande",

        kicker: "Bienvenidos · Welcome",

        title: "La Vieja Adventures",

        titleEn: "Cañón del Río La Vieja",

        subtitle:
          "Cañón · Cascadas · Restaurante · Mirador",

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
    name: "Anticipo Puente La Vieja",
    kind: "anticipo",

    placement: {
      es: "300 m antes del Puente La Vieja",
      en: "300 m before La Vieja Bridge",
    },

    purpose: {
      es: "Preparar al conductor para el próximo giro.",
      en: "Prepare drivers for the upcoming turn.",
    },

    panels: [
      {
        size: "grande",

        kicker: "PRÓXIMA ENTRADA",

        title: "La Vieja Adventures",

        titleEn: "Cañón del Río La Vieja",

        subtitle: "Sucre · San Carlos",

        cta: {
          es: "300 m",
          en: "300 m",
        },

        distance: "300 m",

        brands: ["lva"],

        arrow: "left",

        pictogram: "canon",

        photos: [
          "/image/IMG_4200.jpg",
          "/image/IMG_5592.jpg",
          "/image/IMG_4376.jpg",
          "/image/IMG_4210.jpg",
        ],

        price: TIER_PRICE.grande,
      },
    ],
  },

  {
    id: 3,
    code: "R-03",
    name: "Desvío La Vieja Adventures",
    kind: "anticipo",

    placement: {
      es: "Antes de la vuelta conocida como Chicharronera",
      en: "Before the local Chicharronera turn",
    },

    purpose: {
      es: "Confirmar el desvío correcto hacia el destino.",
      en: "Confirm the correct turn toward the destination.",
    },

    panels: [
      {
        size: "grande",

        kicker: "LA VIEJA ADVENTURES",

        title: "Cañón del Río La Vieja",

        titleEn: "River Canyon",

        subtitle: "Sucre",

        cta: {
          es: "ENTRADA",
          en: "ENTRANCE",
        },

        brands: ["lva"],

        arrow: "right",

        pictogram: "canon",

        photos: [],

        price: TIER_PRICE.grande,
      },
    ],
  },

  {
    id: 4,
    code: "R-04",
    name: "Restaurante y Mirador",
    kind: "destino",

    placement: {
      es: "Acceso al restaurante y mirador",
      en: "Restaurant and lookout access",
    },

    purpose: {
      es: "Identificar los servicios disponibles para visitantes.",
      en: "Identify visitor services available at this access.",
    },

    panels: [
      {
        size: "grande",

        kicker: "LA VIEJA",

        title: "Restaurante & Mirador",

        titleEn: "Restaurant & Lookout",

        subtitle: "Café · Comida · Vista al cañón",

        cta: {
          es: "ENTRADA",
          en: "ENTRANCE",
        },

        brands: ["lva"],

        arrow: "down-right",

        pictogram: "comida",

        photos: ["/image/IMG_5686.jpg"],

        price: TIER_PRICE.grande,
      },
    ],
  },

  {
    id: 5,
    code: "R-05",
    name: "Recepción y Parqueo",
    kind: "indicador",

    placement: {
      es: "Bifurcación interna de acceso",
      en: "Internal access fork",
    },

    purpose: {
      es: "Separar claramente el flujo hacia recepción y parqueo.",
      en: "Clearly direct vehicles toward reception and parking.",
    },

    panels: [
      {
        size: "grande",

        kicker: "LA VIEJA ADVENTURES",

        title: "Recepción",

        titleEn: "Reception · Check-in",

        subtitle: "Tours",

        cta: {
          es: "PARQUEO",
          en: "PARKING",
        },

        brands: ["lva"],

        arrow: "right",

        pictogram: "parqueo",

        photos: [],

        price: TIER_PRICE.grande,
      },
    ],
  },

  {
    id: 6,
    code: "R-06",
    name: "Orientación Lajas + Ciudad Quesada",
    kind: "par",

    placement: {
      es: "Lajas y salida de Ciudad Quesada hacia Sucre",
      en: "Lajas and Ciudad Quesada approach toward Sucre",
    },

    purpose: {
      es: "Dar presencia al destino y confirmar la ruta desde mayor distancia.",
      en: "Build destination awareness and confirm the route from farther away.",
    },

    panels: [
      {
        size: "pequeno",

        kicker: "SUCRE",

        title: "La Vieja Adventures",

        titleEn: "Cañón del Río La Vieja",

        subtitle: "Cañón · Cascadas · Tours",

        cta: {
          es: "SIGA →",
          en: "FOLLOW →",
        },

        brands: ["lva"],

        arrow: "right",

        pictogram: "canon",

        photos: ["/image/IMG_4671.jpg"],

        price: TIER_PRICE.pequeno,
      },

      {
        size: "pequeno",

        kicker: "SUCRE · SAN CARLOS",

        title: "La Vieja Adventures",

        titleEn: "Cañón del Río La Vieja",

        subtitle: "Adventure · Nature · Waterfalls",

        cta: {
          es: "→ SUCRE",
          en: "→ SUCRE",
        },

        brands: ["lva"],

        arrow: "right",

        pictogram: "canon",

        photos: ["/image/IMG_39145.jpg"],

        price: TIER_PRICE.pequeno,
      },
    ],
  },
];