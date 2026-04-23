# tic-tac-toe gameboy

a game invented by asher, productionized by dad.

## the game

- the board is a 9x9 grid, made up of 9 separate 3x3 tic-tac-toe boards
- two players alternate placing x's and o's across the whole 9x9
- each individual 3x3 resolves as its own tic-tac-toe game (win / tie)
- the match is decided by who wins more of the nine sub-boards — first to 5 clinches
- ties on sub-boards count for neither player

## the vibe

the game lives inside a cartoon character asher drew — the "tic tac toe gameboy". big eyes on top, little smile, arms poking out the sides, legs poking out the bottom, and a little gameboy control panel at the bottom (select/start, mini reference grid, d-pad). the 9x9 grid IS its body.

the app uses asher's actual drawing as the frame. the interactive grid is an overlay positioned precisely where he drew it. the drawing stays — this is the point.

## session flow

1. player 1 lands on home → hits "create a game" → gets a 6-character code
2. player 1 enters their name, waits in a lobby
3. player 2 lands on home → hits "join a game" → enters the code → enters name
4. game begins. one board, nine sub-boards, alternating turns
5. confetti pops when a sub-board resolves
6. bigger celebration when a player hits 5 wins (match clinched)
7. either player can offer "play again" — keeps the same session code and names, resets the board

## stack

- vite + react + ts + shadcn/ui + tailwind
- supabase realtime for session sync (sessions table)
- canvas-confetti for the celebrations
- vercel static deploy
- domain: `tic-tac-toe-gameboy.dumboturbomechanicalstudios.com` (D.T.M.S. = dumbo turbo mechanical studios, the "company" asher and his friends started at school). add domain last — ship to `*.vercel.app` first.

## asher's credit

asher's name appears on the title screen and the match-win screen. the D.T.M.S. branding lives somewhere subtle — probably a tiny watermark on the home screen and a "a dumbo turbo mechanical studios production" on the victory screen.

## data model

```
sessions
  code           text primary key       -- 6 uppercase chars, no ambiguous (O/0, I/1)
  player1_name   text
  player2_name   text
  current_turn   int                    -- 1 or 2
  board_state    jsonb                  -- 9x9 array of null | 'X' | 'O'
  sub_results    jsonb                  -- length-9 array of null | 'X' | 'O' | 'tie'
  score_p1       int default 0
  score_p2       int default 0
  status         text                   -- 'waiting' | 'active' | 'finished'
  winner         int                    -- null | 1 | 2 (set when first-to-5 hits)
  created_at     timestamptz default now()
  updated_at     timestamptz default now()
```

realtime subscription on a single row keyed by code. writes are trusted (it's a kids' game between friends — no anti-cheat). if that changes, we can add an edge function to validate moves server-side.

## build order

1. digitize asher's color drawing (hero asset)
2. scaffold vite + shadcn
3. core game logic (local hot-seat first — verify the fun loop)
4. screens: home, lobby, game, victory
5. supabase table + realtime wiring
6. celebrations
7. play-again flow
8. deploy to vercel.app
9. domain last

## open questions

- sound effects? maybe a soft "ping" on each placement, a little fanfare on sub-board wins. kid-friendly, not annoying.
- spectator mode? if a third person hits the URL with the code after both slots filled, do they get a view-only board? (v2)
- is the 5th grader audience going to share a URL, or do they need the code to be really short / pronounceable? (leaning toward 6-char alphanumeric with ambiguous chars stripped — easy to type on chromebook)
