/** Preguntas frecuentes. Revisar y ajustar con la información real del estudio antes de publicar. */
export const faq = [
  {
    q: '¿Cuánto cuesta un proyecto?',
    a: 'Depende del tamaño, los materiales y el nivel de acabados. Después de conocer tu terreno o vivienda y lo que necesitas, te entregamos un presupuesto claro y por etapas, sin sorpresas. La primera orientación es sin compromiso.',
  },
  {
    q: '¿Cuánto demora el diseño y la obra?',
    a: 'Cada caso es distinto. Un diseño y sus planos suelen tomar algunas semanas y una obra puede ir de semanas a varios meses según su alcance. Te damos un cronograma por escrito antes de empezar.',
  },
  {
    q: '¿Puedo contratar solo los planos o solo una etapa?',
    a: 'Sí. Puedes contratar únicamente el diseño y los planos, la remodelación de un ambiente o acompañarte con nuestro equipo desde el boceto hasta la entrega de llaves.',
  },
  {
    q: '¿Necesito licencia o trámites municipales?',
    a: 'En general, la construcción, ampliación o modificación de una vivienda requiere trámites ante la municipalidad. Te orientamos sobre qué corresponde en tu caso según el tipo de intervención.',
  },
  {
    q: '¿Qué necesito para solicitar una cotización?',
    a: 'Con lo que tengas: ubicación, medidas aproximadas, fotos o una idea inicial. Escríbenos por el formulario o por WhatsApp y te decimos qué información falta y cuáles son los siguientes pasos.',
  },
];

export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}
