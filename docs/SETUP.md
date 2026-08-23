# מדריך Setup — Plant Manager

## שלב 1: Supabase (DB + Auth)

1. היכנסי ל-[supabase.com](https://supabase.com) → **New project**
2. שמרי את **Database password** במקום בטוח (לא ב-Git!)
3. אחרי שהפרויקט מוכן:
   - **Project Settings → API** — העתיקי:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (סודי! רק בשרת)
4. **Authentication → Providers → Email** — ודאי ש-Email מופעל
5. **SQL Editor** — הדביקי והריצי את `supabase/schema.sql`

## שלב 2: Gemini API

1. היכנסי ל-[aistudio.google.com](https://aistudio.google.com)
2. **Get API key** → Create API key
3. שמרי ב-`.env.local` כ-`GEMINI_API_KEY`

> **חשוב:** מפתח Gemini לא יופיע ב-Frontend — רק ב-API Routes בשרת.

## שלב 3: משתני סביבה מקומיים

```powershell
Copy-Item .env.example .env.local
# ערכי את .env.local עם המפתחות האמיתיים
```

`.env.local` **לא** עולה ל-Git — מוגן ב-`.gitignore`.

## שלב 4: הרצה מקומית

```powershell
npm install
npm run dev
```

פתחי [http://localhost:3000](http://localhost:3000)

## שלב 5: GitHub (פרטי!)

ה-repo נוצר כ-**Private** — לא public.

לפני כל push:
```powershell
npm run check-secrets
```

## שלב 6: Vercel (Deploy)

1. [vercel.com/new](https://vercel.com/new) → Import מה-GitHub repo
2. **Environment Variables** — הוסיפי את כל המשתנים מ-`.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
3. Deploy

> ב-Vercel המפתחות נשמרים מוצפנים — לא בקוד.

## שלב 7 (עתידי): Resend — מיילים

1. [resend.com](https://resend.com) → API Key
2. הוסיפי `RESEND_API_KEY` ל-`.env.local` ול-Vercel

---

## כללי אבטחה

| ✅ כן | ❌ לא |
|------|------|
| `.env.local` (מקומי) | `.env.local` ב-Git |
| `.env.example` (תבנית בלי מפתחות) | מפתחות בקוד |
| `GEMINI_API_KEY` רק ב-API Routes | `NEXT_PUBLIC_GEMINI_*` |
| Repo **Private** ב-GitHub | Repo Public עם secrets |
| `npm run check-secrets` לפני push | push ישיר בלי בדיקה |

## איפה כל מפתח חי

```
Frontend (דפדפן)     → NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
Server (API Routes)  → GEMINI_API_KEY, SUPABASE_SERVICE_ROLE_KEY
Vercel Dashboard     → כל המשתנים (מוצפן)
GitHub               → רק קוד + .env.example (בלי ערכים אמיתיים)
```
