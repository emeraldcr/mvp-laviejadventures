# Guía avanzada de conexión y control desde Python

## Modelo mental

La computadora ejecuta el cliente ADB, el teléfono ejecuta `adbd` y la huella RSA autorizada une ambos. Hay tres transportes posibles: USB, Wireless debugging emparejado y ADB TCP heredado. Todos entregan permisos del usuario Android `shell`, **no root**.

```text
Python → adb client → USB o TCP cifrado/emparejado → adbd → Android services
```

Con bootloader bloqueado y Verified Boot verde, Python no puede leer claves, datos privados de otras aplicaciones, particiones protegidas ni alterar el sistema. Ningún script legítimo convierte ADB normal en “god mode”.

## Herramientas

- `index.py`: inventario sanitizado y exportación JSON.
- `gate.py`: pairing, aliases y conexiones USB/Wi‑Fi.
- `phone.py`: consola profunda y biblioteca Python para diagnóstico/control consentido.

## Inicio rápido

```powershell
python docs/huawei-mao-lx9/gate.py status
python docs/huawei-mao-lx9/phone.py summary
python docs/huawei-mao-lx9/phone.py report > phone-report.json
python docs/huawei-mao-lx9/phone.py features
python docs/huawei-mao-lx9/phone.py sensors > sensors.txt
python docs/huawei-mao-lx9/phone.py routes
```

`routes` puede mostrar direcciones de la red local. No publique esa salida sin revisarla.

## Captura y diagnóstico

```powershell
python docs/huawei-mao-lx9/phone.py screenshot screen.png
python docs/huawei-mao-lx9/phone.py --confirm logcat logs.txt --seconds 10
python docs/huawei-mao-lx9/phone.py processes
python docs/huawei-mao-lx9/phone.py packages
```

Una captura o `logcat` puede contener notificaciones, nombres, URLs o datos de aplicaciones. `logcat` exige confirmación por esa razón.

## Archivos compartidos

Las transferencias están confinadas por la herramienta a `/sdcard/`:

```powershell
python docs/huawei-mao-lx9/phone.py pull /sdcard/Download/manual.pdf .\manual.pdf
python docs/huawei-mao-lx9/phone.py --confirm push .\mapa.pdf /sdcard/Download/mapa.pdf
```

ADB normal no puede entrar en `/data/data/<paquete>` salvo que la aplicación sea depurable y permita mecanismos específicos.

## Automatización visible y consentida

```powershell
python docs/huawei-mao-lx9/phone.py --confirm open-url https://example.com
python docs/huawei-mao-lx9/phone.py --confirm key 3
python docs/huawei-mao-lx9/phone.py --confirm text "hola mundo"
```

Los keycodes comunes son 3 Home, 4 Back, 24 volumen arriba, 25 volumen abajo y 26 encendido. La inyección funciona sobre la pantalla activa; no debe usarse para introducir contraseñas ni saltarse bloqueos.

## Aplicaciones

```powershell
python docs/huawei-mao-lx9/phone.py --confirm install .\app-debug.apk
python docs/huawei-mao-lx9/phone.py --confirm uninstall com.example.app
```

La pantalla del teléfono puede pedir confirmación y las políticas Huawei pueden bloquear fuentes desconocidas. La herramienta no evade esas decisiones.

## Uso como biblioteca

```python
from pathlib import Path
import importlib.util

path = Path("docs/huawei-mao-lx9/phone.py")
spec = importlib.util.spec_from_file_location("mao_phone", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

phone = module.Phone(module.adb_path())
phone.ensure()
print(phone.summary())
print(phone.shell("wm", "size"))
```

Para automatizaciones propias, use `Phone.run()` y `Phone.shell()` con argumentos separados; no construya comandos concatenando entradas no confiables.

## Capacidades verificadas en este ejemplar

- Qualcomm SM6225/KHAJE, ARM64, ocho CPU lógicas.
- 7.47 GiB de RAM física observada.
- Pantalla física 1080×2388 a 480 dpi.
- Wi‑Fi, Wi‑Fi Direct, Passpoint, Bluetooth/BLE, NFC/MIFARE, GPS, IMS y USB OTG.
- Camera2 FULL con RAW, controles manuales, frontal, autofocus y flash declarados.
- Acelerómetro MIR3DA, magnetómetro QST, luz AMS, proximidad Huawei, pasos, movimiento, orientación y vectores geomagnéticos.
- OpenGL ES 3.x/AEP y Vulkan 1.1 declarados.
- Cifrado por archivos, Treble, Verified Boot verde y bootloader bloqueado.

Una feature declarada indica compatibilidad del framework, no garantiza que toda app, operador, cámara o accesorio la exponga de igual manera.

## Límites deliberados

El toolkit no incluye escaneo de redes ajenas, extracción de credenciales, bypass del bloqueo, lectura de conversaciones, activación clandestina de cámara/micrófono, escalada de privilegios, desbloqueo del bootloader ni escritura de particiones. Esas acciones exceden un administrador legítimo de dispositivo y pueden destruir datos o comprometer a terceros.
