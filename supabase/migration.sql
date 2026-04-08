-- RoutineDuel – Supabase setup
-- Run this in Supabase → SQL Editor

-- 1. Create the shared state table
CREATE TABLE IF NOT EXISTS public.duo_state (
  id          text        PRIMARY KEY,
  state       jsonb       NOT NULL,
  updated_by  text        NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Row Level Security: any authenticated user can read/write
ALTER TABLE public.duo_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_rw" ON public.duo_state;
CREATE POLICY "authenticated_rw" ON public.duo_state
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Enable Realtime on this table
-- (also do this in: Supabase dashboard → Database → Replication → supabase_realtime publication → add duo_state)
ALTER PUBLICATION supabase_realtime ADD TABLE public.duo_state;
