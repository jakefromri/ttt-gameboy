# tic tac toe gameboy

A game invented by Asher, productionized by dad. Nine tic-tac-toe boards in one — first to win five sub-boards takes the match.

A Dumbo Turbo Mechanical Studios production.

## stack
- Vite + React + TypeScript
- Tailwind + a few hand-rolled shadcn-style components
- Supabase realtime (sessions table) for multiplayer sync
- `canvas-confetti` for celebrations
- Deployed to Vercel

## run
```sh
cp .env.example .env       # fill in Supabase URL + anon key
npm install
npm run dev
```

## project layout
```
assets/                # Asher's original drawings + processed hero images
src/
  components/          # shared UI (BoardCell, SubBoard, etc.)
  screens/             # Home, Lobby, Game, Victory
  lib/                 # game engine, supabase client, helpers
  App.tsx
idea.md                # scoping doc
```

See `idea.md` for the full concept and build order.
