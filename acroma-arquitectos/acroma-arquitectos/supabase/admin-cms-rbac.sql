-- =============================================================================
-- ACROMA ARQUITECTOS — CMS, roles y permisos granulares
-- Ejecutar UNA VEZ en Supabase SQL Editor, después de schema.sql.
-- Migración aditiva: conserva admins y contenido existentes.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- Roles y permisos
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z][a-z0-9_]*$'),
  name text not null,
  description text not null default '',
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  module text not null
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- Permisos base
insert into public.permissions (code, name, module) values
 ('dashboard.read', 'Ver dashboard', 'dashboard'),
 ('cms.read', 'Ver contenido del sitio', 'cms'),
 ('cms.edit', 'Editar contenido del sitio', 'cms'),
 ('cms.publish', 'Publicar cambios', 'cms'),
 ('projects.manage', 'Gestionar proyectos', 'projects'),
 ('services.manage', 'Gestionar servicios', 'services'),
 ('posts.manage', 'Gestionar novedades y campañas', 'posts'),
 ('testimonials.manage', 'Gestionar testimonios', 'testimonials'),
 ('site_images.manage', 'Gestionar imágenes del sitio', 'media'),
 ('media.manage', 'Subir y gestionar archivos', 'media'),
 ('business.manage', 'Editar datos del negocio', 'business'),
 ('leads.read', 'Ver consultas y clientes', 'crm'),
 ('leads.manage', 'Gestionar consultas y clientes', 'crm'),
 ('appointments.manage', 'Gestionar agenda', 'crm'),
 ('analytics.read', 'Ver analítica', 'analytics'),
 ('seo.manage', 'Gestionar SEO', 'marketing'),
 ('users.manage', 'Gestionar usuarios y roles', 'security'),
 ('settings.manage', 'Gestionar configuración', 'security'),
 ('audit.read', 'Consultar historial de cambios', 'security')
on conflict (code) do nothing;

-- Roles iniciales
insert into public.roles (code, name, description) values
 ('admin', 'Administrador', 'Control completo de ACROMA.'),
 ('editor', 'Editor', 'Gestiona contenido y prepara publicaciones.'),
 ('commercial', 'Comercial', 'Gestiona consultas, clientes y seguimiento.')
on conflict (code) do nothing;

-- Editor: contenido y multimedia, sin permisos de usuarios ni configuración.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
 'dashboard.read','cms.read','cms.edit','projects.manage','services.manage',
 'posts.manage','testimonials.manage','site_images.manage','media.manage','seo.manage'
)
where r.code = 'editor'
on conflict do nothing;

-- Comercial: acceso limitado al CRM.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
 'dashboard.read','leads.read','leads.manage','appointments.manage'
)
where r.code = 'commercial'
on conflict do nothing;

-- Comprueba el permiso real del usuario autenticado.
-- Los correos allowlist de public.admins conservan el acceso total heredado.
create or replace function private.has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private, auth
as $$
  select
    auth.uid() is not null
    and (
      exists (
        select 1
        from auth.users u
        join public.admins a on a.email = lower(u.email)
        where u.id = auth.uid()
          and u.email_confirmed_at is not null
      )
      or exists (
        select 1
        from public.user_roles ur
        join public.role_permissions rp on rp.role_id = ur.role_id
        join public.permissions p on p.id = rp.permission_id
        where ur.user_id = auth.uid()
          and p.code = permission_code
      )
    );
$$;
revoke all on function private.has_permission(text) from public, anon;
grant execute on function private.has_permission(text) to authenticated;

-- CMS: páginas y secciones estructuradas que alimentarán el editor visual.
create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  status text not null default 'draft' check (status in ('draft','published')),
  seo_title text not null default '',
  seo_description text not null default '',
  og_image_url text not null default '',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  section_key text not null,
  label text not null,
  component text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  design jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);
create index if not exists cms_sections_page_order_idx
  on public.cms_sections(page_id, sort_order);

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  note text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (page_id, version)
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id, created_at desc);

-- Actualización de timestamps
create or replace function private.touch_updated_at()
returns trigger language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;

