import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site!.toString().replace(/\/$/, '');
  // Cuando exista /admin, se mantiene fuera de los buscadores.
  const body = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${base}/sitemap-index.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
