-- ACROMA Business Hub v1
-- Additive migration: preserves the public website and existing CMS.
create extension if not exists pgcrypto;

create table if not exists public.hub_clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 160),
  document_type text not null default 'none' check (document_type in ('none','dni','ruc','ce','passport')),
  document_number text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  city text not null default '',
  client_type text not null default 'person' check (client_type in ('person','company','investor')),
  source text not null default 'manual',
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists hub_clients_document_unique on public.hub_clients(document_type, document_number) where document_number <> '' and document_type <> 'none';
create index if not exists hub_clients_name_idx on public.hub_clients using gin (to_tsvector('simple', full_name));

create table if not exists public.hub_opportunities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.hub_clients(id) on delete cascade,
  title text not null,
  service_line text not null default 'Arquitectura y diseño',
  stage text not null default 'new' check (stage in ('new','contacted','diagnosis','quoted','negotiation','won','lost')),
  estimated_value numeric(14,2) not null default 0 check (estimated_value >= 0),
  currency text not null default 'PEN' check (currency = 'PEN'),
  probability integer not null default 10 check (probability between 0 and 100),
  assigned_to uuid references auth.users(id) on delete set null,
  next_follow_up date,
  lost_reason text not null default '',
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hub_opportunities_stage_idx on public.hub_opportunities(stage, updated_at desc);

