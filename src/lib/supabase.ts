import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseMisconfigured = !supabaseUrl || !supabaseKey;

// When env vars are missing we export a dummy client placeholder.
// The app will render a config-error screen before any Supabase call is made.
export const supabase = supabaseMisconfigured
  ? (null as never)
  : createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: { eventsPerSecond: 5 },
      },
    });
