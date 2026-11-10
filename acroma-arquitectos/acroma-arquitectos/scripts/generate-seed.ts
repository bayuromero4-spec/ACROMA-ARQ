// Genera supabase/seed.sql desde los datos locales (src/data). Uso: npm run seed:generate
import { writeFileSync } from 'node:fs';
import { business } from '../src/data/site';
import { services } from '../src/data/services';
import { projects } from '../src/data/projects';
import { testimonials } from '../src/data/testimonials';

const q = (v: unknown) => `'${String(v).replace(/'/g, "''")}'`;
const arr = (a: string[]) => (a.length ? `array[${a.map(q).join(', ')}]::text[]` : `'{}'::text[]`);
const json = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;

const out: string[] = [];
out.push(`-- ACROMA Arquitectos — contenido inicial (generado desde src/data con "npm run seed:generate").
-- Ejecuta DESPUÉS de schema.sql. Es seguro repetirlo: no duplica ni pisa lo que ya editaste.
`);

out.push(`insert into public.business_info (id, name, tagline, description, email, phones, whatsapp_e164, whatsapp_display, street, locality, region, country, hours, facebook, instagram, stats)
values (1, ${q(business.name)}, ${q(business.tagline)}, ${q(business.description)}, ${q(business.email)}, ${json(business.phones)}, ${q(business.whatsapp.e164)}, ${q(business.whatsapp.display)}, ${q(business.address.street)}, ${q(business.address.locality)}, ${q(business.address.region)}, ${q(business.address.country)}, ${q(business.hours)}, ${q(business.social.facebook)}, ${q(business.social.instagram)}, ${json(business.stats)})
on conflict (id) do nothing;
`);

for (const s of services) {
  out.push(`insert into public.services (slug, title, kicker, summary, description, features, ideal_for, deliverables, image_url, image_alt, sort_order, featured, status)
values (${q(s.slug)}, ${q(s.title)}, ${q(s.kicker)}, ${q(s.summary)}, ${q(s.description)}, ${arr(s.features)}, ${q(s.idealFor)}, ${q(s.deliverables)}, ${q(s.image.src)}, ${q(s.image.alt)}, ${s.order}, ${s.featured}, 'published')
on conflict (slug) do nothing;
`);
}

for (const p of projects) {
  out.push(`insert into public.projects (slug, title, excerpt, description, category, location, completed_on, featured, main_image_url, main_image_alt, details, service_slugs, status)
values (${q(p.slug)}, ${q(p.title)}, ${q(p.excerpt)}, ${arr(p.description)}, ${q(p.category)}, ${q(p.location)}, ${q(p.date)}, ${p.featured}, ${q(p.mainImage.src)}, ${q(p.mainImage.alt)}, ${json(p.details ?? [])}, ${arr(p.services ?? [])}, 'published')
on conflict (slug) do nothing;
`);
  if (p.gallery.length) {
    out.push(`insert into public.project_images (project_id, url, alt, sort_order)
select pr.id, g.url, g.alt, g.ord from public.projects pr
cross join (values
${p.gallery.map((g, i) => `  (${q(g.src)}, ${q(g.alt)}, ${i})`).join(',\n')}
) as g(url, alt, ord)
where pr.slug = ${q(p.slug)}
  and not exists (select 1 from public.project_images pi where pi.project_id = pr.id);
`);
  }
}

if (testimonials.length) {
  out.push(`insert into public.testimonials (name, role, location, quote, rating, project_slug, sort_order, status)
select v.* from (values
${testimonials.map((t, i) => `  (${q(t.name)}, ${q(t.role)}, ${q(t.location)}, ${q(t.quote)}, ${t.rating}, ${t.projectSlug ? q(t.projectSlug) : 'null'}, ${i}, 'published')`).join(',\n')}
) as v(name, role, location, quote, rating, project_slug, sort_order, status)
where not exists (select 1 from public.testimonials);
`);
}

writeFileSync('supabase/seed.sql', out.join('\n'));
console.log('supabase/seed.sql escrito');