create table if not exists public.hub_quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  client_id uuid not null references public.hub_clients(id),
  opportunity_id uuid references public.hub_opportunities(id) on delete set null,
  title text not null,
  scope text not null default '',
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  tax numeric(14,2) not null default 0 check (tax >= 0),
  total numeric(14,2) generated always as (subtotal + tax) stored,
  currency text not null default 'PEN' check (currency = 'PEN'),
  status text not null default 'draft' check (status in ('draft','sent','accepted','rejected','expired')),
  valid_until date,
  terms text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hub_contracts (
  id uuid primary key default gen_random_uuid(),
  contract_number text not null unique,
  client_id uuid not null references public.hub_clients(id),
  quote_id uuid references public.hub_quotes(id) on delete set null,
  title text not null,
  scope text not null default '',
  amount numeric(14,2) not null default 0 check (amount >= 0),
  currency text not null default 'PEN' check (currency = 'PEN'),
  status text not null default 'draft' check (status in ('draft','review','signed','active','completed','cancelled')),
  starts_on date,
  ends_on date,
  file_url text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hub_projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  client_id uuid not null references public.hub_clients(id),
  opportunity_id uuid references public.hub_opportunities(id) on delete set null,
  contract_id uuid references public.hub_contracts(id) on delete set null,
  title text not null,
  project_family text not null check (project_family in ('architecture','real_estate')),
  service_line text not null default '',
  location text not null default '',
  status text not null default 'planning' check (status in ('planning','design','review','documentation','construction','delivery','completed','paused','cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  budget numeric(14,2) not null default 0 check (budget >= 0),
  currency text not null default 'PEN' check (currency = 'PEN'),
  starts_on date,
  due_on date,
  manager_id uuid references auth.users(id) on delete set null,
  description text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hub_projects_status_idx on public.hub_projects(status, due_on);

create table if not exists public.hub_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.hub_projects(id) on delete cascade,
  client_id uuid references public.hub_clients(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending','in_progress','review','done','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hub_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  event_type text not null default 'meeting' check (event_type in ('meeting','site_visit','inspection','delivery','payment','other')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  client_id uuid references public.hub_clients(id) on delete set null,
  project_id uuid references public.hub_projects(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.hub_transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.hub_projects(id) on delete set null,
  client_id uuid references public.hub_clients(id) on delete set null,
  transaction_type text not null check (transaction_type in ('income','expense')),
  category text not null default 'general',
  description text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'PEN' check (currency = 'PEN'),
  transaction_date date not null default current_date,
  payment_status text not null default 'paid' check (payment_status in ('pending','paid','void')),
  reference text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists hub_transactions_date_idx on public.hub_transactions(transaction_date desc);

create table if not exists public.hub_whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  wa_message_id text unique,
  client_id uuid references public.hub_clients(id) on delete set null,
  phone_e164 text not null,
  direction text not null check (direction in ('inbound','outbound')),
  message_type text not null default 'text',
  body text not null default '',
  delivery_status text not null default 'received' check (delivery_status in ('received','queued','sent','delivered','read','failed')),
  provider_payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists hub_whatsapp_phone_idx on public.hub_whatsapp_messages(phone_e164, created_at desc);

-- Updated-at maintenance.
create or replace function public.hub_touch_updated_at()
returns trigger language plpgsql set search_path = pg_catalog
as $$ begin new.updated_at = now(); return new; end; $$;
revoke all on function public.hub_touch_updated_at() from public, anon, authenticated;
do $$
declare t text;
begin
  foreach t in array array['hub_clients','hub_opportunities','hub_quotes','hub_contracts','hub_projects','hub_tasks'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch_updated_at', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.hub_touch_updated_at()', t || '_touch_updated_at', t);
  end loop;
end $$;

-- Permission catalog. Existing administrator bypass is retained via private.has_permission().
insert into public.permissions(code,name,module) values
 ('hub.dashboard','Ver Business Hub','dashboard'),
 ('hub.clients.read','Ver clientes','crm'),
 ('hub.clients.manage','Gestionar clientes','crm'),
 ('hub.sales.manage','Gestionar oportunidades y cotizaciones','sales'),
 ('hub.projects.read','Ver proyectos','projects'),
 ('hub.projects.manage','Gestionar proyectos','projects'),
 ('hub.tasks.manage','Gestionar tareas y agenda','operations'),
 ('hub.finance.read','Ver finanzas','finance'),
 ('hub.finance.manage','Gestionar finanzas','finance'),
 ('hub.whatsapp.read','Ver conversaciones WhatsApp','communications'),
 ('hub.whatsapp.manage','Gestionar conversaciones WhatsApp','communications')
on conflict (code) do nothing;

-- Add role grants without elevating the existing editor/commercial roles to finance or administration.
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = any (
  case r.code
    when 'commercial' then array['hub.dashboard','hub.clients.read','hub.clients.manage','hub.sales.manage','hub.whatsapp.read','hub.whatsapp.manage']
    when 'editor' then array['hub.dashboard','hub.clients.read','hub.projects.read','hub.projects.manage','hub.tasks.manage']
    when 'commercial' then array['hub.dashboard','hub.clients.read','hub.clients.manage','hub.sales.manage','hub.whatsapp.read','hub.whatsapp.manage','hub.projects.read']
    else array[]::text[]
  end
)
on conflict do nothing;

-- Every business table is private to authenticated staff with module-specific permissions.
do $$
declare t text; read_perm text; write_perm text;
begin
  foreach t in array array['hub_clients','hub_opportunities','hub_quotes','hub_contracts','hub_projects','hub_tasks','hub_events','hub_transactions','hub_whatsapp_messages'] loop
    read_perm := case
      when t = 'hub_clients' then 'hub.clients.read'
      when t in ('hub_opportunities','hub_quotes','hub_contracts') then 'hub.sales.manage'
      when t = 'hub_projects' then 'hub.projects.read'
      when t in ('hub_tasks','hub_events') then 'hub.tasks.manage'
      when t = 'hub_transactions' then 'hub.finance.read'
      when t = 'hub_whatsapp_messages' then 'hub.whatsapp.read'
    end;
    write_perm := case
      when t = 'hub_clients' then 'hub.clients.manage'
      when t in ('hub_opportunities','hub_quotes','hub_contracts') then 'hub.sales.manage'
      when t = 'hub_projects' then 'hub.projects.manage'
      when t in ('hub_tasks','hub_events') then 'hub.tasks.manage'
      when t = 'hub_transactions' then 'hub.finance.manage'
      when t = 'hub_whatsapp_messages' then 'hub.whatsapp.manage'
    end;
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_access', t);
    execute format('create policy %I on public.%I for select to authenticated using (private.has_permission(%L))', t || '_read', t, read_perm);
    execute format('create policy %I on public.%I for insert to authenticated with check (private.has_permission(%L))', t || '_insert', t, write_perm);
    execute format('create policy %I on public.%I for update to authenticated using (private.has_permission(%L)) with check (private.has_permission(%L))', t || '_update', t, write_perm, write_perm);
    execute format('create policy %I on public.%I for delete to authenticated using (private.has_permission(%L))', t || '_delete', t, write_perm);
  end loop;
end $$;

-- Least-privilege Data API grants. RLS remains the row-level authorization boundary.
grant select, insert, update, delete on
 public.hub_clients, public.hub_opportunities, public.hub_quotes, public.hub_contracts,
 public.hub_projects, public.hub_tasks, public.hub_events, public.hub_transactions,
 public.hub_whatsapp_messages to authenticated;
revoke all on
 public.hub_clients, public.hub_opportunities, public.hub_quotes, public.hub_contracts,
 public.hub_projects, public.hub_tasks, public.hub_events, public.hub_transactions,
 public.hub_whatsapp_messages from anon;

-- This deployment intentionally does not add public write endpoints or store Meta secrets in the browser.


-- Allow authorized Business Hub staff to review and update public website inquiries.
-- This keeps the public insert-only policy intact and does not expose leads to anon users.
drop policy if exists leads_hub_read on public.leads;
create policy leads_hub_read on public.leads for select to authenticated
  using (private.has_permission('hub.clients.read'));
drop policy if exists leads_hub_update on public.leads;
create policy leads_hub_update on public.leads for update to authenticated
  using (private.has_permission('hub.clients.manage'))
  with check (private.has_permission('hub.clients.manage'));
grant select, update on public.leads to authenticated;
