# Recreate Nagram — Master Brief

This is the **single prompt** to recreate the app at its current state. Paste the
whole "Master Brief" block below into Claude Code (or the web interface) as your
first message. Then use the [SETUP-CHECKLIST](./SETUP-CHECKLIST.md) for the
Supabase/Vercel steps only you can perform.

It already folds in every iteration documented in [PROMPT-LOG](./PROMPT-LOG.md),
so a single shot should land very close to this build.

---

## How to drive Claude Code for this project

- **Environment:** Node 18+ (built/tested on Node 22), npm. A git repo on the
  branch you want to ship from (we use `main` as the Vercel production branch).
- **Working style that worked well here:**
  - Let Claude scaffold everything, run `npm install` and `npm run build` to
    self-verify, and render SVGs/PNGs to images to eyeball the art.
  - Ask for a **manual version marker** (a `VERSION` constant shown by the
    wordmark) and bump it every push so you can confirm when a deploy is live.
  - Iterate one feature batch per message (see PROMPT-LOG).
- **Things only you can do** (Claude can't): grant the GitHub App write access,
  set the Vercel production branch, add Vercel env vars, run the Supabase SQL.

---

## Master Brief (paste this)

> Build a mobile-first **React + Vite** web app in **plain JavaScript** (no
> TypeScript) called **Nagram**, structured so it can be a PWA. Keep components
> modular, art as inline SVG, no blockers to offline use. Verify with
> `npm install && npm run build` as you go.
>
> ### Identity & layout
> - Centered single column, minimal, large touch targets. Single gold accent
>   **`#c9a23f`**; dark default palette with a light palette too.
> - Top bar: a **Saved** button (left) and, on the right, a small account chip
>   (when "signed in") + a **dark/light theme toggle** (sun/moon icon,
>   persisted to localStorage, overrides OS preference).
> - Masthead: logo sigil, wordmark **"Nagram"** with a small dim **version
>   marker** (`VERSION` constant, e.g. `a.6.0`; scheme a=alpha/b=beta/v=release;
>   bump manually before each push), and tagline **"Unmake a name. Make a
>   Nagram."**
> - A faint **watermark sigil** behind the content, sized `min(560px, 92vw)` and
>   centered so it never overflows off-center on narrow/Android screens.
>
> ### Two modes (segmented control directly under the tagline, above the input)
> - **Anagram** (default): label "Enter a name", validates **3–300** characters;
>   button "Start". Typing/pasting beyond 300 clamps to 300 and warns
>   "Maximum name length is 300 characters."
> - **Unique letters**: label becomes **"Will statement"**, placeholder like
>   "e.g. I am calm and focused", button "Reduce to letters". On submit, reduce
>   the text to **unique CAPITAL letters** — letters only (drop digits,
>   punctuation, spaces), de-duplicated case-insensitively, first occurrence
>   kept; require **≥2 distinct letters**. (Think sigil-making.)
> - In **Unique letters** mode, tint the working container brighter than Anagram
>   mode using **colors only** (no new DOM containers, don't move elements):
>   apply a brighter background to the existing input/form container and the
>   existing game container. Implement via a `data-mode` attribute on the root.
>
> ### Core letter mechanic
> - Build one **fixed letter slot per character**, in original order; positions
>   never reorder. **Spaces from the name are NOT slots** — spacing is handled by
>   a single dedicated key (below).
> - **Line 1 (available):** every letter in its fixed position. Tapping an
>   available letter moves it to Line 2 and leaves a faint greyed placeholder
>   (not tappable) in its Line 1 spot.
> - **Line 2 (booked):** booked letters packed left in tap order. Tapping a
>   Line 2 letter returns it to its Line 1 position and the rest slide left. The
>   current result = the left-to-right order of Line 2.
> - **One dedicated, always-present space key** on Line 1 (visually distinct).
>   It's **disabled when the last Line-2 token is a space or Line 2 is empty**,
>   so you can never make a double space or a leading space. Removing a letter
>   between two spaces collapses them to one. A single trailing space (if any)
>   is stripped silently on save.
> - **Save** appears once **all letters** are booked (leftover/unused spaces
>   never block it). Spaces render as a visible `␣`.
>
> ### Save flow + accounts (placeholder)
> - Pressing **Save** first opens a **simulated "Continue with Google"** modal
>   (real Google "G" logo) that **always authenticates** — placeholder, no real
>   OAuth. Persist the fake user in localStorage; show an account chip + "Sign
>   out". Cancelling the modal aborts the save.
> - On confirm, insert a row into **Supabase** with `original_name` (the name or
>   will statement), `anagram` (the Line 2 string), and `mode`
>   (`'anagram'`/`'unique'`). Then show **"Saved!"** + a **New** button that
>   resets. A **Reset** button is always available.
>
> ### Saved panel
> - The top-bar **Saved** button opens a modal listing saved rows newest-first.
>   Each row shows a **mode badge** ("Anagram"/"Unique letters") before the
>   anagram, the anagram text, and `from "<original_name>"`, with **Copy**
>   (copies the anagram) and **Delete** (removes the row) buttons.
>
> ### Database (Supabase, `@supabase/supabase-js`)
> - Read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from env. Create
>   `.env.example`; git-ignore `.env`. App must still run if unconfigured
>   (disable saving gracefully with a note).
> - Table `anagrams(id, original_name text, anagram text, mode text default
>   'anagram', created_at timestamptz default now())`. RLS on, with anon
>   `insert` / `select` / `delete` policies. (Provide the SQL; I'll run it.)
>
> ### Original SVG art (three self-contained React components)
> - Sigil / sacred-geometry style: fine gold line work, transparent background,
>   works light & dark. Geometry: interlocking circles (seed of life), nested
>   triangles (hexagram), inner pentagram, concentric mandala rings, radial
>   ticks (radial symmetry).
> - Real **Devanagari** at cardinal points spelling the app name phonetically:
>   **ना** (top), **ग** (upper right), **र** (lower right), **म** (bottom), with
>   **अ** and **ॐ** as accent glyphs. Embed them as **SVG `<path>` outlines
>   extracted from Noto Sans Devanagari (SIL OFL)** so rendering is identical
>   everywhere and fully offline (no system/web font dependency). See
>   ART-AND-GLYPHS for the extraction recipe; include `licenses/OFL.txt`.
> - Deliver: (1) main **LogoSigil**, (2) simplified square **AppIcon**, (3) faint
>   **WatermarkSigil**. Elegant, intricate but not cluttered.
>
> ### PWA (separate final step)
> - Add `vite-plugin-pwa`: manifest (name "Nagram", theme `#0c0a08`, standalone),
>   offline service worker precaching the app shell. Generate icon PNGs
>   (192/512/maskable) + favicon **at build time** from the AppIcon via a
>   `prebuild` script using `sharp` (so binaries aren't committed and a fresh
>   clone just builds). Document install testing and PWABuilder APK packaging.
>
> ### Deliverables
> - `npm install && npm run dev` runs immediately; `npm run build` produces the
>   PWA build. `README.md` (run + Supabase + Vercel + PWA/APK), `.env.example`,
>   `.gitignore`.

---

## After the one-shot

1. Run the SQL and set env vars — see [SETUP-CHECKLIST](./SETUP-CHECKLIST.md).
2. Push to your production branch (`main`), set it as Vercel's Production Branch,
   add env vars for **Production**, and redeploy.
3. Confirm the **version marker** changed on the live site.
