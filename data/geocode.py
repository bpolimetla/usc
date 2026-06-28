#!/usr/bin/env python3
"""Convert data-enriched.csv → ../ui/src/data/apts.json with lat/lng."""
import csv, json, time, re, urllib.request, urllib.parse
from pathlib import Path

DIR      = Path(__file__).parent
CSV_IN   = DIR / "data-enriched.csv"
JSON_OUT = (DIR / "../ui/src/data/apts.json").resolve()

# Reuse known lat/lng to avoid unnecessary Nominatim calls
try:
    with open(JSON_OUT) as f:
        existing = {a["name"]: a for a in json.load(f)}
except Exception:
    existing = {}

def geocode(address):
    q = urllib.parse.urlencode({"q": address, "format": "json", "limit": 1})
    url = f"https://nominatim.openstreetmap.org/search?{q}"
    req = urllib.request.Request(url, headers={"User-Agent": "usc-housing-geocoder/1.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read())
    if data:
        return float(data[0]["lat"]), float(data[0]["lon"])
    return None, None

def safe_float(v):
    try:
        return float(str(v).strip())
    except Exception:
        return None

with open(CSV_IN, newline="", encoding="utf-8") as f:
    text = f.read()

# Fix unquoted commas in dollar amounts (e.g. $1,250/mo)
text = re.sub(r',(\$[\d,]+[^,"\n]*),', r',"\1",', text)

apts = []
for row in csv.DictReader(text.splitlines()):
    row = {k: v for k, v in row.items() if k is not None}

    name     = (row.get("Apartment Name") or "").strip()
    address  = (row.get("Address") or "").strip()
    website  = (row.get("Website") or "").strip()
    rent     = (row.get("Rent (2x2 Est.)") or "").strip()
    rating   = safe_float(row.get("Star Rating") or "")
    comments = (row.get("Comments") or "").strip()
    exact    = (row.get("Exact Postal Address") or "").strip()
    dist     = safe_float(row.get("Distance (miles)") or "")
    drive    = (row.get("Driving Time (Mon 8AM)") or "").strip()

    if not name:
        continue

    prev = existing.get(name)
    if prev and prev.get("exactAddress") == exact and prev.get("lat") is not None:
        lat, lng = prev["lat"], prev["lng"]
        print(f"  reuse   {name}")
    else:
        geo_addr = exact or address
        print(f"  geocode {name} → {geo_addr}")
        lat, lng = geocode(geo_addr)
        time.sleep(1.1)

    apts.append({
        "name":          name,
        "address":       address,
        "exactAddress":  exact,
        "website":       website,
        "rent":          rent if rent and rent.lower() != "n/a" else None,
        "rating":        rating,
        "comments":      comments,
        "distanceMiles": dist,
        "drivingTime":   drive if drive and drive.lower() != "n/a" else None,
        "lat":           lat,
        "lng":           lng,
    })

with open(JSON_OUT, "w") as f:
    json.dump(apts, f, indent=2)

geocoded = sum(1 for a in apts if a["lat"] is not None)
print(f"\nDone: {len(apts)} apartments, {geocoded} geocoded → {JSON_OUT}")
