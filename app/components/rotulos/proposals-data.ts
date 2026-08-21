import type { Proposal, Rule } from "./types";

/** Los seis formatos que se le pueden proponer al cliente, en orden de peso. */
export const PROPOSALS: Proposal[] = [
  {
    id: "P-A",
    variant: "turistico",
    name: {
      es: "Café turístico con pictograma",
      en: "Brown tourist sign with pictogram",
    },
    reference: {
      es: "MUTCD (EE.UU.), TSRGD (Reino Unido), Unterrichtungstafel (Alemania), SECTUR (México)",
      en: "MUTCD (US), TSRGD (UK), Unterrichtungstafel (Germany), SECTUR (Mexico)",
    },
    slots: "R-02 · R-03 · R-06",
    why: {
      es: "El café es el color que el mundo entero reserva para atractivo turístico y recreativo. El conductor lo decodifica antes de leer una sola letra: sabe que ahí hay algo que visitar, no un negocio cualquiera. Pictograma + destino + distancia: tres unidades, ni una más.",
      en: "Brown is the color the whole world reserves for tourist and recreational attractions. Drivers decode it before reading a single letter. Pictogram, destination, distance: three units, no more.",
    },
    specs: [
      {
        es: "Pictograma silueta, nunca foto: a 60 km/h una foto es una mancha.",
        en: "Silhouette pictogram, never a photo: at 60 km/h a photo is just a smudge.",
      },
      {
        es: "Máximo 3 renglones. El nombre del cañón manda, la marca va chiquita abajo.",
        en: "Three lines max. The canyon name leads, the brand sits small underneath.",
      },
      {
        es: "Letra de 18–20 cm para leerse cómodo a 70–80 m.",
        en: "18–20 cm cap height to read comfortably at 70–80 m.",
      },
    ],
    recommended: true,
  },
  {
    id: "P-B",
    variant: "mopt",
    name: {
      es: "MOPT dividido con franja de distancia",
      en: "MOPT banded sign with distance strip",
    },
    reference: {
      es: "El que le pasaron: norma MOPT / SIECA, con bloque de marca patrocinadora",
      en: "The one you were sent: MOPT / SIECA standard, with a sponsor brand block",
    },
    slots: "R-02 · R-03",
    why: {
      es: "Exactamente el formato de la foto: franja azul con flecha y kilometraje, bloque de marca en amarillo y panel verde de destino. Se ve oficial porque lo es, y esa autoridad prestada le da confianza al turista. Ojo: el bloque amarillo funciona porque el color pega contra el verde, no por llevar mucha información.",
      en: "Exactly the format in the photo: blue strip with arrow and distance, yellow brand block, green destination panel. It looks official because it is, and that borrowed authority reassures visitors. The yellow block works because of the color contrast, not because it holds lots of information.",
    },
    specs: [
      {
        es: "Tres módulos separados por 2–3 cm: la división es lo que lo hace legible.",
        en: "Three modules split by 2–3 cm: the division is what makes it readable.",
      },
      {
        es: "Verde destino + azul distancia + amarillo marca. Nada de degradados ni sombras.",
        en: "Green destination, blue distance, yellow brand. No gradients, no shadows.",
      },
      {
        es: "Sobre ruta nacional necesita permiso del MOPT dentro del derecho de vía.",
        en: "On a national route it needs MOPT approval inside the right-of-way.",
      },
    ],
    recommended: false,
  },
  {
    id: "P-C",
    variant: "flecha",
    name: {
      es: "Flecha direccional mínima",
      en: "Minimal directional trailblazer",
    },
    reference: {
      es: "Trailblazer del MUTCD, fingerboard de Nueva Zelanda y Australia",
      en: "MUTCD trailblazer, New Zealand and Australia fingerboards",
    },
    slots: "R-06 (Lajas y CQ)",
    why: {
      es: "Para los anticipos lejanos donde solo hay que sembrar el rumbo. Tres palabras y una flecha. En Lajas y Ciudad Quesada el conductor no va a decidir nada todavía: solo tiene que registrar que existe y hacia dónde queda.",
      en: "For the far-out teasers where you only need to plant a direction. Three words and an arrow. In Lajas and Ciudad Quesada the driver is not deciding anything yet, they just need to register that it exists and which way it is.",
    },
    specs: [
      {
        es: "Media lámina alcanza: es la mitad de precio y el doble de legible.",
        en: "A half panel is enough: half the price, twice the legibility.",
      },
      {
        es: "La flecha ocupa un tercio del rótulo, no es un adorno.",
        en: "The arrow takes a third of the sign, it is not decoration.",
      },
      {
        es: "Sin teléfono ni redes: a esa distancia nadie los anota.",
        en: "No phone, no socials: nobody writes them down from that far out.",
      },
    ],
    recommended: true,
  },
  {
    id: "P-D",
    variant: "servicios",
    name: {
      es: "Azul de servicios con placas de marca",
      en: "Blue service sign with logo panels",
    },
    reference: {
      es: "Specific Service (LOGO) signs del MUTCD, paneles azules de servicios en Europa",
      en: "MUTCD Specific Service (LOGO) signs, blue service panels across Europe",
    },
    slots: "R-04 (restaurante y mirador)",
    why: {
      es: "El azul es el código universal de servicios al conductor: comida, combustible, hospedaje. Para el restaurante y mirador dice más que cualquier frase, porque el que tiene hambre lo busca sin leer. Cada servicio va en su placa blanca con pictograma.",
      en: "Blue is the universal code for driver services: food, fuel, lodging. For the restaurant and lookout it says more than any sentence, because a hungry driver scans for it without reading. Each service gets its own white tile with a pictogram.",
    },
    specs: [
      {
        es: "Placas blancas independientes: se cambian sin rehacer el rótulo entero.",
        en: "Independent white tiles: swap one without remaking the whole sign.",
      },
      {
        es: "Pictogramas de norma (cubiertos, mirador), no íconos de moda.",
        en: "Standard pictograms (cutlery, lookout), not trendy icons.",
      },
      {
        es: "Máximo cuatro placas por rótulo.",
        en: "Four tiles per sign, maximum.",
      },
    ],
    recommended: true,
  },
  {
    id: "P-E",
    variant: "portal",
    name: {
      es: "Portal de entrada con foto y QR",
      en: "Gateway sign with photo and QR",
    },
    reference: {
      es: "Gateway signs de parques nacionales (NPS de EE.UU., DOC de Nueva Zelanda)",
      en: "National park gateway signs (US NPS, New Zealand DOC)",
    },
    slots: "R-01 (entrada)",
    why: {
      es: "Aquí sí van la foto, el QR, los teléfonos y las redes: es el único punto donde el carro va lento o parqueado y la gente tiene tiempo de mirar. Todo lo que quitamos de los rótulos de ruta se concentra en este, que es el que remata la venta.",
      en: "This is where the photo, QR, phones and socials belong: the only spot where the car is slow or parked and people have time to look. Everything stripped from the highway signs concentrates here, the one that closes the sale.",
    },
    specs: [
      {
        es: "Es el rótulo que ya está diseñado arriba, con las dos marcas.",
        en: "This is the sign already designed above, carrying both brands.",
      },
      {
        es: "El QR solo tiene sentido con el carro detenido. En ruta es papel botado.",
        en: "The QR only makes sense with the car stopped. On the highway it is wasted print.",
      },
      {
        es: "Buen momento para iluminarlo: es el que se busca de noche.",
        en: "Worth lighting: this is the one people hunt for after dark.",
      },
    ],
    recommended: true,
  },
  {
    id: "P-F",
    variant: "blades",
    name: {
      es: "Paletas de madera para adentro",
      en: "Wooden blade signs for inside",
    },
    reference: {
      es: "Fingerpost británico y señalética de senderos (parques nacionales, Camino de Santiago)",
      en: "British fingerpost and trail signage (national parks, Camino de Santiago)",
    },
    slots: "R-05 (parqueo y recepción)",
    why: {
      es: "Adentro de la finca el problema ya no es velocidad, es orientación. Una paleta por destino, apiladas en un poste: parqueo, recepción, restaurante, sendero. Madera y crema pegan con el entorno y se leen a pie, que es como se recorre.",
      en: "Inside the property the problem is no longer speed, it is orientation. One blade per destination stacked on a post: parking, reception, restaurant, trail. Wood and cream fit the setting and read on foot, which is how people move there.",
    },
    specs: [
      {
        es: "Se agregan paletas después sin tocar el poste.",
        en: "Add blades later without touching the post.",
      },
      {
        es: "Bilingüe en la misma paleta: español grande, inglés debajo.",
        en: "Bilingual on the same blade: Spanish large, English underneath.",
      },
      {
        es: "Sale más barato que una lámina metálica grande.",
        en: "Cheaper than one large metal panel.",
      },
    ],
    recommended: true,
  },
];

