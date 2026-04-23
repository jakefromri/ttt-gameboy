import { Button } from '@/components/ui/Button';

interface LobbyProps {
  code: string;
  yourName: string;
  opponentName?: string;
  onCancel: () => void;
}

/** shown after a player creates an online session and is waiting for someone to join. */
export function Lobby({ code, yourName, opponentName, onCancel }: LobbyProps) {
  const ready = Boolean(opponentName);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-crayon-paper">
      <h2 className="font-marker text-3xl">your code</h2>
      <div
        className="mt-4 font-marker text-6xl tracking-[0.3em] text-crayon-blue px-6 py-4 rounded-2xl bg-white border-4 border-black shadow-[6px_6px_0_0_#000] cursor-pointer"
        onClick={() => navigator.clipboard?.writeText(code).catch(() => {})}
        title="tap to copy"
      >
        {code}
      </div>
      <p className="mt-3 text-black/60 text-sm font-display">tap to copy</p>

      <div className="mt-10 text-center font-display">
        <div className="text-black/50 text-sm">you</div>
        <div className="text-2xl font-semibold">{yourName}</div>
      </div>

      <div className="mt-4 text-center font-display">
        <div className="text-black/50 text-sm">opponent</div>
        <div className={`text-2xl font-semibold ${ready ? '' : 'animate-wiggle text-black/50'}`}>
          {opponentName ?? 'waiting…'}
        </div>
      </div>

      <Button variant="ghost" className="mt-12" onClick={onCancel}>
        cancel
      </Button>
    </div>
  );
}
