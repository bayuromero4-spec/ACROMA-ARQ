/**
 * Tipos de datos del sitio.
 *
 * Estos tipos describen la forma de los datos. Hoy los datos viven en archivos
 * locales (src/data/*.ts); más adelante vendrán de Supabase con la misma forma,
 * así que las páginas no necesitan cambiar.
 */

export interface SiteImage {
  /** URL de la imagen (remota o ruta en /public). */
  src: string;
  /** Texto alternativo descriptivo (accesibilidad y SEO). */
  alt: string;
  width: number;
  height: number;
}

export interface BusinessInfo {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phones: { label: string; display: string; e164: string }[];
  whatsapp: { e164: string; display: string };
  address: {
    street: string;
    locality: string;
    region: string;
    country: string;
    countryCode: string;
  };
  geo: { latitude: number; longitude: number };
  hours: string;
  social: { facebook: string; instagram: string };
  stats: { value: string; label: string }[];
}

export interface Service {
  slug: string;
  title: string;
  /** Texto corto para tarjetas. */
  summary: string;
  /** Descripción completa para la página de servicios. */
  description: string;
  /** Etiqueta pequeña sobre el título (p. ej. "Diseño"). */
  kicker: string;
  /** Puntos clave del servicio. */
  features: string[];
  /** A quién va dirigido. */
  idealFor: string;
  /** Qué recibe el cliente. */
  deliverables: string;
  image: SiteImage;
  /** Orden de aparición. */
  order: number;
  /** Se muestra en el home. */
  featured: boolean;
}

export type ProjectCategory =
  | 'Vivienda'
  | 'Reforma integral'
  | 'Cocinas y baños'
  | 'Ampliación'
  | 'Multifamiliar'
  | 'Comercial';

export interface Project {
  title: string;
  slug: string;
  /** Resumen corto para tarjetas y meta description. */
  excerpt: string;
  /** Descripción larga (párrafos). */
  description: string[];
  category: ProjectCategory;
  location: string;
  /** Fecha de finalización, formato ISO (AAAA-MM-DD). */
  date: string;
  featured: boolean;
  mainImage: SiteImage;
  gallery: SiteImage[];
  /** Datos técnicos opcionales. */
  details?: { label: string; value: string }[];
  /** Servicios aplicados (slugs de servicios). */
  services?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  /** Valoración de 1 a 5. */
  rating: number;
  /** Slug de un proyecto relacionado (opcional). */
  projectSlug?: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface Reason {
  title: string;
  description: string;
}

export interface Post {
  slug: string;
  kind: 'campana' | 'noticia';
  title: string;
  summary: string;
  body: string[];
  image?: SiteImage;
  ctaLabel: string;
  ctaUrl: string;
  /** Enlace a la publicación en Facebook/Instagram (opcional). */
  socialUrl: string;
  /** Fechas ISO (AAAA-MM-DD). */
  startsOn: string;
  endsOn?: string;
  pinned: boolean;
}

export interface SiteImages {
  hero?: { url: string; alt: string };
  nosotros?: { url: string; alt: string };
}
