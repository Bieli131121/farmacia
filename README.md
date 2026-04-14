# FarmaVida — Sistema de Farmácia Online

React + Vite · Supabase · Stone Pagamentos

---

## Stack

| Camada      | Tecnologia                        |
|-------------|-----------------------------------|
| Frontend    | React 18, Vite, React Router v6   |
| Backend/DB  | Supabase (PostgreSQL + Auth + Realtime) |
| Pagamentos  | Stone Pagamentos (PIX + Cartão)   |
| Deploy      | Vercel / Netlify                  |

---

## 1. Supabase — setup

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor → New query** e cole todo o SQL abaixo:

```sql
-- PRODUTOS
create table if not exists produtos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  descricao     text,
  categoria     text not null,
  preco         numeric(10,2) not null,
  preco_original numeric(10,2),
  estoque       int not null default 0,
  imagem_url    text,
  ativo         boolean not null default true,
  created_at    timestamptz default now()
);
alter table produtos enable row level security;
create policy "leitura publica" on produtos for select using (true);
create policy "admin escreve"   on produtos for all   using (auth.role() = 'authenticated');

-- PEDIDOS
create table if not exists pedidos (
  id            uuid primary key default gen_random_uuid(),
  cliente_nome  text not null,
  cliente_email text not null,
  cliente_fone  text,
  itens         jsonb not null,
  total         numeric(10,2) not null,
  metodo_pag    text not null,
  parcelas      int default 1,
  status        text not null default 'pendente',
  payment_id    text,
  observacoes   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table pedidos enable row level security;
create policy "inserir pedido"  on pedidos for insert with check (true);
create policy "leitura pedidos" on pedidos for select using (true);
create policy "admin atualiza"  on pedidos for update using (auth.role() = 'authenticated');

-- RESERVAS
create table if not exists reservas (
  id            uuid primary key default gen_random_uuid(),
  cliente_nome  text not null,
  cliente_email text not null,
  cliente_fone  text,
  itens         jsonb not null,
  status        text not null default 'ativa',
  expira_em     timestamptz default (now() + interval '24 hours'),
  observacoes   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table reservas enable row level security;
create policy "inserir reserva"  on reservas for insert with check (true);
create policy "leitura reservas" on reservas for select using (true);
create policy "admin atualiza r" on reservas for update using (auth.role() = 'authenticated');

-- Função para decrementar estoque
create or replace function decrementar_estoque(produto_id uuid, qtd int)
returns void language plpgsql as $$
begin
  update produtos set estoque = estoque - qtd where id = produto_id;
end;
$$;
```

3. Vá em **Authentication → Users → Invite user** e crie o usuário admin
4. Pegue a **URL** e **anon key** em **Project Settings → API**

---

## 2. Stone Pagamentos — setup

1. Crie conta em [stone.com.br](https://stone.com.br) e solicite acesso à API
2. No portal da Stone, obtenha:
   - `STONE_ACCOUNT_ID` — ID da sua conta
   - `STONE_ACCESS_TOKEN` — token de acesso (sandbox para testes)

> ⚠️ **Segurança**: Em produção, gere o token Stone numa **Supabase Edge Function**
> para não expor credenciais no frontend.

---

## 3. Variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

VITE_STONE_ACCOUNT_ID=sua_account_id
VITE_STONE_ACCESS_TOKEN=seu_token_sandbox

# E-mails com acesso ao painel admin (separados por vírgula)
VITE_ADMIN_EMAILS=admin@farmavida.com.br
```

---

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse:
- **Loja cliente**: http://localhost:5173
- **Painel admin**: http://localhost:5173/admin/login

---

## 5. Deploy (Vercel)

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel

# Configure as variáveis de ambiente no dashboard da Vercel
# Project → Settings → Environment Variables
```

---

## Estrutura de páginas

### Área do cliente (`/`)
| Rota                  | Descrição                          |
|-----------------------|------------------------------------|
| `/`                   | Loja — catálogo com filtros        |
| `/carrinho`           | Carrinho com resumo                |
| `/checkout`           | Checkout — compra (PIX/cartão) ou reserva |
| `/confirmacao/:id`    | Confirmação do pedido/reserva      |
| `/meus-pedidos`       | Consulta de pedidos por e-mail     |

### Área admin (`/admin`)
| Rota                  | Descrição                          |
|-----------------------|------------------------------------|
| `/admin/login`        | Login com Supabase Auth            |
| `/admin/dashboard`    | KPIs, pedidos recentes, estoque    |
| `/admin/produtos`     | CRUD de produtos                   |
| `/admin/pedidos`      | Gestão de pedidos + troca de status|
| `/admin/reservas`     | Gestão de reservas + confirmação   |

---

## Fluxo de pagamento Stone

```
Cliente → Checkout
  ├── PIX
  │     Stone API → gera QR Code + código copia e cola
  │     Cliente paga → clica "Já paguei"
  │     Sistema registra pedido como "pendente" (confirmar via webhook)
  │
  └── Cartão
        Stone.js tokeniza o cartão (nunca dados brutos no backend)
        Stone API → processa cobrança → retorna status
        status=approved → pedido criado como "pago"
        status=refused  → toast de erro
```

### Webhook Stone (produção)
Configure em **Portal Stone → Webhooks** apontando para uma
**Supabase Edge Function** que atualiza `pedidos.status` ao receber
confirmação de pagamento PIX.

---

## Personalização rápida

| O que mudar          | Onde                              |
|----------------------|-----------------------------------|
| Nome da farmácia     | `src/components/client/Header.jsx`, `index.html` |
| Endereço/horário     | `src/components/client/Footer.jsx`, `src/pages/client/Confirmacao.jsx` |
| Cores                | `src/index.css` — variáveis `:root` |
| Categorias           | `src/pages/client/Loja.jsx` → array `CATS` |
| Produtos demo        | `src/pages/client/Loja.jsx` → array `DEMO` |
