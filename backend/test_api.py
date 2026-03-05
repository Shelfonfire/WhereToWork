from supabase_client import supabase_get

cats = supabase_get('place_categories')
print(f'Categories: {len(cats)}')
places = supabase_get('places_full', {'select': 'id,name,latitude,longitude', 'limit': '5'})
print(f'Places: {len(places)}')
for p in places:
    print(f'  - {p["name"]} ({p.get("latitude")}, {p.get("longitude")})')
