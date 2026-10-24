# Auditoría UX, UI y SEO de la portada

Fecha: 2026-10-23, Costa Rica. Código revisado: `ba320af` (master).
Páginas principales: https://www.laviejaadventures.com/ y https://www.laviejaadventures.com/en.

## Resultado

La portada tiene una base técnica SEO funcional y contenido útil para decidir un tour. Las prioridades son corregir el acceso a inglés observado en producción, el contraste de controles, el menú móvil y la presentación del catálogo mientras carga. Hay además contenido sin traducir y una brecha para medir qué elementos de la portada convierten.

Esta entrega es una auditoría: no modifica el diseño, el catálogo ni el flujo de reservas.

## Alcance y evidencia

- Lectura de rutas ES/EN, componentes activos de la portada, navegación, pie, estilos, catálogo, metadatos, JSON-LD, robots y sitemap.
- GET del HTML público de ambas portadas, robots.txt y sitemap.xml; comprobación de 57 direcciones únicas entre enlaces internos y URLs del sitemap. Todas respondieron HTTP 200, sin redirecciones en esa muestra. Esto no acredita cada interacción, ausencia de soft 404 o funcionamiento del pago.
- HEAD de 11 imágenes únicas utilizadas en el HTML: todas respondieron HTTP 200 como WebP.
- Segunda lectura HTTP de /, /en y /index para verificar el selector de idioma y textos en inglés.
- Cálculo de contraste sobre los colores declarados en el código. No se midieron estilos computados en un navegador.
- `npm run type-check` y `npm run lint`: aprobados.
- Sin navegador, Playwright, capturas, build, despliegue, escrituras en Mongo o pruebas de pago. La revisión visual y de interacción queda manual.
- No se obtuvo acceso a Search Console, datos de conversión ni métricas de campo. No se asigna puntuación visual ni se afirma una mejora de posiciones.
- El HTML desplegado y el checkout no se consideran una misma revisión verificada. El selector de idioma se documenta como observación de producción; las demás referencias de código corresponden al HEAD indicado.
- El archivo JSON adjunto guarda respuestas resumidas, destinos comprobados y comprobaciones de imágenes; no contiene credenciales.

## Hallazgos prioritarios

### 1. P2 — El enlace EN de producción dirige a otra portada española

**Evidencia de producción:** en dos lecturas HTTP, el enlace con `aria-label="Switch to English"` de / contiene `href="/index"`. /index responde 200, conserva `html lang="es"` y la portada española. /en sí responde en inglés.

**Impacto:** el enlace de idioma entregado por el servidor no lleva a su destino anunciado. También crea un enlace interno a un alias adicional de la portada. No se verificó si la hidratación del navegador modifica el enlace.

**Corrección:** garantizar /en como destino de la portada española en el HTML inicial y después de hidratar; revisar la revisión desplegada y la normalización de pathname. El código actual calcula la URL en `app/components/home/HomeNav.tsx:95` con `lib/site/i18n.ts:12`, que devuelve /en al recibir /. Esto requiere reconciliar producción y código, no atribuir sin evidencia la causa al helper.

**Aceptación:** desde / y /index, EN abre /en; desde /en, ES abre /. Comprobar con y sin JavaScript y con navegación cliente. Decidir la redirección permanente de /index tras revisar enlaces existentes.

### 2. P2 — Contraste insuficiente en estados oscuros y de hover

**Código:** `app/components/home/HomeTourDiscovery.tsx:55`, `app/globals.css:66` y `app/globals.css:161`.

La tarjeta seleccionada usa texto blanco sobre `--lva-accent`; en oscuro ese fondo es #70eee1. El contraste calculado es **1.40:1**. El hover de botones primarios repite blanco sobre ese color. Además, `.lva-nav-cta:hover` cambia el fondo a la superficie oscura conservando tinta #17211f: con superficie #171412 resulta **1.11:1**.

**Impacto:** cuesta leer la selección y las acciones. WCAG AA requiere 4.5:1 para texto normal y 3:1 para texto grande; estos pares quedan por debajo de ambos umbrales.

**Corrección:** usar pares de fondo/tinta semánticos, manteniendo tinta oscura sobre menta clara y una tinta legible en hover. Ajustar también icono, descripción y etiquetas internas.

