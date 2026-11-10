/**
 * Capa de acceso a contenido.
 *
 * Las páginas SOLO leen datos a través de estas funciones.
 *  · Con PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY definidas: lee de Supabase (solo contenido "published").
 *  · Sin ellas, o si Supabase falla durante el build: usa los datos locales de src/data.
 * Los datos se piden una sola vez por build y se reutilizan en todas las páginas.
 */
import { business as localBusiness, processSteps, reasons } from '../data/site';
import { services as localServices } from '../data/services';
import { projects as localProjects } from '../data/projects';
import { testimonials as localTestimonials } from '../data/testimonials';
import { posts as localPosts } from '../data/posts';
import type { BusinessInfo, Post, Project, ProjectCategory, ProcessStep, Reason, Service, SiteImage, SiteImages, Testimonial } from '../data/types';
import { getServerClient } from './supabase';

interface Content {
  business: BusinessInfo;
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  posts: Post[];
  siteImages: SiteImages;
}

const localContent = (): Content => ({
  business: localBusiness,
  services: localServices,
  projects: localProjects,
  testimonials: localTestimonials,
  posts: localPosts,
  siteImages: {},
});

/** Las imágenes subidas desde el panel no traen medidas: se usan proporciones estándar para evitar saltos de layout. */
const image = (src: string, alt: string, width: number, height: number): SiteImage => ({ src, alt, width, height });

async function loadFromSupabase(): Promise<Content> {
  const sb = getServerClient();
  if (!sb) return localContent();

  const [biz, svc, prj, imgs, tst, pst, sim] = await Promise.all([
    sb.from('business_info').select('*').eq('id', 1).maybeSingle(),
    sb.from('services').select('*').eq('status', 'published').order('sort_order'),
    sb.from('projects').select('*').eq('status', 'published').order('completed_on', { ascending: false }),
    sb.from('project_images').select('*').order('sort_order'),
    sb.from('testimonials').select('*').eq('status', 'published').order('sort_order'),
    sb.from('posts').select('*').eq('status', 'published').order('starts_on', { ascending: false }),
    sb.from('site_images').select('*'),
  ]);
  // posts / site_images pueden no existir aún si no se ejecutó novedades.sql: no es un error fatal.
  for (const r of [biz, svc, prj, imgs, tst]) if (r.error) throw new Error(r.error.message);
  if (!biz.data) throw new Error('business_info vacío');

  const b = biz.data;
  const business: BusinessInfo = {
    ...localBusiness,
    name: b.name,
    tagline: b.tagline,
    description: b.description,
    email: b.email,
    phones: b.phones,
    whatsapp: { e164: b.whatsapp_e164, display: b.whatsapp_display },
    address: { ...localBusiness.address, street: b.street, locality: b.locality, region: b.region, country: b.country },
    hours: b.hours,
    social: { facebook: b.facebook, instagram: b.instagram },
    stats: b.stats,
  };

  const services: Service[] = (svc.data ?? []).map((s) => ({
    slug: s.slug,
    title: s.title,
    kicker: s.kicker,
    summary: s.summary,
    description: s.description,
    features: s.features ?? [],
    idealFor: s.ideal_for,
    deliverables: s.deliverables,
    image: image(s.image_url, s.image_alt, 1200, 900),
    order: s.sort_order,
    featured: s.featured,
  }));

  const gallery = new Map<string, SiteImage[]>();
  for (const i of imgs.data ?? []) {
    const list = gallery.get(i.project_id) ?? [];
    list.push(image(i.url, i.alt, 1400, 1000));
    gallery.set(i.project_id, list);
  }

  const projects: Project[] = (prj.data ?? []).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    description: p.description ?? [],
    category: p.category as ProjectCategory,
    location: p.location,
    date: p.completed_on,
    featured: p.featured,
    mainImage: image(p.main_image_url, p.main_image_alt, 1600, 1100),
    gallery: gallery.get(p.id) ?? [],
    details: p.details ?? [],
    services: p.service_slugs ?? [],
  }));

  const testimonials: Testimonial[] = (tst.data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    location: t.location,
    quote: t.quote,
    rating: t.rating,
    projectSlug: t.project_slug ?? undefined,
  }));

  const posts: Post[] = pst.error
    ? localPosts
    : (pst.data ?? []).map((p) => ({
        slug: p.slug,
        kind: p.kind,
        title: p.title,
        summary: p.summary,
        body: p.body ?? [],
        image: p.image_url ? image(p.image_url, p.image_alt, 1400, 900) : undefined,
        ctaLabel: p.cta_label,
        ctaUrl: p.cta_url,
        socialUrl: p.social_url,
        startsOn: p.starts_on,
        endsOn: p.ends_on ?? undefined,
        pinned: p.pinned,
      }));

  const siteImages: SiteImages = {};
  for (const r of sim.error ? [] : (sim.data ?? [])) {
    if (r.key === 'hero' || r.key === 'nosotros') siteImages[r.key as 'hero' | 'nosotros'] = { url: r.url, alt: r.alt };
  }

  return { business, services, projects, testimonials, posts, siteImages };
}

