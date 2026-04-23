# next steps — tic tac toe gameboy

This is everything Jake needs to run after Cowork hands off. Terminal only, no dashboards.

## 1. install + run locally (proves the scaffold works)

```sh
cd ~/Workspace/skunkworks/tic-tac-toe-gameboy   # or wherever you synced this
npm install
npm run dev
```

Open http://localhost:5180. With no `.env` configured, the Home screen will only show **"play on this device"** — local hot-seat mode. Start a game, enter two names, play through to a match. Confetti should pop when a sub-board resolves and a bigger celebration fires on match win.

If the grid overlay is misaligned, tweak `src/assets/grid-coords.json`. The current values came from a 5-pass visual iteration:

```json
{ "left_pct": 0.140, "top_pct": 0.265, "right_pct": 0.858, "bottom_pct": 0.745 }
```

## 2. game engine tests (already passing, sanity re-run)

```sh
node --experimental-strip-types --test src/lib/game.test.ts
```

17 tests cover win detection, turn alternation, sub-board locking, first-to-5 clinch, and the 4-4-tie edge case. Match result logic is the easy place for bugs to hide — tests catch them.

## 3. stand up Supabase (unlocks online play)

Follow your own `/personal/_templates/new-personal-project-setup.md` for the dev+prod Supabase setup. Short version:

```sh
supabase projects create ttt-gameboy-dev
supabase link --project-ref [DEV_REF]
supabase db push            # applies supabase/migrations/20260422000001_sessions.sql
```

Grab the URL + anon key from the Supabase dashboard and drop into `.env`:

```
VITE_SUPABASE_URL=https://[REF].supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Restart `npm run dev`. Home screen should now show **"create a game"** and **"join a game"**. Open two browsers (or one normal + one incognito), create a session in one, join with the code from the other. Both clients will live-update via the realtime subscription on the `sessions` row.

Repeat for prod:

```sh
supabase projects create ttt-gameboy-prod
supabase link --project-ref [PROD_REF]
supabase db push
```

## 4. deploy to Vercel

```sh
vercel link                  # first time only
vercel env add VITE_SUPABASE_URL preview        # paste dev URL
vercel env add VITE_SUPABASE_ANON_KEY preview   # paste dev anon key
vercel env add VITE_SUPABASE_URL production     # paste prod URL
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

Ship to the `*.vercel.app` URL first. Test it with Asher from his chromebook. Iterate.

## 5. custom domain (do last)

Point `tic-tac-toe-gameboy.dumboturbomechanicalstudios.com` at Vercel. GoDaddy → Vercel template lives at `/personal/_templates/godaddy-domain-setup.md`.

---

## handoff notes & open items

- **First turn alternates on play-again.** Each match after the first, whoever went second goes first. (Symmetry matters in a kids' game.)
- **Writes are trusted in the current schema.** Either client can mutate the session row freely. For a kids' game between friends this is fine; if it ever needs hardening, add an edge function to validate moves server-side.
- **Session cleanup.** The migration has a commented-out `pg_cron` sweep for sessions older than 24h. Uncomment when usage picks up.
- **Spectator mode** (a third person opens the URL with a known code after both slots are filled): the current code rejects this with "this game already has two players". If you want a view-only experience for siblings/friends watching, add a `spectator` read path.
- **Sound.** No audio yet. If Asher wants it, `Tone.js` or plain `<audio>` with a subtle "bip" on placement and a little fanfare on sub-board win is maybe an hour of work.
- **Dev overlay for grid tuning.** `GameBoard` accepts a `showOverlay` prop that outlines the 9 sub-board cells in bold colors — handy if we ever swap in a new hero image or re-photograph the drawing.
- **First-to-5 vs play-all-9.** Currently hardcoded first-to-5. If Asher wants "finish all 9 no matter what" as an option later, it's a small tweak in `game.ts`.

## Linear

When you start working on this, create a Linear project for `tic-tac-toe-gameboy` under your personal team. Suggested initial issues:
1. set up dev + prod Supabase, push migration
2. deploy to `*.vercel.app`, sanity-test two-browser play
3. fix any grid overlay drift on mobile screens
4. add subtle placement "bip" sound
5. custom domain on D.T.M.S. subdomain
