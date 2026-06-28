#!/usr/bin/env python3
"""
Add driving distance and Monday 8 AM driving time from each apartment
to Olin Hall, USC (3650 McClintock Ave, Los Angeles, CA 90089).
One OpenAI web-search call per row.
"""

import csv
import json
import os
import re
import time
from openai import OpenAI

INPUT_FILE = "data/data-enriched.csv"
OUTPUT_FILE = "data/data-enriched.csv"

DESTINATION = "Olin Hall, 3650 McClintock Ave, Los Angeles, CA 90089"

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])


def get_commute(origin: str) -> dict:
    prompt = f"""Use Google Maps to find the commute from this apartment to USC Olin Hall.

From: {origin}
To: {DESTINATION}

Return ONLY this JSON (no markdown, no extra text):
{{
  "distance_miles": "<driving distance in miles, e.g. 1.2>",
  "driving_time_mon_8am": "<typical driving time on Monday at 8 AM including traffic, e.g. 8 min>"
}}

Rules:
- Use real Google Maps driving directions.
- For driving_time_mon_8am, use typical Monday 8 AM rush-hour traffic conditions.
- distance_miles should be a decimal number only (no units in the value).
- driving_time_mon_8am should be a human-readable string like "12 min" or "25 min".
- Do NOT assume. If not found, use null.
"""

    response = client.chat.completions.create(
        model="gpt-4o-search-preview",
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.choices[0].message.content.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        print(f"  [WARN] No JSON found. Raw: {text[:200]}")
        return {}

    try:
        return json.loads(match.group())
    except json.JSONDecodeError as e:
        print(f"  [WARN] JSON error: {e}")
        return {}


def main():
    with open(INPUT_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        original_fields = reader.fieldnames
        rows = list(reader)

    out_fields = [f for f in original_fields if f is not None] + [
        "Distance (miles)",
        "Driving Time (Mon 8AM)",
    ]
    results = []

    for i, row in enumerate(rows):
        row = {k: v for k, v in row.items() if k is not None}
        origin = row.get("Exact Postal Address") or row.get("Address", "")
        name = row["Apartment Name"]

        print(f"[{i + 1}/{len(rows)}] {name}")
        print(f"  from: {origin}")

        data = get_commute(origin)

        new_row = dict(row)
        new_row["Distance (miles)"] = data.get("distance_miles") or "N/A"
        new_row["Driving Time (Mon 8AM)"] = data.get("driving_time_mon_8am") or "N/A"

        print(f"  distance={new_row['Distance (miles)']}  drive={new_row['Driving Time (Mon 8AM)']}")
        results.append(new_row)

        if i < len(rows) - 1:
            time.sleep(1)

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out_fields)
        writer.writeheader()
        writer.writerows(results)

    print(f"\nDone. {len(results)} rows -> {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