let cache: Promise<Content> | null = null;
function content(): Promise<Content> {
  cache ??= loadFromSupabase().catch((err) => {
    console.warn(`[content] Supabase no disponible, uso datos locales: ${err instanceof Error ? err.message : err}`);
    return localContent();
  });
  return cache;
}

export async function getBusiness(): Promise<BusinessInfo> {
  return (await content()).business;
}

export async function getServices(options: { featuredOnly?: boolean } = {}): Promise<Service[]> {
  const list = [...(await content()).services].sort((a, b) => a.order - b.order);
  return options.featuredOnly ? list.filter((s) => s.featured) : list;
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return (await content()).services.find((s) => s.slug === slug);
}

export async function getProjects(options: { featuredOnly?: boolean; limit?: number } = {}): Promise<Project[]> {
  let list = [...(await content()).projects].sort((a, b) => b.date.localeCompare(a.date));
  if (options.featuredOnly) list = list.filter((p) => p.featured);
  if (options.limit) list = list.slice(0, options.limit);
  return list;
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return (await content()).projects.find((p) => p.slug === slug);
}

export async function getProjectsByService(serviceSlug: string): Promise<Project[]> {
  return (await content()).projects
    .filter((p) => p.services?.includes(serviceSlug))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getRelatedProjects(project: Project, limit = 3): Promise<Project[]> {
  const others = (await content()).projects.filter((p) => p.slug !== project.slug);
  const sameCategory = others.filter((p) => p.category === project.category);
  const rest = others.filter((p) => p.category !== project.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return (await content()).testimonials;
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  return processSteps;
}

export async function getReasons(): Promise<Reason[]> {
  return reasons;
}

const today = () => new Date().toISOString().slice(0, 10);
const isLive = (p: Post, day = today()) => p.startsOn <= day && (!p.endsOn || p.endsOn >= day);

/** Novedades y campañas vigentes hoy (fijadas primero, luego las más recientes). */
export async function getPosts(options: { limit?: number } = {}): Promise<Post[]> {
  const list = (await content()).posts
    .filter((p) => isLive(p))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.startsOn.localeCompare(a.startsOn));
  return options.limit ? list.slice(0, options.limit) : list;
}

export async function getAllPosts(): Promise<Post[]> {
  return (await content()).posts;
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return (await content()).posts.find((p) => p.slug === slug);
}

/** Campaña vigente para el aviso superior (la fijada o la más reciente). */
export async function getActiveCampaign(): Promise<Post | undefined> {
  return (await getPosts()).find((p) => p.kind === 'campana');
}

export async function getSiteImages(): Promise<SiteImages> {
  return (await content()).siteImages;
}
