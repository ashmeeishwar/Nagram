# Nagram — Documentation

A doc set for **recreating Nagram quickly and accurately** with Claude Code (CLI)
or the Claude web interface, plus reference material for how the app is built.

Read in this order:

1. **[RECREATE.md](./RECREATE.md)** — the single master brief to paste into
   Claude Code to rebuild the app from scratch, plus the environment/setup it
   expects. Start here.
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — file-by-file map, state model, and
   data flow. Read when you need to understand or extend the code.
3. **[SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md)** — Supabase SQL, env vars,
   Vercel deploy, PWA testing, and the per-change version-bump workflow.
4. **[ART-AND-GLYPHS.md](./ART-AND-GLYPHS.md)** — how the sacred-geometry sigils
   and the embedded Devanagari glyph outlines are produced (the font-subset /
   path-extraction recipe).
5. **[PROMPT-LOG.md](./PROMPT-LOG.md)** — the chronological list of feature
   requests that produced this state, so you can replay them incrementally
   instead of one-shotting.

> Tip: for a fast, accurate rebuild, paste **RECREATE.md** as the opening
> message, then feed the items from **PROMPT-LOG.md** one at a time if you want
> the exact same iteration path. Keep **SETUP-CHECKLIST.md** open for the
> Supabase/Vercel steps that only you can do.
