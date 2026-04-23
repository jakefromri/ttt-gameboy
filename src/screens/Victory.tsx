import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Mark } from '@/components/Mark';
import type { GameState, Mark as MarkType } from '@/lib/game';
import { celebrateMatch } from '@/lib/celebrate';

interface VictoryProps {
  state: GameState;
  players: { X: string; O: string };
  onPlayAgain: () => void;
  onQuit: () => void;
}

export function Victory({ state, players, onPlayAgain, onQuit }: VictoryProps) {
  useEffect(() => {
    celebrateMatch();
  }, []);

  const result = state.matchResult;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-crayon-paper text-center">
      {result === 'tie' ? (
        <>
          <h1 className="font-marker text-5xl">it's a tie!</h1>
          <p className="mt-2 text-black/70 font-display">both of you split the 9 boards.</p>
        </>
      ) : (
        <>
          <div className="animate-pop">
            <Mark
              kind={result as MarkType}
              className="w-32 h-32 drop-shadow"
            />
          </div>
          <h1 className="mt-4 font-marker text-5xl">
            {players[result as MarkType]} wins!
          </h1>
          <p className="mt-2 font-display text-xl text-black/70">
            <span className="font-semibold text-black">{state.scoreX}</span> to{' '}
            <span className="font-semibold text-black">{state.scoreO}</span>
          </p>
        </>
      )}

      <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
        <Button size="lg" variant="primary" onClick={onPlayAgain}>
          play again
        </Button>
        <Button variant="ghost" onClick={onQuit}>
          quit to home
        </Button>
      </div>

      <div className="mt-12 text-xs text-black/50 font-display">
        a <span className="font-marker text-sm">dumbo turbo mechanical studios</span> production ·
        invented by <span className="font-semibold">asher</span>
      </div>
    </div>
  );
}
