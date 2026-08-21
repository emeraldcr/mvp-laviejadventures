#!/usr/bin/env python3
"""Safe ADB connection manager for USB and Wireless debugging.

Profiles store only an alias and host:port endpoint. Pairing codes, device
serials, credentials, SSIDs, MAC addresses and ADB private keys are never saved.
"""

from __future__ import annotations

import argparse
import getpass
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


DEFAULT_ADB = Path(r"C:\tmp\android-platform-tools\platform-tools\adb.exe")
PROFILE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,31}$")
ENDPOINT = re.compile(r"^(?:\[[0-9A-Fa-f:]+\]|[A-Za-z0-9.-]+):([1-9][0-9]{0,4})$")


def config_path() -> Path:
    root = os.environ.get("LOCALAPPDATA")
    return Path(root) / "mao-lx9-adb" / "connections.json" if root else Path.home() / ".mao-lx9-adb" / "connections.json"


def find_adb(explicit: str | None) -> str:
    for item in (explicit, os.environ.get("ADB_PATH"), shutil.which("adb"), str(DEFAULT_ADB)):
        if item and Path(item).is_file():
            return str(Path(item))
    raise RuntimeError("adb not found; pass --adb PATH")


def adb(executable: str, *args: str, timeout: int = 30) -> str:
    result = subprocess.run(
        [executable, *args], capture_output=True, text=True, encoding="utf-8",
        errors="replace", timeout=timeout, check=False,
    )
    output = "\n".join(part.strip() for part in (result.stdout, result.stderr) if part.strip())
    if result.returncode:
        raise RuntimeError(output or f"adb exited with {result.returncode}")
    return output


def validate_endpoint(value: str) -> str:
    match = ENDPOINT.fullmatch(value.strip())
    if not match or int(match.group(1)) > 65535:
        raise argparse.ArgumentTypeError("endpoint must be host:port (port 1-65535)")
    return value.strip()


def load_profiles() -> dict[str, str]:
    path = config_path()
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in data.items()):
        raise RuntimeError(f"invalid profile file: {path}")
    return data


def save_profiles(profiles: dict[str, str]) -> None:
    path = config_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(profiles, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def resolve_target(value: str, profiles: dict[str, str]) -> str:
    target = profiles.get(value, value)
    return validate_endpoint(target)


def device_rows(executable: str) -> list[tuple[str, str, str]]:
    rows = []
    for line in adb(executable, "devices", "-l").splitlines()[1:]:
        parts = line.split()
        if len(parts) >= 2:
            detail = " ".join(part for part in parts[2:] if not part.startswith("transport_id:"))
            rows.append((parts[0], parts[1], detail))
    return rows


def main() -> int:
    parser = argparse.ArgumentParser(description="Manage authorized ADB USB/Wi-Fi connections without storing secrets")
    parser.add_argument("--adb", help="path to adb executable")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("status", help="show current ADB transports")
    sub.add_parser("profiles", help="list saved endpoint aliases")

    add = sub.add_parser("save", help="save an alias for a host:port endpoint")
    add.add_argument("name")
    add.add_argument("endpoint", type=validate_endpoint)

    forget = sub.add_parser("forget", help="delete a saved alias (does not alter the phone)")
    forget.add_argument("name")

    connect = sub.add_parser("connect", help="connect to a saved alias or host:port")
    connect.add_argument("target")

    disconnect = sub.add_parser("disconnect", help="disconnect a saved alias or host:port")
    disconnect.add_argument("target")

    pair = sub.add_parser("pair", help="pair with Android Wireless debugging; code is prompted and never saved")
    pair.add_argument("endpoint", type=validate_endpoint)

    tcpip = sub.add_parser("tcpip", help="ask an authorized USB device to listen for legacy ADB TCP (less secure)")
    tcpip.add_argument("port", nargs="?", type=int, default=5555)
    tcpip.add_argument("--confirm-insecure", action="store_true", help="required acknowledgement")

    args = parser.parse_args()
    try:
        executable = find_adb(args.adb)
        profiles = load_profiles()
        if args.command == "status":
            rows = device_rows(executable)
            if not rows:
                print("No ADB transports detected.")
            for serial, state, detail in rows:
                kind = "network" if ":" in serial else "usb"
                safe_id = serial if kind == "network" else "[USB serial hidden]"
                print(f"{kind:7} {state:12} {safe_id} {detail}".rstrip())
        elif args.command == "profiles":
            print(f"Profile file: {config_path()}")
            for name, endpoint in sorted(profiles.items()):
                print(f"{name:32} {endpoint}")
        elif args.command == "save":
            if not PROFILE_NAME.fullmatch(args.name):
                raise RuntimeError("profile name must be 1-32 letters, numbers, dot, underscore or dash")
            profiles[args.name] = args.endpoint
            save_profiles(profiles)
            print(f"Saved {args.name} -> {args.endpoint}")
        elif args.command == "forget":
            if args.name not in profiles:
                raise RuntimeError(f"unknown profile: {args.name}")
            del profiles[args.name]
            save_profiles(profiles)
            print(f"Forgot profile {args.name}; phone and ADB keys were not changed")
        elif args.command == "connect":
            print(adb(executable, "connect", resolve_target(args.target, profiles)))
        elif args.command == "disconnect":
            print(adb(executable, "disconnect", resolve_target(args.target, profiles)))
        elif args.command == "pair":
            code = getpass.getpass("Pairing code (not saved): ")
            if not re.fullmatch(r"[0-9]{6}", code):
                raise RuntimeError("pairing code must contain exactly six digits")
            print(adb(executable, "pair", args.endpoint, code))
        elif args.command == "tcpip":
            if not 1024 <= args.port <= 65535:
                raise RuntimeError("port must be between 1024 and 65535")
            if not args.confirm_insecure:
                raise RuntimeError("legacy TCP exposes ADB on the LAN; add --confirm-insecure to continue")
            print(adb(executable, "tcpip", str(args.port)))
            print("Disconnect or disable USB debugging when finished; prefer Android's paired Wireless debugging.")
        return 0
    except (RuntimeError, subprocess.TimeoutExpired, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
