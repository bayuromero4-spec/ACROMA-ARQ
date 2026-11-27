alter table public.hub_project_tour_scenes
  add column if not exists plan_id uuid,
  add column if not exists plan_x numeric,
  add column if not exists plan_y numeric,
  add column if not exists connected_scene_ids uuid[] not null default '{}';

create table if not exists public.hub_project_tour_plans (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.hub_project_tours(id) on delete cascade,
  title text not null,
  floor_label text not null default 'Primer piso',
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists hub_project_tour_plans_tour_order_idx
  on public.hub_project_tour_plans(tour_id, sort_order);
alter table public.hub_project_tour_plans enable row level security;
drop policy if exists "Authenticated users manage tour plans" on public.hub_project_tour_plans;
create policy "Authenticated users manage tour plans" on public.hub_project_tour_plans
  for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "Public reads plans for published tours" on public.hub_project_tour_plans;
create policy "Public reads plans for published tours" on public.hub_project_tour_plans
  for select to anon, authenticated using (
    exists (select 1 from public.hub_project_tours t where t.id = tour_id and t.status = 'published')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('acroma-360-plans','acroma-360-plans',true,20971520,
  array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true, file_size_limit=20971520,
  allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "Public read ACROMA 360 plans" on storage.objects;
create policy "Public read ACROMA 360 plans" on storage.objects for select to anon, authenticated
  using (bucket_id = 'acroma-360-plans');
drop policy if exists "Authenticated upload ACROMA 360 plans" on storage.objects;
create policy "Authenticated upload ACROMA 360 plans" on storage.objects for insert to authenticated
  with check (bucket_id = 'acroma-360-plans' and auth.uid() is not null);
drop policy if exists "Authenticated update ACROMA 360 plans" on storage.objects;
create policy "Authenticated update ACROMA 360 plans" on storage.objects for update to authenticated
  using (bucket_id = 'acroma-360-plans' and auth.uid() is not null)
  with check (bucket_id = 'acroma-360-plans' and auth.uid() is not null);
drop policy if exists "Authenticated delete ACROMA 360 plans" on storage.objects;
create policy "Authenticated delete ACROMA 360 plans" on storage.objects for delete to authenticated
  using (bucket_id = 'acroma-360-plans' and auth.uid() is not null);
