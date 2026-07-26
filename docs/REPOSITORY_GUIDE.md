# Guía del repositorio — La Vieja Adventures

> Documento interno para desarrollo, contenido, ventas y atención al cliente.
> Última revisión contra el repositorio: 26 de julio de 2026.

## 1. Propósito y reglas de uso

Este repositorio contiene el sitio web y el sistema de reservas de **La Vieja
Adventures**, operador de experiencias de naturaleza y aventura en la Zona
Norte de Costa Rica, principalmente en la ribera del Río La Vieja, Sucre de
Ciudad Quesada, San Carlos, Alajuela.

Esta guía reúne lo que actualmente está respaldado por el código. No sustituye
el calendario, la confirmación del operador ni las instrucciones del guía.

Reglas operativas:

1. **Seguridad primero.** Con lluvia fuerte, río crecido o una condición
   insegura, no se recomienda ni se opera una actividad de cañón o río. Se
   reprograma o se ofrece una alternativa segura.
2. **Nunca prometer cupos ni precios sin confirmar.** La disponibilidad debe
   comprobarse en el calendario o con Allan/Verónica. Los precios publicados
   también deben validarse cuando existan discrepancias.
3. **Reservas:** resumir tour, fecha, horario, paquete, participantes,
   transporte y total; pedir confirmación explícita; procesar la reserva;
   emitir voucher/resumen y comunicar políticas.
4. **Escalar a una persona** los grupos grandes, itinerarios personalizados,
   condiciones médicas relevantes, pagos complejos o cualquier duda de
   seguridad.
5. **Clima y río:** usar la herramienta meteorológica y la evaluación operativa
   del día. Un pronóstico por sí solo no autoriza una salida.

## 2. La empresa

### Identidad

- Nombre comercial: **La Vieja Adventures**.
- Producto insignia: **Tour Ciudad Esmeralda — Cañón del Río La Vieja**.
- Zona principal: Sucre de Ciudad Quesada, San Carlos, Alajuela, Costa Rica.
- Propuesta: aventura guiada, naturaleza local, agua, bosque, cañón y
  experiencias de la Zona Norte.
- Idiomas documentados para Ciudad Esmeralda: español e inglés.
- Certificación: el archivo operativo `AGENTS.md` indica que el proceso
  **ICT/CTP está en trámite**. No se debe presentar como certificación ya
  obtenida.

### Contacto oficial presente en el código

- WhatsApp/teléfono: **+506 6233-2535**
- Correo: **ciudadesmeraldacr@gmail.com**
- Instagram: <https://www.instagram.com/laviejadventures>
- Facebook: <https://www.facebook.com/laviejaadventures>
- YouTube: <https://www.youtube.com/@laviejaadventures>
- TikTok: <https://www.tiktok.com/@la.vieja.adventur>
- X: <https://x.com/adventuresvieja>

La página `/info` contiene enlaces de Google Maps y Waze. Para compartir una
ubicación con un cliente se debe usar el enlace generado desde
`lib/constants/location.ts`, no escribir coordenadas de memoria.

### Estilo de atención

El idioma principal es español, con ustedeo natural, tono cálido y un toque de
humor local. El tono puede ser vacilón; las instrucciones de seguridad no.
Inglés se usa cuando el cliente lo pide.

## 3. Catálogo público respaldado por el código

El catálogo de respaldo vive en `lib/tours/public-catalog.ts`. En producción,
la base de datos puede reemplazar o ampliar estos valores.

| Tour | Duración | Dificultad | Precio base de respaldo | Zona |
| --- | ---: | --- | ---: | --- |
| Ciudad Esmeralda — Cañón del Río La Vieja | 3–4 h | Moderado | ₡25.000 | Sucre, Ciudad Quesada |
| Cuadra-Tours Aventura | 1,5–2 h | Intermedio | ₡19.990 | Senderos privados, Zona Norte |
| Cascadas Secretas del Río La Vieja | 2–3 h | Moderado | ₡19.990 | Ciudad Esmeralda / Río La Vieja |
| Tour Gastronómico Local | 1,5 h | Fácil | ₡24.990 | Ciudad Esmeralda / Zona Norte |
| Lluvia en la Naturaleza | 1 h | Fácil | ₡19.990 | Bosque de Ciudad Esmeralda |
| Avistamiento de Aves | 2 h | Fácil | ₡22.990 | Corredor Juan Castro Blanco |
| Tour Nocturno La Vieja Adventures | 1,5 h | Fácil | ₡22.990 | Bosque La Vieja Adventures |
| Rapel en Cañón del Río | 2 h | Intermedio–avanzado | ₡29.990 | Cañón del Río La Vieja |
| Caminata a Volcanes Dormidos | 3–4 h | Moderado | ₡34.990 | Parque Nacional del Agua Juan Castro Blanco |

