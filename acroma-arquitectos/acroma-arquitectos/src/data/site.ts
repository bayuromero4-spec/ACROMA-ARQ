import type { BusinessInfo, ProcessStep, Reason } from './types';

/**
 * Información del negocio.
 * Más adelante estos datos podrán editarse desde el panel /admin (Supabase).
 * Los datos de contacto proceden de la web actual de ACROMA.
 */
export const business: BusinessInfo = {
  name: 'ACROMA Arquitectos',
  legalName: 'ACROMA Arquitectos',
  tagline: 'Arquitectura, construcción y reformas en Cajamarca',
  description:
    'Estudio de arquitectura y construcción en Cajamarca. Diseño arquitectónico, reformas integrales, remodelación de cocinas y baños, ampliaciones, construcción y planos de todas las especialidades.',
  url: 'https://acroma-arquitectos.com',
  email: 'contacto@acroma-arquitectos.com',
  phones: [
    { label: 'WhatsApp principal', display: '960 577 902', e164: '+51960577902' },
    { label: 'WhatsApp secundario', display: '948 940 408', e164: '+51948940408' },
  ],
  whatsapp: { e164: '51960577902', display: '960 577 902' },
  address: {
    street: 'Cajamarca',
    locality: 'Cajamarca',
    region: 'Cajamarca',
    country: 'Perú',
    countryCode: 'PE',
  },
  geo: { latitude: -7.1638, longitude: -78.5003 },
  hours: 'Lunes a sábado, 8:00 a 18:00',
  social: {
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/acroma_arquitectos',
  },
  stats: [
    { value: '+60', label: 'Proyectos entre diseño, reformas y obra' },
    { value: '8', label: 'Especialidades en planos y obra' },
    { value: '100%', label: 'Seguimiento directo del equipo' },
  ],
};

export const navigation = [
  { label: 'Servicios', href: '/servicios' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Novedades', href: '/novedades' },
  { label: 'Contacto', href: '/contacto' },
];

export const team = [
  {
    name: 'Arq. Anderson Romero',
    role: 'Equipo técnico',
    bio: 'Diseño arquitectónico y desarrollo de propuestas orientadas a las necesidades de cada cliente.',
  },
  {
    name: 'Arq. Cristian García',
    role: 'Equipo técnico',
    bio: 'Participación en el desarrollo y la coordinación de propuestas arquitectónicas para cada proyecto.',
  },
];

export const values = [
  {
    title: 'Claridad',
    description:
      'Etapas, entregables y costos definidos desde el inicio. Sabes qué se hace, cuándo y por qué, sin tecnicismos innecesarios.',
  },
  {
    title: 'Criterio',
    description:
      'Cada diseño responde al terreno, al clima y al presupuesto. Preferimos la solución que funciona a la que solo impresiona.',
  },
  {
    title: 'Cercanía',
    description:
      'Comunicación directa con el equipo que diseña y construye. Respondemos, explicamos y acompañamos hasta la entrega.',
  },
];

export const processSteps: ProcessStep[] = [
  {
    title: 'Escuchamos y medimos',
    description:
      'Visitamos el terreno o la vivienda, revisamos necesidades, presupuesto aproximado y restricciones. Definimos el problema correcto antes de dibujar.',
  },
  {
    title: 'Diseñamos y visualizamos',
    description:
      'Planteamos distribución, volumen y materiales. Te mostramos alternativas y visualizaciones 3D para decidir con seguridad.',
  },
  {
    title: 'Planificamos con detalle',
    description:
      'Desarrollamos planos de arquitectura, estructura, instalaciones eléctricas y sanitarias, con metrado y presupuesto para cotizar sin sorpresas.',
  },
  {
    title: 'Construimos y entregamos',
    description:
      'Ejecutamos la obra con supervisión permanente, reportes de avance y una entrega cuidada, con terminaciones revisadas una por una.',
  },
];

export const reasons: Reason[] = [
  {
    title: 'Diseño y obra en un solo equipo',
    description:
      'Quien diseña también supervisa la construcción. Menos traspasos de información, menos errores y plazos más previsibles.',
  },
  {
    title: 'Presupuesto claro desde el inicio',
    description:
      'Metrados y partidas detalladas antes de empezar. Sabes en qué se invierte cada sol y cuáles son las alternativas.',
  },
  {
    title: 'Planos completos de todas las especialidades',
    description:
      'Arquitectura, estructura, instalaciones eléctricas y sanitarias. Documentación lista para licencia y para construir.',
  },
  {
    title: 'Pensado para Cajamarca',
    description:
      'Diseñamos para el clima, la altura, la lluvia y los materiales de la zona, con criterio para que la casa funcione bien y dure.',
  },
];
