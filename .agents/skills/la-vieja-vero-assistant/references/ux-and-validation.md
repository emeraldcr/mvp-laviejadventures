# UX y validación

## Principios

- Mostrar solo opciones actuales y ocultarlas al elegir.
- Evitar mensajes y envíos duplicados.
- Permitir texto libre en menús.
- Explicar cada dato.
- Mostrar progreso sobre 12 campos.
- Identificar respuestas de Mongo, OpenAI y campos recuperados.
- Mantener el aviso de seguridad.

## Inputs

- Tour, horario, condición, paquete, transporte y almuerzo: tarjetas o pastillas.
- Fecha: `type=date`, `lang=es-CR`, mínimo local, fechas rápidas y resumen legible.
- Personas: pastillas frecuentes y número entre 1 y 20; escalar más de 12.
- Edades: una casilla por persona, enteros de 0 a 100.
- Nombre: autocomplete, 2 a 120 caracteres.
- Correo: `type=email`, sin autocapitalización, máximo 254 y confirmación visual válida.
- Teléfono: `type=tel`, códigos frecuentes y 8 a 15 dígitos.

## Pensamiento y errores

Usar pastillas animadas con `aria-live`. Aplicar timeout y mostrar recuperación; nunca dejar a Vero pensando indefinidamente.

## Responsive

Usar `minmax(0,1fr)` y `min-w-0`, mantener el botón visible y verificar foco, labels, contraste y scroll.
