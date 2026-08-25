# Shere Pistavros

Shere Pistavros is a React + Vite app for saint icon identification.

## Features

- Upload or capture saint icon images.
- Identify saints for free using a local trained visual matcher (from your labeled icons).
- Enrich verified saints with their Coptic Orthodox tradition, Coptic Synaxarium feast day, and its Gregorian date for the current Coptic year.
- Use the matching Coptic Synaxarium commemoration as the biography when available.
- Link to a saint's Tasbeha doxology collection when a verified collection is available.
- Import and search the complete Coptic Synaxarium catalog, then use its saint labels while adding visual training icons.
- Export and restore local backups of training icons, history, and the Synaxarium catalog.
- After a saint is recognized, retrieve a sourced biography from Wikipedia and link to the full article.
- Save local training labels to train your own in-app model.
- Keep a local history of the most recent identifications.

## Setup

```bash
npm install
npm run dev
```

Use the **Train Model** tab to add labeled icons first. The local model uses these labels to identify future images without any API key.

The **Synaxarium** tab imports the official calendar's commemorations and offers canonical labels for the image-training workflow. Calendar text alone does not train visual recognition; add a labeled icon for each saint you want the local matcher to recognize.

## Licensed Image Collection

The project includes a Wikimedia Commons review collector for openly licensed icon images. It does not scrape Google Images. It separately searches for Coptic, Greek, and broader Orthodox icon candidates, filters obvious non-icon files, and records licenses, attributions, source URLs, and query tradition in the shared `Images` directory.

```bash
npm run download:synaxarium-sample
```

Use the full catalog only when you have adequate disk space and time; it is rate-limited and may take several minutes:

```bash
npm run download:synaxarium-icons
```

Review the generated `Images/synaxarium-icon-review-manifest.json` before training. Commons search results can still be ambiguous, so use the **Review downloaded icons** queue in the Train tab and approve only clear, correct saint depictions. Use **Deny** for wrong or low-quality candidates; denied sources are recorded in `Images/synaxarium-icon-review-denials.json` and future downloader runs will try to fetch replacement candidates for those saints while skipping previously denied sources. Nothing enters the visual matcher until approved.

The key, training labels, and history are stored locally in your browser's IndexedDB database. Existing data from older localStorage versions is imported automatically when available.

## Cross-device Cloud Sync (Vercel)

To reuse the same training data on any device, configure Redis for Vercel:

1. Add an Upstash Redis integration to your Vercel project.
2. In Vercel project environment variables, ensure these exist:
	- `UPSTASH_REDIS_REST_URL`
	- `UPSTASH_REDIS_REST_TOKEN`
3. Optional: set `TRAINING_SYNC_KEY` to isolate your dataset key.
4. Redeploy.

When configured, the app loads cloud training data at startup and syncs changes automatically through `/api/training-sync`.

## Scripts

- `npm run dev` - start development server
- `npm run lint` - run ESLint
- `npm run build` - production build
- `npm run preview` - preview production build
