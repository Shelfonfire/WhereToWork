"""
Import places from source CSV into WhereToWork Supabase DB.
Maps CSV columns -> places, place_locations, workspace_details, place_web_links.
Uses Nominatim geocoding with "London, UK" suffix.
"""

import csv
import sys
import os
import re
import time
import argparse
import logging

# Add backend to path for database.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
from database import get_db_connection

from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

CSV_FILE = os.path.join(os.path.dirname(__file__), "source_data_csv.csv")

# Nominatim requires a user agent
geolocator = Nominatim(user_agent="wheretowork-import", timeout=10)

# £ symbol mapping to approximate min_spend_gbp
PRICE_MAP = {
    "£": 3.00,
    "£-££": 4.00,
    "£ to ££": 4.00,
    "££": 6.00,
    "££ - £££": 8.00,
    "££ to £££": 8.00,
    "£££": 10.00,
    "£££ (4.70 for a tea and a juice)": 10.00,
    "£££ (compared to a cafe)": 10.00,
}


def geocode_area(area: str) -> tuple:
    """Geocode an area name, appending 'London, UK'. Returns (lat, lon) or (None, None)."""
    if not area:
        return None, None
    query = f"{area}, London, UK"
    try:
        time.sleep(1.1)  # Nominatim rate limit: 1 req/sec
        location = geolocator.geocode(query)
        if location:
            logger.info(f"  Geocoded '{area}' -> ({location.latitude:.5f}, {location.longitude:.5f})")
            return location.latitude, location.longitude
        else:
            logger.warning(f"  Could not geocode '{area}'")
            return None, None
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        logger.warning(f"  Geocoding error for '{area}': {e}")
        return None, None


def parse_coffee_price(raw: str) -> float | None:
    """Extract numeric coffee price from strings like '£3.50', '2', '£2.50 ish'."""
    if not raw or not raw.strip():
        return None
    raw = raw.strip()
    match = re.search(r"£?(\d+(?:\.\d+)?)", raw)
    if match:
        return float(match.group(1))
    return None


def parse_stars(raw: str) -> int | None:
    """Parse STARS column to laptop_friendly_score (1-5 int)."""
    if not raw or not raw.strip():
        return None
    try:
        val = float(raw.strip())
        score = max(1, min(5, round(val)))
        return score
    except ValueError:
        return None


def parse_wifi_quality(raw: str) -> tuple:
    """Parse WIFI text -> (has_wifi: bool, wifi_reliable: bool|None)."""
    if not raw or not raw.strip():
        return None, None
    low = raw.strip().lower()
    if low in ("no", "none", ""):
        return False, False

    has_wifi = True
    reliable = None
    if any(w in low for w in ("excellent", "very good", "great", "good and consistent", "always strong")):
        reliable = True
    elif any(w in low for w in ("awful", "horrible", "dodgy", "patchy", "flaky", "slow", "unreliable")):
        reliable = False
    elif any(w in low for w in ("good", "decent", "fine", "pretty good", "ok", "solid")):
        reliable = True

    return has_wifi, reliable


def parse_plugs(raw: str) -> tuple:
    """Parse PLUG SOCKETS -> (has_plugs: bool|None, plug_quantity: str|None)."""
    if not raw or not raw.strip():
        return None, None
    low = raw.strip().lower()
    if low in ("no", "none"):
        return False, None
    has_plugs = True
    quantity = raw.strip() if raw.strip() else None
    if any(w in low for w in ("plenty", "plentiful", "lots", "yes")):
        quantity = "plenty"
    elif "limited" in low or "few" in low:
        quantity = "limited"
    elif "some" in low:
        quantity = "some"
    return has_plugs, quantity


def parse_price_bracket(raw: str) -> float | None:
    """Map £/££/£££ string to min_spend_gbp."""
    if not raw or not raw.strip():
        return None
    cleaned = raw.strip().split("(")[0].strip()  # remove parenthetical
    # Direct lookup
    if cleaned in PRICE_MAP:
        return PRICE_MAP[cleaned]
    # Count £ signs
    count = cleaned.count("£")
    if count == 1:
        return 3.00
    elif count == 2:
        return 6.00
    elif count >= 3:
        return 10.00
    return None


def guess_category_id(name: str, description: str, notes: str) -> int:
    """Guess place_categories.id from name/notes heuristics."""
    combined = f"{name} {description} {notes}".lower()
    if "library" in combined:
        return 3  # Library
    if "hotel" in combined or "lobby" in combined:
        return 4  # Hotel Lobby
    if any(w in combined for w in ("pub", "bar", "tavern", "arms", "lion", "head")):
        return 6  # Pub
    if any(w in combined for w in ("waterstones", "waterstone", "foyles", "bookshop")):
        return 7  # Bookshop Cafe
    if "co-work" in combined or "cowork" in combined or "campus" in combined:
        return 2  # Co-working
    if "restaurant" in combined or "dining" in combined:
        return 5  # Restaurant
    return 1  # Default: Cafe


