-- Public portfolio bridge for ACROMA Business Hub projects.
-- Public users can only read rows explicitly published by the studio.
create table if not exists public.hub_project_publications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.hub_projects(id) on delete cascade,
  slug text not null unique,
  public_title text not null,
  public_category text not null default 'Arquitectura',
  public_location text not null default '',
  public_stage text not null default 'design' check (public_stage in ('design','development','construction','completed')),
  excerpt text not null default '',
  public_description text not null default '',
  cover_url text not null default '',
  is_published boolean not null default false,
  show_360 boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hub_project_publications_public_idx
  on public.hub_project_publications (public_stage, featured desc, updated_at desc)
  where is_published = true;
alter table public.hub_project_publications enable row level security;
revoke all on public.hub_project_publications from anon, authenticated;
grant select on public.hub_project_publications to anon, authenticated;
grant insert, update, delete on public.hub_project_publications to authenticated;
drop policy if exists hub_project_publications_public_read on public.hub_project_publications;
create policy hub_project_publications_public_read
  on public.hub_project_publications for select to anon, authenticated
  using (is_published = true);
drop policy if exists hub_project_publications_staff_read on public.hub_project_publications;
create policy hub_project_publications_staff_read
  on public.hub_project_publications for select to authenticated
  using (private.has_permission('hub.projects.read'));
drop policy if exists hub_project_publications_staff_insert on public.hub_project_publications;
create policy hub_project_publications_staff_insert
  on public.hub_project_publications for insert to authenticated
  with check (private.has_permission('hub.projects.manage'));
drop policy if exists hub_project_publications_staff_update on public.hub_project_publications;
create policy hub_project_publications_staff_update
  on public.hub_project_publications for update to authenticated
  using (private.has_permission('hub.projects.manage'))
  with check (private.has_permission('hub.projects.manage'));
drop policy if exists hub_project_publications_staff_delete on public.hub_project_publications;
create policy hub_project_publications_staff_delete
  on public.hub_project_publications for delete to authenticated
  using (private.has_permission('hub.projects.manage'));
