import { useEffect, useRef } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { Mark } from '@/components/Mark';
import type { GameState, Mark as MarkType } from '@/lib/game';
import { celebrateSubBoard } from '@/lib/celebrate';
import { cn } from '@/lib/utils';

interface GameProps {
  state: GameState;
  players: { X: string; O: string };
  /** optional — for online games, which side is "you" */
  youAre?: MarkType;
  onMove: (r: number, c: number) => void;
  /** when true, local player can't act (waiting on opponent's move) */
  disabled?: boolean;
}

export function Game({ state, players, youAre, onMove, disabled }: GameProps) {
  const lastResolvedRef = useRef<number | null>(null);

  // fire confetti when a sub-board just resolved (but NOT when the whole
  // match finishes — victory screen handles that)
  useEffect(() => {
    if (
      state.justResolvedSub !== null &&
      state.justResolvedSub !== lastResolvedRef.current &&
      !state.matchResult
    ) {
      lastResolvedRef.current = state.justResolvedSub;
      // estimate origin near the resolved sub-board
      const sbRow = Math.floor(state.justResolvedSub / 3);
      const sbCol = state.justResolvedSub % 3;
      const x = 0.25 + sbCol * 0.25;
      const y = 0.3 + sbRow * 0.2;
      celebrateSubBoard(x, y);
    }
  }, [state.justResolvedSub, state.matchResult]);

  const turnPlayer = players[state.turn];
  const isYourTurn = !youAre || youAre === state.turn;

  return (
    <div className="min-h-screen flex flex-col items-center px-3 py-4 bg-crayon-paper">
      {/* header: scoreboard */}
      <ScoreBar state={state} players={players} />

      {/* turn banner */}
      <div className="mt-3 text-center font-display">
        {state.matchResult ? (
          <span className="text-lg text-black/60">match over</span>
        ) : (
          <span className="text-lg">
            <Mark kind={state.turn} className="inline-block w-6 h-6 align-middle mx-1" />
            <span className="font-semibold">{turnPlayer}</span>'s turn
            {youAre && (
              <span className={cn('ml-2 text-sm', isYourTurn ? 'text-crayon-green font-bold' : 'text-black/50')}>
                {isYourTurn ? '(your go)' : '(waiting…)'}
              </span>
            )}
          </span>
        )}
      </div>

      <div className="mt-3 w-full max-w-[560px]">
        <GameBoard state={state} disabled={disabled || !!state.matchResult} onCellClick={onMove} />
      </div>

      <div className="mt-4 text-xs text-black/40 font-display text-center">
        a game by <span className="font-semibold">asher</span> · a <span className="font-marker">D.T.M.S.</span> production
      </div>
    </div>
  );
}

function ScoreBar({
  state,
  players,
}: {
  state: GameState;
  players: { X: string; O: string };
}) {
  return (
    <div className="w-full max-w-[560px] grid grid-cols-2 gap-2 font-display">
      <ScorePill name={players.X} mark="X" score={state.scoreX} isTurn={state.turn === 'X' && !state.matchResult} />
      <ScorePill name={players.O} mark="O" score={state.scoreO} isTurn={state.turn === 'O' && !state.matchResult} />
    </div>
  );
}

function ScorePill({
  name,
  mark,
  score,
  isTurn,
}: {
  name: string;
  mark: MarkType;
  score: number;
  isTurn: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border-4 px-3 py-2 flex items-center gap-2 bg-white',
        isTurn ? 'border-black shadow-[3px_3px_0_0_#000]' : 'border-black/30',
      )}
    >
      <Mark kind={mark} className="w-7 h-7 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-black/50 truncate">{mark === 'X' ? 'player 1' : 'player 2'}</div>
        <div className="text-base font-semibold truncate">{name}</div>
      </div>
      <div className="font-marker text-2xl tabular-nums">{score}</div>
    </div>
  );
}
