# Deploy checklist — Plant Manager

## 1. Push latest code to GitHub

## 2. Vercel — import project
- https://vercel.com/new → Import `adilat-01/plant-tracker`
- Framework: Next.js (auto-detected)

## 3. Environment Variables (Vercel → Settings → Environment Variables)
Add ALL of these for **Production** and **Preview**:

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — mark Sensitive |
| `GEMINI_API_KEY` | Server only — mark Sensitive |

## 4. Supabase Auth — add production URL
Authentication → URL Configuration:
- **Site URL:** `https://YOUR-APP.vercel.app`
- **Redirect URLs:** `https://YOUR-APP.vercel.app/auth/callback`

## 5. SQL patches (if not run yet)
- `supabase/schema.sql`
- `supabase/patch-storage.sql`

## 6. Redeploy after env vars
Deployments → ... → Redeploy