**Importante:** estos son valores de respaldo del sitio, no una promesa de
venta. El catálogo puede venir de MongoDB y los paquetes pueden mostrar otros
montos. Confirmar precio y disponibilidad antes de cerrar.

## 4. Detalle de los tours

### 4.1 Ciudad Esmeralda — Cañón del Río La Vieja

La experiencia insignia recorre aproximadamente 3,5 km de sendero, río y cañón
hasta la Cascada El Zafiro y pozas turquesa. Requiere buena condición física y
capacidad para caminar por terreno húmedo e irregular.

- Duración: 3–4 horas.
- Incluye: acceso, guía profesional bilingüe y equipo de seguridad.
- Equipo indicado en paquetes: casco, chaleco salvavidas y arnés.
- No incluye por defecto: transporte, alimentos ni bebidas no especificadas.
- Recomendado para: adultos activos y viajeros que buscan aventura real.
- Antes de reservar: consultar condiciones médicas, movilidad, clima reciente y
  estado del río.
- Seguridad: si el río está crecido o hay lluvia fuerte, no se realiza. La
  decisión operativa del guía prevalece.

Paquetes definidos en código:

- Esencial: recorrido completo, guía y equipo; salidas 08:00, 09:00 y 10:00.
- Con Almuerzo: Esencial más casado (pollo, res o vegetariano), bebida natural y
  postre; mismas salidas.
- Privado: almuerzo, guía exclusivo, horario flexible, fotos y atención
  personalizada; sujeto a disponibilidad.

### 4.2 Cuadra-Tours Aventura

Recorrido guiado en ATV por senderos privados entre finca, bosque, quebradas,
barro estacional y miradores del valle de San Carlos.

- Duración: 1,5–2 horas.
- Dificultad: intermedia.
- Incluye: inducción, ATV según paquete, guía, casco y ruta privada.
- No requiere experiencia previa; se practica primero en terreno plano.
- Edad documentada para conducir: 16 años con licencia. Menores pueden viajar
  como pasajeros, sujeto a validación del operador.
- Llevar: zapato cerrado, ropa que se pueda ensuciar, cambio de ropa, toalla,
  agua, bloqueador y repelente.
- Salidas de grupo registradas: 08:00, 09:00, 10:00 y 14:00.
- En lluvia fuerte se modifica o cancela la ruta por seguridad.

### 4.3 Cascadas Secretas del Río La Vieja

Caminata de ritmo tranquilo a cascadas escondidas y pozas naturales, con
interpretación de flora, fauna y geología.

- Duración: 2–3 horas.
- Dificultad: moderada.
- Incluye: guía, acceso a senderos, briefing y paradas fotográficas.
- No incluye: transporte, comidas, toalla ni propinas.
- Baño en pozas: únicamente donde el guía lo autorice según el caudal.
- Apta para familias con condición física moderada; los niños deben caminar
  acompañados.
- Llevar: calzado con agarre, traje de baño, toalla, ropa seca, agua, repelente,
  bloqueador biodegradable y protección impermeable para el teléfono.
- Salidas registradas: 07:00, 08:00 y 09:00.

### 4.4 Tour Gastronómico Local

Degustación cultural de comida tradicional costarricense preparada por
anfitriones locales con productos de temporada.

- Duración: 1,5 horas.
- Dificultad: fácil.
- Incluye: anfitrión, degustación, bebida natural y contexto cultural.
- El menú varía por temporada.
- Con aviso previo se pueden gestionar opciones vegetarianas, veganas o
  alergias; nunca prometer una adaptación sin confirmarla.
- Apto para niños y adultos mayores.
- Horarios registrados: 11:00, 12:00 y 17:00.

### 4.5 Lluvia en la Naturaleza

Caminata sensorial corta para vivir el bosque durante lluvia normal: aromas,
sonidos, ranas, quebradas y fotografía, con equipo especial.

- Duración: 1 hora.
- Dificultad: fácil.
- Incluye: guía, equipo para lluvia y ruta sensorial.
- Llevar: calzado cerrado con agarre y ropa ligera de secado rápido.
- Horarios registrados: 09:00, 10:00 y 14:00.
- La lluvia normal es parte de la experiencia; tormenta, crecida o condición
  insegura obliga a modificar, reprogramar o cancelar.

### 4.6 Avistamiento de Aves

Salida de madrugada o mañana en el corredor biológico del Parque Nacional del
Agua Juan Castro Blanco, entre bosque nuboso, quebradas y fincas en
regeneración.

- Duración pública: 2 horas.
- Dificultad: fácil.
- Incluye según paquete: naturalista/guía especializado, binoculares
  compartidos y lista de especies observadas.
- Salidas registradas: 05:30 y 06:00.
- Llevar: ropa de tonos neutros, zapato con agarre, chaqueta ligera, agua,
  repelente y cámara si se desea.
