import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { hasRealtime } from '@/lib/supabase';
import { normalizeCode } from '@/lib/utils';

interface HomeProps {
  onCreateOnline: () => void;
  onJoinOnline: (code: string) => void;
  onPlayLocal: () => void;
}

export function Home({ onCreateOnline, onJoinOnline, onPlayLocal }: HomeProps) {
  const [mode, setMode] = useState<'menu' | 'join'>('menu');
  const [code, setCode] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-crayon-paper">
      <h1 className="font-marker text-5xl sm:text-6xl text-center leading-tight">
        tic <span className="text-crayon-red">tac</span> toe
        <br />
        <span className="text-crayon-blue">gameboy</span>
      </h1>
      <p className="mt-3 text-center text-black/70 font-display text-lg max-w-sm">
        nine tic-tac-toe boards in one. first to <span className="font-bold">5</span> wins.
      </p>

      {mode === 'menu' && (
        <div className="mt-10 flex flex-col gap-4 w-full max-w-xs animate-bounceIn">
          {hasRealtime && (
            <>
              <Button size="lg" variant="primary" onClick={onCreateOnline}>
                create a game
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setMode('join')}>
                join a game
              </Button>
              <div className="h-px bg-black/10 my-2" />
            </>
          )}
          <Button
            size={hasRealtime ? 'md' : 'lg'}
            variant={hasRealtime ? 'ghost' : 'primary'}
            onClick={onPlayLocal}
          >
            play on this device
          </Button>
        </div>
      )}

      {mode === 'join' && (
        <div className="mt-10 flex flex-col gap-4 w-full max-w-xs animate-bounceIn">
          <label className="font-display text-sm text-black/70">enter the 6-character code</label>
          <Input
            autoFocus
            value={code}
            onChange={e => setCode(normalizeCode(e.target.value))}
            placeholder="ABC234"
            maxLength={6}
            className="text-center tracking-[0.3em] uppercase"
          />
          <Button
            size="lg"
            onClick={() => onJoinOnline(code)}
            disabled={code.length !== 6}
          >
            join
          </Button>
          <Button variant="ghost" onClick={() => setMode('menu')}>
            ← back
          </Button>
        </div>
      )}

      <div className="mt-12 text-center text-xs text-black/50 font-display">
        a game by asher • a <span className="font-marker">D.T.M.S.</span> production
      </div>
    </div>
  );
}
