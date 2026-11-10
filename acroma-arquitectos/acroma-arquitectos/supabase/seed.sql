-- ACROMA Arquitectos — contenido inicial (generado desde src/data con "npm run seed:generate").
-- Ejecuta DESPUÉS de schema.sql. Es seguro repetirlo: no duplica ni pisa lo que ya editaste.

insert into public.business_info (id, name, tagline, description, email, phones, whatsapp_e164, whatsapp_display, street, locality, region, country, hours, facebook, instagram, stats)
values (1, 'ACROMA Arquitectos', 'Arquitectura, construcción y reformas en Cajamarca', 'Estudio de arquitectura y construcción en Cajamarca. Diseño arquitectónico, reformas integrales, remodelación de cocinas y baños, ampliaciones, construcción y planos de todas las especialidades.', 'contacto@acroma-arquitectos.com', '[{"label":"WhatsApp principal","display":"960 577 902","e164":"+51960577902"},{"label":"WhatsApp secundario","display":"948 940 408","e164":"+51948940408"}]'::jsonb, '51960577902', '960 577 902', 'Cajamarca', 'Cajamarca', 'Cajamarca', 'Perú', 'Lunes a sábado, 8:00 a 18:00', 'https://www.facebook.com/', 'https://www.instagram.com/acroma_arquitectos', '[{"value":"+60","label":"Proyectos entre diseño, reformas y obra"},{"value":"8","label":"Especialidades en planos y obra"},{"value":"100%","label":"Seguimiento directo del equipo"}]'::jsonb)
on conflict (id) do nothing;

insert into public.services (slug, title, kicker, summary, description, features, ideal_for, deliverables, image_url, image_alt, sort_order, featured, status)
values ('diseno-arquitectonico', 'Diseño arquitectónico', 'Diseño', 'Viviendas y edificios pensados para tu terreno, tu clima y tu forma de vivir, con visualización 3D para decidir antes de construir.', 'Desarrollamos el proyecto arquitectónico completo: estudio del terreno, programa de necesidades, distribución, volumetría, fachadas y visualización 3D. Cada decisión se explica con lenguaje claro para que sepas qué apruebas y por qué.', array['Anteproyecto y proyecto de arquitectura', 'Estudio de orientación, ventilación e iluminación', 'Visualización 3D y recorridos virtuales', 'Expediente para licencia de edificación']::text[], 'Familias con terreno propio y propietarios que quieren ordenar áreas, prioridades y presupuesto antes de construir.', 'Planos de arquitectura, cortes y elevaciones, imágenes 3D y memoria descriptiva para tramitar licencia.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&h=900&q=78', 'Vivienda contemporánea con fachada de vidrio y madera', 1, true, 'published')
on conflict (slug) do nothing;

