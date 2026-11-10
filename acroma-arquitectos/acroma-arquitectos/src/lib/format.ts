/** Formatea una fecha ISO como "septiembre de 2025". */
export function formatMonthYear(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));
}

/** Año de una fecha ISO. */
export function yearOf(iso: string): string {
  return iso.slice(0, 4);
}

/** Enlace de WhatsApp con mensaje prellenado. */
export function whatsappUrl(e164WithoutPlus: string, message?: string): string {
  const base = `https://wa.me/${e164WithoutPlus}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** "15 de diciembre de 2026" a partir de AAAA-MM-DD (sin desfases de zona horaria). */
export function formatDay(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export const kindLabel = (kind: 'campana' | 'noticia') => (kind === 'campana' ? 'Campaña' : 'Novedad');

/** Detecta la red social de un enlace, para rotular el botón. */
export function socialName(url: string): string {
  if (/instagram\.com/i.test(url)) return 'Instagram';
  if (/facebook\.com|fb\.com|fb\.watch/i.test(url)) return 'Facebook';
  return 'redes';
}
