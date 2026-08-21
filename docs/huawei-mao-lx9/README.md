# Huawei MAO-LX9 — dossier técnico e inventario ADB

Estado: equipo físico conectado e inspeccionado por ADB el 31 de julio de 2026. Este documento distingue entre datos observados en el teléfono y capacidades declaradas por Android. No contiene serial, cuentas, IMEI, MAC, IP ni redes guardadas.

## Identificación observada

| Campo | Valor detectado |
|---|---|
| Fabricante / modelo | HUAWEI MAO-LX9 |
| Producto interno | MAO-L29 |
| Dispositivo | HWMAO-Q |
| Plataforma comercial | Huawei nova 11i (variante regional) |
| Android base / API | Android 12 / API 31 |
| Firmware mostrado | `MAO-L29 14.2.0.168(C605E2R1P1)` |
| Incremental | `104.2.0.168C605` |
| Parche reportado | 2022-08-01 |
| Tipo / firma | `user` / `release-keys` |
| Arquitecturas | arm64-v8a, armeabi-v7a, armeabi |
| RAM física observada | 7.47 GiB aprox. (7,830,228 KiB) |
| Espacio de usuario observado | 106 GB útiles; 79 GB libres durante la lectura |
| Verified Boot | `green` |
| Bootloader | bloqueado (`ro.boot.flash.locked=1`) |
| Project Treble | habilitado |

El identificador comercial, la región y la versión visible no deben confundirse: `MAO-LX9` es el modelo de venta, `MAO-L29` es el producto de software y `C605` identifica una personalización regional. Android base 12 y firmware/EMUI 14 pueden coexistir porque son capas de versión distintas.

## Conexión actual con la computadora

El equipo enumera por USB con VID Huawei `12D1` y presenta tres funciones:

- MTP/WPD para transferencia multimedia.
- Unidad de almacenamiento usada por el instalador o componente Huawei.
- ADB mediante WinUSB, después de activar Depuración USB y aceptar la huella RSA.

Herramienta instalada durante la sesión:

```text
C:\tmp\android-platform-tools\platform-tools\adb.exe
```

ADB permite consultar propiedades, servicios, paquetes, registros y almacenamiento autorizado. No concede root, no desbloquea el bootloader y no permite leer directamente particiones protegidas. La autorización puede revocarse desde Opciones de desarrollador.

## Capacidades declaradas por el teléfono

Estas capacidades provienen de `pm list features`; representan lo que el framework ofrece a las aplicaciones, no una prueba de rendimiento o compatibilidad con cada accesorio.

### Red y conexión directa

- Wi‑Fi cliente.
- **Wi‑Fi Direct / Wi‑Fi P2P** para conexión local entre dispositivos sin un router tradicional.
- Wi‑Fi Passpoint.
- Escaneo Wi‑Fi permanente configurable.
- Bluetooth clásico y Bluetooth Low Energy.
- NFC y compatibilidad NXP MIFARE declarada.
- Telefonía GSM, CDMA declarada por framework e IMS (base para VoLTE según operador).
- GPS y ubicación por red.
- USB host (OTG) y USB accessory.
- SIP/VoIP e IPsec a nivel de Android.

Durante la inspección, Wi‑Fi estaba habilitado, el escaneo disponible y el equipo no estaba conectado a una red. El script deliberadamente no muestra SSID, BSSID, MAC, direcciones IP ni redes guardadas.

Wi‑Fi Direct sirve para descubrimiento y enlace P2P, compartir contenido o conectar accesorios que lo soporten. No significa por sí solo que exista una interfaz de escritorio, depuración inalámbrica habilitada ni acceso remoto sin consentimiento.

### Hardware multimedia y sensores

- Cámaras frontal y trasera, autofocus y flash.
- Camera2 nivel `FULL`, captura RAW, control manual de sensor y posprocesado manual declarados.
- Micrófono y audio de baja latencia/pro.
- Acelerómetro, brújula, luz, proximidad y contador de pasos.
- Lector de huella.
- Pantalla multitáctil avanzada.

### Gráficos, Android y entorno “virtual”

