# Nagram

> Unmake a name. Make an anagram.

Nagram is a minimal, meditative web app for crafting anagrams **one letter at a
time**. Type a name, then tap its letters in any order to compose a new
arrangement. When every letter has been placed, save your anagram to a Supabase
database.

Built with **React + Vite** in plain JavaScript, mobile-first, and installable
as a **PWA** for offline use. All artwork is original SVG sacred-geometry work
with real Devanagari letterforms embedded as glyph outlines (no font
dependency, identical rendering everywhere, fully offline).

---

## How the letter mechanic works

- **Line 1 — Available letters:** every character of the name is shown in its
  fixed original position. Positions never reorder. Spaces appear as `␣`.
- Tapping an available letter moves it to **Line 2** (appended at the right) and
  leaves a faint, greyed-out placeholder in its original spot.
- **Line 2 — Booked letters:** booked letters are packed left in tap order. The
  current anagram is simply the left-to-right order of Line 2.
- Tapping a Line 2 letter returns it to its original Line 1 position; the
  remaining booked letters slide left to close the gap.
- When **all** letters are booked, a **Save** button appears. Saving writes a
  row to Supabase, then shows **Saved!** and a **New** button to start over.
- A **Reset** button is always available.

---

## Quick start

Requirements: Node 18+ and npm.

```bash
npm install
cp .env.example .env   # then fill in your Supabase values
npm run dev
```

Open the printed local URL. The app runs even without Supabase configured —
saving is simply disabled until you add credentials.

### Other scripts

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                           |
| `npm run build`   | Production build into `dist/` (includes PWA assets) |
| `npm run preview` | Serve the production build locally                  |
| `npm run icons`   | Regenerate `public/` favicon + PWA icon PNGs        |

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and the **anon
   public** key into your `.env`:

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

3. In the **SQL Editor**, create the table:

   ```sql
   create table if not exists public.anagrams (
     id          bigint generated always as identity primary key,
     original_name text not null,
     anagram       text not null,
     mode          text not null default 'anagram',
     created_at    timestamptz not null default now()
   );

   -- If the table already exists from an earlier version, add the mode column:
   alter table public.anagrams add column if not exists mode text not null default 'anagram';

   -- Allow the web app (anon key) to insert, read and delete.
   alter table public.anagrams enable row level security;

   create policy "anon can insert anagrams"
     on public.anagrams for insert
     to anon
     with check (true);

   create policy "anon can read anagrams"
     on public.anagrams for select
     to anon
     using (true);

   create policy "anon can delete anagrams"
     on public.anagrams for delete
     to anon
     using (true);
   ```

   > The Saved panel reads and deletes rows, so the `select` and `delete`
   > policies above are required. This is a single-user demo using anonymous
   > access; tighten these policies (e.g. per-user with real auth) before
   > sharing publicly.

> The `anon` key is safe to ship in a client bundle **as long as Row Level
> Security is enabled** and policies only permit what you intend (here, inserts).

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **New Project → Import** the repo. Vercel auto-detects Vite
   (build command `npm run build`, output directory `dist`).
3. Add the two environment variables under **Settings → Environment
   Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. (Re-deploy after changing env vars so they're baked into the build.)

---

## PWA — install & offline

The production build registers a service worker and ships a web manifest, so
Nagram is installable and works fully offline (the app shell and inlined SVG art
are precached).

### Test installability locally

```bash
npm run build
npm run preview
```

Then in the browser:

- **Chrome / Edge desktop:** open the preview URL → an **install** icon appears
  in the address bar. Or check **DevTools → Application → Manifest** and
  **Service Workers**.
- **Verify offline:** in **DevTools → Network**, tick **Offline** and reload —
  the app should still load and run.
- **Lighthouse:** run the **PWA** audit in DevTools for an installability
  report.
- **Android Chrome:** visit your deployed HTTPS URL → menu → **Add to Home
  screen**.

> Service workers require a secure context — `localhost` and HTTPS both qualify.

### Package as an Android APK with PWABuilder (free)

1. Deploy to a public HTTPS URL (e.g. Vercel).
2. Go to [pwabuilder.com](https://www.pwabuilder.com) and enter your URL.
3. PWABuilder validates the manifest and service worker, then click
   **Package for stores → Android**.
4. Choose the package options (the maskable icon is already provided) and
   **Download** the generated `.apk` / `.aab` plus signing key.
5. Sideload the `.apk` to a device, or upload the `.aab` to the Play Store.

---

## Project structure

```
public/                 generated favicon + PWA icon PNGs
scripts/
  generate-icons.mjs    builds icon.svg and PNGs from the glyph/geometry source
src/
  components/
    devanagariGlyphs.js  Noto Sans Devanagari glyph outlines (OFL) as SVG paths
    sigilGeometry.js     shared sacred-geometry helpers
    LogoSigil.jsx        main logo sigil
    AppIcon.jsx          simplified square app icon
    WatermarkSigil.jsx   faint background watermark
    LetterGame.jsx       the core letter-booking mechanic
  supabaseClient.js      Supabase client + saveAnagram()
  App.jsx                screens, input + validation
  index.css             minimal mobile-first styling
licenses/OFL.txt        SIL Open Font License for the embedded glyphs
```

---

## Visual identity

Three self-contained SVG React components in a sigil / sacred-geometry style —
fine gold (`#c9a23f`) line work on a transparent background, working in both
light and dark mode:

- **`LogoSigil`** — seed-of-life circles, nested triangles (hexagram), inner
  pentagram and concentric mandala rings, with Devanagari at the cardinal
  points: **ना** (top), **ग** (upper right), **र** (lower right), **म**
  (bottom), plus **अ** and **ॐ** as accent glyphs.
- **`AppIcon`** — a bolder, simplified square version for the favicon and PWA
  icons.
- **`WatermarkSigil`** — a faint, intricate mandala that sits behind the
  content.

The Devanagari glyphs are real outlines extracted from **Noto Sans Devanagari**
(SIL OFL 1.1) and embedded as SVG `<path>` data, so they render identically on
every device and need no network or system fonts.

---

## Documentation

The [`docs/`](docs/) folder is a guide for **recreating this app quickly** with
Claude Code or the web interface:

- [`docs/RECREATE.md`](docs/RECREATE.md) — one master brief to paste and rebuild.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — file map, state model, data flow.
- [`docs/SETUP-CHECKLIST.md`](docs/SETUP-CHECKLIST.md) — Supabase/Vercel/PWA + the
  deploy gotchas and version-bump workflow.
- [`docs/ART-AND-GLYPHS.md`](docs/ART-AND-GLYPHS.md) — sigil geometry + the
  Devanagari glyph-extraction recipe.
- [`docs/PROMPT-LOG.md`](docs/PROMPT-LOG.md) — the iteration history.

---

## License

App code: MIT. Embedded Devanagari glyph outlines: SIL Open Font License 1.1 —
see [`licenses/OFL.txt`](licenses/OFL.txt).
