/*
  # Schema Inicial do Nailify
  
  ## Query Description:
  Criação das tabelas fundamentais para o sistema de agendamento.
  1. profiles: Extensão da tabela auth.users para dados do perfil e configurações (horários).
  2. services: Serviços oferecidos por cada profissional.
  3. appointments: Agendamentos realizados.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true
*/

-- Create PROFILES table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  plan TEXT DEFAULT 'free',
  business_hours JSONB DEFAULT '{
    "weekdays": {"enabled": true, "start": "09:00", "end": "18:00"},
    "saturday": {"enabled": true, "start": "09:00", "end": "14:00"},
    "sunday": {"enabled": false, "start": "00:00", "end": "00:00"}
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Public can view basic profile info (for booking)" 
  ON public.profiles FOR SELECT 
  TO anon, authenticated
  USING (true); -- Allow public to read profiles to get business hours/name for booking page

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create SERVICES table
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policies for services
CREATE POLICY "Users can manage their own services" 
  ON public.services FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view services (for booking)" 
  ON public.services FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Create APPOINTMENTS table
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The professional
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  date TEXT NOT NULL, -- ISO string YYYY-MM-DD
  start_time TEXT NOT NULL, -- HH:mm
  end_time TEXT NOT NULL, -- HH:mm
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, rescheduled
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments
CREATE POLICY "Users can view their own appointments (Professional)" 
  ON public.appointments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" 
  ON public.appointments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can insert appointments (Booking)" 
  ON public.appointments FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view appointments for availability calculation" 
  ON public.appointments FOR SELECT 
  TO anon, authenticated
  USING (true); -- Needed to calculate busy slots. In a real prod app, we might use a secure function instead.

CREATE POLICY "Public can update appointments (Cancel/Reschedule)" 
  ON public.appointments FOR UPDATE
  TO anon, authenticated
  USING (true); -- Simplified for this demo to allow clients to cancel via link

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