- OpenGL ES 3.0+ (`reqGlEsVersion=0x30002`) y OpenGL ES AEP.
- Vulkan 1.1 declarado, nivel 1 y capacidad de cómputo.
- Picture-in-picture, widgets, impresión, autocompletado, WebView y MIDI.
- Ventanas de forma libre y actividades en pantallas secundarias declaradas. Que la interfaz Huawei las exponga al usuario depende de su configuración.
- Usuarios administrados y eliminación segura de usuarios.
- Cifrado basado en archivos, pantalla de bloqueo segura y Verified Boot.
- Project Treble para separar framework Android e implementación del fabricante.

“Virtual” puede referirse a varias cosas: memoria virtual, pantallas/ventanas virtuales, usuarios o virtualización de sistemas. El inventario confirma funciones de pantallas secundarias y ventanas libres, pero **no confirma una máquina virtual, hypervisor, KVM ni soporte para ejecutar otro sistema operativo**. Eso requiere pruebas específicas y, normalmente, permisos mayores que ADB estándar.

## `index.py`: inventario vivo por ADB

El script se conecta al teléfono autorizado y produce un resumen legible o JSON. Solo ejecuta consultas; no instala APK, no cambia ajustes, no reinicia y no escribe en el dispositivo.

```powershell
python docs/huawei-mao-lx9/index.py
python docs/huawei-mao-lx9/index.py --json
python docs/huawei-mao-lx9/index.py --json --output docs/huawei-mao-lx9/device-report.json
```

Para indicar otra ubicación de ADB:

```powershell
python docs/huawei-mao-lx9/index.py --adb C:\ruta\platform-tools\adb.exe
```

Opcionalmente, `--include-packages` agrega nombres de paquetes instalados. Puede revelar qué aplicaciones usa el dueño, así que está desactivado por defecto.

El reporte incluye:

- estado de autorización ADB;
- identidad técnica y compilación;
- seguridad de arranque y arquitectura;
- RAM, almacenamiento y batería;
- capacidades Android agrupadas;
- estado general de Wi‑Fi, sin identificadores de red;
- lista opcional de paquetes, sin datos internos de las aplicaciones.

## Gate manager: USB y depuración inalámbrica

`gate.py` administra transportes ADB autorizados y aliases de endpoints. Los perfiles se guardan fuera del repositorio, en `%LOCALAPPDATA%\mao-lx9-adb\connections.json`, y contienen solamente `alias -> host:puerto`.

```powershell
# Ver USB y conexiones inalámbricas actuales (oculta el serial USB)
python docs/huawei-mao-lx9/gate.py status

# Pairing seguro de Android 11+; solicita el código sin mostrarlo ni guardarlo
python docs/huawei-mao-lx9/gate.py pair 192.168.1.50:37123

# Guardar el puerto de conexión mostrado por "Depuración inalámbrica"
python docs/huawei-mao-lx9/gate.py save casa 192.168.1.50:40555
python docs/huawei-mao-lx9/gate.py connect casa
python docs/huawei-mao-lx9/gate.py disconnect casa
python docs/huawei-mao-lx9/gate.py profiles
```

En Android, el puerto de **emparejamiento** y el puerto de **conexión** pueden ser diferentes y cambiar después de reiniciar o cambiar de red. Se obtienen en Opciones de desarrollador → Depuración inalámbrica. El computador y el teléfono normalmente deben compartir una red confiable.

Existe un modo heredado, deliberadamente protegido por confirmación:

```powershell
python docs/huawei-mao-lx9/gate.py tcpip 5555 --confirm-insecure
```

Este modo abre ADB en la red local y es menos seguro que el pairing de Android 11+. Úselo únicamente en una red propia, cierre la conexión al terminar y no reenvíe ese puerto en el router. `gate.py` no descubre objetivos ajenos, no escanea redes y no evade autorizaciones.

## Límites y seguridad

- ADB autorizado puede acceder a información personal visible para el usuario `shell`; debe desactivarse al terminar si no se necesita.
- No publicar el serial ADB, IMEI, Android ID, huellas RSA, cuentas, tokens, MAC, IP, SSID ni archivos personales.
- `verifiedbootstate=green` y `flash.locked=1` indican una cadena de arranque verificada y bloqueada en esta lectura. No garantizan que nunca se haya modificado el dispositivo.
- No intentar `adb root`, escritura de particiones, sideload, fastboot unlock ni extracción de credenciales como parte del inventario.
- El parche reportado por propiedades es antiguo; antes de usar el equipo con información sensible conviene comprobar actualizaciones desde el actualizador oficial de Huawei.

## Fuentes

