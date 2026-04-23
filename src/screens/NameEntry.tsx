import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface NameEntryProps {
  /** 'solo' means both names entered here (local hot-seat);
   *  'single' means just this player (online mode). */
  kind: 'solo' | 'single';
  title?: string;
  onSubmit: (names: { p1: string; p2?: string }) => void;
  onBack?: () => void;
}

export function NameEntry({ kind, title, onSubmit, onBack }: NameEntryProps) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');

  const canSubmit = kind === 'solo' ? p1.trim() && p2.trim() : p1.trim();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-crayon-paper">
      <h2 className="font-marker text-3xl text-center">
        {title ?? (kind === 'solo' ? 'who\'s playing?' : 'what\'s your name?')}
      </h2>

      <div className="mt-8 flex flex-col gap-4 w-full max-w-xs">
        <div>
          <label className="font-display text-sm text-black/60 block mb-1.5">
            {kind === 'solo' ? 'player 1 (X)' : 'your name'}
          </label>
          <Input
            autoFocus
            value={p1}
            onChange={e => setP1(e.target.value)}
            placeholder="name"
            maxLength={16}
          />
        </div>

        {kind === 'solo' && (
          <div>
            <label className="font-display text-sm text-black/60 block mb-1.5">
              player 2 (O)
            </label>
            <Input
              value={p2}
              onChange={e => setP2(e.target.value)}
              placeholder="name"
              maxLength={16}
            />
          </div>
        )}

        <Button
          size="lg"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({ p1: p1.trim(), p2: kind === 'solo' ? p2.trim() : undefined })
          }
        >
          let's go
        </Button>

        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            ← back
          </Button>
        )}
      </div>
    </div>
  );
}
