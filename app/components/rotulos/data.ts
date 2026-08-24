import { TIER_PRICE } from "./pricing";
import type { Rotulo } from "./types";

/**
 * Los seis rótulos del plan, en el orden en que se encuentran manejando desde
 * Ciudad Quesada. Cambiar aquí cambia las láminas, la tabla y el total.
 *
 * Referencia preliminar en adhesivo impreso: las láminas completas usan el
 * tamaño "grande" y las dos piezas de R-06 el tamaño "pequeño". Medidas y
 * montos deben confirmarse con tres cotizaciones del mismo alcance.
 */
export const ROTULOS: Rotulo[] = [
  {
    id: 1,
    code: "R-01",
    name: "Entrada Vuelta Principal",
    kind: "entrada",
    placement: {
      es: "Vuelta principal, entrada a la finca",
      en: "Main turn, entrance to the property",
    },
    purpose: {
      es: "Rótulo madre: doble marca, es el que confirma que ya llegaron.",
      en: "Flagship sign: dual brand, the one that confirms guests arrived.",
    },
    panels: [
      {
        size: "grande",
        kicker: "Bienvenidos · Welcome",
        title: "La Vieja Adventures",
        titleEn: "Cañón del Río La Vieja",
        subtitle: "La Vieja Organics",
        cta: {
          es: "Entre aquí: cañón, cascadas y café orgánico",
          en: "Turn in here: canyon, waterfalls & organic coffee",
        },
        brands: ["lva", "lva-turquoise"],
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
      es: "300 metros antes del Puente La Vieja",
      en: "300 meters before the La Vieja bridge",
    },
    purpose: {
      es: "Aviso anticipado para que bajen la velocidad antes del puente.",
      en: "Advance warning so drivers slow down before the bridge.",
    },
    panels: [
      {
        size: "grande",
        kicker: "Puente La Vieja",
        title: "Su aventura empieza en 300 m",
        titleEn: "Your adventure starts in 300 m",
        subtitle: "Cañón del Río La Vieja",
        cta: {
          es: "Baje la velocidad: la entrada es a la izquierda",
          en: "Slow down: the entrance is on your left",
        },
        distance: "300 m",
        brands: ["lva"],
        arrow: "left",
        pictogram: "rio",
        photos: ["/image/IMG_4200.jpg", "/image/IMG_5592.jpg"],
        price: TIER_PRICE.grande,
      },
    ],
  },
  {
    id: 3,
    code: "R-03",
    name: "Anticipo Vuelta Chicharronera",
    kind: "anticipo",
    placement: {
      es: "Antes de la vuelta de la chicharronera",
      en: "Before the chicharronera turn",
    },
    purpose: {
      es: "El punto de referencia más usado por los clientes que llaman perdidos.",
      en: "The landmark most quoted by guests who call in lost.",
    },
    panels: [
      {
        size: "grande",
        kicker: "Vuelta Chicharronera",
        title: "Cascadas y pozas a la vuelta",
        titleEn: "Waterfalls & pools around the bend",
        subtitle: "Operación según clima y nivel del río",
        cta: {
          es: "No siga de largo: el cañón está aquí cerquita",
          en: "Do not drive past: the canyon is right here",
        },
        brands: ["lva"],
        arrow: "right",
        pictogram: "cascada",
        photos: ["/image/IMG_4376.jpg", "/image/IMG_4210.jpg"],
        price: TIER_PRICE.grande,
      },
    ],
  },
  {
    id: 4,
    code: "R-04",
    name: "Restaurante y Mirador La Vieja",
    kind: "destino",
    placement: {
      es: "Acceso al restaurante y mirador",
      en: "Access to restaurant and lookout",
    },
    purpose: {
      es: "Captura al que solo va pasando: comida y vista, no solo tour.",
      en: "Catches drive-by traffic: food and view, not only tours.",
    },
    panels: [
      {
        size: "grande",
        kicker: "Restaurante y Mirador",
        title: "Coma con vista al cañón",
        titleEn: "Eat with a canyon view",
        subtitle: "La Vieja",
        cta: {
          es: "Pare, tómese un café y asómese al mirador",
          en: "Stop, grab a coffee and step out to the lookout",
        },
        brands: ["lva"],
        arrow: "down-right",
        pictogram: "comida",
        photos: ["/image/IMG_5686.jpg", "/image/IMG_6812.jpg"],
        price: TIER_PRICE.grande,
      },
    ],
  },
  {
    id: 5,
    code: "R-05",
    name: "Parqueo + Recepción",
    kind: "indicador",
    placement: {
      es: "Dentro de la propiedad, bifurcación de acceso",
      en: "Inside the property, at the access fork",
    },
    purpose: {
      es: "Indicador interno: ordena el flujo de carros y evita preguntas.",
      en: "Internal wayfinding: orders car flow and prevents questions.",
    },
    panels: [
      {
        size: "grande",
        kicker: "Parqueo · Parking",
        title: "Recepción",
        titleEn: "Check-in & tours",
        subtitle: "Registro de tours",
        cta: {
          es: "Parquee aquí y pregunte por su tour del día",
          en: "Park here and ask about today's tours",
        },
        brands: ["lva"],
        arrow: "right",
        pictogram: "parqueo",
        photos: ["/image/IMG_4523.jpg", "/image/IMG_2443.jpg"],
        price: TIER_PRICE.grande,
      },
    ],
  },
  {
    id: 6,
    code: "R-06",
    name: "Anticipos Lajas + CQ",
    kind: "par",
    placement: {
      es: "Lajas y Ciudad Quesada (dos láminas pequeñas)",
      en: "Lajas and Ciudad Quesada (two small panels)",
    },
    purpose: {
      es: "Dos anticipos lejanos: siembran la marca desde antes de la ruta.",
      en: "Two far-out teasers: plant the brand before the route even starts.",
    },
    panels: [
      {
        size: "pequeno",
        kicker: "Lajas",
        title: "El cañón lo espera",
        titleEn: "The canyon is waiting",
        cta: {
          es: "Siga rumbo a Sucre: vale cada kilómetro",
          en: "Keep heading to Sucre: worth every kilometer",
        },
        brands: ["lva"],
        arrow: "right",
        pictogram: "canon",
        photos: ["/image/IMG_4671.jpg"],
        price: TIER_PRICE.pequeno,
      },
      {
        size: "pequeno",
        kicker: "Ciudad Quesada",
        title: "Cañón del Río La Vieja",
        titleEn: "La Vieja River Canyon",
        cta: {
          es: "Su próxima aventura queda saliendo a Sucre",
          en: "Your next adventure is on the road to Sucre",
        },
        brands: ["lva"],
        arrow: "right",
        pictogram: "mirador",
        photos: ["/image/IMG_39145.jpg"],
        price: TIER_PRICE.pequeno,
      },
    ],
  },
];
