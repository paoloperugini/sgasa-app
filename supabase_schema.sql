-- ========================================================
-- S.G.A.S.A. - Supabase Database Schema
-- Multi-user, Realtime & Libretto Esami Cattolica
-- ========================================================

-- Abilita l'estensione UUID se non già presente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. TABELLA PROFILES (Profili Studenti)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  year_of_course INTEGER NOT NULL CHECK (year_of_course BETWEEN 1 AND 6),
  channel TEXT NOT NULL CHECK (channel IN ('A-L', 'M-Z')),
  matricola TEXT,
  football_role TEXT NOT NULL DEFAULT 'Centrocampista' CHECK (football_role IN ('Portiere', 'Difensore', 'Centrocampista', 'Attaccante')),
  football_rating INTEGER NOT NULL DEFAULT 7 CHECK (football_rating BETWEEN 1 AND 10),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy di lettura: tutti gli studenti autenticati possono vedere la lista membri (senza email altrui)
DROP POLICY IF EXISTS "Profili visibili a tutti gli utenti autenticati" ON public.profiles;
CREATE POLICY "Profili visibili a tutti gli utenti autenticati" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Policy di inserimento: ogni utente può creare solo il proprio profilo
DROP POLICY IF EXISTS "Utente può inserire il proprio profilo" ON public.profiles;
CREATE POLICY "Utente può inserire il proprio profilo" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Policy di modifica: ogni utente può aggiornare solo il proprio profilo
DROP POLICY IF EXISTS "Utente può aggiornare il proprio profilo" ON public.profiles;
CREATE POLICY "Utente può aggiornare il proprio profilo" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy di cancellazione: ogni utente può cancellare il proprio profilo
DROP POLICY IF EXISTS "Utente può cancellare il proprio profilo" ON public.profiles;
CREATE POLICY "Utente può cancellare il proprio profilo" 
ON public.profiles FOR DELETE 
TO authenticated 
USING (auth.uid() = id);


-- ========================================================
-- 2. TABELLA USER_EXAMS (Libretto Personale Esami Medicina)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.user_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  year_of_course INTEGER NOT NULL CHECK (year_of_course BETWEEN 1 AND 6),
  cfu INTEGER NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'Da preparare' CHECK (status IN ('Da preparare', 'In studio', 'Iscritto', 'Superato', 'Respinto')),
  grade INTEGER CHECK (grade BETWEEN 18 AND 30),
  honors BOOLEAN DEFAULT FALSE,
  date DATE,
  time TEXT DEFAULT '09:00',
  room TEXT DEFAULT 'Aula Magna',
  session TEXT DEFAULT 'Invernale' CHECK (session IN ('Invernale', 'Estiva', 'Autunnale', 'Straordinaria')),
  exam_type TEXT DEFAULT 'Scritto + Orale' CHECK (exam_type IN ('Scritto', 'Orale', 'Scritto + Orale', 'Progetto')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per performance di ricerca per utente
CREATE INDEX IF NOT EXISTS idx_user_exams_user_id ON public.user_exams(user_id);

-- Abilita RLS
ALTER TABLE public.user_exams ENABLE ROW LEVEL SECURITY;

-- Policies per user_exams: ogni studente gestisce solo il proprio libretto privato
DROP POLICY IF EXISTS "Utente legge solo i propri esami" ON public.user_exams;
CREATE POLICY "Utente legge solo i propri esami" 
ON public.user_exams FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utente inserisce solo i propri esami" ON public.user_exams;
CREATE POLICY "Utente inserisce solo i propri esami" 
ON public.user_exams FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utente aggiorna solo i propri esami" ON public.user_exams;
CREATE POLICY "Utente aggiorna solo i propri esami" 
ON public.user_exams FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utente cancella solo i propri esami" ON public.user_exams;
CREATE POLICY "Utente cancella solo i propri esami" 
ON public.user_exams FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ========================================================
-- 3. ABILITAZIONE REALTIME (Per elenco membri e presenze)
-- ========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;
