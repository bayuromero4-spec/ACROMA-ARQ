-- =============================================================================
-- ACROMA Arquitectos — esquema de base de datos (Supabase / PostgreSQL)
--
-- CÓMO USARLO:
--   Supabase → SQL Editor → New query → pega TODO este archivo → Run.
--   Es seguro volver a ejecutarlo (no borra datos).
--   Después ejecuta supabase/seed.sql para cargar el contenido inicial.
--
-- SEGURIDAD (resumen):
--   · Cualquier visitante puede LEER el contenido publicado y ENVIAR el formulario.
--   · Solo los correos de la tabla "admins" pueden crear/editar/borrar contenido,
--     subir imágenes y ver los leads.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Administradores
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);

insert into public.admins (email)
values ('andersoncristianromeromalca@gmail.com')
on conflict (email) do nothing;

-- ¿El usuario que hace la petición es administrador?
-- Comprueba el usuario real de Supabase Auth, con el correo CONFIRMADO.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    join public.admins a on lower(u.email) = a.email
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Mantiene "updated_at" al día
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Información del negocio (una sola fila)
-- ---------------------------------------------------------------------------
create table if not exists public.business_info (
  id               int primary key default 1 check (id = 1),
  name             text not null,
  tagline          text not null default '',
  description      text not null default '',
  email            text not null default '',
  phones           jsonb not null default '[]'::jsonb,   -- [{label, display, e164}]
  whatsapp_e164    text not null default '',             -- sin "+", p. ej. 51960577902
  whatsapp_display text not null default '',
  street           text not null default '',
  locality         text not null default '',
  region           text not null default '',
  country          text not null default 'Perú',
  hours            text not null default '',
  facebook         text not null default '',
  instagram        text not null default '',
  stats            jsonb not null default '[]'::jsonb,   -- [{value, label}]
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Servicios
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title        text not null,
  kicker       text not null default '',
  summary      text not null default '',
  description  text not null default '',
  features     text[] not null default '{}',
  ideal_for    text not null default '',
  deliverables text not null default '',
  image_url    text not null default '',
  image_alt    text not null default '',
  sort_order   int  not null default 0,
  featured     boolean not null default false,
  status       text not null default 'published' check (status in ('draft', 'published')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Proyectos y su galería
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           text not null,
  excerpt         text not null default '',
  description     text[] not null default '{}',          -- párrafos
  category        text not null default 'Vivienda',
  location        text not null default '',
  completed_on    date not null default current_date,
  featured        boolean not null default false,
  main_image_url  text not null default '',
  main_image_alt  text not null default '',
  details         jsonb not null default '[]'::jsonb,    -- [{label, value}]
  service_slugs   text[] not null default '{}',
  status          text not null default 'published' check (status in ('draft', 'published')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  url         text not null,
  alt         text not null default '',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists project_images_project_idx on public.project_images (project_id, sort_order);

-- ---------------------------------------------------------------------------
-- 5. Testimonios
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text not null default '',
  location      text not null default '',
  quote         text not null,
  rating        int  not null default 5 check (rating between 1 and 5),
  project_slug  text,
  sort_order    int  not null default 0,
  status        text not null default 'published' check (status in ('draft', 'published')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. Leads (consultas del formulario)
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null check (char_length(name) between 2 and 120),
  email         text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text not null check (char_length(phone) between 6 and 40),
  project_type  text not null default '' check (char_length(project_type) <= 80),
  message       text not null check (char_length(message) between 5 and 4000),
  source        text not null default '' check (char_length(source) <= 200),
  status        text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'cerrado')),
  notes         text
);
create index if not exists leads_created_idx on public.leads (created_at desc);

-- ---------------------------------------------------------------------------
-- 7. Ajustes privados (solo administradores): p. ej. el enlace para republicar la web
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key   text primary key,
  value text not null default ''
);

-- ---------------------------------------------------------------------------
-- 8. Triggers de updated_at
-- ---------------------------------------------------------------------------
drop trigger if exists touch_business on public.business_info;
create trigger touch_business before update on public.business_info for each row execute function public.touch_updated_at();
drop trigger if exists touch_services on public.services;
create trigger touch_services before update on public.services for each row execute function public.touch_updated_at();
drop trigger if exists touch_projects on public.projects;
create trigger touch_projects before update on public.projects for each row execute function public.touch_updated_at();
drop trigger if exists touch_testimonials on public.testimonials;
create trigger touch_testimonials before update on public.testimonials for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 9. Seguridad a nivel de fila (RLS)
-- ---------------------------------------------------------------------------
alter table public.admins          enable row level security;
alter table public.business_info   enable row level security;
alter table public.services        enable row level security;
alter table public.projects        enable row level security;
alter table public.project_images  enable row level security;
alter table public.testimonials    enable row level security;
alter table public.leads           enable row level security;
alter table public.site_settings   enable row level security;

