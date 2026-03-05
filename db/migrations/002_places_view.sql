-- View to expose full place data via Supabase REST API
-- PostgREST serves views as endpoints automatically

CREATE OR REPLACE VIEW places_full AS
SELECT
    p.id,
    p.name,
    p.description,
    p.google_maps_url,
    p.is_verified,
    p.is_active,
    pc.category,
    pc.icon as category_icon,
    ST_Y(pl.location::geometry) as latitude,
    ST_X(pl.location::geometry) as longitude,
    pl.address,
    pl.area,
    pl.postcode,
    -- Workspace details
    wd.coffee_price_gbp,
    wd.min_spend_gbp,
    wd.has_free_option,
    wd.typical_stay_mins,
    wd.max_stay_mins,
    wd.stay_notes,
    wd.has_wifi,
    wd.wifi_speed_mbps,
    wd.wifi_reliable,
    wd.has_plugs,
    wd.plug_quantity,
    wd.seating_size,
    wd.noise_level,
    wd.has_outdoor_seating,
    wd.has_standing_desks,
    wd.has_meeting_rooms,
    wd.busyness_notes,
    wd.best_times,
    wd.peak_times,
    wd.has_toilets,
    wd.has_food,
    wd.food_notes,
    wd.laptop_friendly_score,
    wd.notes as workspace_notes,
    -- Social links
    pwl.website_url,
    pwl.instagram_url,
    pwl.x_url,
    pwl.facebook_url,
    pwl.tiktok_url
FROM places p
LEFT JOIN place_categories pc ON p.category_id = pc.id
LEFT JOIN place_locations pl ON pl.place_id = p.id AND pl.is_primary = true
LEFT JOIN workspace_details wd ON wd.place_id = p.id
LEFT JOIN place_web_links pwl ON pwl.place_id = p.id
WHERE p.is_active = true;

-- Grant access to anon and authenticated roles for PostgREST
GRANT SELECT ON places_full TO anon;
GRANT SELECT ON places_full TO authenticated;

-- Also expose opening hours and reviews directly
GRANT SELECT ON place_opening_hours TO anon;
GRANT SELECT ON place_opening_hours TO authenticated;
GRANT SELECT ON place_reviews TO anon;
GRANT SELECT ON place_reviews TO authenticated;
GRANT SELECT ON place_categories TO anon;
GRANT SELECT ON place_categories TO authenticated;