**Aceptación:** verificar selección, hover, foco y controles en ambos temas; medir el color efectivo y las transparencias. Referencia: [WCAG contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### 3. P2 — El menú móvil puede bloquear el scroll o dejar acciones fuera de alcance

**Código:** `app/components/home/HomeNav.tsx:45`, `:53`, `:234`, `:251` y `:265`.

Al abrir el menú se bloquea el scroll del body. Si se amplía la ventana al breakpoint de escritorio, `md:hidden` oculta el diálogo, pero `menuOpen` sigue activo y conserva el bloqueo y el manejador de teclado. El diálogo tampoco declara una zona con scroll vertical para pantallas cortas o texto ampliado.

**Impacto:** una rotación o un cambio de tamaño puede dejar la página bloqueada; en un móvil horizontal pueden quedar controles sin acceso. La geometría exacta del recorte queda por confirmar manualmente.

**Corrección:** cerrar el menú al cruzar el breakpoint; liberar efectos; permitir scroll dentro del diálogo y asegurar áreas flexibles con altura mínima correcta.

**Aceptación manual:** abrir a 390 px y ampliar a escritorio; probar 667×375, texto al 200%, Tab, Shift+Tab y Escape. El cierre y las acciones finales deben seguir accesibles.

### 4. P2 — La carga se presenta como catálogo inexistente

**Código:** `app/(page_routes)/page.tsx:18`, `app/components/home/HomeTourDiscovery.tsx:74`, `lib/tours/catalog/read.ts:4`.

El fallback de Suspense renderiza toda la portada con `tours={[]}`. El selector muestra cero resultados y afirma que no hay una experiencia publicada. El HTTP español contiene primero ItemList de 0 tours y después el segmento de 9 tours. En paralelo, el lector captura cualquier error y también devuelve [], confundiendo carga, fallo y vacío real.

**Impacto:** durante una consulta lenta se comunica una conclusión comercial falsa. Cuando termina, se sustituye la portada completa: cambian secciones, datos y estado local. Un fallo real puede producir una portada 200 incompleta y reemplazar contenido útil al revalidar.

**Corrección:** estados explícitos de carga/error/vacío; mantener hero y navegación estables; limitar Suspense a los datos necesarios. Conservar un catálogo previamente verificado o propagar el error para que ISR pueda preservar una versión válida.

**Aceptación:** retrasar la consulta y simular un error sin mostrar “no publicado”; mantener navegable la portada y preservar elecciones. Los segmentos ocultos y los encabezados repetidos del protocolo de streaming de React no se clasifican por sí solos como un fallo SEO.

### 5. P2 — La portada inglesa mezcla idiomas

**Código:** `app/components/home/FeaturedStory.tsx:96` y `app/components/home/HomeTrustSection.tsx:27`, `:118`.

**Confirmado por HTTP en /en:** “3-4 horas”, “Entrada a instalaciones”, “Guía profesional bilingüe (español e inglés)”, “Equipo de seguridad completo…” y “Kit de primeros auxilios”.

**Impacto:** los detalles necesarios para decidir se entienden peor y la experiencia pierde coherencia para visitantes internacionales.

**Corrección:** aplicar `tourDuration(..., lang)` y disponer de inclusiones editoriales por idioma. No fabricar traducciones que alteren lo contratado.

**Aceptación:** revisar las secciones de duración, inclusiones, seguridad y políticas de /en; conservar nombres propios.

### 6. P2 — “Saltar al contenido” apunta antes del encabezado

**Código:** `app/SiteRoot.tsx:59` y `app/HomeClient.tsx:37`.

`#main-content` está en el wrapper que contiene toda la página, incluido SiteHeader. La activación vuelve al contenido que precede a la navegación, en lugar de superarla.

**Corrección:** situar un destino enfocable después del header, con estructura de main y foco adecuados.

**Aceptación:** pulsar Tab desde el inicio, activar el enlace y comprobar que el siguiente foco útil está en el contenido principal, sin recorrer la cabecera. Referencia: [WCAG bypass blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html).

### 7. P3 — “Ver qué incluye” lleva directamente a reservar

**Código:** `app/components/home/HomeTrustSection.tsx:120` y `app/components/home/home-utils.ts:6`.

La etiqueta promete detalles, pero el destino es /reservar?tour=tour-ciudad-esmeralda.

**Impacto:** quien necesita entender las inclusiones entra al calendario/reserva antes de resolver su duda.

**Corrección:** enlazar a las inclusiones del detalle del tour, o cambiar la etiqueta si la intención es iniciar la reserva. Mantener un CTA distinto para cada propósito.

### 8. P2 — Falta conectar la medición de acciones de la portada

**Código:** `app/components/analytics/AnalyticsTracker.tsx:12`, `app/SiteRoot.tsx:59`, `lib/analytics/client.ts:3`.

AnalyticsTracker implementa page_view y captura de clicks, pero no tiene importaciones ni montajes en el árbol revisado. SiteRoot monta Vercel Analytics; los eventos explícitos del checkout existen por separado. Los componentes activos de portada no emiten eventos propios de selección/CTA.

**Impacto:** el código actual no conecta las interacciones de portada con el pipeline propio de eventos. No se puede atribuir desde esa implementación qué sección, categoría, idioma o CTA inicia mejores reservas. No se inspeccionó el panel de Vercel ni su configuración externa.

**Corrección:** instrumentar eventos semánticos mínimos para CTA de hero, WhatsApp, categoría, detalle e inicio de reserva, con sección/idioma/tour y atribución coherente. Evitar duplicación de eventos y captura innecesaria de datos.

**Aceptación:** una acción produce un evento identificable y permite relacionar origen con inicio/final de reserva. Verificar recepción antes de usar los datos para decisiones.

## SEO, rendimiento y oportunidades siguientes

| Tema | Estado observado | Acción |
| --- | --- | --- |
| HTTP, canonical, hreflang, html lang | Correctos en las dos portadas inspeccionadas | Preservar enlaces recíprocos ES/EN/x-default |
| Robots y sitemap | 200; portadas permitidas; reservas con noindex/follow | Mantener reservas fuera del sitemap |
| Sitemap de tours | Los destinos actuales de la muestra respondieron 200 | Los slugs fijos en app/sitemap.ts:13–27 pueden ignorar futuras desactivaciones: usar URLs publicables verificadas |
| H1 inglés | Solo “EMERALD CITY”, mientras título/párrafo usan Ciudad Esmeralda | Mantener el nombre propio y aclarar “Canyon”; es coherencia editorial, no prueba de penalización |
| Metadata social | lib/site/seo.ts:15 declara 1200×630; poster real 1600×900 | Usar dimensiones reales o imagen social dedicada |
| Espera de datos en inglés | app/en/page.tsx:9 espera catálogo antes de renderizar | Aplicar la misma arquitectura de shell/carga corregida a ambos idiomas; no se observó lentitud grave en la muestra HTTP |
| Video | Poster 48,224 bytes; MP4 local 3,133,025 bytes; inicio diferido y pausa visible en código | Considerar conexión/datos ahorrados y visibilidad; HomeHero.tsx:25 no pausa si cambia a reduced-motion durante la sesión |
| Catálogo predeterminado | public.ts:390–410 puede sembrar/reincorporar tours durante lectura pública | Respetar desactivaciones y separar seeding administrativo; riesgo de lógica, no evidencia de precio actual incorrecto |
| Diseño del recorrido | Selector inicial, otras tarjetas “cuál tour”, showcase y CTA final repiten decisiones | Consolidar elección y llevar confianza/prueba social más cerca del primer CTA; validar con conversión, sin prometer incremento |
| Familia y premium | El catálogo HTTP contiene 9 tours; no contiene ningún slug premium del selector | Mostrar consulta asistida explícita para premium, sin sugerir producto publicado; validar idoneidad por tour en familia |

### Rendimiento: límites de esta medición

La muestra HTTP entregó 232,689 bytes de HTML en español y 160,914 en inglés, sin equipararlos a bytes transferidos comprimidos. Una lectura registró cabeceras a 421 ms y 497 ms respectivamente. Son observaciones de una sesión y caché concretas, no métricas de campo ni una comparación controlada.

No se midieron LCP, INP ni CLS actuales. Medir las mismas URLs, conexión y dispositivo en varias corridas manuales y revisar percentil 75 de campo. Objetivos de referencia: LCP ≤2.5 s, INP ≤200 ms y CLS ≤0.1. [Web Vitals](https://web.dev/articles/vitals).

### Contenido y resultados de búsqueda

Los títulos, descripciones y texto visible ya incluyen Ciudad Esmeralda, Río La Vieja, San Carlos y actividades. La siguiente mejora editorial debe resolver dudas concretas y verificadas: requisitos físicos, inclusiones por paquete, llegada, duración y condiciones de confirmación. No inventar precios, cupos, acreditaciones ni volúmenes de búsqueda. [Guía SEO de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

Las preguntas frecuentes siguen siendo útiles para personas. **Google dejó de mostrar FAQ rich results desde el 7 de mayo de 2026**, según su documentación actual; añadir FAQPage no debe presentarse como una promesa de ese formato. Mantener el marcado correcto es distinto de obtener un resultado enriquecido. [Actualizaciones oficiales](https://developers.google.com/search/updates).

## Orden propuesto

1. Corregir/verificar selector EN desplegado, contraste y menú móvil.
2. Separar estados del catálogo, completar inglés y reparar el salto al contenido.
3. Alinear enlaces con su intención y conectar eventos de conversión.
4. Ajustar H1/social metadata, resiliencia del sitemap y arquitectura de carga inglesa.
5. Validación visual manual y medición móvil; comparar conversiones por idioma y dispositivo. Para SEO, comparar periodos de Search Console en lugar de atribuir variaciones diarias a un cambio aislado.

## Validación de esta entrega

- TypeScript y lint: aprobados sobre el checkout revisado.
- Evidencia HTTP y referencias: revisadas; ningún archivo de producto modificado.
- El commit contiene exclusivamente este informe y su evidencia resumida.
- No se iniciaron workers de Next.js ni procesos de build; los comandos de comprobación terminaron.
