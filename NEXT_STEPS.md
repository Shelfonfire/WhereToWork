# WhereToWork - Next Steps

## Status: Deployed — frontend live, backend debugging

## Task 1: Deploy

### Vercel (frontend) — DONE
- Live at: https://wheretowork.vercel.app
- Root: `frontend/`, Framework: Next.js
- TODO: set `NEXT_PUBLIC_API_URL` to Railway URL once backend works

### Railway (backend) — 502, needs fix
- URL: https://wheretowork-production.up.railway.app
- Health endpoint was working, now 502 (app not starting)
- Logging added to `main.py` + `supabase_client.py`
- Removed unused `psycopg2`/`geopy` deps
- **Check**: Root directory must be `backend/` in Railway Settings
- **Check**: Env vars set: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT=8000`

### After backend fix
- Set `NEXT_PUBLIC_API_URL` on Vercel = Railway URL
- Set `FRONTEND_URL` on Railway = https://wheretowork.vercel.app
- Test: visit Vercel URL, verify map loads with data

## Task 2: Rotate Supabase password
- Password was shared in chat - rotate at Supabase Dashboard > Settings > Database
- Update DATABASE_URL and DATABASE_POOLER_URL in Railway + backend/.env

## Task 3: Fix 2 places missing coordinates
- "The Observatory" (Bloomsbury/Kings Cross) and "Grounded" (Whitechapel/Aldgate)
- Manually add coords in Supabase dashboard or re-geocode with simpler area names

## Task 4: Polish & iterate
- See FUTURE_FEATURES.md for full roadmap
- High priority: better geocoding (venue-specific not area-level), Google Maps links, mobile responsiveness

## Key files reference
- Schema: `db/migrations/001_initial_schema.sql`
- View: `db/migrations/002_places_view.sql`
- Backend API: `backend/main.py` (uses Supabase REST API)
- Supabase client: `backend/supabase_client.py`
- Import script: `import_places_from_csv.py`
- Deploy guide: `DEPLOY.md`
- Future features: `FUTURE_FEATURES.md`

## Supabase project
- Project: wcnhnqfrhaibgiakhmph
- Region: eu-west-2
- Dashboard: https://supabase.com/dashboard/project/wcnhnqfrhaibgiakhmph
