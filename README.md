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
cp .env.example .env.local   # set ADMIN_PASSWORD (and optional AI keys)
npm run dev
```

Open http://localhost:3000 · admin at http://localhost:3000/admin

## How it works

- **Home (`/`)** — a 3D ring of gilded garment cards, each spotlit on its own
  jewel stage. Drag, use the arrows, or tap the dots to swap pieces.
- **Item page (`/items/[id]`)** — a 3D inspect viewer + details + availability
  calendar + the rent-request flow.
- **Admin (`/admin`)** — upload photos, edit details, set the stage/glow colour,
  and reorder pieces (top-to-bottom = order on the rail). Changes save to
  `data/items.json`; the catalog falls back to the seed in
  [`src/data/items.ts`](src/data/items.ts) until the first save.
- **Requests** — `POST /api/requests` appends to `data/requests.json`.

## Environment variables

All optional except the admin password. See [`.env.example`](.env.example).

| Variable | Enables |
| --- | --- |
| `ADMIN_PASSWORD` | The `/admin` login (change before sharing). |
| `GROQ_API_KEY` (+ `GROQ_VISION_MODEL`) | **✨ Auto-fill from photo** — Groq vision reads an uploaded photo and fills name, category, colour, description, tags, and a matching accent colour. |
| `REMOVEBG_API_KEY` | **Remove bg** in the admin (keeps the person + clothes). |
| `REPLICATE_API_TOKEN` (+ `REPLICATE_CLOTHES_MODEL`) | **Extract garment** — segment out just the clothing from a worn photo. |

If a key is missing, the related button simply reports it's unavailable —
nothing breaks.

### Clothing extraction from photos

Tiers, easiest → hardest:

1. **Background removal** (keeps her + the garment) — robust, via `REMOVEBG_API_KEY`.
2. **Garment-only extraction** (removes the person too) — clothing segmentation
   via Replicate (`REPLICATE_API_TOKEN` + a `mattmdjaga/segformer_b2_clothes`-style
   model in `REPLICATE_CLOTHES_MODEL`). Good for full garments; edges where cloth
   meets skin can be imperfect.
3. **Catalog-quality flat-lay** (ghost-mannequin) — a dedicated paid service.

Note: a Groq key powers the **text/vision auto-fill** but cannot cut pixels out
of an image — that needs a segmentation provider as above.

## Adding pieces by hand (instead of the admin)

Drop a photo in `public/items/`, add an entry to
[`src/data/items.ts`](src/data/items.ts). Add a `frames: [...]` array of
evenly-rotated photos to turn the inspect view into a 360° drag-to-spin. The
starter pieces use placeholder SVG art — replace with real photos any time.

## Deployment note

`data/items.json`, `data/requests.json`, and `public/uploads/` are written to
local disk — perfect on your own machine or a server with persistent storage.
On read-only/serverless hosts those writes are skipped; swap in a database +
object storage (and an email service for requests) when you go fully hosted.