drop trigger if exists cms_pages_touch on public.cms_pages;
create trigger cms_pages_touch before update on public.cms_pages
for each row execute function private.touch_updated_at();
drop trigger if exists cms_sections_touch on public.cms_sections;
create trigger cms_sections_touch before update on public.cms_sections
for each row execute function private.touch_updated_at();

-- Auditoría de cambios editoriales.
create or replace function private.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private, auth
as $$
declare
  old_row jsonb;
  new_row jsonb;
  rid text;
begin
  if tg_op <> 'INSERT' then old_row := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then new_row := to_jsonb(new); end if;
  rid := coalesce(new_row->>'id', old_row->>'id', new_row->>'slug', old_row->>'slug', new_row->>'key', old_row->>'key');
  insert into public.audit_logs(actor_id, action, table_name, record_id, before_data, after_data)
  values (auth.uid(), tg_op, tg_table_name, rid, old_row, new_row);
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
revoke all on function private.write_audit_log() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['cms_pages','cms_sections','projects','services','posts','site_images','business_info'] loop
    execute format('drop trigger if exists audit_%I on public.%I', t, t);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.write_audit_log()', t, t);
  end loop;
end $$;

-- RLS en todas las tablas nuevas.
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_sections enable row level security;
alter table public.content_revisions enable row level security;
alter table public.audit_logs enable row level security;

-- Lectura administrativa de roles y permisos; cambios de asignación solo al administrador.
drop policy if exists roles_read on public.roles;
create policy roles_read on public.roles for select to authenticated
using (private.has_permission('users.manage'));
drop policy if exists permissions_read on public.permissions;
create policy permissions_read on public.permissions for select to authenticated
using (private.has_permission('users.manage'));
drop policy if exists role_permissions_read on public.role_permissions;
create policy role_permissions_read on public.role_permissions for select to authenticated
using (private.has_permission('users.manage'));
drop policy if exists role_permissions_admin on public.role_permissions;
create policy role_permissions_admin on public.role_permissions for all to authenticated
using (private.has_permission('users.manage'))
with check (private.has_permission('users.manage'));

drop policy if exists user_roles_read on public.user_roles;
create policy user_roles_read on public.user_roles for select to authenticated
using (private.has_permission('users.manage') or user_id = auth.uid());
drop policy if exists user_roles_admin on public.user_roles;
create policy user_roles_admin on public.user_roles for all to authenticated
using (private.has_permission('users.manage'))
with check (private.has_permission('users.manage'));

-- El contenido publicado es público; los borradores solo son visibles para usuarios con permiso.
drop policy if exists cms_pages_public_read on public.cms_pages;
create policy cms_pages_public_read on public.cms_pages for select to anon, authenticated
using (status = 'published');
drop policy if exists cms_pages_editor_read on public.cms_pages;
create policy cms_pages_editor_read on public.cms_pages for select to authenticated
using (private.has_permission('cms.read'));
drop policy if exists cms_pages_editor_write on public.cms_pages;
create policy cms_pages_editor_write on public.cms_pages for all to authenticated
using (private.has_permission('cms.edit'))
with check (private.has_permission('cms.edit'));

drop policy if exists cms_sections_public_read on public.cms_sections;
create policy cms_sections_public_read on public.cms_sections for select to anon, authenticated
using (
  is_visible = true and exists (
    select 1 from public.cms_pages p
    where p.id = page_id and p.status = 'published'
  )
);
drop policy if exists cms_sections_editor_read on public.cms_sections;
create policy cms_sections_editor_read on public.cms_sections for select to authenticated
using (private.has_permission('cms.read'));
drop policy if exists cms_sections_editor_write on public.cms_sections;
create policy cms_sections_editor_write on public.cms_sections for all to authenticated
using (private.has_permission('cms.edit'))
with check (private.has_permission('cms.edit'));

drop policy if exists content_revisions_read on public.content_revisions;
create policy content_revisions_read on public.content_revisions for select to authenticated
using (private.has_permission('audit.read') or private.has_permission('cms.publish'));
drop policy if exists content_revisions_insert on public.content_revisions;
create policy content_revisions_insert on public.content_revisions for insert to authenticated
with check (private.has_permission('cms.edit'));

drop policy if exists audit_logs_read on public.audit_logs;
create policy audit_logs_read on public.audit_logs for select to authenticated
using (private.has_permission('audit.read'));

