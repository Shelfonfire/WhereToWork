# WhereToWork - Next Steps

## Status: Local dev working with 101 places loaded

## Task 1: Deploy (next conversation)

### Vercel (frontend)
1. `cd frontend && npx vercel` or import repo at vercel.com/new
2. Set root directory to `frontend/`
3. Framework preset: Next.js
4. Add env var: `NEXT_PUBLIC_API_URL` = (Railway backend URL, set after Railway deploy)
5. Project name: wheretowork

### Railway (backend)
1. Go to railway.app, New Project > Deploy from GitHub
2. Select WhereToWork repo, set root to `backend/`
3. Add env vars (copy values from `backend/.env`):
   - `DATABASE_URL`, `DATABASE_POOLER_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL` = https://wheretowork.vercel.app
   - `FRONTEND_URLS` = http://localhost:3000
   - `PORT` = 8000
4. After deploy, copy Railway URL and update Vercel's NEXT_PUBLIC_API_URL

### After deploy
- Update FRONTEND_URL on Railway to match actual Vercel URL
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