- La observación de una especie concreta nunca se garantiza.

El contenido editorial afirma “más de 400 especies registradas” en el corredor.
Antes de usar esa cifra en publicidad formal conviene asociarla a una fuente
ornitológica verificable.

### 4.7 Tour Nocturno

Caminata guiada para observar ranas, insectos, rastros y otra actividad del
bosque después del anochecer.

- Duración: 1,5 horas.
- Dificultad: fácil.
- Incluye: guía, ruta nocturna y briefing de seguridad.
- No incluye por defecto: transporte ni linterna personal.
- Horarios registrados: 18:00, 19:00 y 20:00.
- Llevar: zapato cerrado, pantalón largo, repelente y una capa ligera.
- No tocar ni alimentar fauna; seguir siempre la posición e instrucciones del
  guía.

### 4.8 Rapel en Cañón del Río

Descenso controlado por paredes y secciones del cañón con equipo profesional.
Es una actividad distinta y más técnica que la caminata de Ciudad Esmeralda.

- Duración: 2 horas.
- Dificultad: intermedia a avanzada.
- Incluye: guía certificado, equipo profesional y briefing.
- Requiere condición física adecuada y obediencia estricta a las instrucciones.
- Salidas registradas: 08:00, 09:00 y 10:00.
- Con lluvia fuerte, crecida, tormenta eléctrica o condiciones inseguras no se
  realiza.
- Condiciones médicas, miedo severo a alturas o limitaciones de movilidad deben
  revisarse con el operador antes de aceptar la reserva.

### 4.9 Caminata a Volcanes Dormidos / experiencia de bosque nuboso

Caminata por bosque nuboso hacia cráteres antiguos y miradores del Parque
Nacional del Agua Juan Castro Blanco.

- Duración: 3–4 horas.
- Dificultad: moderada.
- Incluye: guía, ruta a cráteres y miradores.
- Salidas registradas: 06:00, 07:00 y 08:00; se recomienda salir temprano antes
  de la nubosidad del mediodía.
- Llevar: calzado de montaña, capa, abrigo ligero, agua, alimento y protección
  solar.
- El nombre **Cloud Forest Explorer** aparece en las instrucciones internas,
  pero no tiene una ficha comercial separada. Hasta confirmar lo contrario,
  tratarlo como nombre relacionado con esta experiencia, no como producto con
  precio o itinerario independiente.

## 5. Ofertas conocidas sin ficha completa

`AGENTS.md` también menciona las siguientes experiencias, pero el catálogo
público no contiene duración, precio, inclusiones, restricciones ni horarios:

- **Pozas Cristalinas:** experiencia relajada en agua cristalina.
- **Tour a caballo.**
- **Domo Geodésico San Vicente — Phoenix Experience:** glamping premium.

Se pueden mencionar como opciones sujetas a consulta. Para cotizar o reservar
se debe escalar a Allan/Verónica y obtener detalles explícitos. No inventar
capacidad, amenidades, política, ubicación exacta, precio ni disponibilidad.

## 6. Paquetes y precios

Cada tour público tiene tres niveles en `lib/tour-packages.ts`:

- **Esencial:** experiencia base en grupo.
- **Plus/temático:** agrega alimentos, ruta extendida, fotografía u otro valor,
  según el tour.
- **Privado:** guía dedicado, ritmo u horario flexible y, en varios casos,
  fotografías.

Precios codificados por persona:

| Tour | Esencial | Plus / segundo nivel | Privado |
| --- | ---: | ---: | ---: |
| Ciudad Esmeralda | ₡21.000 / $40 | ₡31.500 / $60 | ₡42.000 / $80 |
| Avistamiento de Aves | ₡24.990 / $45 | ₡34.990 / $65 | ₡49.990 / $92 |
| Cuadra-Tours | ₡19.990 / $38 | ₡27.990 / $53 | ₡39.990 / $76 |
| Cascadas Secretas | ₡19.990 / $38 | ₡29.990 / $57 | ₡39.990 / $76 |
| Gastronómico | ₡24.990 / $48 | ₡33.990 / $65 | ₡44.990 / $86 |
| Lluvia en la Naturaleza | ₡19.990 / $38 | ₡27.990 / $53 | ₡37.990 / $72 |
| Nocturno | ₡22.990 / $44 | ₡31.990 / $61 | ₡42.990 / $82 |
| Rapel | ₡29.990 / $57 | ₡39.990 / $76 | ₡52.990 / $101 |
| Volcanes Dormidos | ₡34.990 / $67 | ₡44.990 / $86 | ₡57.990 / $110 |

Los valores USD y CRC están almacenados por separado; no asumir que el tipo de
cambio implícito seguirá vigente. La cotización final debe provenir del flujo
de reserva.

