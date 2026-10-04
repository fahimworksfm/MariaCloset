# Lookbook photos ("The Edit" section on the homepage)

Drop editorial / lifestyle photos here and the matching tile upgrades from its
accent-gradient plate to the real photo automatically — no code change needed.
(Until a file exists, the tile shows an elegant placeholder plate.)

Expected filenames — edit `image` in `src/data/lookbook.ts` to rename or repoint:

| File                        | Look              | Suggested crop     |
|-----------------------------|-------------------|--------------------|
| `wedding-feature.jpg`       | The Grand Entrance| portrait ~4:5      |
| `reception.jpg`             | After Dark        | landscape ~16:10   |
| `mehndi.jpg`                | Marigold Hour     | landscape ~16:10   |
| `everyday.jpg`              | The Quiet Edit    | landscape ~16:10   |
| `details.jpg`               | The Details       | portrait ~4:5      |

Tips for clean results:
- Keep the subject roughly centered — tiles use `object-cover` and may crop edges.
- ~1200–1600px on the long side is plenty; compress to keep the page fast.
- Consistent lighting/background across shots reads as one editorial set.
- You can also point `image` at a Vercel Blob URL instead of a local file.
