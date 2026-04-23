import { Mark } from './Mark';
import type { Cell, SubResult } from '@/lib/game';
import { cn } from '@/lib/utils';

interface SubBoardProps {
  /** 9 cells, flat (row-major) */
  cells: Cell[];
  /** position of this sub-board in the 3x3 meta-grid (0..2, 0..2) */
  subRow: number;
  subCol: number;
  result: SubResult;
  /** most recent move cell, or null — for a subtle highlight */
  lastMove?: { r: number; c: number } | null;
  /** global disabling (match over, waiting for opponent, etc.) */
  disabled?: boolean;
  onCellClick: (r: number, c: number) => void;
  /** true if this sub-board just resolved — triggers the stamp animation */
  justResolved?: boolean;
}

export function SubBoard({
  cells,
  subRow,
  subCol,
  result,
  lastMove,
  disabled,
  onCellClick,
  justResolved,
}: SubBoardProps) {
  const subResolved = result !== null;

  return (
    <div
      className={cn(
        'relative grid grid-cols-3 grid-rows-3 gap-0',
        'w-full h-full',
      )}
    >
      {cells.map((cell, idx) => {
        const localR = Math.floor(idx / 3);
        const localC = idx % 3;
        const globalR = subRow * 3 + localR;
        const globalC = subCol * 3 + localC;
        const isLast =
          lastMove && lastMove.r === globalR && lastMove.c === globalC;
        const canClick = !subResolved && !disabled && cell === null;

        return (
          <button
            key={idx}
            type="button"
            disabled={!canClick}
            onClick={() => onCellClick(globalR, globalC)}
            className={cn(
              'relative flex items-center justify-center',
              'aspect-square',
              // inner gridlines (not on outer edges — those are the sub-board border)
              localC < 2 && 'border-r-2 border-black/35',
              localR < 2 && 'border-b-2 border-black/35',
              canClick
                ? 'hover:bg-black/5 active:bg-black/10 cursor-pointer'
                : 'cursor-default',
              !canClick && cell === null && 'opacity-50',
            )}
            aria-label={
              cell
                ? `cell ${globalR},${globalC}: ${cell}`
                : `empty cell ${globalR},${globalC}`
            }
          >
            {cell && (
              <Mark
                kind={cell}
                className={cn('w-[90%] h-[90%]', isLast && 'animate-pop')}
              />
            )}
          </button>
        );
      })}

      {/* resolution stamp */}
      {subResolved && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center pointer-events-none',
            justResolved ? 'animate-pop' : '',
          )}
        >
          {result === 'tie' ? (
            <div className="font-marker text-[clamp(1.2rem,3vw,2.2rem)] text-black/70 rotate-[-8deg] drop-shadow-sm">
              tie!
            </div>
          ) : (
            <Mark kind={result as 'X' | 'O'} className="w-[85%] h-[85%] opacity-80 drop-shadow" />
          )}
        </div>
      )}
    </div>
  );
}