## 7. Reserva, pago y atención posterior

Flujo documentado:

1. Elegir tour, paquete, fecha y salida.
2. Consultar disponibilidad.
3. Recopilar participantes, contacto, necesidades y transporte.
4. Mostrar resumen y total.
5. Pedir **confirmación explícita**.
6. Pagar en línea mediante PayPal; se aceptan las tarjetas que PayPal permita.
7. Confirmar por correo y generar voucher/resumen.
8. Enviar lista exacta de qué llevar y políticas aplicables.

La empresa no solicita números de tarjeta por WhatsApp. El cliente puede ver
reservas confirmadas y estado de pago en el dashboard. Existe además un portal
B2B para operadores y agencias aliadas.

## 8. Seguridad y aptitud

- El guía puede modificar, detener o cancelar una actividad.
- El estado real del río y el terreno manda sobre el itinerario publicado.
- Calzado con buen agarre es el mínimo para sendero, cascadas y cañón.
- El cliente debe informar condiciones médicas, lesiones, embarazo,
  restricciones de movilidad, alergias y necesidades especiales.
- El equipo de protección requerido se usa durante toda la actividad.
- No garantizar baño en pozas, rápel, cruces de agua ni una ruta específica si
  las condiciones no lo permiten.
- Ofrecer Gastronomía, observación de aves u otra opción de bajo riesgo cuando
  el cañón no sea recomendable, siempre sujeto a disponibilidad y evaluación
  climática.

## 9. Políticas y discrepancias que requieren resolución

Las reservas están sujetas a disponibilidad. Los términos indican que los
precios incluyen impuestos aplicables, pero pueden excluir propinas y extras.
El pago completado genera confirmación por correo. El cliente debe dar
información correcta, obedecer al guía y comunicar condiciones médicas.

Hay dos conflictos activos:

1. **Ciudad Esmeralda:** el catálogo y `lib/tour-info.ts` dicen ₡25.000 por
   persona, mientras el paquete Esencial dice ₡21.000.
2. **Cancelación:** `lib/tour-info.ts` dice reembolso completo con 48 horas; el
   catálogo de los demás tours dice cancelación gratuita hasta 24 horas.

Hasta que negocio defina una sola política, no afirmar 24 o 48 horas como regla
universal. Mostrar la condición asociada a la cotización/reserva y confirmar
con Allan/Verónica. Los Términos y Condiciones generales no incluyen una regla
detallada de cancelación.

## 10. Mapa técnico del repositorio

- `app/`: páginas, componentes y rutas API de Next.js.
- `app/(page_routes)/tours`: catálogo público.
- `app/(page_routes)/tour/[slug]`: detalle de cada tour.
- `app/(page_routes)/reservar` y componentes de `reservation`: compra.
- `app/(page_routes)/info`: información de empresa, redes, mapas y videos.
- `app/(page_routes)/preguntas-frecuentes`: preguntas generales.
- `app/(page_routes)/terminos-y-condiciones`: términos legales visibles.
- `lib/tours/public-catalog.ts`: catálogo público de respaldo y lectura desde
  MongoDB.
- `lib/tour-content.ts`: contenido editorial detallado por tour.
- `lib/tour-packages.ts`: paquetes, precios y horarios de respaldo.
- `lib/reservation/`: capacidad, cotización, fechas, transporte y complementos.
- `lib/constants/location.ts`: enlaces oficiales de ubicación.
- `app/api/calendar/availability`: disponibilidad.
- `app/api/paypal`: pago.
- `app/api/bookings`: reservas.
- `app/api/tiempo`: clima y riesgo meteorológico.
- `public/`: fotos, logos y otros recursos estáticos.

Tecnología principal: Next.js App Router, TypeScript, Tailwind CSS, MongoDB,
PayPal, autenticación Auth0/NextAuth y correo mediante Resend/SMTP.

El repositorio también contiene juegos, marcadores deportivos, propuestas de
sitios y otras pruebas que no pertenecen al catálogo de La Vieja Adventures.
No deben usarse como fuente de información turística.

## 11. Fuentes de verdad y mantenimiento

Prioridad recomendada:

1. Estado de seguridad y decisión del guía del día.
2. Calendario/capacidad y cotización generada por el sistema.
3. Tour activo almacenado en MongoDB.
4. Catálogo y paquetes de respaldo en `lib/`.
5. Esta guía.

Cuando cambie un tour, actualizar en conjunto:

- documento de MongoDB;
- `lib/tours/public-catalog.ts`;
- `lib/tour-packages.ts`;
- `lib/tour-content.ts`;
- FAQ, términos y esta guía si corresponde.

Antes de publicar, revisar título, slug, idiomas, duración, dificultad,
ubicación, inclusiones, exclusiones, restricciones, política, horarios,
capacidad, impuestos y precios en CRC/USD.

