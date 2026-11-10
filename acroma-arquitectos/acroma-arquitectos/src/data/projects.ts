import type { Project } from './types';
import { img, photo } from './images';

/**
 * Proyectos de ejemplo (contenido ficticio realista).
 * Reemplazar por proyectos reales o conectar con Supabase más adelante.
 */
export const projects: Project[] = [
  {
    title: 'Reforma casa moderna',
    slug: 'reforma-casa-moderna',
    excerpt:
      'Reforma integral de una vivienda de dos pisos: nueva distribución, fachada contemporánea y mayor entrada de luz natural.',
    description: [
      'Una familia de cuatro personas nos pidió renovar su casa de más de veinte años. La distribución original dejaba la cocina aislada, con poca luz y recorridos largos entre los ambientes.',
      'Reorganizamos la planta baja para integrar cocina, comedor y sala en un solo espacio abierto, ampliamos los vanos hacia el jardín y renovamos por completo las instalaciones eléctricas y sanitarias.',
      'La fachada se rediseñó con volúmenes limpios, madera tratada y carpintería oscura, manteniendo la estructura existente para controlar costos y tiempos de obra.',
    ],
    category: 'Reforma integral',
    location: 'Cajamarca, Cajamarca',
    date: '2025-09-18',
    featured: true,
    mainImage: img(photo.casaFachada, 1600, 1100, 'Fachada contemporánea de vivienda reformada con vidrio y madera'),
    gallery: [
      img(photo.interiorLuminoso, 1400, 1000, 'Sala y comedor integrados con abundante luz natural'),
      img(photo.sala, 1400, 1000, 'Sala contemporánea con acabados claros'),
      img(photo.casaJardin, 1400, 1000, 'Vista de la vivienda desde el jardín'),
      img(photo.cocina, 1400, 1000, 'Cocina abierta con isla central'),
    ],
    details: [
      { label: 'Superficie intervenida', value: '186 m²' },
      { label: 'Plazo de obra', value: '5 meses' },
      { label: 'Servicios', value: 'Diseño, reforma integral, terminaciones' },
    ],
    services: ['diseno-arquitectonico', 'reformas-integrales', 'terminaciones'],
  },
  {
    title: 'Casa del Valle',
    slug: 'casa-del-valle',
    excerpt:
      'Vivienda unifamiliar de nueva construcción con patios interiores, ventilación cruzada y orientación pensada para el clima de la sierra.',
    description: [
      'Diseñamos una casa en un terreno de pendiente suave con vistas al valle. El programa pedía tres dormitorios, un estudio y un espacio social que se abriera al paisaje.',
      'Organizamos la vivienda en torno a un patio que reparte luz y ventilación a todos los ambientes, y orientamos las áreas de uso diario al norte para aprovechar el sol durante el día.',
      'Los muros de albañilería confinada se combinan con madera y piedra local, buscando una casa cálida, durable y fácil de mantener.',
    ],
    category: 'Vivienda',
    location: 'Baños del Inca, Cajamarca',
    date: '2025-05-30',
    featured: true,
    mainImage: img(photo.casaModerna, 1600, 1100, 'Casa moderna de dos niveles con grandes ventanales'),
    gallery: [
      img(photo.casaExterior, 1400, 1000, 'Fachada principal de la Casa del Valle'),
      img(photo.casaJardin, 1400, 1000, 'Jardín y terraza social'),
      img(photo.interiorLuminoso, 1400, 1000, 'Sala con doble altura'),
    ],
    details: [
      { label: 'Superficie construida', value: '240 m²' },
      { label: 'Terreno', value: '420 m²' },
      { label: 'Servicios', value: 'Diseño, planos, construcción' },
    ],
    services: ['diseno-arquitectonico', 'planimetria-y-especialidades', 'construccion'],
  },
  {
    title: 'Cocina abierta Los Pinos',
    slug: 'cocina-abierta-los-pinos',
    excerpt:
      'Remodelación de cocina con isla central, almacenamiento a medida y conexión directa con el comedor y la terraza.',
    description: [
      'La cocina original era cerrada, oscura y con poco espacio para almacenar. La familia quería cocinar acompañada y recibir invitados con comodidad.',
      'Retiramos un muro no estructural, abrimos la cocina al comedor y proyectamos una isla central con barra. El mobiliario a medida aprovecha toda la altura y ordena los utensilios.',
      'Cambiamos las instalaciones de agua y electricidad, mejoramos la ventilación con una campana de extracción y elegimos encimeras resistentes para el uso diario.',
    ],
    category: 'Cocinas y baños',
    location: 'Cajamarca, Cajamarca',
    date: '2025-03-12',
    featured: true,
    mainImage: img(photo.cocina, 1600, 1100, 'Cocina abierta con isla central y mobiliario a medida'),
    gallery: [
      img(photo.sala, 1400, 1000, 'Comedor conectado con la cocina'),
      img(photo.interiorLuminoso, 1400, 1000, 'Vista general del espacio integrado'),
    ],
    details: [
      { label: 'Superficie intervenida', value: '34 m²' },
      { label: 'Plazo de obra', value: '7 semanas' },
      { label: 'Servicios', value: 'Remodelación de cocina, carpintería, instalaciones' },
    ],
    services: ['remodelacion-de-cocinas', 'terminaciones'],
  },
  {
    title: 'Baño principal Jardines',
    slug: 'bano-principal-jardines',
    excerpt:
      'Renovación de baño principal con impermeabilización completa, ducha amplia y revestimientos de larga duración.',
    description: [
      'Un baño con filtraciones recurrentes y distribución estrecha. Antes de elegir acabados, resolvimos el problema de fondo: pendientes, impermeabilización y redes sanitarias.',
      'Reubicamos los aparatos para ganar espacio, instalamos una ducha amplia a ras de piso y mejoramos la ventilación natural.',
      'Los revestimientos claros y el mobiliario suspendido hacen que el baño se sienta más amplio y sea fácil de limpiar.',
    ],
    category: 'Cocinas y baños',
    location: 'Cajamarca, Cajamarca',
    date: '2024-11-22',
    featured: false,
    mainImage: img(photo.bano, 1600, 1100, 'Baño renovado con ducha amplia y revestimientos claros'),
    gallery: [img(photo.interiorLuminoso, 1400, 1000, 'Pasillo luminoso hacia el dormitorio principal')],
    details: [
      { label: 'Superficie intervenida', value: '9 m²' },
      { label: 'Plazo de obra', value: '3 semanas' },
      { label: 'Servicios', value: 'Remodelación de baño, impermeabilización' },
    ],
    services: ['remodelacion-de-banos'],
  },
  {
    title: 'Segundo piso Familia Quispe',
    slug: 'segundo-piso-familia-quispe',
    excerpt:
      'Ampliación de un segundo nivel con tres dormitorios y terraza, integrada a la vivienda existente y construida por etapas.',
    description: [
      'La familia necesitaba más dormitorios sin mudarse. Evaluamos la cimentación y los muros existentes y confirmamos que la estructura admitía un segundo nivel con refuerzos puntuales.',
      'Proyectamos tres dormitorios, un baño compartido y una terraza que aprovecha la vista. La escalera se ubicó para no restar espacio útil a la planta baja.',
      'La obra se ejecutó por etapas, de modo que la familia pudo seguir viviendo en la casa durante la construcción.',
    ],
    category: 'Ampliación',
    location: 'San Miguel de Pallaques, Cajamarca',
    date: '2025-01-28',
    featured: true,
    mainImage: img(photo.casaJardin, 1600, 1100, 'Vivienda con segundo piso ampliado y terraza'),
    gallery: [
      img(photo.obra, 1400, 1000, 'Estructura del nuevo nivel en construcción'),
      img(photo.casaExterior, 1400, 1000, 'Fachada final de la ampliación'),
    ],
    details: [
      { label: 'Superficie ampliada', value: '118 m²' },
      { label: 'Plazo de obra', value: '6 meses' },
      { label: 'Servicios', value: 'Diseño, cálculo estructural, construcción' },
    ],
    services: ['ampliaciones', 'planimetria-y-especialidades', 'construccion'],
  },
  {
    title: 'Edificio de departamentos Santa Elena',
    slug: 'edificio-departamentos-santa-elena',
    excerpt:
      'Edificio multifamiliar de cinco niveles con doce departamentos luminosos y áreas comunes bien resueltas.',
    description: [
      'Un lote angosto y profundo exigía resolver iluminación y ventilación de cada departamento. Estudiamos distintas distribuciones hasta lograr doce unidades con buena orientación.',
      'La circulación central se ilumina con un lucernario, y la fachada combina ritmos verticales con balcones que dan sombra y privacidad.',
      'Entregamos el expediente completo de todas las especialidades para licencia y construcción, y acompañamos la supervisión técnica de la obra.',
    ],
    category: 'Multifamiliar',
    location: 'Cajamarca, Cajamarca',
    date: '2024-08-15',
    featured: true,
    mainImage: img(photo.edificio, 1600, 1100, 'Edificio de departamentos con fachada de vidrio y balcones'),
    gallery: [
      img(photo.detalle, 1400, 1000, 'Detalle de fachada y juego de luces'),
      img(photo.planos, 1400, 1000, 'Planos del edificio en revisión'),
    ],
    details: [
      { label: 'Área construida', value: '1 450 m²' },
      { label: 'Unidades', value: '12 departamentos' },
      { label: 'Servicios', value: 'Diseño, planos de especialidades, supervisión' },
    ],
    services: ['diseno-arquitectonico', 'planimetria-y-especialidades', 'construccion'],
  },
  {
    title: 'Local comercial Plaza Norte',
    slug: 'local-comercial-plaza-norte',
    excerpt:
      'Diseño y remodelación de un local comercial en esquina, con fachada vidriada, buena visibilidad y espacios flexibles.',
    description: [
      'Un local en esquina que necesitaba atraer más público y ordenar mejor la exhibición. Rediseñamos la fachada con grandes vitrinas y un acceso más amable.',
      'Interiormente propusimos un plano libre con mobiliario modular para cambiar la distribución según la temporada.',
      'La obra se ejecutó en tres semanas, con el local cerrado el menor tiempo posible.',
    ],
    category: 'Comercial',
    location: 'Cajamarca, Cajamarca',
    date: '2024-06-05',
    featured: false,
    mainImage: img(photo.detalle, 1600, 1100, 'Detalle arquitectónico de fachada comercial contemporánea'),
    gallery: [img(photo.edificio, 1400, 1000, 'Esquina comercial con vitrinas amplias')],
    details: [
      { label: 'Superficie intervenida', value: '92 m²' },
      { label: 'Plazo de obra', value: '3 semanas' },
      { label: 'Servicios', value: 'Diseño, remodelación, terminaciones' },
    ],
    services: ['diseno-arquitectonico', 'reformas-integrales', 'terminaciones'],
  },
  {
    title: 'Casa Mirador',
    slug: 'casa-mirador',
    excerpt:
      'Vivienda de fin de semana con grandes terrazas, materiales naturales y una relación directa con el paisaje.',
    description: [
      'Una casa de descanso para una familia que buscaba desconectarse de la ciudad. El diseño prioriza las vistas, las terrazas y los espacios para compartir.',
      'Usamos piedra, madera y concreto visto, materiales que envejecen bien y requieren poco mantenimiento.',
      'La construcción se adaptó a la pendiente del terreno para minimizar movimientos de tierra y respetar la vegetación existente.',
    ],
    category: 'Vivienda',
    location: 'Los Baños del Inca, Cajamarca',
    date: '2023-12-10',
    featured: false,
    mainImage: img(photo.casaExterior, 1600, 1100, 'Casa de descanso con terrazas y grandes ventanales'),
    gallery: [
      img(photo.casaModerna, 1400, 1000, 'Volumen principal y terraza'),
      img(photo.casaJardin, 1400, 1000, 'Jardín y área social'),
    ],
    details: [
      { label: 'Superficie construida', value: '165 m²' },
      { label: 'Terreno', value: '600 m²' },
      { label: 'Servicios', value: 'Diseño, planos, construcción' },
    ],
    services: ['diseno-arquitectonico', 'construccion'],
  },
];