- Datos concretos: lectura ADB del equipo físico mediante `getprop`, `pm list features`, `df`, `/proc/meminfo` y `cmd wifi status`.
- Huawei nova 11i, especificaciones oficiales: https://consumer.huawei.com/co/offer/huawei-destu/nova-11i/specs//
- Android Debug Bridge, documentación oficial: https://developer.android.com/tools/adb
- Wi‑Fi Direct, documentación oficial de Android: https://developer.android.com/develop/connectivity/wifi/wifi-direct
- Android feature reference: https://developer.android.com/guide/topics/manifest/uses-feature-element

## Toolkit Python completo

La guía operativa detallada, ejemplos de diagnóstico, archivos, capturas, automatización visible y límites de ADB está en [`PYTHON-GUIDE.md`](PYTHON-GUIDE.md). La consola correspondiente es `phone.py`; toda operación que modifica o interactúa con el teléfono exige `--confirm`.

## Panel Next.js local `/phone`

El proyecto contiene una interfaz visual en `http://localhost:3000/phone`. No habla con USB desde el navegador: utiliza una separación intencional de privilegios.

```text
/phone (React)
    ↓ JSON, acciones enumeradas
/api/phone (Node.js runtime)
    ↓ execFile con argumentos separados
docs/huawei-mao-lx9/phone.py
    ↓ ADB autorizado
Huawei MAO-LX9
```

El backend nunca acepta texto como comando shell. La ruta GET admite solamente `summary`, `report` y `features`; POST admite solamente `home`, `back` y `open-url` con URL HTTP(S) validada. `execFile` evita interpretación por una shell y limita salida, duración y tamaño del proceso.

Inicio local:

```powershell
npm.cmd run dev
# abrir http://localhost:3000/phone
```

Si Python no está disponible como `python`, configure su ruta antes de iniciar Next:

```powershell
$env:PHONE_PYTHON = "C:\ruta\python.exe"
npm.cmd run dev
```

En desarrollo el bridge está disponible. En producción está **deshabilitado por defecto** porque el servidor desplegado no tiene acceso al USB de esta computadora y publicar controles ADB sería peligroso. Para un despliegue estrictamente local y protegido se requiere `PHONE_BRIDGE_ENABLED=true`; no se recomienda configurarlo en Vercel, Cloudflare ni un servidor público.

El panel muestra conexión, modelo, build, SoC, Android, batería, integridad, pantalla y un mapa agrupado de features. También permite enviar Home, Back y abrir una URL visible. Operaciones más delicadas —archivos, logs, APK e inputs— permanecen únicamente en la CLI con `--confirm`.

### Compartir Internet con un iPhone

El reporte de `/phone` incluye `hotspot.supported`, `active`, permiso de upstream celular y presencia general de clientes, sin revelar nombre, contraseña, MAC o IP. El botón **Open hotspot settings** abre la pantalla nativa del Huawei; allí el usuario enciende el punto de acceso y ve la clave localmente.

1. Confirmar que los datos móviles del Huawei navegan.
2. En `/phone`, pulsar **Open hotspot settings**.
3. En el Huawei, configurar nombre, contraseña WPA2/WPA3 y preferir 2.4 GHz si el iPhone no ve la red.
4. Activar Punto de acceso personal.
5. En el iPhone: Ajustes → Wi‑Fi → seleccionar el nombre e introducir la contraseña mostrada por el Huawei.
6. Refrescar `/phone`: debe cambiar de `OFF` a `ON` y mostrar upstream activo cuando Android lo reporte.

También se puede abrir esa pantalla desde Python:

```powershell
python docs/huawei-mao-lx9/phone.py hotspot
python docs/huawei-mao-lx9/phone.py --confirm tether-settings
```

No se usa `cmd wifi start-softap`: Android advierte que ese comando puede crear un AP sin activar tethering de Internet. La pantalla nativa aplica las políticas de SIM/operador y es la ruta correcta para este objetivo.

El panel también ofrece **Replace focused field**. Es un flujo asistido: abra la configuración, toque manualmente el campo de contraseña y luego envíe la nueva clave desde `/phone`; ADB hace seleccionar-todo y escribe sobre el campo enfocado. Finalmente pulse Guardar en el Huawei. La clave se mantiene solamente en memoria React durante la operación, se limpia después y no se incluye en el reporte. Para reducir problemas de codificación se permiten 8–63 letras, números y los símbolos `._@#+=!-`.
