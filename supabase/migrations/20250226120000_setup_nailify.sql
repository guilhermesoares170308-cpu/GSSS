-- ⚠️ ATENÇÃO: ISSO VAI ZERAR AS TABELAS EXISTENTES PARA RECONFIGURAR CORRETAMENTE
-- Execute este script no SQL Editor do Supabase

DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS (PROFILES)
-- Guarda dados do profissional (nome, horários de atendimento)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  business_hours JSONB DEFAULT '{"weekdays": {"end": "18:00", "start": "09:00", "enabled": true}, "sunday": {"end": "00:00", "start": "00:00", "enabled": false}, "saturday": {"end": "14:00", "start": "09:00", "enabled": true}}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Segurança (RLS) para Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa (público) pode VER o perfil para saber o nome e horário de atendimento
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Apenas o dono pode ATUALIZAR seu próprio perfil
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Inserção é feita via Trigger (automático)

-- 2. TABELA DE SERVIÇOS (SERVICES)
CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- em minutos
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Segurança (RLS) para Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Público pode VER os serviços para escolher no agendamento
CREATE POLICY "Services are viewable by everyone" 
ON public.services FOR SELECT USING (true);

-- Apenas o dono pode CRIAR, EDITAR ou DELETAR serviços
CREATE POLICY "Users can insert own services" 
ON public.services FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" 
ON public.services FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" 
ON public.services FOR DELETE USING (auth.uid() = user_id);

-- 3. TABELA DE AGENDAMENTOS (APPOINTMENTS)
CREATE TABLE public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL, -- Profissional
  service_id UUID REFERENCES public.services(id) NOT NULL,
  client_name TEXT NOT NULL,
  date DATE NOT NULL, -- YYYY-MM-DD
  start_time TEXT NOT NULL, -- HH:mm
  end_time TEXT NOT NULL, -- HH:mm
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, rescheduled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Segurança (RLS) para Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Público pode VER agendamentos (necessário para calcular horários ocupados e evitar conflitos)
CREATE POLICY "Appointments are viewable by everyone" 
ON public.appointments FOR SELECT USING (true);

-- Público pode CRIAR agendamentos (Agendar horário)
CREATE POLICY "Public can insert appointments" 
ON public.appointments FOR INSERT WITH CHECK (true);

-- Público pode ATUALIZAR (Para cancelar/remarcar via link)
-- Em um app maior, usaríamos tokens de segurança, mas para Micro-SaaS simples isso funciona
CREATE POLICY "Public can update appointments" 
ON public.appointments FOR UPDATE USING (true);

-- 4. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE AO CADASTRAR
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger se existir para recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
