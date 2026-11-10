import type { Post } from './types';

/** Novedades locales (respaldo si no hay Supabase). Con Supabase se administran desde /admin. */
export const posts: Post[] = [
  {
    slug: 'nueva-web-acroma',
    kind: 'noticia',
    title: 'Estrenamos nueva web',
    summary: 'Ya puedes conocer nuestros servicios y proyectos y pedir tu cotización en línea.',
    body: [
      'Renovamos nuestra página para que encuentres más fácil lo que necesitas: servicios, proyectos y una forma rápida de contactarnos.',
      'Síguenos en Facebook e Instagram para ver avances de obra y novedades del estudio.',
    ],
    ctaLabel: 'Solicitar cotización',
    ctaUrl: '/contacto#formulario',
    socialUrl: '',
    startsOn: '2026-11-01',
    pinned: false,
  },
];
