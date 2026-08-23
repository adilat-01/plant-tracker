# Plant Manager 🌿

מערכת אישית לניהול ומעקב אחר צמחי בית — עם זיהוי AI, בתים משותפים, והתראות השקיה.

## Tech Stack

- **Frontend:** Next.js 16 + React + Tailwind
- **Auth & DB:** Supabase
- **AI:** Gemini API (זיהוי צמחים מתמונה)
- **Deploy:** Vercel
- **Repo:** GitHub (private)

## Quick Start

```bash
cp .env.example .env.local   # Windows: Copy-Item .env.example .env.local
# Fill in keys — see docs/SETUP.md
npm install
npm run dev
```

## Security

- Never commit `.env.local` or real API keys
- Run `npm run check-secrets` before pushing
- `GEMINI_API_KEY` is server-side only (never `NEXT_PUBLIC_`)

Full setup guide: [docs/SETUP.md](docs/SETUP.md)  
Product spec: [docs/PRD.txt](docs/PRD.txt)
