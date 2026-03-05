# WhereToWork Deployment

Frontend on Vercel, backend on Railway. Both deploy from GitHub repo `Shelfonfire/WhereToWork`.

## Frontend (Vercel)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Shelfonfire/WhereToWork` GitHub repo
3. Configure:
   - **Project Name:** `wheretowork`
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://<your-railway-backend-url>` (set after Railway deploy)
5. Deploy

### CLI alternative

```bash
cd frontend
vercel link  # select Shelfonfire/WhereToWork, set root to frontend
vercel env add NEXT_PUBLIC_API_URL  # paste Railway backend URL
vercel --prod
```

## Backend (Railway)

1. Go to [railway.app/new](https://railway.app/new)
2. Deploy from `Shelfonfire/WhereToWork` GitHub repo
3. Set **Root Directory** to `backend`
4. Add environment variables:
   - `DATABASE_URL` = your Supabase/Postgres direct connection string
   - `DATABASE_POOLER_URL` = your Supabase/Postgres pooler connection string
   - `FRONTEND_URL` = `https://wheretowork.vercel.app`
   - `FRONTEND_URLS` = `https://wheretowork.vercel.app,http://localhost:3000`
5. Railway auto-detects Python + `requirements.txt` via nixpacks
6. Deploy

### CLI alternative

```bash
cd backend
railway link  # select your project
railway variables set DATABASE_URL="..."
railway variables set DATABASE_POOLER_URL="..."
railway variables set FRONTEND_URL="https://wheretowork.vercel.app"
railway variables set FRONTEND_URLS="https://wheretowork.vercel.app,http://localhost:3000"
railway up
```

## Post-deploy

1. Copy Railway backend URL (e.g. `https://wheretowork-production.up.railway.app`)
2. Set `NEXT_PUBLIC_API_URL` on Vercel to that URL
3. Redeploy frontend on Vercel
