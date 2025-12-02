-- CRIAÇÃO DA TABELA DE ESTOQUE
create table public.inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  quantity integer default 0,
  unit text default 'un', -- un, ml, cx, etc
  min_threshold integer default 5, -- para avisar quando estiver acabando
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CRIAÇÃO DA TABELA DE DESPESAS (FINANCEIRO)
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  date date not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POLÍTICAS DE SEGURANÇA (RLS)

-- Estoque
alter table public.inventory enable row level security;

create policy "Usuários podem ver seu próprio estoque"
  on public.inventory for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir no seu estoque"
  on public.inventory for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seu estoque"
  on public.inventory for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar seu estoque"
  on public.inventory for delete
  using (auth.uid() = user_id);

-- Despesas
alter table public.expenses enable row level security;

create policy "Usuários podem ver suas próprias despesas"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas despesas"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem deletar suas despesas"
  on public.expenses for delete
  using (auth.uid() = user_id);
