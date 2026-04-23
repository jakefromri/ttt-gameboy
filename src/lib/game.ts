/**
 * game engine for tic-tac-toe gameboy.
 *
 * the board is a single 9x9 grid, split into 9 sub-boards of 3x3.
 * each sub-board is its own independent tic-tac-toe game. the match is
 * decided by who wins more sub-boards. first to 5 clinches it (majority
 * of 9). ties on sub-boards count for neither player.
 *
 * a cell at (r, c) belongs to sub-board (Math.floor(r/3), Math.floor(c/3)).
 * sub-board index = sbRow * 3 + sbCol (0..8).
 */

export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type SubResult = Mark | 'tie' | null;
export type MatchResult = Mark | 'tie' | null;

export const EMPTY_BOARD: Cell[][] = Array.from({ length: 9 }, () =>
  Array<Cell>(9).fill(null),
);
export const EMPTY_SUB_RESULTS: SubResult[] = Array<SubResult>(9).fill(null);

export interface GameState {
  board: Cell[][];          // 9x9
  subResults: SubResult[];   // length 9
  turn: Mark;                // whose move it is right now
  scoreX: number;
  scoreO: number;
  matchResult: MatchResult;  // set when someone clinches or all 9 resolve
  lastMove: { r: number; c: number } | null;
  /** sub-board index most recently resolved, if any. used for celebrations. */
  justResolvedSub: number | null;
}

export const MATCH_TARGET = 5; // first to 5 wins (best of 9)

export function initialGameState(firstTurn: Mark = 'X'): GameState {
  return {
    board: EMPTY_BOARD.map(row => row.slice()),
    subResults: EMPTY_SUB_RESULTS.slice(),
    turn: firstTurn,
    scoreX: 0,
    scoreO: 0,
    matchResult: null,
    lastMove: null,
    justResolvedSub: null,
  };
}

export function subIndex(r: number, c: number): number {
  return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

/**
 * extract the 3x3 sub-board at index 0..8 (row-major).
 * returns a flat array of length 9.
 */
export function subBoardCells(board: Cell[][], idx: number): Cell[] {
  const sbRow = Math.floor(idx / 3);
  const sbCol = idx % 3;
  const cells: Cell[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push(board[sbRow * 3 + r][sbCol * 3 + c]);
    }
  }
  return cells;
}

const WIN_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/**
 * given 9 cells (flat), return 'X'/'O' if a winner, 'tie' if full with no
 * winner, or null if still in progress.
 */
export function evaluateSubBoard(cells: Cell[]): SubResult {
  for (const [a, b, c] of WIN_LINES) {
    const v = cells[a];
    if (v && v === cells[b] && v === cells[c]) return v;
  }
  if (cells.every(c => c !== null)) return 'tie';
  return null;
}

/**
 * get the winning line indices (0..8 within the sub-board) for a resolved
 * sub-board, or null if no winning line (tie or unresolved).
 */
export function winningLine(cells: Cell[]): [number, number, number] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v = cells[a];
    if (v && v === cells[b] && v === cells[c]) {
      return line as [number, number, number];
    }
  }
  return null;
}

export interface MoveResult {
  ok: boolean;
  reason?: string;
  state?: GameState;
}

/**
 * apply a move. returns new state if valid, or an error reason if not.
 * pure function — does not mutate input.
 */
export function applyMove(state: GameState, r: number, c: number): MoveResult {
  if (state.matchResult) return { ok: false, reason: 'match is over' };
  if (r < 0 || r > 8 || c < 0 || c > 8) return { ok: false, reason: 'out of bounds' };
  if (state.board[r][c] !== null) return { ok: false, reason: 'cell not empty' };

  const sub = subIndex(r, c);
  if (state.subResults[sub] !== null) {
    return { ok: false, reason: 'sub-board already resolved' };
  }

  // clone what we need to change
  const newBoard = state.board.map(row => row.slice());
  newBoard[r][c] = state.turn;

  const newSubResults = state.subResults.slice();
  const subCells = subBoardCells(newBoard, sub);
  const subResult = evaluateSubBoard(subCells);

  let scoreX = state.scoreX;
  let scoreO = state.scoreO;
  let justResolved: number | null = null;
  if (subResult && !state.subResults[sub]) {
    newSubResults[sub] = subResult;
    justResolved = sub;
    if (subResult === 'X') scoreX += 1;
    else if (subResult === 'O') scoreO += 1;
  }

  // evaluate match
  let matchResult: MatchResult = null;
  if (scoreX >= MATCH_TARGET) matchResult = 'X';
  else if (scoreO >= MATCH_TARGET) matchResult = 'O';
  else if (newSubResults.every(s => s !== null)) {
    if (scoreX > scoreO) matchResult = 'X';
    else if (scoreO > scoreX) matchResult = 'O';
    else matchResult = 'tie';
  }

  return {
    ok: true,
    state: {
      board: newBoard,
      subResults: newSubResults,
      turn: state.turn === 'X' ? 'O' : 'X',
      scoreX,
      scoreO,
      matchResult,
      lastMove: { r, c },
      justResolvedSub: justResolved,
    },
  };
}

/** did this move finish the match? */
export function matchOver(state: GameState): boolean {
  return state.matchResult !== null;
}
