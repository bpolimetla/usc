# USC Housing

A research tool for finding and evaluating apartments near USC's Olin Hall (3650 McClintock Ave, Los Angeles, CA 90089).

46 apartments enriched with live Google star ratings, 2BR/2BA rent estimates, exact postal addresses, and Monday 8 AM driving times to Olin Hall. Includes an interactive map and sortable table with thumbs up/down voting and CSV export.

---

## Project Structure

```
usc/
├── data/                   # Raw data and Python scripts
│   ├── data.csv            # Original apartment list
│   ├── data-enriched.csv   # Enriched with ratings, rent, addresses, distances
│   ├── enrich.py           # Fetch ratings, rent, addresses via OpenAI
│   ├── add_distance.py     # Add driving distance & time via OpenAI
│   ├── geocode.py          # Generate apts.json for the UI
│   └── README.md           # Script usage guide
├── ui/                     # React web app
│   └── src/
│       └── data/
│           └── apts.json   # Geocoded apartment data consumed by the UI
├── set.sh                  # Export OPENAI_API_KEY (git-ignored)
└── readme.md
```

---

## Quick Start

### 1. Set up API key

Create `set.sh` in the project root:

```bash
export OPENAI_API_KEY="your-key-here"
```

Then source it before running enrichment scripts:

```bash
source set.sh
```

### 2. Run the UI

```bash
cd ui
make install   # first time only
make run       # starts dev server at http://localhost:5173
```

### 3. Update apartment data

If you edit `data/data-enriched.csv` (ratings, rent, etc.), regenerate `apts.json`:

```bash
python3 data/geocode.py
```

Then hard-refresh your browser (Ctrl+Shift+R).

---

## UI Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with links to map and list |
| Apartment Map | `/apts` | Interactive Leaflet map centered on Olin Hall, pins colored by rating |
| Apartments List | `/apts-list` | Sortable, searchable table with all 46 apartments |
| About | `/about` | Search tips and data preparation methodology |

**Features:**
- Rating filter chips (All / 4.5+ / 4.0+ / 3.5+)
- Search by name or address
- Thumbs up / thumbs down voting stored in localStorage
- Download CSV (includes your votes) from the header
- Dark / light mode

---

## Data Pipeline

See `data/README.md` for full details.

```
data.csv → enrich.py → add_distance.py → data-enriched.csv → geocode.py → apts.json
```

| Script | Requires API Key | What it does |
|--------|-----------------|--------------|
| `enrich.py` | OpenAI | Adds ratings, rent estimates, postal addresses |
| `add_distance.py` | OpenAI | Adds driving distance & Mon 8AM time to Olin Hall |
| `geocode.py` | None | Converts CSV to JSON with lat/lng for the map |
