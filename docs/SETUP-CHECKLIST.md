# Setup Checklist

The steps Claude can't do for you, plus the per-change workflow. Tick these and
the app runs locally, saves to Supabase, and deploys to production on Vercel.

## 1. Local

```bash
npm install
cp .env.example .env     # fill in the two values below
npm run dev
```

The app runs even without Supabase configured (saving is disabled with a note).

## 2. Supabase

1. Create a project at supabase.com.
2. **Project Settings → API** → copy into `.env` (and later into Vercel):
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
3. **SQL Editor** — run:
   ```sql
   create table if not exists public.anagrams (
     id            bigint generated always as identity primary key,
     original_name text not null,
     anagram       text not null,
     mode          text not null default 'anagram',
     created_at    timestamptz not null default now()
   );

   -- if upgrading an older table:
   alter table public.anagrams add column if not exists mode text not null default 'anagram';

   alter table public.anagrams enable row level security;

   create policy "anon can insert anagrams" on public.anagrams
     for insert to anon with check (true);
   create policy "anon can read anagrams" on public.anagrams
     for select to anon using (true);
   create policy "anon can delete anagrams" on public.anagrams
     for delete to anon using (true);
   ```
   The Saved panel needs **select** and **delete**; saving needs **insert** and
   the **mode** column. This is a single-user demo using anon access — tighten
   before any public sharing.

## 3. Vercel

1. Import the repo (Vite auto-detected: build `npm run build`, output `dist`).
2. **Settings → Git → Production Branch** → set to your push branch (**`main`**).
3. **Settings → Environment Variables** → add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` for **Production** (and Preview if you use it).
4. **Redeploy** (uncheck "use existing build cache").

### Critical gotchas (most "it didn't update" issues)

- **`VITE_*` vars are baked in at build time.** Adding/editing them does nothing
  until you trigger a **new deploy**. Re-saving env vars ≠ rebuild.
- **Production branch must be the branch you push.** Otherwise your pushes only
  create *preview* deployments and the production URL stays frozen.
- **Service worker cache (PWA).** After a deploy the old shell can serve for a
  load or two. Force it: hard refresh (Ctrl/Cmd+Shift+R), or DevTools →
  Application → Service Workers → Unregister → reload.
- The repo's GitHub App needs **Contents: write** for pushes to land.

## 4. Confirm a deploy is live

Bump the `VERSION` constant at the top of `src/App.jsx` (scheme: `a`=alpha,
`b`=beta, `v`=release) **before each push**. After deploy, reload the site and
check the small marker next to the "Nagram" wordmark matches.

## 5. PWA / Android

```bash
npm run build && npm run preview   # install icon in the address bar; test Offline in DevTools
```
Package an APK free at pwabuilder.com (enter the deployed HTTPS URL → Package for
stores → Android). See the root README for details.
