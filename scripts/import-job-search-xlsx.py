"""Convert the Master Jobs worksheet into static TypeScript data.

Usage:
  python scripts/import-job-search-xlsx.py path/to/job-search.xlsx

The spreadsheet is an import source only. The CV job board does not read Excel
or MongoDB at runtime.
"""

from __future__ import annotations

import json
import sys
from datetime import date, datetime
from pathlib import Path

import openpyxl


FIELDS = {
    "id": "Job ID",
    "company": "Company",
    "title": "Role",
    "track": "Primary Track",
    "seniority": "Target / Seniority",
    "stack": "Stack",
    "eligibility": "Eligibility",
    "workMode": "Work Mode",
    "engagement": "Engagement / Evidence",
    "sourcePriority": "Priority",
    "matchScore": "Match Score",
    "locationFit": "Location Fit",
    "contractorSignal": "Contractor Signal",
    "preferenceExclusion": "Preference Exclusion",
    "userSignal": "User Signal",
    "sourceStatus": "Status",
    "firstSeen": "First Seen",
    "lastSeen": "Last Seen",
    "seenCount": "Seen Count",
    "url": "Direct URL",
    "nextStep": "Action / Next Step",
    "recordQuality": "Record Quality",
    "sources": "Seen In Sources",
    "notes": "Notes",
}


def clean(value: object) -> object:
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, str):
        return " ".join(value.replace("\ufffd", "—").split())
    return value


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Pass the source .xlsx path as the only argument.")

    source = Path(sys.argv[1]).resolve()
    workbook = openpyxl.load_workbook(source, read_only=False, data_only=True)
    sheet = workbook["Master Jobs"]
    headers = [cell.value for cell in sheet[1]]
    positions = {name: headers.index(name) for name in FIELDS.values()}

    records: list[dict[str, object]] = []
    for values in sheet.iter_rows(min_row=2, values_only=True):
        if not values[positions["Job ID"]]:
            continue
        record = {
            key: clean(values[positions[column]])
            for key, column in FIELDS.items()
        }
        records.append(record)

    ids = [record["id"] for record in records]
    if len(ids) != len(set(ids)):
        raise SystemExit("Master Jobs contains duplicate Job IDs.")

    destination = Path(__file__).resolve().parents[1] / "app/(page_routes)/cv/data/job-search-records.ts"
    payload = json.dumps(records, ensure_ascii=False, indent=2)
    destination.write_text(
        "// Generated from the Master Jobs worksheet. Do not hand-edit.\n"
        "// Refresh with scripts/import-job-search-xlsx.py. No runtime database is required.\n\n"
        "export type JobSearchRecord = {\n"
        "  id: string;\n"
        "  company: string;\n"
        "  title: string;\n"
        "  track: string;\n"
        "  seniority: string;\n"
        "  stack: string;\n"
        "  eligibility: string;\n"
        "  workMode: string;\n"
        "  engagement: string;\n"
        "  sourcePriority: string;\n"
        "  matchScore: number | string;\n"
        "  locationFit: string;\n"
        "  contractorSignal: string;\n"
        "  preferenceExclusion: string;\n"
        "  userSignal: string;\n"
        "  sourceStatus: string;\n"
        "  firstSeen: string;\n"
        "  lastSeen: string;\n"
        "  seenCount: number | string;\n"
        "  url: string;\n"
        "  nextStep: string;\n"
        "  recordQuality: string;\n"
        "  sources: string;\n"
        "  notes: string;\n"
        "};\n\n"
        f"export const JOB_SEARCH_RECORDS: readonly JobSearchRecord[] = {payload};\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} jobs to {destination}")


if __name__ == "__main__":
    main()