insert into public.services (slug, title, kicker, summary, description, features, ideal_for, deliverables, image_url, image_alt, sort_order, featured, status)
values ('reformas-integrales', 'Reformas integrales', 'Reformas', 'Transformamos una vivienda completa: nueva distribución, instalaciones, acabados y fachada, con una sola dirección de obra.', 'Una reforma integral exige coordinar diseño, demoliciones, estructura, instalaciones y acabados. Asumimos todo el proceso con un cronograma claro, control de costos y supervisión diaria para que vivir el cambio sea lo más llevadero posible.', array['Diagnóstico del estado actual de la vivienda', 'Nueva distribución y mejora de iluminación', 'Renovación de instalaciones eléctricas y sanitarias', 'Cronograma, presupuesto y reportes de avance']::text[], 'Casas que ya no responden a la rutina familiar o que necesitan renovarse por completo sin empezar desde cero.', 'Propuesta de reforma, planos de intervención, presupuesto por partidas y ejecución de obra supervisada.', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&h=900&q=78', 'Interior residencial moderno y luminoso tras una reforma integral', 2, true, 'published')
on conflict (slug) do nothing;

insert into public.services (slug, title, kicker, summary, description, features, ideal_for, deliverables, image_url, image_alt, sort_order, featured, status)
values ('remodelacion-de-cocinas', 'Remodelación de cocinas', 'Reformas', 'Cocinas funcionales y bien ventiladas, con mobiliario a medida, buena iluminación y materiales resistentes al uso diario.', 'Diseñamos la cocina alrededor de cómo cocinas: triángulo de trabajo, almacenamiento, ventilación y conexión con la sala o el comedor. Coordinamos carpintería, instalaciones y acabados para una entrega limpia y sin improvisaciones.', array['Distribución y diseño de mobiliario a medida', 'Instalaciones de agua, desagüe, gas y electricidad', 'Revestimientos, encimeras y artefactos', 'Iluminación general y de trabajo']::text[], 'Familias que cocinan a diario y necesitan más espacio, orden o una cocina abierta a la vida social.', 'Propuesta 3D, planos de detalle, carpintería a medida y obra completa lista para usar.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&h=900&q=78', 'Cocina moderna remodelada con isla y buena iluminación', 3, true, 'published')
on conflict (slug) do nothing;

insert into public.services (slug, title, kicker, summary, description, features, ideal_for, deliverables, image_url, image_alt, sort_order, featured, status)
values ('remodelacion-de-banos', 'Remodelación de baños', 'Reformas', 'Baños cómodos, seguros e impermeables, con distribución eficiente, ventilación adecuada y acabados duraderos.', 'Renovamos baños completos cuidando lo que no se ve: pendientes, impermeabilización y redes sanitarias. Después viene lo visible: revestimientos, sanitarios, grifería y mobiliario, elegidos según tu presupuesto y tu uso.', array['Rediseño de distribución y accesibilidad', 'Impermeabilización y renovación de redes sanitarias', 'Revestimientos, sanitarios y grifería', 'Ventilación e iluminación natural o artificial']::text[], 'Viviendas con baños antiguos, con filtraciones o con distribución incómoda.', 'Propuesta de diseño, lista de materiales, presupuesto por partidas y ejecución de obra.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&h=900&q=78', 'Baño renovado con revestimientos claros y buena ventilación', 4, false, 'published')
on conflict (slug) do nothing;

insert into public.services (slug, title, kicker, summary, description, features, ideal_for, deliverables, image_url, image_alt, sort_order, featured, status)
values ('ampliaciones', 'Ampliaciones', 'Obra', 'Más espacio para tu familia: segundos pisos, nuevos dormitorios o áreas sociales integradas a la vivienda existente.', 'Antes de ampliar verificamos estructura, cimentación e instalaciones existentes. Así proyectamos el crecimiento de forma segura, integrada a la casa actual y por etapas si el presupuesto lo requiere.', array['Evaluación estructural previa', 'Diseño integrado con la vivienda existente', 'Planificación por etapas de obra', 'Trámite de licencia de ampliación']::text[], 'Familias que crecen y prefieren ampliar su casa en lugar de mudarse.', 'Planos de ampliación, cálculo estructural, presupuesto por etapas y ejecución supervisada.', 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&h=900&q=78', 'Vivienda moderna ampliada con jardín y áreas sociales', 5, true, 'published')
on conflict (slug) do nothing;

insert into public.services (slug, title, kicker, summary, description, features, ideal_for, deliverables, image_url, image_alt, sort_order, featured, status)
values ('construccion', 'Construcción', 'Obra', 'Construimos viviendas y edificios con supervisión técnica permanente, control de calidad y reportes de avance claros.', 'Ejecutamos obras de principio a fin: cimentación, estructura, albañilería, instalaciones y acabados. Un residente de obra coordina cuadrillas, materiales y tiempos, y tú recibes informes periódicos con fotografías y estado de costos.', array['Obra gruesa y estructura', 'Instalaciones eléctricas y sanitarias', 'Control de calidad y de costos', 'Reportes de avance con fotografías']::text[], 'Propietarios e inversionistas que quieren una sola empresa responsable del diseño y la ejecución.', 'Obra ejecutada según planos, cronograma cumplido y documentación de entrega.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&h=900&q=78', 'Obra de construcción con estructura en avance', 6, true, 'published')
on conflict (slug) do nothing;

insert into public.services (slug, title, kicker, summary, description, features, ideal_for, deliverables, image_url, image_alt, sort_order, featured, status)
values ('terminaciones', 'Terminaciones', 'Obra', 'Pisos, enchapes, pintura, carpintería y detalles finales con el cuidado que hace la diferencia al entregar.', 'Las terminaciones definen cómo se siente la casa. Seleccionamos materiales según uso y presupuesto, coordinamos oficios y revisamos cada ambiente al detalle antes de la entrega para que no queden pendientes.', array['Pisos, enchapes y revestimientos', 'Pintura, drywall y cielos rasos', 'Carpintería de madera y metálica', 'Revisión final y lista de observaciones']::text[], 'Obras en etapa final o casas que necesitan un acabado profesional y duradero.', 'Acabados ejecutados, revisión por ambientes y entrega con garantía de obra.', 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&h=900&q=78', 'Sala contemporánea con acabados cuidados', 7, false, 'published')
on conflict (slug) do nothing;

insert into public.services (slug, title, kicker, summary, description, features, ideal_for, deliverables, image_url, image_alt, sort_order, featured, status)
values ('planimetria-y-especialidades', 'Planimetría de especialidades', 'Planos', 'Planos de arquitectura, estructura, instalaciones eléctricas y sanitarias, completos y coordinados entre sí.', 'Elaboramos el expediente técnico con todas las especialidades coordinadas para evitar interferencias en obra: arquitectura, estructura, instalaciones eléctricas e instalaciones sanitarias, con la documentación necesaria para licencia y construcción.', array['Planos de arquitectura', 'Planos de estructura y cálculo', 'Instalaciones eléctricas', 'Instalaciones sanitarias (agua y desagüe)']::text[], 'Quienes necesitan planos completos para tramitar licencia, financiar o construir con seguridad.', 'Juego completo de planos por especialidad, memorias de cálculo y metrados.', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&h=900&q=78', 'Mesa de trabajo con planos y maqueta arquitectónica', 8, true, 'published')
on conflict (slug) do nothing;

insert into public.projects (slug, title, excerpt, description, category, location, completed_on, featured, main_image_url, main_image_alt, details, service_slugs, status)
values ('reforma-casa-moderna', 'Reforma casa moderna', 'Reforma integral de una vivienda de dos pisos: nueva distribución, fachada contemporánea y mayor entrada de luz natural.', array['Una familia de cuatro personas nos pidió renovar su casa de más de veinte años. La distribución original dejaba la cocina aislada, con poca luz y recorridos largos entre los ambientes.', 'Reorganizamos la planta baja para integrar cocina, comedor y sala en un solo espacio abierto, ampliamos los vanos hacia el jardín y renovamos por completo las instalaciones eléctricas y sanitarias.', 'La fachada se rediseñó con volúmenes limpios, madera tratada y carpintería oscura, manteniendo la estructura existente para controlar costos y tiempos de obra.']::text[], 'Reforma integral', 'Cajamarca, Cajamarca', '2025-09-18', true, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&h=1100&q=78', 'Fachada contemporánea de vivienda reformada con vidrio y madera', '[{"label":"Superficie intervenida","value":"186 m²"},{"label":"Plazo de obra","value":"5 meses"},{"label":"Servicios","value":"Diseño, reforma integral, terminaciones"}]'::jsonb, array['diseno-arquitectonico', 'reformas-integrales', 'terminaciones']::text[], 'published')
on conflict (slug) do nothing;

insert into public.project_images (project_id, url, alt, sort_order)
select pr.id, g.url, g.alt, g.ord from public.projects pr
cross join (values
  ('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&h=1000&q=78', 'Sala y comedor integrados con abundante luz natural', 0),
  ('https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&h=1000&q=78', 'Sala contemporánea con acabados claros', 1),
  ('https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1400&h=1000&q=78', 'Vista de la vivienda desde el jardín', 2),
  ('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&h=1000&q=78', 'Cocina abierta con isla central', 3)
) as g(url, alt, ord)
where pr.slug = 'reforma-casa-moderna'
  and not exists (select 1 from public.project_images pi where pi.project_id = pr.id);

insert into public.projects (slug, title, excerpt, description, category, location, completed_on, featured, main_image_url, main_image_alt, details, service_slugs, status)
values ('casa-del-valle', 'Casa del Valle', 'Vivienda unifamiliar de nueva construcción con patios interiores, ventilación cruzada y orientación pensada para el clima de la sierra.', array['Diseñamos una casa en un terreno de pendiente suave con vistas al valle. El programa pedía tres dormitorios, un estudio y un espacio social que se abriera al paisaje.', 'Organizamos la vivienda en torno a un patio que reparte luz y ventilación a todos los ambientes, y orientamos las áreas de uso diario al norte para aprovechar el sol durante el día.', 'Los muros de albañilería confinada se combinan con madera y piedra local, buscando una casa cálida, durable y fácil de mantener.']::text[], 'Vivienda', 'Baños del Inca, Cajamarca', '2025-05-30', true, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&h=1100&q=78', 'Casa moderna de dos niveles con grandes ventanales', '[{"label":"Superficie construida","value":"240 m²"},{"label":"Terreno","value":"420 m²"},{"label":"Servicios","value":"Diseño, planos, construcción"}]'::jsonb, array['diseno-arquitectonico', 'planimetria-y-especialidades', 'construccion']::text[], 'published')
on conflict (slug) do nothing;

insert into public.project_images (project_id, url, alt, sort_order)
select pr.id, g.url, g.alt, g.ord from public.projects pr
cross join (values
  ('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&h=1000&q=78', 'Fachada principal de la Casa del Valle', 0),
  ('https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1400&h=1000&q=78', 'Jardín y terraza social', 1),
  ('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&h=1000&q=78', 'Sala con doble altura', 2)
) as g(url, alt, ord)
where pr.slug = 'casa-del-valle'
  and not exists (select 1 from public.project_images pi where pi.project_id = pr.id);

insert into public.projects (slug, title, excerpt, description, category, location, completed_on, featured, main_image_url, main_image_alt, details, service_slugs, status)
values ('cocina-abierta-los-pinos', 'Cocina abierta Los Pinos', 'Remodelación de cocina con isla central, almacenamiento a medida y conexión directa con el comedor y la terraza.', array['La cocina original era cerrada, oscura y con poco espacio para almacenar. La familia quería cocinar acompañada y recibir invitados con comodidad.', 'Retiramos un muro no estructural, abrimos la cocina al comedor y proyectamos una isla central con barra. El mobiliario a medida aprovecha toda la altura y ordena los utensilios.', 'Cambiamos las instalaciones de agua y electricidad, mejoramos la ventilación con una campana de extracción y elegimos encimeras resistentes para el uso diario.']::text[], 'Cocinas y baños', 'Cajamarca, Cajamarca', '2025-03-12', true, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&h=1100&q=78', 'Cocina abierta con isla central y mobiliario a medida', '[{"label":"Superficie intervenida","value":"34 m²"},{"label":"Plazo de obra","value":"7 semanas"},{"label":"Servicios","value":"Remodelación de cocina, carpintería, instalaciones"}]'::jsonb, array['remodelacion-de-cocinas', 'terminaciones']::text[], 'published')
on conflict (slug) do nothing;

insert into public.project_images (project_id, url, alt, sort_order)
select pr.id, g.url, g.alt, g.ord from public.projects pr
cross join (values
  ('https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&h=1000&q=78', 'Comedor conectado con la cocina', 0),
  ('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&h=1000&q=78', 'Vista general del espacio integrado', 1)
) as g(url, alt, ord)
where pr.slug = 'cocina-abierta-los-pinos'
  and not exists (select 1 from public.project_images pi where pi.project_id = pr.id);

insert into public.projects (slug, title, excerpt, description, category, location, completed_on, featured, main_image_url, main_image_alt, details, service_slugs, status)
values ('bano-principal-jardines', 'Baño principal Jardines', 'Renovación de baño principal con impermeabilización completa, ducha amplia y revestimientos de larga duración.', array['Un baño con filtraciones recurrentes y distribución estrecha. Antes de elegir acabados, resolvimos el problema de fondo: pendientes, impermeabilización y redes sanitarias.', 'Reubicamos los aparatos para ganar espacio, instalamos una ducha amplia a ras de piso y mejoramos la ventilación natural.', 'Los revestimientos claros y el mobiliario suspendido hacen que el baño se sienta más amplio y sea fácil de limpiar.']::text[], 'Cocinas y baños', 'Cajamarca, Cajamarca', '2024-11-22', false, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&h=1100&q=78', 'Baño renovado con ducha amplia y revestimientos claros', '[{"label":"Superficie intervenida","value":"9 m²"},{"label":"Plazo de obra","value":"3 semanas"},{"label":"Servicios","value":"Remodelación de baño, impermeabilización"}]'::jsonb, array['remodelacion-de-banos']::text[], 'published')
on conflict (slug) do nothing;

insert into public.project_images (project_id, url, alt, sort_order)
select pr.id, g.url, g.alt, g.ord from public.projects pr
cross join (values
  ('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&h=1000&q=78', 'Pasillo luminoso hacia el dormitorio principal', 0)
) as g(url, alt, ord)
where pr.slug = 'bano-principal-jardines'
  and not exists (select 1 from public.project_images pi where pi.project_id = pr.id);

insert into public.projects (slug, title, excerpt, description, category, location, completed_on, featured, main_image_url, main_image_alt, details, service_slugs, status)
values ('segundo-piso-familia-quispe', 'Segundo piso Familia Quispe', 'Ampliación de un segundo nivel con tres dormitorios y terraza, integrada a la vivienda existente y construida por etapas.', array['La familia necesitaba más dormitorios sin mudarse. Evaluamos la cimentación y los muros existentes y confirmamos que la estructura admitía un segundo nivel con refuerzos puntuales.', 'Proyectamos tres dormitorios, un baño compartido y una terraza que aprovecha la vista. La escalera se ubicó para no restar espacio útil a la planta baja.', 'La obra se ejecutó por etapas, de modo que la familia pudo seguir viviendo en la casa durante la construcción.']::text[], 'Ampliación', 'San Miguel de Pallaques, Cajamarca', '2025-01-28', true, 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1600&h=1100&q=78', 'Vivienda con segundo piso ampliado y terraza', '[{"label":"Superficie ampliada","value":"118 m²"},{"label":"Plazo de obra","value":"6 meses"},{"label":"Servicios","value":"Diseño, cálculo estructural, construcción"}]'::jsonb, array['ampliaciones', 'planimetria-y-especialidades', 'construccion']::text[], 'published')
on conflict (slug) do nothing;

insert into public.project_images (project_id, url, alt, sort_order)
select pr.id, g.url, g.alt, g.ord from public.projects pr
cross join (values
  ('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&h=1000&q=78', 'Estructura del nuevo nivel en construcción', 0),
  ('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&h=1000&q=78', 'Fachada final de la ampliación', 1)
) as g(url, alt, ord)
where pr.slug = 'segundo-piso-familia-quispe'
  and not exists (select 1 from public.project_images pi where pi.project_id = pr.id);

insert into public.projects (slug, title, excerpt, description, category, location, completed_on, featured, main_image_url, main_image_alt, details, service_slugs, status)
values ('edificio-departamentos-santa-elena', 'Edificio de departamentos Santa Elena', 'Edificio multifamiliar de cinco niveles con doce departamentos luminosos y áreas comunes bien resueltas.', array['Un lote angosto y profundo exigía resolver iluminación y ventilación de cada departamento. Estudiamos distintas distribuciones hasta lograr doce unidades con buena orientación.', 'La circulación central se ilumina con un lucernario, y la fachada combina ritmos verticales con balcones que dan sombra y privacidad.', 'Entregamos el expediente completo de todas las especialidades para licencia y construcción, y acompañamos la supervisión técnica de la obra.']::text[], 'Multifamiliar', 'Cajamarca, Cajamarca', '2024-08-15', true, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&h=1100&q=78', 'Edificio de departamentos con fachada de vidrio y balcones', '[{"label":"Área construida","value":"1 450 m²"},{"label":"Unidades","value":"12 departamentos"},{"label":"Servicios","value":"Diseño, planos de especialidades, supervisión"}]'::jsonb, array['diseno-arquitectonico', 'planimetria-y-especialidades', 'construccion']::text[], 'published')
on conflict (slug) do nothing;

insert into public.project_images (project_id, url, alt, sort_order)
select pr.id, g.url, g.alt, g.ord from public.projects pr
cross join (values
  ('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&h=1000&q=78', 'Detalle de fachada y juego de luces', 0),
  ('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&h=1000&q=78', 'Planos del edificio en revisión', 1)
) as g(url, alt, ord)
where pr.slug = 'edificio-departamentos-santa-elena'
  and not exists (select 1 from public.project_images pi where pi.project_id = pr.id);

insert into public.projects (slug, title, excerpt, description, category, location, completed_on, featured, main_image_url, main_image_alt, details, service_slugs, status)
values ('local-comercial-plaza-norte', 'Local comercial Plaza Norte', 'Diseño y remodelación de un local comercial en esquina, con fachada vidriada, buena visibilidad y espacios flexibles.', array['Un local en esquina que necesitaba atraer más público y ordenar mejor la exhibición. Rediseñamos la fachada con grandes vitrinas y un acceso más amable.', 'Interiormente propusimos un plano libre con mobiliario modular para cambiar la distribución según la temporada.', 'La obra se ejecutó en tres semanas, con el local cerrado el menor tiempo posible.']::text[], 'Comercial', 'Cajamarca, Cajamarca', '2024-06-05', false, 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&h=1100&q=78', 'Detalle arquitectónico de fachada comercial contemporánea', '[{"label":"Superficie intervenida","value":"92 m²"},{"label":"Plazo de obra","value":"3 semanas"},{"label":"Servicios","value":"Diseño, remodelación, terminaciones"}]'::jsonb, array['diseno-arquitectonico', 'reformas-integrales', 'terminaciones']::text[], 'published')
on conflict (slug) do nothing;

insert into public.project_images (project_id, url, alt, sort_order)
select pr.id, g.url, g.alt, g.ord from public.projects pr
cross join (values
  ('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&h=1000&q=78', 'Esquina comercial con vitrinas amplias', 0)
) as g(url, alt, ord)
where pr.slug = 'local-comercial-plaza-norte'
  and not exists (select 1 from public.project_images pi where pi.project_id = pr.id);

insert into public.projects (slug, title, excerpt, description, category, location, completed_on, featured, main_image_url, main_image_alt, details, service_slugs, status)
values ('casa-mirador', 'Casa Mirador', 'Vivienda de fin de semana con grandes terrazas, materiales naturales y una relación directa con el paisaje.', array['Una casa de descanso para una familia que buscaba desconectarse de la ciudad. El diseño prioriza las vistas, las terrazas y los espacios para compartir.', 'Usamos piedra, madera y concreto visto, materiales que envejecen bien y requieren poco mantenimiento.', 'La construcción se adaptó a la pendiente del terreno para minimizar movimientos de tierra y respetar la vegetación existente.']::text[], 'Vivienda', 'Los Baños del Inca, Cajamarca', '2023-12-10', false, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&h=1100&q=78', 'Casa de descanso con terrazas y grandes ventanales', '[{"label":"Superficie construida","value":"165 m²"},{"label":"Terreno","value":"600 m²"},{"label":"Servicios","value":"Diseño, planos, construcción"}]'::jsonb, array['diseno-arquitectonico', 'construccion']::text[], 'published')
on conflict (slug) do nothing;

insert into public.project_images (project_id, url, alt, sort_order)
select pr.id, g.url, g.alt, g.ord from public.projects pr
cross join (values
  ('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&h=1000&q=78', 'Volumen principal y terraza', 0),
  ('https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1400&h=1000&q=78', 'Jardín y área social', 1)
) as g(url, alt, ord)
where pr.slug = 'casa-mirador'
  and not exists (select 1 from public.project_images pi where pi.project_id = pr.id);

insert into public.testimonials (name, role, location, quote, rating, project_slug, sort_order, status)
select v.* from (values
  ('Rosa Elena Chávez', 'Propietaria', 'Cajamarca', 'Nos explicaron cada decisión con calma y con imágenes 3D. Cuando empezó la obra ya sabíamos exactamente cómo iba a quedar la casa, y el presupuesto se respetó.', 5, 'reforma-casa-moderna', 0, 'published'),
  ('Marco Antonio Quispe', 'Propietario', 'San Miguel de Pallaques', 'Dudábamos si la estructura aguantaría un segundo piso. Hicieron la evaluación, nos dieron una solución segura y pudimos seguir viviendo en la casa durante la obra.', 5, 'segundo-piso-familia-quispe', 1, 'published'),
  ('Lucía Fernández', 'Inversionista inmobiliaria', 'Cajamarca', 'Lo mejor fue tener planos de todas las especialidades coordinados. En obra no hubo interferencias y entregamos los departamentos en la fecha prevista.', 5, 'edificio-departamentos-santa-elena', 2, 'published'),
  ('Jorge Valdivia', 'Propietario', 'Baños del Inca', 'Remodelaron nuestra cocina en menos de dos meses. Cuidaron los detalles, mantuvieron limpia la obra y la comunicación fue constante.', 5, 'cocina-abierta-los-pinos', 3, 'published')
) as v(name, role, location, quote, rating, project_slug, sort_order, status)
where not exists (select 1 from public.testimonials);
