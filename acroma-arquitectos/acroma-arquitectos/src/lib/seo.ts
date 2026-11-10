/**
 * Constructores de datos estructurados (JSON-LD, schema.org).
 */
import type { BusinessInfo, Project, Service, Testimonial } from '../data/types';

const abs = (site: string, path: string) => new URL(path, site).toString();

export function organizationSchema(b: BusinessInfo, site: string, logoUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': ['GeneralContractor', 'ProfessionalService'],
    '@id': `${site}#organization`,
    name: b.name,
    description: b.description,
    url: site,
    logo: logoUrl,
    image: logoUrl,
    email: b.email,
    telephone: b.phones[0]?.e164,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address.street,
      addressLocality: b.address.locality,
      addressRegion: b.address.region,
      addressCountry: b.address.countryCode,
    },
    geo: { '@type': 'GeoCoordinates', latitude: b.geo.latitude, longitude: b.geo.longitude },
    areaServed: { '@type': 'AdministrativeArea', name: 'Cajamarca, Perú' },
    sameAs: [b.social.facebook, b.social.instagram],
  };
}

export function websiteSchema(b: BusinessInfo, site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site}#website`,
    name: b.name,
    url: site,
    inLanguage: 'es-PE',
    publisher: { '@id': `${site}#organization` },
  };
}

export function breadcrumbSchema(site: string, items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(site, item.href),
    })),
  };
}

export function serviceListSchema(site: string, services: Service[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.title,
        description: s.summary,
        provider: { '@id': `${site}#organization` },
        areaServed: 'Cajamarca, Perú',
      },
    })),
  };
}

export function projectSchema(site: string, p: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.excerpt,
    url: abs(site, `/proyectos/${p.slug}`),
    dateCreated: p.date,
    genre: p.category,
    image: [p.mainImage, ...p.gallery].map((i) => i.src),
    locationCreated: { '@type': 'Place', name: p.location },
    creator: { '@id': `${site}#organization` },
  };
}

export function reviewsSchema(site: string, t: Testimonial[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: t.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Review',
        reviewBody: r.quote,
        author: { '@type': 'Person', name: r.name },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
        itemReviewed: { '@id': `${site}#organization` },
      },
    })),
  };
}

export function postSchema(site: string, p: import('../data/types').Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.summary,
    datePublished: p.startsOn,
    ...(p.image ? { image: [p.image.src] } : {}),
    mainEntityOfPage: abs(site, `/novedades/${p.slug}`),
    author: { '@id': `${site}#organization` },
    publisher: { '@id': `${site}#organization` },
  };
}
