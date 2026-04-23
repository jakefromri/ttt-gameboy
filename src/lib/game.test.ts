/**
 * unit tests for the game engine.
 * run with: node --experimental-strip-types --test src/lib/game.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyMove,
  evaluateSubBoard,
  initialGameState,
  subBoardCells,
  subIndex,
  winningLine,
  MATCH_TARGET,
  type Cell,
  type Mark,
} from './game.ts';

// --- evaluateSubBoard ---

test('evaluateSubBoard: empty board is unresolved', () => {
  const cells: Cell[] = Array(9).fill(null);
  assert.equal(evaluateSubBoard(cells), null);
});

test('evaluateSubBoard: row win', () => {
  const cells: Cell[] = ['X', 'X', 'X', null, null, null, null, null, null];
  assert.equal(evaluateSubBoard(cells), 'X');
});

test('evaluateSubBoard: column win', () => {
  const cells: Cell[] = ['O', null, null, 'O', null, null, 'O', null, null];
  assert.equal(evaluateSubBoard(cells), 'O');
});

test('evaluateSubBoard: diagonal win', () => {
  const cells: Cell[] = ['X', null, null, null, 'X', null, null, null, 'X'];
  assert.equal(evaluateSubBoard(cells), 'X');
});

test('evaluateSubBoard: tie', () => {
  const cells: Cell[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  assert.equal(evaluateSubBoard(cells), 'tie');
});

test('winningLine: returns line indices on a diagonal', () => {
  const cells: Cell[] = ['X', null, null, null, 'X', null, null, null, 'X'];
  assert.deepEqual(winningLine(cells), [0, 4, 8]);
});

// --- subIndex / subBoardCells ---

test('subIndex: maps (0,0) to sub 0, (8,8) to sub 8, (4,5) to sub 4', () => {
  assert.equal(subIndex(0, 0), 0);
  assert.equal(subIndex(8, 8), 8);
  assert.equal(subIndex(4, 5), 4);
  assert.equal(subIndex(2, 6), 2);
  assert.equal(subIndex(6, 2), 6);
});

test('subBoardCells: extracts the correct 3x3 chunk', () => {
  const board: Cell[][] = Array.from({ length: 9 }, () =>
    Array<Cell>(9).fill(null),
  );
  board[0][0] = 'X';
  board[2][2] = 'O';
  const sub0 = subBoardCells(board, 0);
  assert.equal(sub0[0], 'X');
  assert.equal(sub0[8], 'O');
});

// --- applyMove ---

test('applyMove: rejects out-of-bounds', () => {
  const s = initialGameState('X');
  assert.equal(applyMove(s, -1, 0).ok, false);
  assert.equal(applyMove(s, 9, 0).ok, false);
});

test('applyMove: rejects move on occupied cell', () => {
  let s = initialGameState('X');
  s = applyMove(s, 0, 0).state!;
  const res = applyMove(s, 0, 0);
  assert.equal(res.ok, false);
});

test('applyMove: alternates turns', () => {
  let s = initialGameState('X');
  assert.equal(s.turn, 'X');
  s = applyMove(s, 0, 0).state!;
  assert.equal(s.turn, 'O');
  s = applyMove(s, 0, 1).state!;
  assert.equal(s.turn, 'X');
});

test('applyMove: resolving a sub-board awards a score', () => {
  let s = initialGameState('X');
  // X takes top row of sub-board 0: (0,0) (0,1) (0,2)
  s = applyMove(s, 0, 0).state!;  // X
  s = applyMove(s, 1, 0).state!;  // O
  s = applyMove(s, 0, 1).state!;  // X
  s = applyMove(s, 1, 1).state!;  // O
  s = applyMove(s, 0, 2).state!;  // X — wins sub 0
  assert.equal(s.scoreX, 1);
  assert.equal(s.scoreO, 0);
  assert.equal(s.subResults[0], 'X');
  assert.equal(s.justResolvedSub, 0);
});

test('applyMove: rejects moves in resolved sub-boards', () => {
  let s = initialGameState('X');
  s = applyMove(s, 0, 0).state!;  // X
  s = applyMove(s, 3, 0).state!;  // O (sub 3, different sub)
  s = applyMove(s, 0, 1).state!;  // X
  s = applyMove(s, 3, 1).state!;  // O
  s = applyMove(s, 0, 2).state!;  // X wins sub 0

  // now try to play in sub 0
  const res = applyMove(s, 1, 1);
  assert.equal(res.ok, false, 'should not allow move in resolved sub-board');
});

test('applyMove: first to 5 sub-board wins clinches match', () => {
  let s = initialGameState('X');
  // helper: fill sub-board idx with row-top win for mark
  const winSub = (state: typeof s, idx: number, mark: Mark): typeof s => {
    const sbRow = Math.floor(idx / 3);
    const sbCol = idx % 3;
    const r0 = sbRow * 3;
    const c0 = sbCol * 3;
    // X or O grabs top row (3 same-mark moves) — need opponent moves between
    // so we'll instead manually force a clean win without needing opponent
    // by using a pair of sub-boards alternately.
    // simpler: just set board directly
    state.board[r0][c0] = mark;
    state.board[r0][c0 + 1] = mark;
    state.board[r0][c0 + 2] = mark;
    state.subResults[idx] = mark;
    if (mark === 'X') state.scoreX += 1;
    else state.scoreO += 1;
    return state;
  };
  // give X five sub-boards manually (direct state mutation for test setup)
  winSub(s, 0, 'X');
  winSub(s, 1, 'X');
  winSub(s, 2, 'X');
  winSub(s, 3, 'X');
  assert.equal(s.scoreX, 4);
  assert.equal(s.matchResult, null);

  // now play one more X win via applyMove to trigger match clinch logic
  // sub 4 is rows 3-5, cols 3-5. build a winning line:
  // X: (3,3) (3,4) (3,5)  — interleaved with a non-4 O move
  s.turn = 'X';
  s = applyMove(s, 3, 3).state!;  // X
  s = applyMove(s, 6, 6).state!;  // O (sub 8, fresh)
  s = applyMove(s, 3, 4).state!;  // X
  s = applyMove(s, 6, 7).state!;  // O
  s = applyMove(s, 3, 5).state!;  // X wins sub 4

  assert.equal(s.scoreX, 5);
  assert.equal(s.matchResult, 'X', 'first to 5 should clinch match for X');
});

test('MATCH_TARGET is 5 (majority of 9)', () => {
  assert.equal(MATCH_TARGET, 5);
});

test('applyMove: rejects moves after match is over', () => {
  let s = initialGameState('X');
  // force a finished state directly for test speed
  s.matchResult = 'X';
  const res = applyMove(s, 0, 0);
  assert.equal(res.ok, false);
});

test('match ends in tie if all 9 sub-boards resolve with equal score impossible… wait, actually with 9 sub-boards and ties, a 4-4-1tie can happen', () => {
  // constructed state: 8 sub-boards resolved 4-4, one tied. no winner.
  // fastest: patch the state directly and verify matchResult logic via applyMove
  // by putting the last-tie creating move through applyMove.
  let s = initialGameState('X');
  // set 4 subs X, 4 subs O, leave sub 8 nearly tied
  for (const idx of [0, 1, 2, 3]) {
    s.subResults[idx] = 'X';
    s.scoreX += 1;
  }
  for (const idx of [4, 5, 6, 7]) {
    s.subResults[idx] = 'O';
    s.scoreO += 1;
  }
  // sub 8 rows 6-8 cols 6-8. fill so next X move at (6,6) creates a tie
  // we'll skip the setup and just directly test final match tie by
  // creating a cells layout that ends in tie
  // for simplicity, just set up and trigger evaluation by playing into sub 8
  // arrange sub 8 as a tie directly: X O X / X O O / O X X
  const tiedSub: Cell[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  for (let i = 0; i < 9; i++) {
    const r = 6 + Math.floor(i / 3);
    const c = 6 + (i % 3);
    s.board[r][c] = tiedSub[i];
  }
  // don't pre-set sub 8 result — force evaluation by replaying the last cell
  s.board[8][8] = null;
  s.turn = 'X';
  const res = applyMove(s, 8, 8);
  assert.equal(res.ok, true);
  assert.equal(res.state!.subResults[8], 'tie');
  assert.equal(res.state!.matchResult, 'tie', '4-4 with a tied 9th board should be a match tie');
});
