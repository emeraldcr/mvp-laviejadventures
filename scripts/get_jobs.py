"""List every job saved by the CV page (MongoDB collection cv_generations).
Usage:  python scripts/get_jobs.py [--json]
Reads MONGODB_URI / MONGODB_DB from .env.local in the project root.
"""
import json, sys
from pathlib import Path
from pymongo import MongoClient

def load_env():
    env = {}
    p = Path(__file__).resolve().parent.parent / ".env.local"
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def main():
    env = load_env()
    client = MongoClient(env["MONGODB_URI"], serverSelectionTimeoutMS=10000)
    db = client[env.get("MONGODB_DB") or "lva"]
    jobs = list(db["cv_generations"].find({}).sort("createdAt", -1))
    if "--json" in sys.argv:
        print(json.dumps(jobs, default=str, indent=2, ensure_ascii=False))
        return
    print(f"{len(jobs)} jobs found\n")
    for j in jobs:
        desc = (j.get("jobDescription") or "").strip().replace("\n", " ")
        print(f"- {j.get('createdAt')} | {j.get('status')} | {j['_id']}")
        print(f"  {desc[:200]}{'...' if len(desc) > 200 else ''}\n")

if __name__ == "__main__":
    main()
