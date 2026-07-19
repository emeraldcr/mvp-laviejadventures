import type { Lang } from "@/lib/LanguageContext";

export const principalContent = {
  es: {
    header: {
      exploreGroup: "Explorar",
      forecast: "Pronóstico",
      dashboard: "Dashboard",
      logout: "Cerrar sesión",
      userMenuAria: "Menú de usuario",
      toggleMenuAria: "Abrir o cerrar menú",
    },
    hero: {
      errorLoadingImages: "No se pudieron cargar las fotos",
      loadingImages: "Cargando fotos...",
      previousImageAria: "Foto anterior",
      nextImageAria: "Foto siguiente",
      goToSlideAria: "Ir a la foto {slide}",
      scrollToToursAria: "Ir a los tours",
      scrollToMainAria: "Ir al contenido principal",
      locationBadge: "San Carlos · Costa Rica",
      title: "El cañón te está esperando. ¿Entramos?",
      subtitle: "Tours con guías de la zona · Grupos chicos · Desde $30",
      socialProof: "4.9 · +500 personas que ya se metieron al río · Guías locales",
      trustItems: [
        "Cancelás gratis hasta 48 h antes",
        "Pago seguro",
        "Confirmación al toque",
      ] as readonly string[],
    },
    tours: {
      eyebrow: "¿Qué te late más?",
      title: "Nuestras experiencias",
      subtitle:
        "Del cañón con agua hasta la caminata tranquila en el bosque: acá hay para el que quiere adrenalina y para el que quiere aire fresco sin apuros.",
    },
    conversion: {
      title: "Preguntas que nos hacen seguido",
      subtitle: "Lo que la gente quiere saber antes de meterse al río o al bosque.",
      faqs: [
        {
          question: "¿Puedo cambiar la fecha después de reservar?",
          answer:
            "Sí. Avisanos con al menos 48 horas y te ayudamos a reprogramar según lo que haya disponible. Sin drama.",
        },
        {
          question: "¿Cuál tour conviene si soy principiante?",
          answer:
            "Si venís más suave, **Cascadas Secretas**, **Lluvia en la Naturaleza** o el **Tour Gastronómico** son buena entrada. Baja o media intensidad, sin pedirte experiencia previa. Ciudad Esmeralda ya pide más pierna y ganas.",
        },
        {
          question: "¿Qué pasa si llueve el día del tour?",
          answer:
            "Con lluvia liviana casi siempre salimos igual — en la zona eso es parte del paisaje. Si se pone feo de verdad (tormenta fuerte o río crecido), te escribimos con tiempo para cambiar fecha o pasar a otra actividad segura. Seguridad primero, siempre.",
        },
        {
          question: "¿Qué llevo al tour?",
          answer:
            "En general: ropa cómoda, zapatos que se puedan mojar, traje de baño, toalla, repelente, bloqueador y una muda seca. Según el tour te mandamos la lista exacta al confirmar.",
        },
        {
          question: "¿Hay edad mínima?",
          answer:
            "La mayoría de tours reciben desde 10–12 años con un adulto. Los más exigentes (rapel, cuatrimotos) piden 14 y 16 años respectivamente. Si tenés dudas con peques o adultos mayores, escribí y te decimos con honestidad.",
        },
        {
          question: "¿El transporte viene incluido?",
          answer:
            "No está incluido en el tour. Si necesitás traslado desde el hotel, lo coordinamos aparte por un costo adicional.",
        },
        {
          question: "¿Cómo es la cancelación?",
          answer:
            "Cancelás gratis hasta 48 horas antes. Con menos de 48 horas no hay reembolso. Si el clima o el río no dan, nosotros te reprogramamos o te ofrecemos alternativa segura.",
        },
      ],
    },
    booking: {
      loading: "Preparando tu reserva...",
      eyebrow: "Nueva reserva",
      title: "Tu próximo tour arranca acá",
      description:
        "Elegí fecha, dejá tus datos y si te trabás en algo, usá el botón de AI o escribinos por WhatsApp.",
      steps: {
        date: "Paso 1 · Fecha",
        details: "Paso 2 · Detalles",
      },
    },
    errors: {
      criticalFallback: "Uy, algo falló al cargar las reservas. Recargá la página o escribinos por WhatsApp.",
    },
  },
  en: {
    header: {
      exploreGroup: "Explore",
      forecast: "Forecast",
      dashboard: "Dashboard",
      logout: "Log Out",
      userMenuAria: "User menu",
      toggleMenuAria: "Toggle menu",
    },
    hero: {
      errorLoadingImages: "Couldn't load the photos",
      loadingImages: "Loading photos...",
      previousImageAria: "Previous image",
      nextImageAria: "Next image",
      goToSlideAria: "Go to slide {slide}",
      scrollToToursAria: "Scroll to tours",
      scrollToMainAria: "Scroll to main content",
      locationBadge: "San Carlos · Costa Rica",
      title: "The canyon is waiting. Ready to go in?",
      subtitle: "Local guides · Small groups · From $30",
      socialProof: "4.9 · 500+ people who already got wet · Local guides",
      trustItems: [
        "Free cancel up to 48h",
        "Secure payment",
        "Quick confirmation",
      ] as readonly string[],
    },
    tours: {
      eyebrow: "What sounds good?",
      title: "Our experiences",
      subtitle:
        "From a full canyon day to a calm forest walk — something for the adrenaline crowd and for those who just want fresh air without the rush.",
    },
    conversion: {
      title: "Questions we get all the time",
      subtitle: "What people ask before they hit the river or the trail.",
      faqs: [
        {
          question: "Can I change my date after booking?",
          answer:
            "Yes. Give us at least 48 hours' notice and we'll help you rebook based on what's open. No stress.",
        },
        {
          question: "Which tour is best for beginners?",
          answer:
            "If you want something gentler, **Secret Waterfalls**, **Rain in Nature**, or the **Food Tour** are solid starts. Lower or medium intensity, no prior experience needed. Ciudad Esmeralda asks for more legs and energy.",
        },
        {
          question: "What if it rains?",
          answer:
            "Light rain is normal here and we usually still go out. If a real storm hits or the river rises, we'll message you early with a new date or a safer option. Safety first, always.",
        },
        {
          question: "What should I bring?",
          answer:
            "In general: comfy clothes, shoes that can get wet, swimsuit, towel, repellent, sunscreen, and a dry change. We'll send the exact list when you confirm.",
        },
        {
          question: "Is there a minimum age?",
          answer:
            "Most tours welcome ages 10–12+ with an adult. More demanding ones (canyon rappel, ATVs) need 14 and 16. Not sure about kids or older guests? Message us and we'll be straight with you.",
        },
        {
          question: "Is transport included?",
          answer:
            "Not in the tour price. Need a hotel transfer? We can arrange it separately for an extra fee.",
        },
        {
          question: "What's the cancellation policy?",
          answer:
            "Free cancel up to 48 hours before. Inside 48 hours, no refund. If weather or the river make it unsafe, we rebook you or offer a safer alternative.",
        },
      ],
    },
    booking: {
      loading: "Getting your booking ready...",
      eyebrow: "New booking",
      title: "Your next tour starts here",
      description:
        "Pick a date, add your details, and if you get stuck, use the AI button or WhatsApp us.",
      steps: {
        date: "Step 1 · Date",
        details: "Step 2 · Details",
      },
    },
    errors: {
      criticalFallback: "Something went wrong loading bookings. Refresh or WhatsApp us.",
    },
  },
} as const satisfies Record<Lang, object>;

export type PrincipalContent = (typeof principalContent)[Lang];