-- Sustituye las políticas exclusivas de administrador por permisos granulares.
drop policy if exists business_admin on public.business_info;
create policy business_manage on public.business_info for all to authenticated
using (private.has_permission('business.manage'))
with check (private.has_permission('business.manage'));

drop policy if exists services_admin on public.services;
create policy services_manage on public.services for all to authenticated
using (private.has_permission('services.manage'))
with check (private.has_permission('services.manage'));

drop policy if exists projects_admin on public.projects;
create policy projects_manage on public.projects for all to authenticated
using (private.has_permission('projects.manage'))
with check (private.has_permission('projects.manage'));

drop policy if exists project_images_admin on public.project_images;
create policy project_images_manage on public.project_images for all to authenticated
using (private.has_permission('projects.manage'))
with check (private.has_permission('projects.manage'));

drop policy if exists testimonials_admin on public.testimonials;
create policy testimonials_manage on public.testimonials for all to authenticated
using (private.has_permission('testimonials.manage'))
with check (private.has_permission('testimonials.manage'));

drop policy if exists leads_admin on public.leads;
create policy leads_read_manage on public.leads for select to authenticated
using (private.has_permission('leads.read'));
create policy leads_update_manage on public.leads for update to authenticated
using (private.has_permission('leads.manage'))
with check (private.has_permission('leads.manage'));
create policy leads_delete_manage on public.leads for delete to authenticated
using (private.has_permission('leads.manage'));

drop policy if exists settings_admin on public.site_settings;
create policy settings_manage on public.site_settings for all to authenticated
using (private.has_permission('settings.manage'))
with check (private.has_permission('settings.manage'));

drop policy if exists posts_admin on public.posts;
create policy posts_manage on public.posts for all to authenticated
using (private.has_permission('posts.manage'))
with check (private.has_permission('posts.manage'));

drop policy if exists site_images_admin on public.site_images;
create policy site_images_manage on public.site_images for all to authenticated
using (private.has_permission('site_images.manage'))
with check (private.has_permission('site_images.manage'));

-- Storage: escritura por permiso específico, lectura pública del bucket media.
drop policy if exists media_admin_write on storage.objects;
drop policy if exists media_manage_write on storage.objects;
create policy media_manage_write on storage.objects for all to authenticated
using (bucket_id = 'media' and private.has_permission('media.manage'))
with check (bucket_id = 'media' and private.has_permission('media.manage'));

-- El administrador principal conserva el acceso total mediante public.admins + is_admin().


-- API segura para que el panel consulte los permisos del usuario actual.
-- El wrapper es SECURITY INVOKER; la comprobación privilegiada vive en el esquema privado.
create or replace function private.get_my_permissions()
returns table(permission_code text)
language sql
stable
security definer
set search_path = pg_catalog, public, private, auth
as $$
  select p.code
  from public.permissions p
  where exists (
    select 1
    from auth.users u
    join public.admins a on a.email = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  )
  or exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    where ur.user_id = auth.uid() and rp.permission_id = p.id
  );
$$;
revoke all on function private.get_my_permissions() from public, anon;
grant execute on function private.get_my_permissions() to authenticated;

create or replace function public.has_permission(permission_code text)
returns boolean
language sql
stable
security invoker
set search_path = public, private
as $$
  select private.has_permission(permission_code);
$$;
revoke all on function public.has_permission(text) from public, anon;
grant execute on function public.has_permission(text) to authenticated;

create or replace function public.get_my_permissions()
returns table(permission_code text)
language sql
stable
security invoker
set search_path = public, private
as $$
  select * from private.get_my_permissions();
$$;
revoke all on function public.get_my_permissions() from public, anon;
grant execute on function public.get_my_permissions() to authenticated;

-- Un editor puede guardar borradores, pero solo quien tenga cms.publish puede publicar.
create or replace function private.guard_cms_publish()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
begin
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from new.status)
     and not private.has_permission('cms.publish') then
    raise exception 'No tienes permiso para publicar contenido.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_cms_publish() from public, anon, authenticated;
drop trigger if exists cms_pages_guard_publish on public.cms_pages;
create trigger cms_pages_guard_publish
before insert or update of status on public.cms_pages
for each row execute function private.guard_cms_publish();