def import_row(cur, row: dict, dry_run: bool) -> bool:
    """Import one CSV row. Returns True if inserted, False if skipped/error."""
    name = (row.get("VENUE") or "").strip()
    if not name:
        return False

    area = (row.get(" Area") or row.get("Area") or "").strip()
    # Clean emoji from area
    area_clean = re.sub(r'[^\w\s/\'-]', '', area).strip()

    website = (row.get("WEBSITE LINK") or "").strip()
    wifi_raw = (row.get("WIFI") or "").strip()
    plugs_raw = (row.get("PLUG SOCKETS") or "").strip()
    price_raw = (row.get("£") or "").strip()
    staff_raw = (row.get("STAFF") or "").strip()
    stars_raw = (row.get("STARS") or "").strip()
    coffee_raw = (row.get("PRICE OF A CUP OF COFFEE") or "").strip()
    accessible_raw = (row.get("ACCESSIBLE? (steps etc)") or "").strip()
    anything_else = (row.get("ANYTHING ELSE?") or "").strip()
    menu_raw = (row.get("MENU") or "").strip()
    where_raw = (row.get("Where") or "").strip()

    # Check duplicate
    cur.execute("SELECT id FROM places WHERE LOWER(name) = LOWER(%s)", (name,))
    if cur.fetchone():
        logger.info(f"  SKIP (duplicate): {name}")
        return False

    # Parse fields
    has_wifi, wifi_reliable = parse_wifi_quality(wifi_raw)
    has_plugs, plug_quantity = parse_plugs(plugs_raw)
    min_spend = parse_price_bracket(price_raw)
    laptop_score = parse_stars(stars_raw)
    coffee_price = parse_coffee_price(coffee_raw)

    # Build notes from STAFF + ANYTHING ELSE + ACCESSIBLE
    notes_parts = []
    if staff_raw:
        notes_parts.append(f"Staff: {staff_raw}")
    if anything_else:
        notes_parts.append(f"Notes: {anything_else}")
    if accessible_raw:
        notes_parts.append(f"Accessibility: {accessible_raw}")
    notes = "\n".join(notes_parts) if notes_parts else None

    # Build description from menu
    description = menu_raw if menu_raw else None

    category_id = guess_category_id(name, description or "", notes or "")

    # Geocode
    lat, lon = geocode_area(area_clean)

    if dry_run:
        logger.info(f"  DRY RUN: would insert '{name}' area='{area_clean}' cat={category_id} "
                     f"lat={lat} lon={lon} wifi={has_wifi} plugs={has_plugs} "
                     f"price={min_spend} score={laptop_score} coffee={coffee_price}")
        return True

    # Insert place
    cur.execute(
        """INSERT INTO places (name, description, category_id, is_verified, is_active)
           VALUES (%s, %s, %s, false, true) RETURNING id""",
        (name, description, category_id)
    )
    place_id = cur.fetchone()[0]

    # Insert place_locations
    if lat is not None and lon is not None:
        cur.execute(
            """INSERT INTO place_locations (place_id, location, area, is_primary)
               VALUES (%s, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, %s, true)""",
            (place_id, lon, lat, area_clean)
        )
    else:
        cur.execute(
            """INSERT INTO place_locations (place_id, area, is_primary)
               VALUES (%s, %s, true)""",
            (place_id, area_clean)
        )

    # Insert workspace_details
    cur.execute(
        """INSERT INTO workspace_details
           (place_id, coffee_price_gbp, min_spend_gbp, has_wifi, wifi_reliable,
            has_plugs, plug_quantity, has_food, food_notes, laptop_friendly_score, notes)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (place_id, coffee_price, min_spend, has_wifi, wifi_reliable,
         has_plugs, plug_quantity,
         True if menu_raw else None, menu_raw or None,
         laptop_score, notes)
    )

    # Insert place_web_links if website exists
    if website and website not in ("t",):  # filter junk
        # Ensure URL has scheme
        url = website if website.startswith("http") else f"http://{website}"
        cur.execute(
            """INSERT INTO place_web_links (place_id, website_url)
               VALUES (%s, %s)""",
            (place_id, url)
        )

    logger.info(f"  INSERTED: {name} (id={place_id})")
    return True


def main():
    parser = argparse.ArgumentParser(description="Import places from CSV into WhereToWork DB")
    parser.add_argument("--dry-run", action="store_true", help="Parse and geocode but don't write to DB")
    parser.add_argument("--csv", default=CSV_FILE, help="Path to CSV file")
    args = parser.parse_args()

    # Read CSV
    rows = []
    with open(args.csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            venue = (row.get("VENUE") or "").strip()
            if venue:
                rows.append(row)

    logger.info(f"Found {len(rows)} venues in CSV")

    if args.dry_run:
        logger.info("=== DRY RUN MODE ===")

    conn = get_db_connection()
    cur = conn.cursor()

    inserted = 0
    skipped = 0
    errors = 0

    try:
        for i, row in enumerate(rows, 1):
            venue = (row.get("VENUE") or "").strip()
            logger.info(f"[{i}/{len(rows)}] {venue}")
            try:
                if import_row(cur, row, args.dry_run):
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                logger.error(f"  ERROR: {e}")
                errors += 1
                conn.rollback()
                # Re-open cursor after rollback
                cur = conn.cursor()

        if not args.dry_run:
            conn.commit()
            logger.info("Committed all inserts")
    finally:
        cur.close()
        conn.close()

    logger.info("=" * 50)
    logger.info(f"DONE: {inserted} inserted, {skipped} skipped, {errors} errors")


if __name__ == "__main__":
    main()
