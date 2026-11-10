# ACROMA Arquitectos — web pública

Sitio hecho con [Astro](https://astro.build) (HTML estático, casi sin JavaScript).

## Comandos

| Comando           | Qué hace                                  |
| ----------------- | ----------------------------------------- |
| `npm install`     | Instala las dependencias (solo la primera vez) |
| `npm run dev`     | Servidor local en http://localhost:4321   |
| `npm run build`   | Genera el sitio final en `dist/`          |
| `npm run preview` | Prueba localmente el sitio ya compilado   |

## Estructura

```
src/
  data/        Contenido local: negocio, servicios, proyectos, testimonios
  lib/         content.ts (acceso a datos), seo.ts (JSON-LD), format.ts
  layouts/     BaseLayout.astro (SEO, header, footer)
  components/  Piezas reutilizables (Hero, tarjetas, formulario, etc.)
  pages/       Una página por archivo (la ruta sale del nombre)
  styles/      global.css (colores, tipografía, botones)
  assets/      Logo y foto del equipo (se optimizan solos)
public/        Archivos que se publican tal cual (favicon, futuros videos)
```

## Cómo editar contenido (por ahora)

- Teléfonos, correo, horario, redes, equipo: `src/data/site.ts`
- Servicios: `src/data/services.ts`
- Proyectos (título, slug, galería, destacado…): `src/data/projects.ts`
- Testimonios: `src/data/testimonials.ts`
- Dominio real: `site` en `astro.config.mjs` (afecta canonical, sitemap y robots)

Cada proyecto nuevo crea solo su página en `/proyectos/<slug>`, y cada servicio en `/servicios/<slug>`.

## Conectar Supabase y el panel /admin

Proyecto: `https://qfrfqnjvsdujumyimzap.supabase.co`. Se hace **una sola vez**:

1. **Base de datos.** Supabase → *SQL Editor* → *New query* → pega todo `supabase/schema.sql` → *Run*.
   Luego otra consulta nueva con `supabase/seed.sql` (carga el contenido de ejemplo actual). Ambos se pueden repetir sin riesgo.
   **Si ya habías ejecutado `schema.sql` antes de la versión con campañas**, ejecuta además `supabase/novedades.sql` (añade campañas, novedades e imágenes del sitio).
2. **Crear el usuario administrador.** Supabase → *Authentication → Users → Add user → Create new user*:
   correo `andersoncristianromeromalca@gmail.com`, una contraseña segura y marca **Auto Confirm User**.
   (Solo los correos de la tabla `admins` entran al panel; para añadir otro, inserta su correo en esa tabla y crea su usuario.)
3. **Cerrar el registro público.** *Authentication → Sign In / Providers → Email*: desactiva *Allow new users to sign up*.
4. **Claves.** *Project Settings → API*: copia la clave **anon / publishable** (nunca la `service_role`).
   Copia `.env.example` a `.env` y pégala en `PUBLIC_SUPABASE_ANON_KEY`. En Netlify, cárgala como variable de entorno igual.
5. `npm run build`. Si faltan las claves, o Supabase no responde, la web usa los datos de `src/data` y no se rompe.

### Publicar en Cloudflare Pages

1. Sube el proyecto a un repositorio de GitHub (sin `node_modules` ni `.env`).
2. Cloudflare → *Workers & Pages → Create → Pages → Connect to Git* → elige el repositorio.
3. Build command: `npm run build` · Output directory: `dist` (Node 20, ya fijado en `.node-version`).
4. *Environment variables* (Production): `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`.
5. Para el botón "Publicar cambios": proyecto → *Settings → Builds → Deploy hooks → Add*, copia la URL y pégala en el panel.
6. Dominio propio: *Custom domains*; luego cambia `site` en `astro.config.mjs`.

### Cómo trabaja el cliente

- Entra en `https://TU-DOMINIO/admin` con su correo y contraseña.
- Edita **proyectos (con galería), servicios, testimonios, datos del negocio** y gestiona **consultas** (estado y notas). Sube fotos: se reducen y comprimen solas (WebP).
- Lo que está en *Borrador* no se muestra en la web.
- La web pública es estática y rápida: para ver los cambios pulsa **Publicar cambios**, que reconstruye el sitio (1–2 min).
  Configúralo una vez: Netlify → *Site configuration → Build & deploy → Build hooks → Add build hook*,
  copia la URL y pégala en el panel, sección *Publicar cambios*.
- El panel **no** permite tocar diseño, colores, tipografías, animaciones ni estructura.

### Campañas, novedades e imágenes del sitio

- **Novedades y campañas** (panel): crea una publicación con título, texto, imagen, botón y fechas.
  Tipo *Campaña* = aviso dorado arriba en toda la web mientras esté vigente (se oculta sola al pasar la fecha final).
  Tipo *Novedad* = noticia o felicitación. Puedes pegar el enlace de la publicación de Facebook/Instagram y aparece el botón «Ver en…».
  Se muestran en el inicio, en `/novedades` y en su propia página. Los botones de Instagram y Facebook salen de *Datos del negocio*.
- **Imágenes del sitio** (panel): cambia la foto de la portada y la del equipo sin tocar el diseño. «Volver a la original» la restaura.
- Recuerda pulsar **Publicar cambios** para ver cualquier cambio en la web.
- La foto de portada original está en `src/assets/hero-maqueta.jpg`.

### Formulario de contacto

Guarda cada consulta en la tabla `leads` (validada en la base de datos; trampa anti-bots incluida).
Si el envío falla, ofrece continuar por WhatsApp con los datos ya escritos.

### Seguridad (resumen)

Visitantes: solo leen contenido publicado y envían el formulario (no pueden leer consultas). Administradores
(verificados en la base de datos con correo confirmado): todo lo demás. `/admin` lleva `noindex` y está en `robots.txt`.

Para regenerar `seed.sql` desde `src/data`: `npm run seed:generate`.

## Diseño Liquid Glass y animaciones

- Material de vidrio: clases `.glass`, `.glass--dark`, `.glass--pill` y fondos `.aurora` en `src/styles/global.css`.
- Efectos (revelado al scroll, contadores, parallax, destello del puntero): `src/scripts/effects.ts`.
  Se activan con atributos: `data-reveal`, `data-reveal-group`, `data-count`, `data-glass`, `data-parallax`.
- Respeta `prefers-reduced-motion`, `prefers-reduced-transparency` y `prefers-contrast`.
- Transiciones entre páginas con View Transitions nativas (Chrome y Safari recientes; el resto navega normal).

## Hero con video en loop

El hero tiene un slot `media`. Instrucciones en los comentarios de `src/components/Hero.astro`
(sube el video a `public/media/` y pásalo como `<video slot="media" …>`).

## Pendiente antes de publicar

- Reemplazar las fotos de ejemplo (Unsplash) por fotos reales.
- Revisar las preguntas frecuentes (`src/data/faq.ts`) con los datos reales del estudio.
- Confirmar correo, enlace de Facebook y las cifras de `src/data/site.ts` (son de ejemplo).
- Poner el dominio real en `astro.config.mjs`.
- Ejecutar los pasos de *Conectar Supabase*, y subir fotos reales desde el panel.
