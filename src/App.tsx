import { useEffect, useState } from 'react';
import { Home } from './screens/Home';
import { NameEntry } from './screens/NameEntry';
import { Lobby } from './screens/Lobby';
import { Game } from './screens/Game';
import { Victory } from './screens/Victory';
import {
  applyMove,
  initialGameState,
  type GameState,
  type Mark,
} from './lib/game';
import { useOnlineSession } from './lib/useOnlineSession';
import { generateSessionCode } from './lib/utils';

type Screen =
  | { kind: 'home' }
  | { kind: 'name_solo' }
  | { kind: 'name_online_create' }
  | { kind: 'name_online_join'; code: string }
  | { kind: 'lobby_online' }
  | { kind: 'game_solo' }
  | { kind: 'game_online' }
  | { kind: 'victory_solo' }
  | { kind: 'victory_online' };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ kind: 'home' });
  const [localState, setLocalState] = useState<GameState>(() => initialGameState('X'));
  const [localPlayers, setLocalPlayers] = useState<{ X: string; O: string }>({
    X: 'Player 1',
    O: 'Player 2',
  });
  const online = useOnlineSession();

  // auto-transition on match resolution / opponent join
  useEffect(() => {
    if (screen.kind === 'game_solo' && localState.matchResult) {
      setScreen({ kind: 'victory_solo' });
    }
  }, [screen.kind, localState.matchResult]);

  useEffect(() => {
    if (screen.kind === 'game_online' && online.gameState?.matchResult) {
      setScreen({ kind: 'victory_online' });
    }
  }, [screen.kind, online.gameState?.matchResult]);

  useEffect(() => {
    if (
      screen.kind === 'lobby_online' &&
      online.row?.player2_name &&
      online.row?.status === 'active'
    ) {
      setScreen({ kind: 'game_online' });
    }
  }, [screen.kind, online.row?.player2_name, online.row?.status]);

  // ---------- handlers ----------

  const handleLocalMove = (r: number, c: number) => {
    const res = applyMove(localState, r, c);
    if (res.ok && res.state) setLocalState(res.state);
  };

  const handleLocalPlayAgain = () => {
    // alternate first turn each match
    const nextTurn: Mark = localState.turn === 'X' ? 'O' : 'X';
    setLocalState(initialGameState(nextTurn));
    setScreen({ kind: 'game_solo' });
  };

  // ---------- render ----------

  switch (screen.kind) {
    case 'home':
      return (
        <Home
          onCreateOnline={() => setScreen({ kind: 'name_online_create' })}
          onJoinOnline={code => setScreen({ kind: 'name_online_join', code })}
          onPlayLocal={() => setScreen({ kind: 'name_solo' })}
        />
      );

    case 'name_solo':
      return (
        <NameEntry
          kind="solo"
          onSubmit={({ p1, p2 }) => {
            setLocalPlayers({ X: p1, O: p2 || 'Player 2' });
            setLocalState(initialGameState('X'));
            setScreen({ kind: 'game_solo' });
          }}
          onBack={() => setScreen({ kind: 'home' })}
        />
      );

    case 'name_online_create':
      return (
        <NameEntry
          kind="single"
          title="what's your name?"
          onSubmit={async ({ p1 }) => {
            const code = generateSessionCode();
            await online.createSession(p1, code);
            setScreen({ kind: 'lobby_online' });
          }}
          onBack={() => setScreen({ kind: 'home' })}
        />
      );

    case 'name_online_join':
      return (
        <NameEntry
          kind="single"
          title="what's your name?"
          onSubmit={async ({ p1 }) => {
            await online.joinSession(screen.code, p1);
            setScreen({ kind: 'game_online' });
          }}
          onBack={() => setScreen({ kind: 'home' })}
        />
      );

    case 'lobby_online':
      return (
        <Lobby
          code={online.code ?? '------'}
          yourName={online.row?.player1_name ?? '…'}
          opponentName={online.row?.player2_name ?? undefined}
          onCancel={async () => {
            await online.leave();
            setScreen({ kind: 'home' });
          }}
        />
      );

    case 'game_solo':
      return (
        <Game
          state={localState}
          players={localPlayers}
          onMove={handleLocalMove}
        />
      );

    case 'game_online':
      if (!online.gameState || !online.row) return null;
      return (
        <Game
          state={online.gameState}
          players={{
            X: online.row.player1_name ?? 'Player 1',
            O: online.row.player2_name ?? 'Player 2',
          }}
          youAre={online.youAre ?? undefined}
          disabled={online.youAre !== online.gameState.turn}
          onMove={(r, c) => online.submitMove(r, c)}
        />
      );

    case 'victory_solo':
      return (
        <Victory
          state={localState}
          players={localPlayers}
          onPlayAgain={handleLocalPlayAgain}
          onQuit={() => {
            setLocalState(initialGameState('X'));
            setScreen({ kind: 'home' });
          }}
        />
      );

    case 'victory_online':
      if (!online.gameState || !online.row) return null;
      return (
        <Victory
          state={online.gameState}
          players={{
            X: online.row.player1_name ?? 'Player 1',
            O: online.row.player2_name ?? 'Player 2',
          }}
          onPlayAgain={async () => {
            await online.playAgain();
            setScreen({ kind: 'game_online' });
          }}
          onQuit={async () => {
            await online.leave();
            setScreen({ kind: 'home' });
          }}
        />
      );
  }
}
