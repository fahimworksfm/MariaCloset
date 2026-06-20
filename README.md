# Maria's Closet 👗

A boutique web app for renting out a personal closet. Browse the rail as a
**3D carousel** you can drag/spin, open a piece to inspect it in 3D, check its
availability calendar, and send a **request to rent** that Maria approves
manually. No accounts, no payments, no database — all data lives in the repo.

Built with **Next.js 14**, **React Three Fiber**, and **Tailwind CSS**.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

- **Home (`/`)** — a 3D ring of garment cards. Drag, use the arrows, or tap the
  dots to swap between pieces. "View & rent" opens the detail page.
- **Item page (`/items/[id]`)** — a 3D inspect viewer (drag to peek, or 360°
  spin if the item has frames) plus details and the rent-request flow.
- **Requests** — submitting the form `POST`s to `/api/requests`, which appends
  the request to `data/requests.json` (created automatically on first request).
  Open that file to see pending requests.

## Adding / editing pieces

1. Drop a photo into `public/items/` (e.g. `public/items/red-gown.jpg`).
2. Add an entry to [`src/data/items.ts`](src/data/items.ts):

```ts
{
  id: "red-gown",
  name: "Red Carpet Gown",
  category: "Gowns",
  size: "UK 8",
  color: "Red",
  pricePerDay: 50,
  description: "…",
  image: "/items/red-gown.jpg",
  accent: "#a01b2b",        // glow / highlight colour
  unavailable: [{ from: "2026-07-01", to: "2026-07-04" }], // booked ranges
}
```

### 360° spin (optional)

Take several evenly-rotated photos of a piece, drop them in `public/items/`,
and list them in order as `frames: ["/items/x-01.jpg", "/items/x-02.jpg", …]`.
The inspect view automatically becomes drag-to-spin.

The starter pieces use placeholder SVG art in `public/items/` — replace them
with real photos whenever you're ready.

## Settings

Edit [`src/data/config.ts`](src/data/config.ts) for the closet name, tagline,
and currency. Set `ownerEmail` to enable an email fallback on the confirmation
screen (handy if you deploy somewhere with a read-only filesystem).

## Notes on deployment

`data/requests.json` is written to the local filesystem, which works great when
you run the app on your own machine or a server with persistent disk. On
read-only/serverless hosts the write is skipped gracefully and the confirmation
screen offers an email fallback instead — swap in a database or email service
when you're ready to go fully hosted.
