import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AppState } from '../types';

const TABLE = 'duo_state';

// ── Read ─────────────────────────────────────────────────────────────────────

export async function fetchRemoteState(duoId: string): Promise<AppState | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('state')
    .eq('id', duoId)
    .maybeSingle();

  if (error) {
    console.error('[remoteState] fetchRemoteState error:', error.message);
    return null;
  }
  return (data?.state as AppState) ?? null;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function pushRemoteState(
  duoId: string,
  state: AppState,
  updatedBy: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(
    { id: duoId, state, updated_by: updatedBy, updated_at: new Date().toISOString() },
    { onConflict: 'id' },
  );
  if (error) {
    console.error('[remoteState] pushRemoteState error:', error.message);
  }
}

// ── Realtime subscription ─────────────────────────────────────────────────────
// Calls `onUpdate` whenever ANOTHER client pushes a new state.
// Passes the new AppState so the caller can hydrate.

export function subscribeRemoteState(
  duoId: string,
  currentUserId: string,
  onUpdate: (newState: AppState) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`duo_state:${duoId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE, filter: `id=eq.${duoId}` },
      (payload) => {
        const row = payload.new as { state: AppState; updated_by: string } | undefined;
        if (!row) return;
        // Ignore echo of our own pushes
        if (row.updated_by === currentUserId) return;
        onUpdate(row.state);
      },
    )
    .subscribe();

  return channel;
}

export function unsubscribeRemoteState(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
