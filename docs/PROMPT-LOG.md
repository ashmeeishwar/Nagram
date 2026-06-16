# Prompt Log

The chronological feature requests that produced this build. To reproduce the
exact iteration path, paste [RECREATE.md](./RECREATE.md) first, then feed these
one batch at a time. (RECREATE.md already folds all of these into one brief, so
you can also one-shot it.)

Each batch maps to one commit on `main`.

## 0 — Initial build (`a.1.0`-era)
The original master brief: React+Vite plain-JS Nagram, the letter mechanic,
Supabase save, three SVG sigils with embedded Devanagari, README/`.env.example`/
`.gitignore`, then the PWA step (manifest, offline SW, icon PNGs, APK docs).

## 1 — Infinite space key
- Add a dedicated, **always-available, infinitely usable space key** to Line 1.
- It must **not** affect Save: Save is enabled once all *letters* are booked,
  even if spaces are left.

## 2 — Single spaces + 300 cap
- No double/triple spaces in Line 2; reject adding a space next to a space
  (initially via a notice). Only **one** space key regardless of source spaces.
- Cap the name at **300** characters; clamp paste/typing to 300 with a warning.

## 3 — Version marker + deploy diagnosis
- Add a small, non-conspicuous **version marker** by the wordmark, bumped
  manually before each push (a/b/v scheme).
- (Discovered the live site was a stale build / wrong production branch / env
  vars not baked in — see SETUP-CHECKLIST gotchas.)

## 4 — Saved list, fake Google login, theme toggle, trailing space
- **Saved** panel listing saved rows with **Copy** + **Delete** per item.
- Simulated **Google OAuth** on Save (always authenticates, placeholder).
- Non-intrusive but clearly visible **dark-mode toggle**.
- If the last Line-2 token is a space on Save, strip it (then later: prevent it).

## 5 — Branch policy → `main`
- From here on commit/push directly to **`main`**; move existing work to `main`
  so Vercel deploys production from it.

## 6 — Space-key disable, motto, watermark, modes
- Instead of the "last space removed" notice, **disable the space key** when the
  last token is a space (or Line 2 is empty); strip a trailing space silently.
- Motto → **"Unmake a name. Make a Nagram."**
- Fix watermark **centering** on narrow/Android (size `min(560px, 92vw)`).
- Add the **Anagram / Unique letters** mode switch; Unique reduces a *will
  statement* to unique letters for a sigil.

## 7 — Unique-mode polish + saved mode
- Unique mode: **letters only, all CAPITALS**.
- Store and show the **mode** ("Anagram"/"Unique letters") in the Saved list.
- **Brighter container tint** for Unique-letters mode (colors only, no new DOM).

## 8 — This documentation set
- The `docs/` directory you're reading.
