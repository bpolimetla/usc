# Data Scripts

All scripts are run from the **project root** (`/usc/`), not from this folder.

---

## API Key Setup

Scripts that call OpenAI (`enrich.py`, `add_distance.py`) require an `OPENAI_API_KEY`.
Set it in `set.sh` at the project root, then source it before running:

```bash
source set.sh
```

> `set.sh` is listed in `.gitignore` and will never be committed.

---

## Scripts

### 1. `enrich.py` — Enrich raw apartment data

**Input:** `data/data.csv`
**Output:** `data/data-enriched.csv`

Reads each apartment row from `data.csv` and makes one OpenAI web-search API call per row to fetch:
- Google star rating
- 2BR/2BA rent estimate (only if the original value is N/A)
- Exact postal address

```bash
source set.sh
python3 data/enrich.py
```

---

### 2. `add_distance.py` — Add driving distance & time to Olin Hall

**Input:** `data/data-enriched.csv`
**Output:** `data/data-enriched.csv` (updated in place)

Reads each apartment from `data-enriched.csv` and makes one OpenAI web-search API call per row to calculate:
- **Distance (miles)** — straight driving distance to Olin Hall (3650 McClintock Ave, USC)
- **Driving Time (Mon 8AM)** — estimated drive time on a Monday at 8 AM

```bash
source set.sh
python3 data/add_distance.py
```

---

### 3. `geocode.py` — Generate `apts.json` for the UI

**Input:** `data/data-enriched.csv`
**Output:** `ui/src/data/apts.json`

Converts the enriched CSV into the JSON file consumed by the React UI. Uses the [Nominatim](https://nominatim.openstreetmap.org/) (OpenStreetMap) API to geocode lat/lng for each apartment. Reuses existing coordinates from `apts.json` to avoid redundant requests (Nominatim enforces a 1 req/sec rate limit).

No API key required.

```bash
python3 data/geocode.py
```

Run this any time you edit `data-enriched.csv` (e.g. after updating ratings or addresses) to sync the UI data.

---

## Typical Workflow

```
# First time: build the enriched dataset
source set.sh
python3 data/enrich.py
python3 data/add_distance.py

# Any time ratings/addresses change: update the UI data
python3 data/geocode.py
```
