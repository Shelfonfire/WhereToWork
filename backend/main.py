from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from database import get_db_connection

load_dotenv()

app = FastAPI(title="WhereToWork API", version="1.0.0")

# CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
extra_urls = os.getenv("FRONTEND_URLS", "")
origins = [frontend_url, "http://localhost:3000"]
if extra_urls:
    origins.extend([u.strip() for u in extra_urls.split(",") if u.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---

class WorkspaceDetails(BaseModel):
    coffeePriceGbp: Optional[float] = None
    minSpendGbp: Optional[float] = None
    hasFreeOption: Optional[bool] = None
    typicalStayMins: Optional[int] = None
    maxStayMins: Optional[int] = None
    stayNotes: Optional[str] = None
    hasWifi: Optional[bool] = None
    wifiSpeedMbps: Optional[int] = None
    wifiReliable: Optional[bool] = None
    hasPlugs: Optional[bool] = None
    plugQuantity: Optional[str] = None
    seatingSize: Optional[str] = None
    noiseLevel: Optional[str] = None
    hasOutdoorSeating: Optional[bool] = None
    hasStandingDesks: Optional[bool] = None
    hasMeetingRooms: Optional[bool] = None
    busynessNotes: Optional[str] = None
    bestTimes: Optional[str] = None
    peakTimes: Optional[str] = None
    hasToilets: Optional[bool] = None
    hasFood: Optional[bool] = None
    foodNotes: Optional[str] = None
    laptopFriendlyScore: Optional[int] = None
    notes: Optional[str] = None

class OpeningHour(BaseModel):
    day: str
    start: str
    end: str

class SocialLinks(BaseModel):
    website: Optional[str] = None
    instagram: Optional[str] = None
    x: Optional[str] = None
    facebook: Optional[str] = None
    tiktok: Optional[str] = None

class ReviewSummary(BaseModel):
    averageScore: Optional[float] = None
    reviewCount: int = 0

class PlaceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    categoryIcon: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    area: Optional[str] = None
    postcode: Optional[str] = None
    googleMapsUrl: Optional[str] = None
    isVerified: bool = False
    workspace: Optional[WorkspaceDetails] = None
    openingHours: Optional[List[OpeningHour]] = None
    socialLinks: Optional[SocialLinks] = None
    reviewSummary: Optional[ReviewSummary] = None


# --- Endpoints ---

@app.get("/")
def root():
    return {"name": "WhereToWork API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/places", response_model=List[PlaceResponse])
def get_places():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT
                p.id, p.name, p.description, p.google_maps_url, p.is_verified,
                pc.category, pc.icon as category_icon,
                ST_Y(pl.location::geometry) as latitude,
                ST_X(pl.location::geometry) as longitude,
                pl.address, pl.area, pl.postcode,
                -- Workspace details
                wd.coffee_price_gbp, wd.min_spend_gbp, wd.has_free_option,
                wd.typical_stay_mins, wd.max_stay_mins, wd.stay_notes,
                wd.has_wifi, wd.wifi_speed_mbps, wd.wifi_reliable,
                wd.has_plugs, wd.plug_quantity,
                wd.seating_size, wd.noise_level,
                wd.has_outdoor_seating, wd.has_standing_desks, wd.has_meeting_rooms,
                wd.busyness_notes, wd.best_times, wd.peak_times,
                wd.has_toilets, wd.has_food, wd.food_notes,
                wd.laptop_friendly_score, wd.notes as workspace_notes,
                -- Social links
                pwl.website_url, pwl.instagram_url, pwl.x_url, pwl.facebook_url, pwl.tiktok_url,
                -- Review summary
                COALESCE(AVG(pr.score), 0) as avg_score,
                COUNT(pr.id) as review_count
            FROM places p
            LEFT JOIN place_categories pc ON p.category_id = pc.id
            LEFT JOIN place_locations pl ON pl.place_id = p.id AND pl.is_primary = true
            LEFT JOIN workspace_details wd ON wd.place_id = p.id
            LEFT JOIN place_web_links pwl ON pwl.place_id = p.id
            LEFT JOIN place_reviews pr ON pr.place_id = p.id
            WHERE p.is_active = true
            GROUP BY p.id, p.name, p.description, p.google_maps_url, p.is_verified,
                     pc.category, pc.icon,
                     pl.location, pl.address, pl.area, pl.postcode,
                     wd.coffee_price_gbp, wd.min_spend_gbp, wd.has_free_option,
                     wd.typical_stay_mins, wd.max_stay_mins, wd.stay_notes,
                     wd.has_wifi, wd.wifi_speed_mbps, wd.wifi_reliable,
                     wd.has_plugs, wd.plug_quantity,
                     wd.seating_size, wd.noise_level,
                     wd.has_outdoor_seating, wd.has_standing_desks, wd.has_meeting_rooms,
                     wd.busyness_notes, wd.best_times, wd.peak_times,
                     wd.has_toilets, wd.has_food, wd.food_notes,
                     wd.laptop_friendly_score, wd.notes,
                     pwl.website_url, pwl.instagram_url, pwl.x_url, pwl.facebook_url, pwl.tiktok_url
            ORDER BY p.name
        """)
        rows = cur.fetchall()

        places = []
        for row in rows:
            if row['latitude'] is None or row['longitude'] is None:
                continue

            workspace = None
            if row.get('has_wifi') is not None or row.get('coffee_price_gbp') is not None:
                workspace = WorkspaceDetails(
                    coffeePriceGbp=row.get('coffee_price_gbp'),
                    minSpendGbp=row.get('min_spend_gbp'),
                    hasFreeOption=row.get('has_free_option'),
                    typicalStayMins=row.get('typical_stay_mins'),
                    maxStayMins=row.get('max_stay_mins'),
                    stayNotes=row.get('stay_notes'),
                    hasWifi=row.get('has_wifi'),
                    wifiSpeedMbps=row.get('wifi_speed_mbps'),
                    wifiReliable=row.get('wifi_reliable'),
                    hasPlugs=row.get('has_plugs'),
                    plugQuantity=row.get('plug_quantity'),
                    seatingSize=row.get('seating_size'),
                    noiseLevel=row.get('noise_level'),
                    hasOutdoorSeating=row.get('has_outdoor_seating'),
                    hasStandingDesks=row.get('has_standing_desks'),
                    hasMeetingRooms=row.get('has_meeting_rooms'),
                    busynessNotes=row.get('busyness_notes'),
                    bestTimes=row.get('best_times'),
                    peakTimes=row.get('peak_times'),
                    hasToilets=row.get('has_toilets'),
                    hasFood=row.get('has_food'),
                    foodNotes=row.get('food_notes'),
                    laptopFriendlyScore=row.get('laptop_friendly_score'),
                    notes=row.get('workspace_notes'),
                )

            social = None
            if any(row.get(k) for k in ['website_url', 'instagram_url', 'x_url', 'facebook_url', 'tiktok_url']):
                social = SocialLinks(
                    website=row.get('website_url'),
                    instagram=row.get('instagram_url'),
                    x=row.get('x_url'),
                    facebook=row.get('facebook_url'),
                    tiktok=row.get('tiktok_url'),
                )

            review_summary = None
            if row['review_count'] > 0:
                review_summary = ReviewSummary(
                    averageScore=round(float(row['avg_score']), 1),
                    reviewCount=row['review_count'],
                )

            places.append(PlaceResponse(
                id=row['id'],
                name=row['name'],
                description=row.get('description'),
                category=row.get('category'),
                categoryIcon=row.get('category_icon'),
                latitude=row['latitude'],
                longitude=row['longitude'],
                address=row.get('address'),
                area=row.get('area'),
                postcode=row.get('postcode'),
                googleMapsUrl=row.get('google_maps_url'),
                isVerified=row.get('is_verified', False),
                workspace=workspace,
                openingHours=None,  # Fetched separately below
                socialLinks=social,
                reviewSummary=review_summary,
            ))

        # Fetch opening hours for all places
        if places:
            place_ids = [p.id for p in places]
            cur.execute("""
                SELECT place_id, day_of_week, open_time, close_time, is_closed
                FROM place_opening_hours
                WHERE place_id = ANY(%s)
                ORDER BY place_id, day_of_week
            """, (place_ids,))
            hours_rows = cur.fetchall()

            days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            hours_map: dict = {}
            for hr in hours_rows:
                pid = hr['place_id']
                if pid not in hours_map:
                    hours_map[pid] = []
                if hr['is_closed']:
                    hours_map[pid].append(OpeningHour(
                        day=days[hr['day_of_week']],
                        start='00:00', end='00:00'
                    ))
                else:
                    hours_map[pid].append(OpeningHour(
                        day=days[hr['day_of_week']],
                        start=str(hr['open_time'])[:5],
                        end=str(hr['close_time'])[:5],
                    ))

            for place in places:
                if place.id in hours_map:
                    place.openingHours = hours_map[place.id]

        return places
    finally:
        conn.close()


@app.get("/categories")
def get_categories():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, category, description, icon FROM place_categories ORDER BY id")
        return cur.fetchall()
    finally:
        conn.close()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
