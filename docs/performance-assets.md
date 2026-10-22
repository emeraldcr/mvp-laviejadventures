# Rendimiento de assets públicos

## Resultado de esta pasada

- `public/` pasó de 43.03 MB a 21.85 MB: reducción aproximada de 49.2%.
- 110 fotografías JPG/PNG fueron convertidas a WebP con calidad 82 y rotación EXIF aplicada.
- Se actualizaron las referencias locales y el endpoint `/api/images` para servir WebP.
- La galería no contiene duplicados exactos por SHA-256. La carpeta `public/image/` conserva nombres de cámara `IMG_...` porque renombrarlos rompería enlaces históricos; los nombres descriptivos ya se usan en `public/og/tours` y `public/propuestas/grupo-jess`.
- `public/hero/vid1.mp4` no tenía referencias en la aplicación y fue retirado. El hero activo es `ciudad-esmeralda-hero.mp4`.
- El poster del hero se mantiene como WebP y el video se monta después de la carga inicial (`requestIdleCallback`, con fallback de 1.2 s). `prefers-reduced-motion` evita cargarlo.

## Pendiente operativo

El hero MP4 quedó en aproximadamente 3.0 MB. La compresión adicional requiere un encoder de video disponible en el entorno de publicación; este checkout no tenía `ffmpeg`. Al preparar una versión CDN, generar una variante H.264 de ancho moderado y conservar el poster como fallback. No cargar videos en galerías o rutas donde no aporten a la experiencia.

## Medición manual antes/después

En una ventana incógnito y una conexión móvil, medir la misma URL desplegada con Lighthouse o PageSpeed Insights y guardar:

1. LCP, CLS e INP, además de TTFB y peso transferido.
2. Carga inicial con video permitido y con `prefers-reduced-motion`.
3. La ruta `/galeria` por separado, verificando que las imágenes fuera de pantalla sean lazy.

Comparar tres corridas por variante y anotar fecha, URL, dispositivo y conexión. Esta validación visual y de campo queda pendiente para revisión manual; no se usó Playwright.
