#!/usr/bin/env python3
"""Read-only inventory tool for VIMOQ M9010 / UNISOC firmware dumps.

This does not connect to or flash a phone. It inventories files already copied
to disk, records hashes, finds common firmware signatures, extracts printable
strings, and estimates entropy to help identify compressed/encrypted regions.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from collections import Counter
from pathlib import Path
from typing import Any


SIGNATURES = {
    b"UBI#": "UBI image",
    b"hsqs": "SquashFS (little-endian)",
    b"sqsh": "SquashFS (big-endian)",
    b"ANDROID!": "Android boot image",
    b"VNDRBOOT": "Android vendor boot image",
    b"PK\x03\x04": "ZIP container",
    b"\x1f\x8b\x08": "gzip stream",
    b"7z\xbc\xaf\x27\x1c": "7-Zip archive",
    b"ELF": "ELF marker",
    b"MOCOR": "Mocor marker",
    b"SPRD": "Spreadtrum/UNISOC marker",
    b"SCI1": "Spreadtrum/UNISOC image marker",
}

INTERESTING_STRING = re.compile(
    rb"(?:MOCOR|SPRD|UNISOC|Spreadtrum|version|build|IMEI|NVITEM|LTE|VoLTE|Bluetooth|"
    rb"camera|factory|calibration|partition|boot|download|FOTA|update)",
    re.IGNORECASE,
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def entropy(sample: bytes) -> float:
    if not sample:
        return 0.0
    counts = Counter(sample)
    size = len(sample)
    return -sum((count / size) * math.log2(count / size) for count in counts.values())


def find_signatures(data: bytes) -> list[dict[str, Any]]:
    hits: list[dict[str, Any]] = []
    for signature, label in SIGNATURES.items():
        offset = data.find(signature)
        while offset >= 0 and len(hits) < 200:
            hits.append({"offset": offset, "offset_hex": hex(offset), "type": label})
            offset = data.find(signature, offset + 1)
    return sorted(hits, key=lambda item: item["offset"])


def extract_strings(data: bytes, minimum: int = 6) -> list[str]:
    strings = re.findall(rb"[\x20-\x7e]{%d,}" % minimum, data)
    selected = []
    for value in strings:
        if INTERESTING_STRING.search(value):
            selected.append(value[:300].decode("ascii", errors="replace"))
        if len(selected) >= 500:
            break
    return selected


def inspect_file(path: Path) -> dict[str, Any]:
    data = path.read_bytes()
    sample = data if len(data) <= 16 * 1024 * 1024 else data[: 8 * 1024 * 1024] + data[-8 * 1024 * 1024 :]
    return {
        "path": str(path),
        "size_bytes": len(data),
        "sha256": sha256(path),
        "sample_entropy_bits_per_byte": round(entropy(sample), 4),
        "signatures": find_signatures(data),
        "interesting_strings": extract_strings(data),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Inventory VIMOQ/UNISOC firmware files without modifying them.")
    parser.add_argument("input", type=Path, help="Firmware file or directory containing a dump")
    parser.add_argument("--output", type=Path, default=Path("firmware-report.json"))
    args = parser.parse_args()

    if not args.input.exists():
        parser.error(f"Input does not exist: {args.input}")

    files = [args.input] if args.input.is_file() else sorted(p for p in args.input.rglob("*") if p.is_file())
    report = {
        "device_target": "VIMOQ M9010 / UNISOC T107",
        "mode": "read-only static analysis",
        "files": [inspect_file(path) for path in files],
    }
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Analyzed {len(files)} file(s). Report: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
