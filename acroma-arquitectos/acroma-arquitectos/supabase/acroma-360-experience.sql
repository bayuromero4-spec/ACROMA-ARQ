-- ACROMA 360 Experience: recorridos panorámicos vinculados a proyectos.
create table if not exists public.hub_project_tours (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.hub_projects(id) on delete cascade,
  slug text not null unique,
  title text not null default 'Recorrido virtual',
  intro text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  cover_url text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.hub_project_tour_scenes (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.hub_project_tours(id) on delete cascade,
  title text not null,
  description text not null default '',
  floor_label text not null default 'Nivel 1',
  panorama_url text not null,
  sort_order integer not null default 0,
  initial_yaw numeric not null default 0,
  initial_pitch numeric not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists hub_project_tour_scenes_order_idx on public.hub_project_tour_scenes(tour_id, floor_label, sort_order);
alter table public.hub_project_tours enable row level security;
alter table public.hub_project_tour_scenes enable row level security;
drop policy if exists "hub_tours_manage_authenticated" on public.hub_project_tours;
create policy "hub_tours_manage_authenticated" on public.hub_project_tours for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "hub_tours_read_published" on public.hub_project_tours;
create policy "hub_tours_read_published" on public.hub_project_tours for select to anon, authenticated using (status = 'published' or auth.uid() is not null);
drop policy if exists "hub_tour_scenes_manage_authenticated" on public.hub_project_tour_scenes;
create policy "hub_tour_scenes_manage_authenticated" on public.hub_project_tour_scenes for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "hub_tour_scenes_read_published" on public.hub_project_tour_scenes;
create policy "hub_tour_scenes_read_published" on public.hub_project_tour_scenes for select to anon, authenticated using (exists (select 1 from public.hub_project_tours t where t.id = tour_id and t.status = 'published'));
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('acroma-360','acroma-360',true,52428800,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=52428800,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "acroma_360_public_read" on storage.objects;
create policy "acroma_360_public_read" on storage.objects for select to anon, authenticated using (bucket_id='acroma-360');
drop policy if exists "acroma_360_auth_upload" on storage.objects;
create policy "acroma_360_auth_upload" on storage.objects for insert to authenticated with check (bucket_id='acroma-360');
drop policy if exists "acroma_360_auth_update" on storage.objects;
create policy "acroma_360_auth_update" on storage.objects for update to authenticated using (bucket_id='acroma-360') with check (bucket_id='acroma-360');
drop policy if exists "acroma_360_auth_delete" on storage.objects;
create policy "acroma_360_auth_delete" on storage.objects for delete to authenticated using (bucket_id='acroma-360');