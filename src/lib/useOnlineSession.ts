import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';
import {
  applyMove,
  initialGameState,
  type GameState,
  type Mark,
  type Cell,
  type SubResult,
} from './game';

export type SessionStatus = 'idle' | 'waiting' | 'active' | 'finished' | 'error';

export interface SessionRow {
  code: string;
  player1_name: string | null;
  player2_name: string | null;
  current_turn: Mark;
  board_state: Cell[][];
  sub_results: SubResult[];
  score_x: number;
  score_o: number;
  status: 'waiting' | 'active' | 'finished';
  match_result: SessionMatchResult;
  just_resolved_sub: number | null;
  created_at: string;
  updated_at: string;
}

type SessionMatchResult = Mark | 'tie' | null;

interface UseOnlineSessionResult {
  code: string | null;
  row: SessionRow | null;
  gameState: GameState | null;
  status: SessionStatus;
  youAre: Mark | null;
  error: string | null;
  createSession: (name: string, code: string) => Promise<void>;
  joinSession: (code: string, name: string) => Promise<void>;
  submitMove: (r: number, c: number) => Promise<void>;
  playAgain: () => Promise<void>;
  leave: () => Promise<void>;
}

/**
 * hook that manages an online session via supabase realtime. lives for
 * the duration of one session. returns current row + helpers to mutate it.
 *
 * writes are trusted (kids game, small blast radius). if we ever want to
 * prevent cheating we'd move validation into an edge function.
 */
export function useOnlineSession(): UseOnlineSessionResult {
  const [code, setCode] = useState<string | null>(null);
  const [row, setRow] = useState<SessionRow | null>(null);
  const [youAre, setYouAre] = useState<Mark | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const subRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);

  // derive a GameState from the row for easy reuse of UI components
  const gameState: GameState | null = row
    ? {
        board: row.board_state,
        subResults: row.sub_results,
        turn: row.current_turn,
        scoreX: row.score_x,
        scoreO: row.score_o,
        matchResult: row.match_result,
        lastMove: null,
        justResolvedSub: row.just_resolved_sub,
      }
    : null;

  useEffect(() => {
    return () => {
      if (subRef.current) {
        supabase?.removeChannel(subRef.current);
        subRef.current = null;
      }
    };
  }, []);

  async function subscribe(sessionCode: string) {
    if (!supabase) return;
    if (subRef.current) supabase.removeChannel(subRef.current);

    const channel = supabase
      .channel(`session:${sessionCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `code=eq.${sessionCode}` },
        payload => {
          if (payload.new) setRow(payload.new as SessionRow);
        },
      )
      .subscribe();

    subRef.current = channel;
  }

  async function createSession(name: string, newCode: string) {
    if (!supabase) {
      setError('online play is not configured');
      return;
    }
    setStatus('waiting');
    const empty = initialGameState('X');
    const { data, error: err } = await supabase
      .from('sessions')
      .insert({
        code: newCode,
        player1_name: name,
        player2_name: null,
        current_turn: 'X',
        board_state: empty.board,
        sub_results: empty.subResults,
        score_x: 0,
        score_o: 0,
        status: 'waiting',
        match_result: null,
        just_resolved_sub: null,
      })
      .select()
      .single();
    if (err) {
      setStatus('error');
      setError(err.message);
      return;
    }
    setCode(newCode);
    setRow(data as SessionRow);
    setYouAre('X');
    await subscribe(newCode);
  }

  async function joinSession(joinCode: string, name: string) {
    if (!supabase) {
      setError('online play is not configured');
      return;
    }
    setStatus('waiting');
    const { data: existing, error: selErr } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', joinCode)
      .maybeSingle();
    if (selErr) {
      setStatus('error');
      setError(selErr.message);
      return;
    }
    if (!existing) {
      setStatus('error');
      setError('no session found with that code');
      return;
    }
    if (existing.player2_name) {
      setStatus('error');
      setError('this game already has two players');
      return;
    }
    const { data, error: updErr } = await supabase
      .from('sessions')
      .update({ player2_name: name, status: 'active' })
      .eq('code', joinCode)
      .select()
      .single();
    if (updErr) {
      setStatus('error');
      setError(updErr.message);
      return;
    }
    setCode(joinCode);
    setRow(data as SessionRow);
    setYouAre('O');
    setStatus('active');
    await subscribe(joinCode);
  }

  async function submitMove(r: number, c: number) {
    if (!supabase || !row || !gameState || !youAre) return;
    if (gameState.turn !== youAre) return; // not our turn
    const result = applyMove(gameState, r, c);
    if (!result.ok || !result.state) return;
    const s = result.state;
    const { error: err } = await supabase
      .from('sessions')
      .update({
        board_state: s.board,
        sub_results: s.subResults,
        current_turn: s.turn,
        score_x: s.scoreX,
        score_o: s.scoreO,
        match_result: s.matchResult,
        just_resolved_sub: s.justResolvedSub,
        status: s.matchResult ? 'finished' : 'active',
      })
      .eq('code', code!);
    if (err) {
      setError(err.message);
    }
  }

  async function playAgain() {
    if (!supabase || !code) return;
    // alternate who goes first each match
    const nextTurn: Mark = row?.current_turn === 'X' ? 'O' : 'X';
    const fresh = initialGameState(nextTurn);
    const { error: err } = await supabase
      .from('sessions')
      .update({
        board_state: fresh.board,
        sub_results: fresh.subResults,
        current_turn: nextTurn,
        score_x: 0,
        score_o: 0,
        match_result: null,
        just_resolved_sub: null,
        status: 'active',
      })
      .eq('code', code);
    if (err) setError(err.message);
  }

  async function leave() {
    if (subRef.current) {
      supabase?.removeChannel(subRef.current);
      subRef.current = null;
    }
    setCode(null);
    setRow(null);
    setYouAre(null);
    setStatus('idle');
    setError(null);
  }

  return {
    code,
    row,
    gameState,
    status,
    youAre,
    error,
    createSession,
    joinSession,
    submitMove,
    playAgain,
    leave,
  };
}