-- Administradores: solo ellos ven y gestionan la lista
drop policy if exists admins_all on public.admins;
create policy admins_all on public.admins for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Negocio: lectura pública, edición solo admin
drop policy if exists business_read on public.business_info;
create policy business_read on public.business_info for select to anon, authenticated using (true);
drop policy if exists business_admin on public.business_info;
create policy business_admin on public.business_info for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Servicios
drop policy if exists services_read on public.services;
create policy services_read on public.services for select to anon, authenticated using (status = 'published');
drop policy if exists services_admin on public.services;
create policy services_admin on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Proyectos
drop policy if exists projects_read on public.projects;
create policy projects_read on public.projects for select to anon, authenticated using (status = 'published');
drop policy if exists projects_admin on public.projects;
create policy projects_admin on public.projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Galería: visible si el proyecto está publicado
drop policy if exists project_images_read on public.project_images;
create policy project_images_read on public.project_images for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));
drop policy if exists project_images_admin on public.project_images;
create policy project_images_admin on public.project_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Testimonios
drop policy if exists testimonials_read on public.testimonials;
create policy testimonials_read on public.testimonials for select to anon, authenticated using (status = 'published');
drop policy if exists testimonials_admin on public.testimonials;
create policy testimonials_admin on public.testimonials for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Leads: cualquiera puede ENVIAR uno nuevo (nunca leerlo); solo admin los gestiona
drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads for insert to anon, authenticated
  with check (status = 'nuevo' and notes is null);
drop policy if exists leads_admin on public.leads;
create policy leads_admin on public.leads for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Ajustes privados
drop policy if exists settings_admin on public.site_settings;
create policy settings_admin on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 10. Almacenamiento de imágenes (bucket público "media")
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects for all to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 11. Campañas, novedades e imágenes del sitio (igual que novedades.sql)
-- ---------------------------------------------------------------------------
-- Campañas (promociones por temporada) y noticias (felicitaciones, novedades)
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind        text not null default 'noticia' check (kind in ('campana', 'noticia')),
  title       text not null,
  summary     text not null default '',
  body        text[] not null default '{}',                -- párrafos
  image_url   text not null default '',
  image_alt   text not null default '',
  cta_label   text not null default '',                    -- p. ej. "Quiero la promoción"
  cta_url     text not null default '',                    -- enlace del botón (opcional)
  social_url  text not null default '',                    -- publicación en Facebook/Instagram (opcional)
  starts_on   date not null default current_date,
  ends_on     date,                                        -- vacío = sin fecha de fin
  pinned      boolean not null default false,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists posts_starts_idx on public.posts (starts_on desc);

-- Imágenes de secciones del sitio que el cliente puede cambiar (portada, equipo…)
create table if not exists public.site_images (
  key         text primary key check (key in ('hero', 'nosotros')),
  url         text not null,
  alt         text not null default '',
  updated_at  timestamptz not null default now()
);

drop trigger if exists touch_posts on public.posts;
create trigger touch_posts before update on public.posts for each row execute function public.touch_updated_at();
drop trigger if exists touch_site_images on public.site_images;
create trigger touch_site_images before update on public.site_images for each row execute function public.touch_updated_at();

alter table public.posts       enable row level security;
alter table public.site_images enable row level security;

drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select to anon, authenticated using (status = 'published');
drop policy if exists posts_admin on public.posts;
create policy posts_admin on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists site_images_read on public.site_images;
create policy site_images_read on public.site_images for select to anon, authenticated using (true);
drop policy if exists site_images_admin on public.site_images;
create policy site_images_admin on public.site_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Ejemplos: una noticia publicada y una campaña de Navidad en BORRADOR (para que veas cómo se usa)
insert into public.posts (slug, kind, title, summary, body, cta_label, cta_url, starts_on, ends_on, pinned, status)
values
  ('nueva-web-acroma', 'noticia', 'Estrenamos nueva web',
   'Ya puedes conocer nuestros servicios y proyectos y pedir tu cotización en línea.',
   array['Renovamos nuestra página para que encuentres más fácil lo que necesitas: servicios, proyectos y una forma rápida de contactarnos.','Síguenos en Facebook e Instagram para ver avances de obra y novedades del estudio.'],
   'Solicitar cotización', '/contacto#formulario', current_date, null, false, 'published'),
  ('campana-navidena', 'campana', 'Campaña navideña ACROMA',
   'Edita este texto con tu promoción: qué incluye, hasta cuándo y cómo aprovecharla.',
   array['Escribe aquí los detalles de la campaña. Cuando esté lista, cambia el estado a «Publicado» y pulsa «Publicar cambios».'],
   'Quiero esta campaña', '/contacto#formulario', current_date, current_date + 30, true, 'draft')
on conflict (slug) do nothing;
