# 🛠️ SOLUÇÃO FINAL PARA ERROS DE CONEXÃO

Os erros que você está vendo (**"Invalid path"** e **"Socket server error"**) acontecem por dois motivos:
1. As tabelas ainda não existem no seu banco Supabase.
2. O servidor ainda não conseguiu sincronizar com o banco vazio.

### 📋 PASSO 1: Criar as Tabelas Corretas
No seu painel do Supabase, vá em **SQL Editor** -> **New Query**, cole o código abaixo e clique em **RUN**:

```sql
-- PARTE 1: RESET (Limpa qualquer tabela antiga com nome errado)
drop table if exists public.users cascade;
drop table if exists public.products cascade;
drop table if exists public.orders cascade;
drop table if exists public.settings cascade;
drop table if exists public.usuarios cascade;
drop table if exists public.produtos cascade;
drop table if exists public.pedidos cascade;
drop table if exists public.configuracoes cascade;

-- PARTE 2: CRIAÇÃO (Padrão Inglês para compatibilidade total)

-- Tabela de Usuários
create table public.users (
  id text primary key,
  email text unique not null,
  password text not null,
  role text default 'client',
  created_at timestamp with time zone default now()
);

-- Tabela de Produtos
create table public.products (
  id bigint primary key generated always as identity,
  name text not null,
  price numeric not null,
  image text,
  image_url text,
  description text,
  category text,
  sizes text[], -- Adicionado para tamanhos (Array de texto)
  stock_quantity integer default 0,
  created_at timestamp with time zone default now()
);

-- Tabela de Configurações
create table public.settings (
  id integer primary key default 1,
  pix_key text,
  pix_name text,
  pix_city text,
  whatsapp text,
  logo_url text,
  enable_card boolean default true,
  banner_url text,
  banner_title text,
  updated_at timestamp with time zone default now()
);

-- Tabela de Pedidos
create table public.orders (
  id bigint primary key generated always as identity,
  user_email text,
  customer_name text,
  items jsonb,
  total_price numeric,
  payment_method text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- PARTE 3: PERMISSÕES (Libera o acesso para o site)
alter table public.users disable row level security;
alter table public.products disable row level security;
alter table public.settings disable row level security;
alter table public.orders disable row level security;

-- PARTE 4: DADOS INICIAIS
insert into public.users (id, email, password, role) 
values ('admin-master', 'mavictorlojaonline@gmail.com', 'mavictor1234', 'admin')
on conflict (email) do nothing;

insert into public.settings (id, pix_name, whatsapp) 
values (1, 'Venda Rápida MaVictor', '5588999126218')
on conflict (id) do nothing;
```

### 📋 PASSO 2: Verificar a URL do Supabase
Clique no link **/api/debug/supabase** no seu site.
Veja se a `url_do_banco` é a mesma que aparece em **Settings -> API** no Supabase.

### 📋 PASSO 3: Reiniciar
Após rodar o SQL, o erro de "Invalid path" deve sumir ao atualizar a página. O sistema agora usará as tabelas em Inglês para evitar bugs de caracteres especiais.
