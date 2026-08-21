# VIMOQ M9010 — especificación técnica y plan de firmware

Estado del documento: modelo y solicitante regulatorio confirmados físicamente; sin un volcado de firmware disponible.  
Equipo objetivo confirmado: **VIMOQ M9010**, FCC ID **2A5RQ-M9010**, fabricado en China. La batería removible está marcada `BL-5CV`.

## Identificación física

`BL-5CV` es un **número de modelo/parte de batería Li-ion**, utilizado por distintos teléfonos y repuestos. No identifica por sí solo la placa, el chipset o el firmware del equipo. Las baterías comercializadas con ese código suelen anunciar 3,6–3,7 V y capacidades diferentes según el fabricante; por eso tampoco se debe inferir 1900 mAh únicamente desde `BL-5CV`.

La etiqueta física bajo la batería confirma:

- Marca: VIMOQ.
- Modelo: M9010.
- FCC ID: 2A5RQ-M9010.
- Marcación de diseño/revisión visible: D/N M4N1.
- País indicado: China.

La foto original contiene dos IMEI y otro código individual. Esos valores no se transcriben en este repositorio. Toda copia documental de la etiqueta debe censurarlos completamente.

## Resumen ejecutivo

El M9010 no es un teléfono Android. La plataforma UNISOC T107 utiliza **Mocor RTOS**, un sistema ligero para teléfonos básicos. No se debe asumir compatibilidad con APK, ADB, fastboot, recovery Android ni ROMs Android.

La marca VIMOQ y la certificación del M9010 están vinculadas a **Shenzhen Transchan Technology Limited**, empresa del grupo Transsion. El SoC lo fabrica **UNISOC**. La tienda o importador local no necesariamente es el fabricante.

## Especificación consolidada

| Área | Especificación | Confianza / fuente |
|---|---|---|
| Marca / modelo | VIMOQ M9010 | Confirmado por etiqueta física, publicación y manual FCC |
| Tipo | Teléfono básico 4G, formato candybar, teclado físico | Confirmado |
| Titular/fabricante asociado | Shenzhen Transchan Technology Limited (Transsion) | Etiqueta física enlazada por FCC ID con el expediente regulatorio |
| Plataforma | UNISOC T107 | Confirmado por comercio; coherente con memoria y radio |
| CPU | 1× Arm Cortex-A7 hasta 1 GHz, 22 nm | Especificación oficial T107 |
| Sistema base | Mocor RTOS | Especificación oficial T107; el nombre comercial “vimoq” no identifica otro kernel |
| RAM | 48 MB anunciados; T107 integra 384 Mb = 48 MB LPDDR2 | Confirmado/coherente |
| Almacenamiento | 128 MB NAND anunciados | Confirmado comercialmente; chip exacto pendiente de placa/dump |
| Expansión | microSD anunciada hasta 128 GB | Publicación comercial; validar en el equipo y sistema de archivos |
| Pantalla | TFT 1,77 pulgadas, 128×160 px (QQVGA), 65K colores | Fuente comercial detallada |
| Cámara | 1,3 MP anunciados | Fuente comercial; sensor exacto pendiente |
| Red | GSM/WCDMA/LTE Cat 1, VoLTE soportado por la plataforma | T107 oficial; bandas del producto según variante/certificación |
| SIM | Dual SIM física | Confirmado |
| Bluetooth / FM | Integrados en T107; presentes en el producto | Confirmado |
| Wi‑Fi / GPS | No anunciados; GPS es opcional en T107 | No asumir que están poblados |
| Batería | La ficha M9010 anuncia Li-ion removible de 1900 mAh; el equipo en mano lleva una batería marcada BL-5CV | Capacidad y compatibilidad deben leerse directamente en la batería |
| Puertos | micro‑USB y auriculares 3,5 mm | Fuente comercial |
| Dimensiones | 128,8 × 52,5 × 13,75–13,8 mm | Fuente comercial |
| Contactos / SMS | Hasta 2000 contactos y 500 mensajes anunciados | Dato del vendedor; depende del firmware |
| FCC ID | 2A5RQ-M9010 | Confirmado físicamente; autorización concedida el 22 de marzo de 2023 |

