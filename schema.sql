-- Supabase Schema for Coachera (based on existing mock data)

CREATE TABLE public.athletes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  age integer,
  ranking integer,
  academy_id text,
  avatar text,
  "matchesAnalyzed" integer DEFAULT 0,
  "lastActive" text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id uuid REFERENCES public.athletes(id) ON DELETE CASCADE,
  upload_date date DEFAULT CURRENT_DATE,
  opponent text NOT NULL,
  result text CHECK (result IN ('W', 'L')),
  duration text,
  score text,
  ai_report jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Optional: Create permissive policies for the investor demo if you aren't using strict Auth yet
CREATE POLICY "Enable read access for all users" ON public.athletes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.matches FOR UPDATE USING (true);
