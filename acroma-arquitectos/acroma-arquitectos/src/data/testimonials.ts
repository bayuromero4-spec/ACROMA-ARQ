import type { Testimonial } from './types';

/** Testimonios de ejemplo (contenido ficticio realista). */
export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Rosa Elena Chávez',
    role: 'Propietaria',
    location: 'Cajamarca',
    quote:
      'Nos explicaron cada decisión con calma y con imágenes 3D. Cuando empezó la obra ya sabíamos exactamente cómo iba a quedar la casa, y el presupuesto se respetó.',
    rating: 5,
    projectSlug: 'reforma-casa-moderna',
  },
  {
    id: 't2',
    name: 'Marco Antonio Quispe',
    role: 'Propietario',
    location: 'San Miguel de Pallaques',
    quote:
      'Dudábamos si la estructura aguantaría un segundo piso. Hicieron la evaluación, nos dieron una solución segura y pudimos seguir viviendo en la casa durante la obra.',
    rating: 5,
    projectSlug: 'segundo-piso-familia-quispe',
  },
  {
    id: 't3',
    name: 'Lucía Fernández',
    role: 'Inversionista inmobiliaria',
    location: 'Cajamarca',
    quote:
      'Lo mejor fue tener planos de todas las especialidades coordinados. En obra no hubo interferencias y entregamos los departamentos en la fecha prevista.',
    rating: 5,
    projectSlug: 'edificio-departamentos-santa-elena',
  },
  {
    id: 't4',
    name: 'Jorge Valdivia',
    role: 'Propietario',
    location: 'Baños del Inca',
    quote:
      'Remodelaron nuestra cocina en menos de dos meses. Cuidaron los detalles, mantuvieron limpia la obra y la comunicación fue constante.',
    rating: 5,
    projectSlug: 'cocina-abierta-los-pinos',
  },
];
