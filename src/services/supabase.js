// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

/* ─────────────────────────────────────────────────────────
   SQL PARA RODAR NO SUPABASE SQL EDITOR (uma única vez)
   Acesse: supabase.com → seu projeto → SQL Editor → New query
   ─────────────────────────────────────────────────────────

-- PRODUTOS
create table if not exists produtos (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text,
  categoria   text not null,
  preco       numeric(10,2) not null,
  preco_original numeric(10,2),
  estoque     int not null default 0,
  imagem_url  text,
  ativo       boolean not null default true,
  created_at  timestamptz default now()
);

-- RLS: leitura pública, escrita autenticada
alter table produtos enable row level security;
create policy "leitura publica" on produtos for select using (true);
create policy "admin escreve" on produtos for all using (auth.role() = 'authenticated');

-- PEDIDOS
create table if not exists pedidos (
  id            uuid primary key default gen_random_uuid(),
  cliente_nome  text not null,
  cliente_email text not null,
  cliente_fone  text,
  itens         jsonb not null,
  total         numeric(10,2) not null,
  metodo_pag    text not null,   -- 'cartao' | 'pix'
  parcelas      int default 1,
  status        text not null default 'pendente',
  -- pendente | pago | pronto | retirado | cancelado
  payment_id    text,            -- ID retornado pela Stone
  observacoes   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table pedidos enable row level security;
-- cliente vê só os próprios (por email via parâmetro)
create policy "cliente ve proprio" on pedidos for select
  using (true); -- filtramos no código por email
create policy "inserir pedido" on pedidos for insert with check (true);
create policy "admin atualiza" on pedidos for update using (auth.role() = 'authenticated');

-- RESERVAS
create table if not exists reservas (
  id            uuid primary key default gen_random_uuid(),
  cliente_nome  text not null,
  cliente_email text not null,
  cliente_fone  text,
  itens         jsonb not null,
  status        text not null default 'ativa',
  -- ativa | retirada | expirada | cancelada
  expira_em     timestamptz default (now() + interval '24 hours'),
  observacoes   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table reservas enable row level security;
create policy "inserir reserva" on reservas for insert with check (true);
create policy "leitura reserva" on reservas for select using (true);
create policy "admin atualiza reserva" on reservas for update using (auth.role() = 'authenticated');

-- Função para decrementar estoque
create or replace function decrementar_estoque(produto_id uuid, qtd int)
returns void language plpgsql as $$
begin
  update produtos set estoque = estoque - qtd where id = produto_id;
end;
$$;

*/
