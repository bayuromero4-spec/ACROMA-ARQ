import type { Service } from './types';
import { img, photo } from './images';

export const services: Service[] = [
  {
    slug: 'diseno-arquitectonico',
    title: 'Diseño arquitectónico',
    kicker: 'Diseño',
    summary:
      'Viviendas y edificios pensados para tu terreno, tu clima y tu forma de vivir, con visualización 3D para decidir antes de construir.',
    description:
      'Desarrollamos el proyecto arquitectónico completo: estudio del terreno, programa de necesidades, distribución, volumetría, fachadas y visualización 3D. Cada decisión se explica con lenguaje claro para que sepas qué apruebas y por qué.',
    features: [
      'Anteproyecto y proyecto de arquitectura',
      'Estudio de orientación, ventilación e iluminación',
      'Visualización 3D y recorridos virtuales',
      'Expediente para licencia de edificación',
    ],
    idealFor:
      'Familias con terreno propio y propietarios que quieren ordenar áreas, prioridades y presupuesto antes de construir.',
    deliverables:
      'Planos de arquitectura, cortes y elevaciones, imágenes 3D y memoria descriptiva para tramitar licencia.',
    image: img(photo.casaFachada, 1200, 900, 'Vivienda contemporánea con fachada de vidrio y madera'),
    order: 1,
    featured: true,
  },
  {
    slug: 'reformas-integrales',
    title: 'Reformas integrales',
    kicker: 'Reformas',
    summary:
      'Transformamos una vivienda completa: nueva distribución, instalaciones, acabados y fachada, con una sola dirección de obra.',
    description:
      'Una reforma integral exige coordinar diseño, demoliciones, estructura, instalaciones y acabados. Asumimos todo el proceso con un cronograma claro, control de costos y supervisión diaria para que vivir el cambio sea lo más llevadero posible.',
    features: [
      'Diagnóstico del estado actual de la vivienda',
      'Nueva distribución y mejora de iluminación',
      'Renovación de instalaciones eléctricas y sanitarias',
      'Cronograma, presupuesto y reportes de avance',
    ],
    idealFor:
      'Casas que ya no responden a la rutina familiar o que necesitan renovarse por completo sin empezar desde cero.',
    deliverables:
      'Propuesta de reforma, planos de intervención, presupuesto por partidas y ejecución de obra supervisada.',
    image: img(photo.interiorLuminoso, 1200, 900, 'Interior residencial moderno y luminoso tras una reforma integral'),
    order: 2,
    featured: true,
  },
  {
    slug: 'remodelacion-de-cocinas',
    title: 'Remodelación de cocinas',
    kicker: 'Reformas',
    summary:
      'Cocinas funcionales y bien ventiladas, con mobiliario a medida, buena iluminación y materiales resistentes al uso diario.',
    description:
      'Diseñamos la cocina alrededor de cómo cocinas: triángulo de trabajo, almacenamiento, ventilación y conexión con la sala o el comedor. Coordinamos carpintería, instalaciones y acabados para una entrega limpia y sin improvisaciones.',
    features: [
      'Distribución y diseño de mobiliario a medida',
      'Instalaciones de agua, desagüe, gas y electricidad',
      'Revestimientos, encimeras y artefactos',
      'Iluminación general y de trabajo',
    ],
    idealFor: 'Familias que cocinan a diario y necesitan más espacio, orden o una cocina abierta a la vida social.',
    deliverables: 'Propuesta 3D, planos de detalle, carpintería a medida y obra completa lista para usar.',
    image: img(photo.cocina, 1200, 900, 'Cocina moderna remodelada con isla y buena iluminación'),
    order: 3,
    featured: true,
  },
  {
    slug: 'remodelacion-de-banos',
    title: 'Remodelación de baños',
    kicker: 'Reformas',
    summary:
      'Baños cómodos, seguros e impermeables, con distribución eficiente, ventilación adecuada y acabados duraderos.',
    description:
      'Renovamos baños completos cuidando lo que no se ve: pendientes, impermeabilización y redes sanitarias. Después viene lo visible: revestimientos, sanitarios, grifería y mobiliario, elegidos según tu presupuesto y tu uso.',
    features: [
      'Rediseño de distribución y accesibilidad',
      'Impermeabilización y renovación de redes sanitarias',
      'Revestimientos, sanitarios y grifería',
      'Ventilación e iluminación natural o artificial',
    ],
    idealFor: 'Viviendas con baños antiguos, con filtraciones o con distribución incómoda.',
    deliverables: 'Propuesta de diseño, lista de materiales, presupuesto por partidas y ejecución de obra.',
    image: img(photo.bano, 1200, 900, 'Baño renovado con revestimientos claros y buena ventilación'),
    order: 4,
    featured: false,
  },
  {
    slug: 'ampliaciones',
    title: 'Ampliaciones',
    kicker: 'Obra',
    summary:
      'Más espacio para tu familia: segundos pisos, nuevos dormitorios o áreas sociales integradas a la vivienda existente.',
    description:
      'Antes de ampliar verificamos estructura, cimentación e instalaciones existentes. Así proyectamos el crecimiento de forma segura, integrada a la casa actual y por etapas si el presupuesto lo requiere.',
    features: [
      'Evaluación estructural previa',
      'Diseño integrado con la vivienda existente',
      'Planificación por etapas de obra',
      'Trámite de licencia de ampliación',
    ],
    idealFor: 'Familias que crecen y prefieren ampliar su casa en lugar de mudarse.',
    deliverables: 'Planos de ampliación, cálculo estructural, presupuesto por etapas y ejecución supervisada.',
    image: img(photo.casaJardin, 1200, 900, 'Vivienda moderna ampliada con jardín y áreas sociales'),
    order: 5,
    featured: true,
  },
  {
    slug: 'construccion',
    title: 'Construcción',
    kicker: 'Obra',
    summary:
      'Construimos viviendas y edificios con supervisión técnica permanente, control de calidad y reportes de avance claros.',
    description:
      'Ejecutamos obras de principio a fin: cimentación, estructura, albañilería, instalaciones y acabados. Un residente de obra coordina cuadrillas, materiales y tiempos, y tú recibes informes periódicos con fotografías y estado de costos.',
    features: [
      'Obra gruesa y estructura',
      'Instalaciones eléctricas y sanitarias',
      'Control de calidad y de costos',
      'Reportes de avance con fotografías',
    ],
    idealFor: 'Propietarios e inversionistas que quieren una sola empresa responsable del diseño y la ejecución.',
    deliverables: 'Obra ejecutada según planos, cronograma cumplido y documentación de entrega.',
    image: img(photo.obra, 1200, 900, 'Obra de construcción con estructura en avance'),
    order: 6,
    featured: true,
  },
  {
    slug: 'terminaciones',
    title: 'Terminaciones',
    kicker: 'Obra',
    summary:
      'Pisos, enchapes, pintura, carpintería y detalles finales con el cuidado que hace la diferencia al entregar.',
    description:
      'Las terminaciones definen cómo se siente la casa. Seleccionamos materiales según uso y presupuesto, coordinamos oficios y revisamos cada ambiente al detalle antes de la entrega para que no queden pendientes.',
    features: [
      'Pisos, enchapes y revestimientos',
      'Pintura, drywall y cielos rasos',
      'Carpintería de madera y metálica',
      'Revisión final y lista de observaciones',
    ],
    idealFor: 'Obras en etapa final o casas que necesitan un acabado profesional y duradero.',
    deliverables: 'Acabados ejecutados, revisión por ambientes y entrega con garantía de obra.',
    image: img(photo.sala, 1200, 900, 'Sala contemporánea con acabados cuidados'),
    order: 7,
    featured: false,
  },
  {
    slug: 'planimetria-y-especialidades',
    title: 'Planimetría de especialidades',
    kicker: 'Planos',
    summary:
      'Planos de arquitectura, estructura, instalaciones eléctricas y sanitarias, completos y coordinados entre sí.',
    description:
      'Elaboramos el expediente técnico con todas las especialidades coordinadas para evitar interferencias en obra: arquitectura, estructura, instalaciones eléctricas e instalaciones sanitarias, con la documentación necesaria para licencia y construcción.',
    features: [
      'Planos de arquitectura',
      'Planos de estructura y cálculo',
      'Instalaciones eléctricas',
      'Instalaciones sanitarias (agua y desagüe)',
    ],
    idealFor: 'Quienes necesitan planos completos para tramitar licencia, financiar o construir con seguridad.',
    deliverables: 'Juego completo de planos por especialidad, memorias de cálculo y metrados.',
    image: img(photo.planos, 1200, 900, 'Mesa de trabajo con planos y maqueta arquitectónica'),
    order: 8,
    featured: true,
  },
];
