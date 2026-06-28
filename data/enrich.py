#!/usr/bin/env python3
"""
Enrich data.csv with live Google Maps data via OpenAI web search.
One API call per apartment. Fills in missing rent, star rating, and exact address.
"""

import csv
import json
import os
import re
import time
from openai import OpenAI

INPUT_FILE = "data/data.csv"
OUTPUT_FILE = "data/data-enriched.csv"

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])


def enrich(row: dict) -> dict:
    name = row["Apartment Name"]
    address = row["Address"]
    rent = row["Rent (2x2 Est.)"]
    rating = row["Star Rating"]

    prompt = f"""Search Google Maps for this apartment. Return ONLY a JSON object — no markdown, no extra text.

Apartment: {name}
Address: {address}

Required JSON fields:
{{
  "google_star_rating": "<exact Google Maps star rating as a number, e.g. 4.3 — null if not found>",
  "rent_2x2": "<monthly rent for a 2-bedroom 2-bathroom unit in dollars, e.g. $3,200/mo — null if not found>",
  "exact_postal_address": "<full verified mailing address from Google Maps including zip code>"
}}

Rules:
- Do NOT assume or estimate any value.
- Current rent in our data: "{rent}". If it is N/A or missing, search the apartment website or Zillow/Apartments.com for a 2BR/2BA price.
- Current star rating in our data: "{rating}". Get the actual live Google Maps rating.
- For exact_postal_address, use the canonical address shown on Google Maps.
- If a value cannot be found after searching, set it to null.
"""

    response = client.chat.completions.create(
        model="gpt-4o-search-preview",
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.choices[0].message.content.strip()

    # strip markdown fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    # extract JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        print(f"  [WARN] Could not parse JSON for {name}. Raw: {text[:200]}")
        return {}

    try:
        return json.loads(match.group())
    except json.JSONDecodeError as e:
        print(f"  [WARN] JSON decode error for {name}: {e}")
        return {}


def is_valid_rating(value) -> bool:
    try:
        f = float(str(value))
        return 1.0 <= f <= 5.0
    except (ValueError, TypeError):
        return False


def main():
    with open(INPUT_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        original_fields = reader.fieldnames  # captured before iteration
        rows = list(reader)

    # filter out any None keys from malformed CSV rows
    clean_fields = [f for f in original_fields if f is not None]
    out_fields = clean_fields + ["Exact Postal Address"]
    results = []

    for i, row in enumerate(rows):
        # drop any None-keyed extra fields from CSV parse overflow
        row = {k: v for k, v in row.items() if k is not None}

        print(f"[{i + 1}/{len(rows)}] {row['Apartment Name']} ...")
        data = enrich(row)

        new_row = dict(row)

        if data:
            # update star rating only if it's a valid 1.0–5.0 value
            live_rating = data.get("google_star_rating")
            if live_rating and live_rating != "null" and is_valid_rating(live_rating):
                new_row["Star Rating"] = live_rating

            # fill in rent only if currently N/A or empty
            if row["Rent (2x2 Est.)"].strip() in ("N/A", "", "null"):
                live_rent = data.get("rent_2x2")
                if live_rent and live_rent != "null":
                    new_row["Rent (2x2 Est.)"] = live_rent

            # exact postal address
            addr = data.get("exact_postal_address")
            new_row["Exact Postal Address"] = addr if addr and addr != "null" else row["Address"]
        else:
            new_row["Exact Postal Address"] = row["Address"]

        results.append(new_row)
        print(f"  rating={new_row['Star Rating']}  rent={new_row['Rent (2x2 Est.)']}  addr={new_row['Exact Postal Address']}")

        # 1-second pause between calls to avoid rate limits
        if i < len(rows) - 1:
            time.sleep(1)

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out_fields)
        writer.writeheader()
        writer.writerows(results)

    print(f"\nDone. Enriched {len(results)} rows -> {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
