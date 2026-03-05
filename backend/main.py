from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv
from supabase_client import supabase_get

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']


def _row_to_place(row: dict, hours_map: dict, review_map: dict) -> PlaceResponse | None:
    if row.get('latitude') is None or row.get('longitude') is None:
        return None

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

    review = review_map.get(row['id'])

    opening_hours = None
    if row['id'] in hours_map:
        opening_hours = hours_map[row['id']]

    return PlaceResponse(
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
        openingHours=opening_hours,
        socialLinks=social,
        reviewSummary=review,
    )


# --- Endpoints ---

@app.get("/")
def root():
    return {"name": "WhereToWork API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/places", response_model=List[PlaceResponse])
def get_places():
    try:
        logger.info("Fetching places from Supabase...")
        rows = supabase_get("places_full", {"select": "*", "order": "name"})
        logger.info(f"Got {len(rows)} rows from places_full")

        # Fetch opening hours
        hours_map: dict = {}
        try:
            hours_rows = supabase_get("place_opening_hours", {
                "select": "place_id,day_of_week,open_time,close_time,is_closed",
                "order": "place_id,day_of_week",
            })
            for hr in hours_rows:
                pid = hr['place_id']
                if pid not in hours_map:
                    hours_map[pid] = []
                if hr.get('is_closed'):
                    hours_map[pid].append(OpeningHour(day=DAYS[hr['day_of_week']], start='00:00', end='00:00'))
                else:
                    hours_map[pid].append(OpeningHour(
                        day=DAYS[hr['day_of_week']],
                        start=str(hr.get('open_time', ''))[:5],
                        end=str(hr.get('close_time', ''))[:5],
                    ))
        except Exception as e:
            logger.warning(f"Failed to fetch opening hours: {e}")

        # Fetch review summaries
        review_map: dict = {}
        try:
            reviews = supabase_get("place_reviews", {"select": "place_id,score"})
            from collections import defaultdict
            scores: dict = defaultdict(list)
            for r in reviews:
                scores[r['place_id']].append(r['score'])
            for pid, score_list in scores.items():
                review_map[pid] = ReviewSummary(
                    averageScore=round(sum(score_list) / len(score_list), 1),
                    reviewCount=len(score_list),
                )
        except Exception as e:
            logger.warning(f"Failed to fetch reviews: {e}")

        places = []
        for row in rows:
            place = _row_to_place(row, hours_map, review_map)
            if place:
                places.append(place)

        logger.info(f"Returning {len(places)} places")
        return places
    except Exception as e:
        logger.error(f"Error in get_places: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/categories")
def get_categories():
    try:
        return supabase_get("place_categories", {"select": "id,category,description,icon", "order": "id"})
    except Exception as e:
        logger.error(f"Error in get_categories: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