## Fabricación y cadena de producto

- **Marca y solicitante regulatorio:** Shenzhen Transchan Technology Limited.
- **Grupo empresarial:** Transsion, conocido por fabricar y comercializar varias marcas de telefonía.
- **Diseñador del chipset:** UNISOC.
- **Fabricación del silicio:** el T107 es un SoC de 22 nm; la ficha oficial no debe confundirse con el ensamblador final del teléfono.
- **Circuit / comercios locales:** son canales comerciales; no hay evidencia de que fabriquen el hardware.

## Arquitectura de software esperada

La ficha oficial del T107 describe:

- Mocor RTOS ligero.
- CPU Cortex-A7 de 1 GHz.
- LTE Cat 1, WCDMA, GSM y VoLTE.
- Bluetooth, FM y códec de audio integrados.
- NAND externa, LCD y cámara mediante interfaces seriales/paralelas.
- Soporte del proveedor para aplicaciones de terceros, pagos, radio/música en línea o asistentes de voz.

“Soporte para aplicaciones de terceros” significa integración durante la construcción OEM del firmware. No implica una tienda pública ni instalación libre por el usuario.

## Qué puede contener el firmware

Hasta obtener un dump, esta lista es una hipótesis de trabajo, no un inventario confirmado:

1. Primer cargador y código de inicialización de la plataforma UNISOC.
2. Imagen Mocor RTOS y controladores de pantalla, teclado, audio, cámara y radio.
3. Pila de telefonía GSM/WCDMA/LTE/VoLTE.
4. Recursos de interfaz: fuentes, idiomas, iconos, tonos y menús.
5. Aplicaciones integradas: llamadas, SMS, contactos, cámara, reproductor, grabadora, FM, alarma y calculadora.
6. Datos NV de calibración y configuración de radio.
7. Configuración de operador, bandas, APN y parámetros regionales.
8. Mecanismo de actualización/FOTA, si el producto lo incorpora.

Los datos NV, calibraciones RF, claves y particiones de identidad deben respaldarse y nunca editarse a ciegas. No se deben publicar IMEI, números de serie, claves o datos personales extraídos.

## Ruta segura para extender el sistema

### Nivel 1 — sin modificar firmware

- Usar microSD para audio, imágenes y datos compatibles.
- Revisar menús de accesibilidad, marcación rápida, SOS, Bluetooth y perfiles.
- Documentar códigos de versión mostrados por el propio teléfono.

### Nivel 2 — personalización OEM

- Obtener del fabricante el SDK/BSP exacto de T107/M9010, mapa de particiones y herramienta de empaquetado.
- Cambiar únicamente recursos o aplicaciones soportadas por Mocor.
- Compilar para la revisión exacta de placa y validar firma/checksum.

### Nivel 3 — ingeniería de firmware

- Hacer primero un dump completo verificable y dos copias con SHA-256 coincidente.
- Identificar formato de paquete, particiones, compresión, firmas y versión de placa.
- Construir cambios mínimos y reversibles en un equipo de prueba.
- Conservar una ruta de recuperación con firmware oficial antes de escribir nada.

No se recomienda intentar portar Android: 48 MB de RAM, 128 MB NAND, ausencia de BSP Android público y el diseño RTOS lo vuelven impráctico.

## Inspección del firmware

Esta carpeta incluye `index.py`, un analizador estático de solo lectura. No conecta ni escribe en el teléfono.

```powershell
python docs/vimoq/index.py C:\ruta\al\dump.bin --output docs/vimoq/firmware-report.json
```

También acepta una carpeta con varios archivos. El reporte incluye tamaño, SHA-256, entropía aproximada, firmas conocidas y cadenas relevantes.

### Pendiente para completar el análisis real

