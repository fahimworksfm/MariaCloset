# Maria's Closet

Next.js 14 (App Router) rental closet. The live site is https://maria-closet.vercel.app, and it deploys from `main` on Vercel. All data and media live in Supabase. Admins (/admin) and closet owners (/owner) edit everything from the site, so nobody should need to open Supabase or edit code for content.

## Commands

- `npm run dev`, `npm run build`, `npx tsc --noEmit -p .` (ESLint isn't configured)
- `npm run db:migrate`: applies new `supabase/migrations/*.sql`
- `npm run db:seed`: one-time seed of a fresh DB from `src/data` (`-- --force` to re-run)
- For local env vars, run `vercel link` and `vercel env pull .env.local`. Never ask for secrets in chat.
- Never run `next build` while a dev or start server is running: they share `.next`.

## Data (Supabase Postgres)

- Supabase was provisioned through Vercel Marketplace and is connected to the `maria-closet` project for all environments. Its env vars are POSTGRES_URL (pooler), POSTGRES_URL_NON_POOLING, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (plus others).
- `src/lib/db.ts` uses postgres.js over POSTGRES_URL with `prepare: false`, since the pooler runs in transaction mode. `date` columns are parsed as strings and numeric columns come back as strings. Wrap jsonb values in `sql.json()`. Don't use supabase-js for data.
- The schema is in `supabase/migrations`. Each file runs once and is tracked in `schema_migrations`. For a change, add a new numbered file; never edit an applied one. Tables:
  - items (`sort_order`; `closet` null means Maria's)
  - requests (`adjustments` stays null until rewards settle)
  - owners
  - reviews, waitlist, gift_cards
  - lookbook (`sort_order`; `closet` null means the homepage edit)
  - referrals, credits, saves (`bump_save()` is atomic)
  - settings (jsonb rows `site` and `rewards`)
- **Security:** RLS is on for every table with no policies, and anon/authenticated are revoked. All access is server-side in the API routes behind the admin/owner cookie auth. Renter contacts and owner password hashes must never reach the client.
- `src/lib/*` storage modules:
  - List saves (`saveItems`, `saveLookbookFor`) diff against the DB and write only changed rows. They compare with `sameKey()` because jsonb reorders keys.
  - Owner saves go through `saveClosetItems(closet, …)`, which can only touch that closet.
  - `decideRequest` claims rewards atomically (adjustments null → `[]`) so they can't be paid twice.

## Media (Supabase Storage)

- The public `media` bucket (50MB cap; images, mp4 and webm) is created by the migration.
- The browser calls `uploadMedia()` (`src/lib/uploadMedia.ts`), which sends a JSON POST to `/api/admin/upload`. That route checks auth and returns a signed upload URL (`src/lib/media.ts`); the browser then PUTs the file straight to Supabase. In dev without Supabase, uploads fall back to `public/uploads`.

## Settings

- `getSettings()` in `src/lib/settings.ts` is cached per request and layers DB values over `defaultSettings` in `src/data/config.ts`.
- It's edited at /admin/settings: tagline, description, owner email, hero video, and rewards (enabled, welcomeOffer, referralReward, tiers, scope). Saving calls `revalidatePath("/", "layout")`.
- `siteConfig` holds only the fixed name, ownerName, currencySymbol and url.
- Pure helpers take settings as a parameter: `rewardsApplyTo(item, rewards)`, `tierFor(n, tiers)`, `planRewards(…, rewards)`. Client components get settings as props.

## Deploy

- Each Vercel build runs `vercel-build`: `db:migrate && db:seed && next build`.
- The seed is a no-op once the `seed` marker row exists, and production has been seeded.
- A failed migration fails the build, so the previous deployment stays live.

## Design

The admin is monochrome. Use the existing Tailwind tokens (`night`, `cream`, `gold`, `marigold`, `rani`, which are warm greys despite the names) and the `panel`, `field`, `btn-primary`, `btn-ghost` and `eyebrow` classes.

## AI

The AI uses Groq (`GROQ_API_KEY`; optional `GROQ_MODEL` and `GROQ_VISION_MODEL`). The admin home shows an AI status line. Without a working key, search, the stylist and photo auto-fill fall back to non-AI behaviour.