/** Las cifras duras de señalización que sostienen las propuestas. */
export const RULES: Rule[] = [
  {
    value: "2,5 cm ≈ 10 m",
    text: {
      es: "Regla de altura de letra del FHWA: cada 2,5 cm de altura da unos 10 m de lectura. Para que se lea a 80 m hay que ir en 20 cm.",
      en: "FHWA letter height rule: every 2.5 cm of cap height buys about 10 m of legibility. To read at 80 m you need 20 cm.",
    },
  },
  {
    value: "3 unidades",
    text: {
      es: "Máximo tres unidades de información por rótulo (destino, flecha, distancia). La cuarta ya no se lee, estorba.",
      en: "Three information units per sign, max (destination, arrow, distance). The fourth one is not read, it gets in the way.",
    },
  },
  {
    value: "6 segundos",
    text: {
      es: "A 60 km/h el conductor cubre 100 m en 6 segundos y solo un tercio lo dedica al rótulo. Todo tiene que caber en esos 2 segundos.",
      en: "At 60 km/h a driver covers 100 m in 6 seconds and spends only a third of that on the sign. Everything has to fit in those 2 seconds.",
    },
  },
  {
    value: "Tipo IV",
    text: {
      es: "Lámina retrorreflectiva ASTM D4956 tipo IV o superior. Sin retrorreflectivo el rótulo desaparece de noche, que es cuando más se busca.",
      en: "ASTM D4956 Type IV retroreflective sheeting or better. Without it the sign vanishes at night, exactly when people look hardest.",
    },
  },
];
