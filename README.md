# Plant Tracker

Live: [plant-tracker-dun.vercel.app](https://plant-tracker-dun.vercel.app)

Personal plant-care app: add plants from a photo, share a household, and get watering reminders.

## Stack

| Layer | Tech |
|-------|------|
| App | Next.js 16, React, Tailwind |
| Auth + DB + Storage | Supabase |
| AI | Gemini (server-side plant ID) |
| Deploy | Vercel |

## Repo layout

```
├── src/                 # App router, components, server actions
├── supabase/            # SQL schema and patches
├── docs/                # SETUP.md, PRD, deploy notes
├── scripts/check-secrets.mjs
└── .env.example
```

## Quick start

```bash
copy .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` using [docs/SETUP.md](docs/SETUP.md).

## Environment variables

| Variable | Client? | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **no** | Server only |
| `GEMINI_API_KEY` | **no** | Server only — never `NEXT_PUBLIC_` |

## Security

- Keep this repo **private**
- Run `npm run check-secrets` before pushing
- Never commit `.env.local`

Product spec: [docs/PRD.txt](docs/PRD.txt)
