#!/usr/bin/env python3
"""Read-only ADB capability inventory for the Huawei MAO-LX9.

The default report omits device serials and network identifiers. It performs no
installation, setting change, reboot, file transfer, or partition access.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


DEFAULT_WINDOWS_ADB = Path(r"C:\tmp\android-platform-tools\platform-tools\adb.exe")

PROPERTIES = {
    "manufacturer": "ro.product.manufacturer",
    "model": "ro.product.model",
    "product": "ro.product.name",
    "device": "ro.product.device",
    "android": "ro.build.version.release",
    "api_level": "ro.build.version.sdk",
    "display_build": "ro.build.display.id",
    "incremental_build": "ro.build.version.incremental",
    "security_patch": "ro.build.version.security_patch",
    "build_type": "ro.build.type",
    "build_tags": "ro.build.tags",
    "cpu_abis": "ro.product.cpu.abilist",
    "verified_boot": "ro.boot.verifiedbootstate",
    "flash_locked": "ro.boot.flash.locked",
    "treble": "ro.treble.enabled",
}

CATEGORIES = {
    "network": ("wifi", "bluetooth", "nfc", "telephony", "location", "sip", "ipsec"),
    "camera_audio": ("camera", "audio", "microphone"),
    "sensors_security": ("sensor", "fingerprint", "security", "secure_lock", "encryption", "verified_boot"),
    "graphics_display": ("opengl", "vulkan", "screen", "touchscreen", "secondary_displays", "picture_in_picture", "freeform"),
    "usb": ("usb",),
    "android_software": ("android.software", "app_widgets", "autofill", "webview", "midi", "managed_users"),
    "huawei": ("huawei",),
}


class AdbError(RuntimeError):
    pass


def find_adb(explicit: str | None) -> str:
    candidates = [explicit, os.environ.get("ADB_PATH"), shutil.which("adb")]
    if DEFAULT_WINDOWS_ADB.exists():
        candidates.append(str(DEFAULT_WINDOWS_ADB))
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return str(Path(candidate))
    raise AdbError("adb not found; use --adb PATH or set ADB_PATH")


def run(adb: str, *args: str, timeout: int = 15) -> str:
    try:
        result = subprocess.run(
            [adb, *args], capture_output=True, text=True, timeout=timeout,
            encoding="utf-8", errors="replace", check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise AdbError(f"adb timed out: {' '.join(args)}") from exc
    if result.returncode:
        message = (result.stderr or result.stdout).strip()
        raise AdbError(message or f"adb exited with code {result.returncode}")
    return result.stdout.strip()


def select_device(adb: str) -> None:
    lines = [line for line in run(adb, "devices").splitlines()[1:] if line.strip()]
    states = [line.split(None, 1)[1] if len(line.split(None, 1)) > 1 else "unknown" for line in lines]
    if not lines:
        raise AdbError("no ADB device detected")
    if "unauthorized" in states:
        raise AdbError("device unauthorized; accept the RSA debugging prompt on the unlocked phone")
    ready = [state for state in states if state == "device"]
    if len(ready) != 1:
        raise AdbError(f"expected exactly one authorized device; found {len(ready)}")


def shell(adb: str, *args: str) -> str:
    return run(adb, "shell", *args)


def get_properties(adb: str) -> dict[str, str]:
    return {name: shell(adb, "getprop", prop) for name, prop in PROPERTIES.items()}


def get_features(adb: str) -> dict[str, list[str]]:
    raw = shell(adb, "pm", "list", "features")
    features = sorted(line.removeprefix("feature:") for line in raw.splitlines() if line.startswith("feature:"))
    grouped: dict[str, list[str]] = {name: [] for name in CATEGORIES}
    grouped["other"] = []
    for feature in features:
        destination = "other"
        for category, needles in CATEGORIES.items():
            if any(needle in feature.lower() for needle in needles):
                destination = category
                break
        grouped[destination].append(feature)
    return {name: values for name, values in grouped.items() if values}


def parse_meminfo(adb: str) -> dict[str, Any]:
    raw = shell(adb, "cat", "/proc/meminfo")
    values: dict[str, int] = {}
    for line in raw.splitlines():
        match = re.match(r"(MemTotal|MemAvailable):\s+(\d+) kB", line)
        if match:
            values[match.group(1)] = int(match.group(2))
    return {
        "total_kib": values.get("MemTotal"),
        "available_kib": values.get("MemAvailable"),
    }


def get_wifi_state(adb: str) -> dict[str, bool | str]:
    raw = shell(adb, "cmd", "wifi", "status")
    lower = raw.lower()
    return {
        "enabled": "wifi is enabled" in lower,
        "scanning_always_available": "wifi scanning is always available" in lower,
        "connected": "wifi is connected" in lower and "wifi is not connected" not in lower,
        "privacy_note": "SSID, BSSID, MAC and IP are intentionally omitted",
    }


def get_battery(adb: str) -> dict[str, str]:
    raw = shell(adb, "dumpsys", "battery")
    wanted = {"level", "scale", "status", "health", "plugged", "temperature", "voltage"}
    result: dict[str, str] = {}
    for line in raw.splitlines():
        if ":" in line:
            key, value = (part.strip() for part in line.split(":", 1))
            if key in wanted:
                result[key] = value
    return result


def get_storage(adb: str) -> dict[str, str]:
    raw = shell(adb, "df", "-h", "/data")
    lines = [line.split() for line in raw.splitlines() if line.strip()]
    if len(lines) < 2 or len(lines[-1]) < 6:
        return {"raw": raw}
    row = lines[-1]
    return {"size": row[1], "used": row[2], "available": row[3], "use_percent": row[4]}


def build_report(adb: str, include_packages: bool) -> dict[str, Any]:
    report: dict[str, Any] = {
        "target": "Huawei MAO-LX9",
        "mode": "read-only ADB inventory",
        "privacy": "serial and network identifiers omitted",
        "connection": {"adb_authorized": True},
        "identity_and_build": get_properties(adb),
        "memory": parse_meminfo(adb),
        "storage": get_storage(adb),
        "battery": get_battery(adb),
        "wifi": get_wifi_state(adb),
        "features": get_features(adb),
    }
    if include_packages:
        raw = shell(adb, "pm", "list", "packages")
        report["packages"] = sorted(line.removeprefix("package:") for line in raw.splitlines())
    return report


def print_human(report: dict[str, Any]) -> None:
    props = report["identity_and_build"]
    print(f"Device: {props['manufacturer']} {props['model']} ({props['product']} / {props['device']})")
    print(f"Android: {props['android']} (API {props['api_level']})")
    print(f"Build: {props['display_build']}")
    print(f"Security patch: {props['security_patch']}")
    print(f"Verified boot: {props['verified_boot']} | Flash locked: {props['flash_locked']}")
    print(f"CPU ABIs: {props['cpu_abis']}")
    memory = report["memory"]
    if memory["total_kib"]:
        print(f"RAM: {memory['total_kib'] / 1024 / 1024:.2f} GiB total")
    storage = report["storage"]
    print(f"Storage: {storage.get('used', '?')} used / {storage.get('size', '?')} ({storage.get('available', '?')} available)")
    wifi = report["wifi"]
    print(f"Wi-Fi: enabled={wifi['enabled']} connected={wifi['connected']} scanning={wifi['scanning_always_available']}")
    print("\nCapabilities:")
    for category, features in report["features"].items():
        print(f"  {category} ({len(features)}):")
        for feature in features:
            print(f"    - {feature}")
    if "packages" in report:
        print(f"\nInstalled package names ({len(report['packages'])}):")
        for package in report["packages"]:
            print(f"  - {package}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Read-only Huawei MAO-LX9 capability inventory over ADB")
    parser.add_argument("--adb", help="path to adb executable")
    parser.add_argument("--json", action="store_true", help="print JSON instead of the human report")
    parser.add_argument("--output", type=Path, help="write the selected report format to a file")
    parser.add_argument("--include-packages", action="store_true", help="include installed package names (privacy-sensitive)")
    args = parser.parse_args()
    try:
        adb = find_adb(args.adb)
        select_device(adb)
        report = build_report(adb, args.include_packages)
    except AdbError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    if args.json:
        rendered = json.dumps(report, indent=2, ensure_ascii=False)
        if args.output:
            args.output.write_text(rendered + "\n", encoding="utf-8")
        else:
            print(rendered)
    elif args.output:
        original = sys.stdout
        try:
            with args.output.open("w", encoding="utf-8") as handle:
                sys.stdout = handle
                print_human(report)
        finally:
            sys.stdout = original
    else:
        print_human(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
