import { useMemo } from 'react';
import { SubBoard } from './SubBoard';
import type { GameState } from '@/lib/game';
import { subBoardCells } from '@/lib/game';
import gridCoords from '@/assets/grid-coords.json';
import characterUrl from '@/assets/character.png';
import { cn } from '@/lib/utils';

interface Props {
  state: GameState;
  disabled?: boolean;
  onCellClick: (r: number, c: number) => void;
  /** optional: show a dev overlay to fine-tune grid coords */
  showOverlay?: boolean;
}

export function GameBoard({ state, disabled, onCellClick, showOverlay }: Props) {
  const leftPct = gridCoords.grid.left_pct * 100;
  const topPct = gridCoords.grid.top_pct * 100;
  const widthPct = (gridCoords.grid.right_pct - gridCoords.grid.left_pct) * 100;
  const heightPct = (gridCoords.grid.bottom_pct - gridCoords.grid.top_pct) * 100;

  const subBoards = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        idx: i,
        subRow: Math.floor(i / 3),
        subCol: i % 3,
        cells: subBoardCells(state.board, i),
      })),
    [state.board],
  );

  return (
    <div
      className="relative w-full mx-auto select-none"
      style={{
        // the character-clean image is 1600 x 2235 (aspect ~0.716)
        maxWidth: '560px',
        aspectRatio: `${gridCoords.image_width} / ${gridCoords.image_height}`,
      }}
    >
      <img
        src={characterUrl}
        alt="tic tac toe gameboy character drawn by asher"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* interactive 9x9 grid overlay */}
      <div
        className={cn(
          'absolute grid grid-cols-3 grid-rows-3 gap-[1.5%]',
          showOverlay && 'outline outline-2 outline-red-500',
        )}
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
      >
        {subBoards.map(sb => (
          <div
            key={sb.idx}
            className={cn(
              'relative rounded-sm',
              showOverlay && 'outline outline-1 outline-blue-500',
            )}
          >
            <SubBoard
              cells={sb.cells}
              subRow={sb.subRow}
              subCol={sb.subCol}
              result={state.subResults[sb.idx]}
              lastMove={state.lastMove}
              disabled={disabled}
              onCellClick={onCellClick}
              justResolved={state.justResolvedSub === sb.idx}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
