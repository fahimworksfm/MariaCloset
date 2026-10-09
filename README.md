# Maria's Closet 👗✨

A vibrant, festive web app for renting out a personal closet of **South Asian
attire** — sarees, anarkalis, lehengas, accessories. Browse the rail as a
**3D carousel** on a jewel-toned, marigold-garlanded stage, open a piece to
inspect it in 3D, check its availability, and send a **request to rent**. A
password-protected **admin** lets the owner upload pieces and arrange them.

Built with **Next.js 14**, **React Three Fiber**, and **Tailwind CSS**.

## Getting started

```bash
npm install
vercel link && vercel env pull .env.local   # Supabase + other env vars
npm run db:migrate   # apply supabase/migrations/*.sql
npm run db:seed      # one-time seed (Vercel builds also run both automatically)
npm run dev
```

Open http://localhost:3000 · admin at http://localhost:3000/admin

## How it works

- **Home (`/`)** — a 3D ring of gilded garment cards, each spotlit on its own
  jewel stage. Drag, use the arrows, or tap the dots to swap pieces.
- **Item page (`/items/[id]`)** — a 3D inspect viewer + details + availability
  calendar + the rent-request flow.
- **Admin (`/admin`)** — upload photos, edit details, set the stage/glow colour,
  and reorder pieces (top-to-bottom = order on the rail). Changes save straight
  to the database. **Settings** edits the tagline, description, owner email,
  homepage video and the rewards programme — no code changes needed.
- **Data** — everything lives in Supabase Postgres (see below).

## Environment variables

All optional except the admin password. See [`.env.example`](.env.example).

| Variable | Enables |
| --- | --- |
| `ADMIN_PASSWORD` | The `/admin` login (change before sharing). |
| `POSTGRES_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | The database and media storage — added by the Supabase integration; pull with `vercel env pull`. |
| `GROQ_API_KEY` (+ `GROQ_VISION_MODEL`) | **✨ Auto-fill from photo** — Groq vision reads an uploaded photo and fills name, category, colour, description, tags, and a matching accent colour. |

If `GROQ_API_KEY` is missing, the auto-fill button just reports it's unavailable
— nothing breaks.

### Background removal (free)

The admin's **Remove background** button runs entirely in the browser via
[`@imgly/background-removal`](https://github.com/imgly/background-removal-js) —
**no API key, no per-image cost**, and it works on serverless hosts because the
processing happens on the visitor's device. It removes the background while
keeping the subject + garment; first use downloads a small model, then it's
cached. For best results, photograph pieces on a plain background or laid flat.

## Data & media (Supabase)

Supabase is connected through the Vercel Marketplace, which injects its env vars
into the project. Nobody needs to open Supabase day to day: admins and closet
owners add and edit everything from the site.

- **Database** — tables are defined in [`supabase/migrations`](supabase/migrations)
  and applied with `npm run db:migrate` (uses `POSTGRES_URL_NON_POOLING`). Add a
  new numbered `.sql` file for schema changes; each file runs once.
- **Security** — row-level security is on for every table with no public
  policies, so Supabase's public API can't read anything. The app queries
  Postgres server-side only, behind the admin/owner cookie auth. Renter
  contacts and owner password hashes never reach the browser.
- **Media** — a public `media` bucket. The browser asks `/api/admin/upload` for
  a signed URL (admins/owners only) and uploads straight to Supabase, so videos
  up to 50MB work.
- **Seed / import** — `npm run db:seed` seeds from `src/data/items.ts` and
  `src/data/lookbook.ts`. If `BLOB_READ_WRITE_TOKEN` is present it imports the
  old Vercel Blob data and copies its media instead. It runs once (a marker row
  records it), so pieces deleted later never come back.

## Deployment

Push to `main` and Vercel deploys. Every Vercel build runs `vercel-build`:
new migrations are applied, the one-time seed/import runs on the first deploy
only, and then `next build` runs. If a migration fails, the build fails and the
previous deployment stays live.
