-- =============================================================================
-- ACROMA Arquitectos — AÑADIDO: campañas, novedades e imágenes del sitio.
-- Si ya ejecutaste schema.sql, ejecuta SOLO este archivo (SQL Editor → Run).
-- Si aún no ejecutaste schema.sql, no hace falta: ya incluye esto mismo.
-- Es seguro repetirlo.
-- =============================================================================

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
