# Revisión de seguridad — 3 de noviembre de 2026

Alcance: código local de la web pública, cuentas, estadísticas, reservas, borradores,
PayPal y dependencias de ejecución/desarrollo. No constituye una certificación de
ausencia de vulnerabilidades ni una prueba de penetración de producción.

## Hallazgos corregidos

- Crítico: el token de recuperación llegaba directamente a un filtro MongoDB y
  aceptaba objetos con operadores. Ahora solo admite 64 caracteres hexadecimales.
- Recuperación: tokens almacenados como SHA-256, consumo y cambio de contraseña
  atómicos, vencimiento obligatorio y revocación de sesiones por versión. Los
  enlaces anteriores almacenados sin hash dejan de funcionar; solicitar uno nuevo.
- Identidad: Auth0 exige correo verificado, mantiene la identidad por subject y
  rechaza vinculaciones automáticas por coincidencia de correo. Cambios de correo
  del proveedor requieren revisión explícita. Índices únicos de correo y subject
  previenen carreras de creación. Las cuentas locales existentes siguen usando
  contraseña; no se vinculan automáticamente a una identidad nueva de Auth0.
- Privacidad: crear una cuenta con un correo ajeno ya no permite leer reservas de
  ese correo. El acceso por correo requiere verificación; las nuevas reservas
  autenticadas guardan el ID de usuario. Una recuperación completada verifica el
  correo local. Para reservas antiguas, solicitar recuperación e iniciar sesión
  de nuevo. Las consultas devuelven como máximo las 100 reservas más recientes.
- Estadísticas: GET requiere sesión con correo verificado y lista explícita de
  administradores. Se eliminan nombre/correo del evento y parámetros de URL; se
  filtran claves sensibles de metadatos y se limita la profundidad.
- Pagos: captura ligada al navegador creador mediante cookie HttpOnly, Secure en
  producción, SameSite=Lax y firma HMAC por orden (6 horas). El identificador de
  orden solo no autoriza cobros. Un índice único parcial impide reservas duplicadas
  por capturas concurrentes (las reservas pendientes sin orden quedan excluidas). La conciliación valida importe y moneda también
  para órdenes ya completadas. La respuesta no expone datos personales del pagador.
- Abuso: límites compartidos en MongoDB con incrementos atómicos, TTL de limpieza,
  límites de cuenta para login/recuperación, IP confiable en Vercel, presupuesto
  global de 100 solicitudes de IA/hora. Si falla el control, se deniega la petición.
- Entradas: control de origen para APIs propias, JSON obligatorio, máximo real de
  32 KiB incluso sin Content-Length, rechazo de operadores y anidación excesiva,
  validación escalar en cotizaciones y límite bcrypt de 72 bytes UTF-8.
- Borradores: no se aceptan tokens elegidos por el cliente para crear borradores ni
  se reactivan capacidades vencidas; los nuevos tokens se generan en el servidor.
- Otras fugas: errores internos eliminados de respuestas públicas, nombres escapados
  en correos HTML, tokens excluidos de listados, respuestas sensibles sin caché,
  cabeceras anti-framing/nosniff/no-referrer/HSTS y CSP básica.
- Páginas del servidor: “Mis reservas” aplica la misma verificación que su API.
  El voucher exige propietario de navegador/cuenta y solo muestra una reserva
  pagada persistida; deja de consultar PayPal, reconstruir reservas y asignarlas
  al visitante. Los correos usan un bloqueo atómico, estado de entrega persistente,
  límite de reintentos y clave de idempotencia del proveedor; se escapan sus campos.
- Integridad: GET de tours deja de escribir o reactivar tours deshabilitados.
- Dependencias: undici 7.30.1, ESLint 10, TypeScript ESLint 8.72 y minimatch 11.0.1.
  El override de minimatch se valida con el análisis completo del repositorio.

## Configuración y validación de despliegue pendientes

1. Configurar ANALYTICS_ADMIN_EMAILS con los correos autorizados, separados por
   comas. Sin esa lista, las estadísticas se deniegan por defecto.
2. Mantener AUTH_SECRET aleatorio y estable y APP_BASE_URL/AUTH_URL con el origen
   HTTPS correcto. VERCEL_URL permite el origen de la vista previa correspondiente.
   Confirmar cabeceras y cookies tras el despliegue en el dominio real.
3. La cuenta MongoDB necesita permiso de creación de índices. Antes de desplegar,
   comprobar correos/subjects/órdenes de pago duplicados; no se eliminan ni fusionan registros de
   producción automáticamente. Un conflicto de unicidad bloquea el acceso hasta
   corregirlo. Revisar además TLS, permisos mínimos, backups y restricciones de red.
4. Fuera de Vercel, las solicitudes comparten un límite conservador. Configurar un
   ingreso confiable antes de escalar; no confiar en X-Forwarded-For del cliente.
   Revisar capacidad y reglas WAF: los límites de aplicación no sustituyen defensa
   contra ataques volumétricos. Revisar retención de analytics y borradores.
5. Las órdenes iniciadas antes de este cambio no tienen cookie de propiedad: si
   ya fueron cobradas, conciliarlas por el operador; no pedir repetir un pago.
   Para órdenes no cobradas, reiniciar el checkout en el mismo navegador.
6. Comprobar manualmente Auth0, recuperación por correo, consultas de reservas,
   permisos del visor y PayPal sandbox, incluidos retorno/reintento/múltiples pestañas.
   No se ejecutaron cobros reales ni pruebas de navegador en este trabajo.
7. La CSP actual protege base-uri, object-src y frame-ancestors. Una política estricta
   de scripts con nonces requiere validar scripts de Next, PayPal y analítica en
   navegador. No se afirma que esta CSP elimine cualquier posible XSS.
8. No se inspeccionaron secretos históricos, configuración del proveedor, políticas
   de organización, MFA, logs remotos, DNS ni estado efectivo del despliegue.

## Referencias

- [OWASP: recuperación de contraseñas](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [Auth0: vinculación de identidades](https://auth0.com/docs/manage-users/user-accounts/user-account-linking/link-user-accounts)
- [Vercel: cabeceras de solicitudes](https://vercel.com/docs/headers/request-headers)

## Evidencia local

- npm audit --audit-level=low: 0 vulnerabilidades, incluidas dependencias de desarrollo.
- npm run type-check: correcto.
- npm run lint: correcto, sin errores ni advertencias.
- npm run test:security: 16 pruebas aprobadas.
- npm run test:paypal: 17 pruebas aprobadas.
- npm run build: compilación de producción Turbopack correcta, 59 páginas generadas.
- git diff --check: correcto.
- Servidor local de producción: origen extranjero 403; operador Mongo en recuperación
  400; estadísticas anónimas 403; reservas anónimas 401. Cabeceras nosniff, DENY,
  no-referrer, CSP básica y HSTS presentes; API privada con Cache-Control no-store.
- Servidor temporal detenido después de las comprobaciones.

Las pruebas automatizadas utilizan dobles de servicios; no sustituyen validación
de índices en MongoDB, proveedores externos ni navegador en el despliegue.
Las pruebas HTTP no efectuaron pagos ni solicitudes válidas de escritura.
