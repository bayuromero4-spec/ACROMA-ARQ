import type { SiteImage } from './types';

/**
 * Imágenes de ejemplo (Unsplash). Sustituir por fotos reales de ACROMA
 * (más adelante se subirán desde el panel /admin a Supabase Storage).
 */
const UNSPLASH = 'https://images.unsplash.com';

export const photo = {
  casaModerna: 'photo-1600585154340-be6161a56a0c',
  casaFachada: 'photo-1600607687939-ce8a6c25118c',
  casaJardin: 'photo-1600573472592-401b489a3cdc',
  casaExterior: 'photo-1600596542815-ffad4c1539a9',
  edificio: 'photo-1486406146926-c627a92ad1ab',
  interiorLuminoso: 'photo-1600566753190-17f0baa2a6c3',
  sala: 'photo-1600607688969-a5bfcd646154',
  cocina: 'photo-1556909114-f6e7ad7d3136',
  bano: 'photo-1584622650111-993a426fbf0a',
  planos: 'photo-1503387762-592deb58ef4e',
  equipoPlanos: 'photo-1497366754035-f200968a6e72',
  detalle: 'photo-1518005020951-eccb494ad742',
  obra: 'photo-1504307651254-35680f356dfd',
} as const;

/** Construye un SiteImage a partir de un ID de Unsplash. */
export function img(id: string, width: number, height: number, alt: string): SiteImage {
  return {
    src: `${UNSPLASH}/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=78`,
    alt,
    width,
    height,
  };
}

/** Genera un srcset responsivo para imágenes de Unsplash. */
export function unsplashSrcset(src: string, widths: number[] = [480, 800, 1200, 1600]): string | undefined {
  if (!src.startsWith(UNSPLASH)) return undefined;
  const base = src.replace(/([?&])w=\d+/, '$1').replace(/([?&])h=\d+/, '$1').replace(/&&+/g, '&').replace(/\?&/, '?');
  return widths.map((w) => `${base}&w=${w} ${w}w`).join(', ');
}
