# Plant Tracker 🌿

**Live:** [plant-tracker-dun.vercel.app](https://plant-tracker-dun.vercel.app)

A personal (and shared) plant-care app for home plants: photograph a plant, let AI identify it, organize plants by room, and know when each one needs water.

## Why it exists

Keeping plants alive usually means scattered notes, guesswork about watering, and “wait, when did I last water this?”  
Plant Tracker turns that into one simple dashboard: your plants, their rooms, and a clear watering status — including a household you can share with a partner.

## What you can do

- **Add a plant from a photo** — upload a picture; Gemini suggests the plant name and care defaults (you confirm before saving)
- **Organize by room** — living room, garden, entrance, etc.
- **See watering status at a glance** — who needs water now vs. who’s fine
- **Tap “I watered today”** — resets the timer for everyone in the household
- **Share a household** — create a home, invite with a code, manage the same plants together

## How it works (user flow)

1. **Sign up / log in**
2. **Create a household** (or join with an invite code)
3. **Add a plant** → photo → AI identification → confirm name / light / watering → choose a room → save
4. **Dashboard** shows plants by room with watering status
5. After watering in real life → **“I watered today”** updates the schedule for the whole household

## Product notes

- Built as a personal product for day-to-day use (not a demo-only toy)
- Care tips and watering intervals come from the AI identification step, then stay editable
- Email watering alerts are planned as a later enhancement

---

## For developers

### Stack

| Layer | Tech |
|-------|------|
| App | Next.js 16, React, Tailwind |
| Auth + DB + Storage | Supabase |
| AI | Gemini (server-side only) |
| Deploy | Vercel |

### Quick start

```bash
copy .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` using [docs/SETUP.md](docs/SETUP.md).  
Full product spec: [docs/PRD.txt](docs/PRD.txt)

### Security

- Never commit `.env.local`
- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` stay server-side (never `NEXT_PUBLIC_`)
- Run `npm run check-secrets` before pushing