- Archivo de firmware oficial o dump completo.
- Foto legible de la etiqueta bajo la batería (sin publicar IMEI).
- Pantalla de versión del sistema.
- Revisión de placa/PCB.
- Identificador de compilación y mapa de particiones.
- Herramienta y método oficial de respaldo para esta revisión exacta.

Sin uno de esos artefactos no es posible afirmar qué versión, aplicaciones, particiones o protecciones contiene **este** teléfono concreto.

## Entrada a modo BootROM/FDL

El M9010 no es Android y no se espera un menú de “opciones de desarrollador”, ADB o fastboot. El modo de servicio relevante es el **BootROM/FDL** de UNISOC. Normalmente no muestra nada en pantalla.

### Hechos confirmados de la plataforma

- UNISOC documenta que el modo de descarga se activa manteniendo la señal/tecla de arranque antes de aplicar alimentación.
- En producto terminado se usa una tecla del teclado; en placa se puede usar `Nboot` o `U1TXD` con un fixture de fábrica.
- El PC debe estar esperando el dispositivo: si no recibe el handshake BSL, el puerto puede desaparecer rápidamente y el teléfono continuar el arranque o la carga.
- Para leer/escribir flash se necesitan cargadores FDL1/FDL2 compatibles y, en algunos equipos, firmados para esa compilación.

### Secuencia no destructiva para descubrir la tecla

Realizar una prueba por combinación, nunca todas a la vez:

1. Cargar la batería por encima de 50 % y retirar SIM/microSD.
2. Apagar, desconectar USB y retirar la batería durante 10 segundos.
3. Dejar abierto un monitor USB/PNP en el PC.
4. Reinstalar la batería sin encender el teléfono.
5. Mantener una tecla candidata y, sin soltarla, conectar USB durante 5–8 segundos.
6. Desconectar, retirar batería y repetir con la siguiente tecla.

Orden de prueba sugerido para un *feature phone* UNISOC, basado en convenciones de plataforma pero **no confirmado para el M9010**:

1. `0`
2. `*`
3. `#`
4. tecla de navegación hacia abajo
5. tecla suave izquierda
6. tecla de llamada
7. `*` + `#`
8. `0` + tecla roja/encendido mientras se conecta USB

Una entrada correcta puede aparecer como dispositivo USB/serial UNISOC, Spreadtrum, SCI, SPD, `USB\VID_1782...` o como dispositivo desconocido. La pantalla puede permanecer negra: eso es normal.

### Lo que no debe hacerse todavía

- No puentear pads de placa sin identificar GND, Nboot/U1TXD y la revisión exacta.
- No cargar FDLs de otro teléfono solo por compartir T107.
- No usar `format`, `erase`, `write`, `download`, `upgrade` ni restablecimiento de fábrica.
- No reemplazar el driver de un periférico USB conocido con Zadig.
- No tocar NV/ProdNV, calibración RF, IMEI, PhaseCheck o claves.

La primera meta es únicamente capturar el VID/PID y conservar el puerto; después se instala el driver correspondiente y se intenta un inventario de solo lectura.

## Fuentes consultadas

- UNISOC, ficha oficial T107: https://www.unisoc.com/en/product/FeaturePhoneUS/T107
- Documentación oficial UNISOC de modo Download/Boot: https://unisoc.github.io/sdk/update_firmware/
- Implementación de investigación para T107/feature phones: https://github.com/ilyakurdyukov/spreadtrum_flash
- Manual VIMOQ M9010 / FCC ID 2A5RQ-M9010: https://device.report/manual/9724561
- Expediente FCC del equipo: https://fcc.report/FCC-ID/2A5RQ-M9010/
- Registro de dispositivos asociado a Shenzhen Transchan: https://device.report/shenzhen-transchan-technology
- Registro de marca VIMOQ, serial 98009930: https://trademarks.justia.com/owners/shenzhen-transchan-technology-limited-4134019/
- Especificación comercial regional: https://www.appoloviracel.com.uy/index.php/product/celular-vimo-q-m9010-4g-con-teclado/
- Referencia del código de batería BL-5CV: https://www.battery.org.uk/product/Vertu/BL-5CV/188653.html
