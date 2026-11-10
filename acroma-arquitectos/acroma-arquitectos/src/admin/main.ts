/**
 * Panel /admin — solo edita CONTENIDO (proyectos, servicios, testimonios, negocio, leads, imágenes).
 * El diseño vive en el código y no se expone aquí. La seguridad real la dan las políticas RLS de Supabase.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, any>;
const app = document.getElementById('app')!;
const toastEl = document.getElementById('toast')!;
const SB_URL = document.body.dataset.sbUrl || '';
const SB_KEY = document.body.dataset.sbKey || '';

/* ---------- utilidades ---------- */
function h(tag: string, attrs: Row = {}, ...kids: (Node | string | null | false | undefined)[]): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') (el as any).value = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const kid of kids) if (kid !== null && kid !== undefined && kid !== false) el.append(kid);
  return el;
}
let toastTimer: number | undefined;
function toast(msg: string, bad = false) {
  toastEl.textContent = msg;
  toastEl.className = `on${bad ? ' bad' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toastEl.className = ''), 3400);
}
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const errMsg = (e: any) => e?.message ?? String(e);

if (!SB_URL || !SB_KEY) {
  app.replaceChildren(
    h('div', { class: 'login' }, h('div', { class: 'login__card' },
      h('h1', {}, 'Panel sin configurar'),
      h('p', {}, 'Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY. Revisa el README (sección "Conectar Supabase").'))),
  );
  throw new Error('Supabase sin configurar');
}

const sb: SupabaseClient = createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

/* ---------- imágenes: reducir y subir a Storage ---------- */
async function shrink(file: File, max = 1800): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('No se pudo procesar la imagen'))), 'image/webp', 0.82));
}
async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen');
  const blob = await shrink(file);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;
  const { error } = await sb.storage.from('media').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' });
  if (error) throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}

/* ---------- definición de entidades ---------- */
interface Field {
  key: string; label: string;
  type: 'text' | 'textarea' | 'paragraphs' | 'lines' | 'number' | 'date' | 'checkbox' | 'select' | 'image' | 'pairs' | 'slugs' | 'email' | 'url';
  help?: string; required?: boolean; altKey?: string; options?: string[] | (() => Promise<[string, string][]>);
  pairLabels?: [string, string]; pairKeys?: [string, string]; half?: boolean;
}
const statusOptions = ['published', 'draft'];
const STATUS_LABEL: Record<string, string> = { published: 'Publicado', draft: 'Borrador', campana: 'Campaña (aviso dorado arriba)', noticia: 'Novedad / noticia' };
const categories = ['Vivienda', 'Reforma integral', 'Cocinas y baños', 'Ampliación', 'Multifamiliar', 'Comercial'];

const entities: Record<string, { title: string; table: string; order: [string, boolean]; fields: Field[]; label: (r: Row) => string; meta: (r: Row) => string; thumb?: (r: Row) => string; defaults: Row; singular: string }> = {
  projects: {
    title: 'Proyectos', singular: 'proyecto', table: 'projects', order: ['completed_on', false],
    label: (r) => r.title, meta: (r) => `${r.category} · ${r.location}`, thumb: (r) => r.main_image_url,
    defaults: { category: 'Vivienda', featured: false, status: 'draft', description: [], details: [], service_slugs: [], completed_on: new Date().toISOString().slice(0, 10) },
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'slug', label: 'Dirección web (slug)', type: 'text', help: 'Se genera solo desde el título. Cambiarla cambia el enlace del proyecto.' },
      { key: 'excerpt', label: 'Resumen corto', type: 'textarea', help: 'Aparece en las tarjetas y en Google (máx. ~160 caracteres).' },
      { key: 'description', label: 'Descripción', type: 'paragraphs', help: 'Separa los párrafos con una línea en blanco.' },
      { key: 'category', label: 'Categoría', type: 'select', options: categories, half: true },
      { key: 'location', label: 'Ubicación', type: 'text', half: true },
      { key: 'completed_on', label: 'Fecha de finalización', type: 'date', half: true },
      { key: 'status', label: 'Estado', type: 'select', options: statusOptions, half: true },
      { key: 'featured', label: 'Destacado en el inicio', type: 'checkbox' },
      { key: 'main_image_url', label: 'Imagen principal', type: 'image', altKey: 'main_image_alt' },
      { key: 'details', label: 'Datos técnicos', type: 'pairs', pairLabels: ['Dato', 'Valor'], pairKeys: ['label', 'value'], help: 'Ej.: Superficie intervenida — 186 m²' },
      { key: 'service_slugs', label: 'Servicios aplicados', type: 'slugs' },
    ],
  },
  services: {
    title: 'Servicios', singular: 'servicio', table: 'services', order: ['sort_order', true],
    label: (r) => r.title, meta: (r) => r.kicker, thumb: (r) => r.image_url,
    defaults: { featured: false, status: 'draft', features: [], sort_order: 0 },
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'slug', label: 'Dirección web (slug)', type: 'text' },
      { key: 'kicker', label: 'Etiqueta corta', type: 'text', half: true, help: 'Ej.: Diseño, Obra' },
      { key: 'sort_order', label: 'Orden (menor = primero)', type: 'number', half: true },
      { key: 'summary', label: 'Resumen para tarjetas', type: 'textarea' },
      { key: 'description', label: 'Descripción completa', type: 'textarea' },
      { key: 'features', label: 'Puntos clave', type: 'lines', help: 'Uno por línea.' },
      { key: 'ideal_for', label: 'Ideal para', type: 'textarea' },
      { key: 'deliverables', label: 'Qué recibe el cliente', type: 'textarea' },
      { key: 'status', label: 'Estado', type: 'select', options: statusOptions, half: true },
      { key: 'featured', label: 'Destacado en el inicio', type: 'checkbox' },
      { key: 'image_url', label: 'Imagen', type: 'image', altKey: 'image_alt' },
    ],
  },
  testimonials: {
    title: 'Testimonios', singular: 'testimonio', table: 'testimonials', order: ['sort_order', true],
    label: (r) => r.name, meta: (r) => `${'★'.repeat(r.rating)} · ${String(r.quote).slice(0, 80)}…`,
    defaults: { rating: 5, status: 'draft', sort_order: 0 },
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, half: true },
      { key: 'role', label: 'Rol', type: 'text', half: true, help: 'Ej.: Propietaria' },
      { key: 'location', label: 'Ciudad', type: 'text', half: true },
      { key: 'rating', label: 'Valoración (1 a 5)', type: 'number', half: true },
      { key: 'quote', label: 'Testimonio', type: 'textarea', required: true },
      { key: 'project_slug', label: 'Proyecto relacionado', type: 'select', options: async () => [['', '— Ninguno —'], ...(((await sb.from('projects').select('slug,title').order('title')).data ?? []).map((p: Row) => [p.slug, p.title] as [string, string]))] },
      { key: 'sort_order', label: 'Orden', type: 'number', half: true },
      { key: 'status', label: 'Estado', type: 'select', options: statusOptions, half: true },
    ],
  },
};

entities.posts = {
  title: 'Novedades y campañas', singular: 'publicación', table: 'posts', order: ['starts_on', false],
  label: (r) => r.title,
  meta: (r) => `${r.kind === 'campana' ? 'Campaña' : 'Novedad'} · desde ${r.starts_on}${r.ends_on ? ' hasta ' + r.ends_on : ''}${r.pinned ? ' · fijada' : ''}`,
  thumb: (r) => r.image_url,
  defaults: { kind: 'noticia', status: 'draft', pinned: false, body: [], starts_on: new Date().toISOString().slice(0, 10) },
  fields: [
    { key: 'kind', label: 'Tipo', type: 'select', options: ['noticia', 'campana'], half: true, help: 'Las campañas muestran un aviso dorado arriba en toda la web mientras estén vigentes.' },
    { key: 'status', label: 'Estado', type: 'select', options: statusOptions, half: true },
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'slug', label: 'Dirección web (slug)', type: 'text', help: 'Se genera sola desde el título.' },
    { key: 'summary', label: 'Resumen', type: 'textarea', help: 'Una o dos frases. Se ve en el aviso, las tarjetas y Google.' },
    { key: 'body', label: 'Texto completo', type: 'paragraphs', help: 'Separa los párrafos con una línea en blanco.' },
    { key: 'image_url', label: 'Imagen (opcional)', type: 'image', altKey: 'image_alt' },
    { key: 'starts_on', label: 'Visible desde', type: 'date', half: true },
    { key: 'ends_on', label: 'Visible hasta (opcional)', type: 'date', half: true, help: 'Al pasar esta fecha el aviso se oculta solo; la campaña queda marcada como finalizada.' },
    { key: 'cta_label', label: 'Texto del botón (opcional)', type: 'text', half: true, help: 'Ej.: Quiero esta campaña' },
    { key: 'cta_url', label: 'Enlace del botón', type: 'text', half: true, help: 'Ej.: /contacto#formulario o un enlace de WhatsApp' },
    { key: 'social_url', label: 'Enlace a la publicación en Facebook o Instagram (opcional)', type: 'url', help: 'Pega el enlace de la publicación; aparecerá un botón «Ver en Facebook/Instagram».' },
    { key: 'pinned', label: 'Fijar arriba (aparece primero)', type: 'checkbox' },
  ],
};

const businessFields: Field[] = [
  { key: 'name', label: 'Nombre comercial', type: 'text', required: true },
  { key: 'tagline', label: 'Lema', type: 'text' },
  { key: 'description', label: 'Descripción (Google y pie de página)', type: 'textarea' },
  { key: 'email', label: 'Correo de contacto', type: 'email', half: true },
  { key: 'hours', label: 'Horario', type: 'text', half: true },
  { key: 'phones', label: 'Teléfonos', type: 'pairs', pairLabels: ['Nombre', 'Número (+51…)'], pairKeys: ['label', 'e164'], help: 'Se muestra el número con el formato que escribas.' },
  { key: 'whatsapp_e164', label: 'WhatsApp (solo números, con 51)', type: 'text', half: true, help: 'Ej.: 51960577902' },
  { key: 'whatsapp_display', label: 'WhatsApp (cómo se ve)', type: 'text', half: true },
  { key: 'street', label: 'Dirección', type: 'text' },
  { key: 'locality', label: 'Ciudad', type: 'text', half: true },
  { key: 'region', label: 'Región', type: 'text', half: true },
  { key: 'facebook', label: 'Facebook (enlace)', type: 'url', half: true },
  { key: 'instagram', label: 'Instagram (enlace)', type: 'url', half: true },
  { key: 'stats', label: 'Cifras del inicio', type: 'pairs', pairLabels: ['Cifra', 'Texto'], pairKeys: ['value', 'label'], help: 'Ej.: +60 — Proyectos entre diseño, reformas y obra. Pon solo datos reales.' },
];

/* ---------- editor de formularios genérico ---------- */
interface Built { el: HTMLElement; read: () => Row; }
async function buildFields(fields: Field[], data: Row, folder: string): Promise<Built> {
  const wrap = h('div', { class: 'form' });
  const readers: (() => Row)[] = [];
  let halfBuf: HTMLElement[] = [];
  const flush = () => { if (halfBuf.length) { wrap.append(h('div', { class: 'grid2' }, ...halfBuf)); halfBuf = []; } };

  for (const f of fields) {
    const id = `f-${f.key}`;
    const val = data[f.key];
    let control: HTMLElement;
    let read: () => Row;
    const lab = (extra?: string) => h('label', { for: id }, f.label + (f.required ? ' *' : ''));
    const help = f.help ? h('p', { class: 'help' }, f.help) : null;

    if (f.type === 'checkbox') {
      const input = h('input', { type: 'checkbox', id }) as HTMLInputElement; input.checked = !!val;
      control = h('label', { class: 'check' }, input, f.label);
      read = () => ({ [f.key]: input.checked });
      flush(); wrap.append(control); readers.push(read); continue;
    }
    let field: HTMLElement;
    if (f.type === 'textarea' || f.type === 'paragraphs' || f.type === 'lines') {
      const sep = f.type === 'paragraphs' ? '\n\n' : '\n';
      const ta = h('textarea', { id, rows: f.type === 'paragraphs' ? 9 : 5 }) as HTMLTextAreaElement;
      ta.value = Array.isArray(val) ? val.join(sep) : (val ?? '');
      field = h('div', { class: 'field' }, lab(), ta, help);
      read = () => ({ [f.key]: f.type === 'textarea' ? ta.value.trim() : ta.value.split(f.type === 'paragraphs' ? /\n\s*\n/ : /\n/).map((s) => s.trim()).filter(Boolean) });
    } else if (f.type === 'select') {
      const sel = h('select', { id }) as HTMLSelectElement;
      const opts: [string, string][] = typeof f.options === 'function' ? await f.options()
        : (f.options ?? []).map((o) => [o, STATUS_LABEL[o] ?? o] as [string, string]);
      for (const [v, l] of opts) sel.append(h('option', { value: v }, l));
      sel.value = val ?? opts[0]?.[0] ?? '';
      field = h('div', { class: 'field' }, lab(), sel, help);
      read = () => ({ [f.key]: sel.value || (f.key === 'project_slug' ? null : '') });
    } else if (f.type === 'image') {
      const alt = h('input', { type: 'text', placeholder: 'Descripción de la foto (para Google y accesibilidad)', value: data[f.altKey!] ?? '' }) as HTMLInputElement;
      let url: string = val ?? '';
      const preview = h('img', { alt: '', src: url || undefined }) as HTMLImageElement;
      if (!url) preview.style.display = 'none';
      const file = h('input', { type: 'file', accept: 'image/*', style: 'display:none' }) as HTMLInputElement;
      const btn = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, url ? 'Cambiar imagen' : 'Subir imagen') as HTMLButtonElement;
      btn.onclick = () => file.click();
      file.onchange = async () => {
        if (!file.files?.[0]) return;
        btn.disabled = true; btn.textContent = 'Subiendo…';
        try { url = await uploadImage(file.files[0], folder); preview.src = url; preview.style.display = ''; btn.textContent = 'Cambiar imagen'; toast('Imagen lista. Recuerda guardar.'); }
        catch (e) { toast(errMsg(e), true); btn.textContent = 'Subir imagen'; }
        btn.disabled = false;
      };
      field = h('div', { class: 'field' }, h('span', { class: 'lbl' }, f.label), h('div', { class: 'imgfield' }, preview, h('div', { class: 'imgfield__ctl' }, btn, file, alt)), help);
      read = () => ({ [f.key]: url, [f.altKey!]: alt.value.trim() });
    } else if (f.type === 'pairs') {
      const [ka, kb] = f.pairKeys!; const [la, lb] = f.pairLabels!;
      const box = h('div', { class: 'pairs' });
      const addRow = (a = '', b = '') => {
        const row = h('div', { class: 'pair' },
          h('input', { type: 'text', placeholder: la, value: a, 'data-a': '' }),
          h('input', { type: 'text', placeholder: lb, value: b, 'data-b': '' }),
          h('button', { type: 'button', class: 'btn btn--danger btn--sm', 'aria-label': 'Quitar', onclick: () => row.remove() }, '✕'));
        box.append(row);
      };
      for (const p of (val ?? []) as Row[]) addRow(p[ka], p[kb]);
      const add = h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: () => addRow() }, '+ Añadir');
      field = h('div', { class: 'field' }, h('span', { class: 'lbl' }, f.label), box, add, help);
      read = () => ({ [f.key]: [...box.querySelectorAll('.pair')].map((r) => {
        const a = (r.querySelector('[data-a]') as HTMLInputElement).value.trim(); const b = (r.querySelector('[data-b]') as HTMLInputElement).value.trim();
        const o: Row = { [ka]: a, [kb]: b };
        if (f.key === 'phones') o.display = a && b ? b.replace(/^\+51\s?/, '').replace(/(\d{3})(?=\d)/g, '$1 ').trim() : '';
        return o;
      }).filter((o) => o[ka] || o[kb]) });
    } else if (f.type === 'slugs') {
      const list = (await sb.from('services').select('slug,title').order('sort_order')).data ?? [];
      const sel = new Set<string>(val ?? []);
      const boxes = list.map((s: Row) => { const i = h('input', { type: 'checkbox', value: s.slug }) as HTMLInputElement; i.checked = sel.has(s.slug); return h('label', { class: 'check' }, i, s.title); });
      field = h('div', { class: 'field' }, h('span', { class: 'lbl' }, f.label), h('div', { class: 'checks' }, ...boxes));
      read = () => ({ [f.key]: boxes.map((b) => b.querySelector('input') as HTMLInputElement).filter((i) => i.checked).map((i) => i.value) });
    } else {
      const input = h('input', { type: f.type, id, value: val ?? '' }) as HTMLInputElement;
      if (f.type === 'number') { input.min = '0'; if (f.key === 'rating') { input.min = '1'; input.max = '5'; } }
      field = h('div', { class: 'field' }, lab(), input, help);
      read = () => ({ [f.key]: f.type === 'number' ? Number(input.value || 0) : input.value.trim() });
      if (f.required) input.required = true;
    }
    readers.push(read);
    if (f.half) halfBuf.push(field); else { flush(); wrap.append(field); }
  }
  flush();
  return { el: wrap, read: () => Object.assign({}, ...readers.map((r) => r())) };
}

/* ---------- galería de proyecto (cambios inmediatos) ---------- */
async function galleryEditor(projectId: string): Promise<HTMLElement> {
  const box = h('div', { class: 'field' });
  const grid = h('div', { class: 'gallery' });
  const file = h('input', { type: 'file', accept: 'image/*', multiple: true, style: 'display:none' }) as HTMLInputElement;
  const add = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, '+ Añadir fotos') as HTMLButtonElement;
  add.onclick = () => file.click();
  const load = async () => {
    const { data, error } = await sb.from('project_images').select('*').eq('project_id', projectId).order('sort_order');
    if (error) return toast(errMsg(error), true);
    const items = data ?? [];
    grid.replaceChildren(...items.map((it: Row, i: number) => {
      const alt = h('input', { type: 'text', value: it.alt, placeholder: 'Descripción' }) as HTMLInputElement;
      alt.onchange = async () => { const r = await sb.from('project_images').update({ alt: alt.value.trim() }).eq('id', it.id); toast(r.error ? errMsg(r.error) : 'Guardado', !!r.error); };
      const swap = async (j: number) => {
        const o = items[j]; if (!o) return;
        await Promise.all([sb.from('project_images').update({ sort_order: o.sort_order }).eq('id', it.id), sb.from('project_images').update({ sort_order: it.sort_order }).eq('id', o.id)]);
        if (o.sort_order === it.sort_order) await sb.from('project_images').update({ sort_order: it.sort_order + (j > i ? 1 : -1) }).eq('id', it.id);
        load();
      };
      return h('div', { class: 'gal' }, h('img', { src: it.url, alt: it.alt, loading: 'lazy' }), alt,
        h('div', { class: 'gal__btns' },
          h('button', { type: 'button', class: 'btn btn--ghost btn--sm', 'aria-label': 'Mover antes', onclick: () => swap(i - 1) }, '←'),
          h('button', { type: 'button', class: 'btn btn--ghost btn--sm', 'aria-label': 'Mover después', onclick: () => swap(i + 1) }, '→'),
          h('button', { type: 'button', class: 'btn btn--danger btn--sm', onclick: async () => { if (!confirm('¿Quitar esta foto de la galería?')) return; const r = await sb.from('project_images').delete().eq('id', it.id); if (r.error) toast(errMsg(r.error), true); load(); } }, 'Quitar')));
    }));
    grid.dataset.next = String(items.reduce((m: number, x: Row) => Math.max(m, x.sort_order), -1) + 1);
  };
  file.onchange = async () => {
    const files = [...(file.files ?? [])]; if (!files.length) return;
    add.disabled = true; add.textContent = 'Subiendo…';
    try {
      let n = Number(grid.dataset.next ?? 0);
      for (const f of files) { const url = await uploadImage(f, 'proyectos'); const r = await sb.from('project_images').insert({ project_id: projectId, url, alt: '', sort_order: n++ }); if (r.error) throw r.error; }
      toast(`${files.length} foto(s) añadida(s)`);
    } catch (e) { toast(errMsg(e), true); }
    add.disabled = false; add.textContent = '+ Añadir fotos'; file.value = ''; load();
  };
  box.append(h('span', { class: 'lbl' }, 'Galería de fotos'), h('p', { class: 'help' }, 'Los cambios de la galería se guardan al instante. Escribe una descripción breve en cada foto.'), grid, add, file);
  await load();
  return box;
}

/* ---------- pantallas ---------- */
const main = () => document.getElementById('main')!;
let current = 'projects';

async function listView(key: string) {
  const ent = entities[key];
  main().replaceChildren(h('p', { class: 'boot' }, 'Cargando…'));
  const { data, error } = await sb.from(ent.table).select('*').order(ent.order[0], { ascending: ent.order[1] });
  if (error) return main().replaceChildren(h('p', { class: 'err' }, errMsg(error)));
  const rows = data ?? [];
  const list = h('div', { class: 'list' });
  if (!rows.length) list.append(h('div', { class: 'empty' }, `Aún no hay ${ent.title.toLowerCase()}.`));
  for (const r of rows) {
    const thumb = ent.thumb?.(r);
    list.append(h('div', { class: `row${ent.thumb ? '' : ' no-thumb'}` },
      ent.thumb ? (thumb ? h('img', { src: thumb, alt: '', loading: 'lazy' }) : h('span')) : null,
      h('div', {}, h('div', { class: 'row__title' }, ent.label(r),
        h('span', { class: `pill${r.status === 'draft' ? ' pill--draft' : ''}` }, STATUS_LABEL[r.status]),
        r.featured ? h('span', { class: 'pill pill--star' }, '★ Destacado') : null),
        h('div', { class: 'row__meta' }, ent.meta(r))),
      h('div', {}, h('button', { class: 'btn btn--ghost btn--sm', onclick: () => editView(key, r) }, 'Editar'))));
  }
  main().replaceChildren(
    h('div', { class: 'top' }, h('div', {}, h('h2', {}, ent.title), h('p', { class: 'hint' }, 'Los borradores no se ven en la web. Tras editar, pulsa «Publicar cambios».')),
      h('button', { class: 'btn btn--gold', onclick: () => editView(key, null) }, `+ Nuevo ${ent.singular}`)),
    list);
}

async function editView(key: string, row: Row | null) {
  const ent = entities[key];
  const isNew = !row;
  const data = row ?? { ...ent.defaults };
  const built = await buildFields(ent.fields, data, key === 'projects' ? 'proyectos' : key);
  const err = h('p', { class: 'err' });
  const save = h('button', { class: 'btn btn--gold', type: 'button' }, 'Guardar') as HTMLButtonElement;
  const back = h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => listView(key) }, '← Volver');
  const children: HTMLElement[] = [built.el];
  let gallerySlot: HTMLElement | null = null;
  if (key === 'projects') {
    gallerySlot = h('div', { class: 'form' });
    if (!isNew) gallerySlot.append(await galleryEditor(row!.id));
    else gallerySlot.append(h('p', { class: 'hint' }, 'Guarda el proyecto para poder añadir la galería de fotos.'));
    children.push(gallerySlot);
  }
  const actions = h('div', { class: 'actions' }, save, back);
  if (!isNew) {
    actions.append(h('button', { class: 'btn btn--danger', type: 'button', onclick: async () => {
      if (!confirm(`¿Eliminar este ${ent.singular}? No se puede deshacer.`)) return;
      const r = await sb.from(ent.table).delete().eq('id', row!.id);
      if (r.error) return toast(errMsg(r.error), true);
      toast('Eliminado'); listView(key);
    } }, 'Eliminar'));
  }
  save.onclick = async () => {
    err.textContent = '';
    const payload = built.read();
    if (ent.fields.some((f) => f.required && !String(payload[f.key] ?? '').trim())) { err.textContent = 'Completa los campos obligatorios (*).'; return; }
    if ('slug' in data || ent.fields.some((f) => f.key === 'slug')) payload.slug = slugify(payload.slug || payload.title);
    if (key === 'posts') {
      if (!payload.ends_on) payload.ends_on = null;
      if (payload.ends_on && payload.starts_on && payload.ends_on < payload.starts_on) { err.textContent = 'La fecha final no puede ser anterior a la inicial.'; return; }
      if (payload.cta_url && !/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(payload.cta_url)) { err.textContent = 'El enlace del botón debe empezar con https:// o con /'; return; }
    }
    if (key === 'testimonials') payload.rating = Math.min(5, Math.max(1, Math.round(payload.rating || 5)));
    save.disabled = true; save.textContent = 'Guardando…';
    const q = isNew ? sb.from(ent.table).insert(payload).select().single() : sb.from(ent.table).update(payload).eq('id', row!.id).select().single();
    const r = await q;
    save.disabled = false; save.textContent = 'Guardar';
    if (r.error) { err.textContent = r.error.code === '23505' ? 'Ya existe otro elemento con esa dirección web (slug).' : errMsg(r.error); return; }
    toast('Guardado ✓');
    if (isNew) editView(key, r.data); // reabre para habilitar la galería
  };
  main().replaceChildren(
    h('div', { class: 'top' }, h('h2', {}, isNew ? `Nuevo ${ent.singular}` : ent.label(data))),
    ...children, err, actions);
}

async function businessView() {
  const { data, error } = await sb.from('business_info').select('*').eq('id', 1).maybeSingle();
  if (error) return main().replaceChildren(h('p', { class: 'err' }, errMsg(error)));
  const built = await buildFields(businessFields, data ?? {}, 'negocio');
  const err = h('p', { class: 'err' });
  const save = h('button', { class: 'btn btn--gold', type: 'button' }, 'Guardar') as HTMLButtonElement;
  save.onclick = async () => {
    const payload = built.read();
    if (!payload.name) { err.textContent = 'El nombre es obligatorio.'; return; }
    payload.whatsapp_e164 = String(payload.whatsapp_e164).replace(/\D/g, '');
    err.textContent = ''; save.disabled = true;
    const r = await sb.from('business_info').upsert({ id: 1, ...payload });
    save.disabled = false;
    if (r.error) { err.textContent = errMsg(r.error); return; }
    toast('Guardado ✓');
  };
  main().replaceChildren(h('div', { class: 'top' }, h('div', {}, h('h2', {}, 'Datos del negocio'), h('p', { class: 'hint' }, 'Contacto, horario, redes y cifras que se muestran en toda la web.'))),
    built.el, err, h('div', { class: 'actions' }, save));
}

async function leadsView() {
  main().replaceChildren(h('p', { class: 'boot' }, 'Cargando…'));
  const { data, error } = await sb.from('leads').select('*').order('created_at', { ascending: false }).limit(300);
  if (error) return main().replaceChildren(h('p', { class: 'err' }, errMsg(error)));
  const list = h('div', { class: 'list' });
  if (!data?.length) list.append(h('div', { class: 'empty' }, 'Todavía no hay consultas.'));
  for (const l of data ?? []) {
    const sel = h('select', {}, ...['nuevo', 'contactado', 'cerrado'].map((s) => h('option', { value: s, selected: s === l.status }, s[0].toUpperCase() + s.slice(1)))) as HTMLSelectElement;
    const notes = h('textarea', { rows: 2, placeholder: 'Notas internas (solo tú las ves)' }) as HTMLTextAreaElement; notes.value = l.notes ?? '';
    const card = h('div', { class: 'lead', 'data-status': l.status });
    const persist = async () => {
      const r = await sb.from('leads').update({ status: sel.value, notes: notes.value.trim() || null }).eq('id', l.id);
      if (r.error) return toast(errMsg(r.error), true);
      card.dataset.status = sel.value; toast('Guardado ✓'); refreshBadge();
    };
    sel.onchange = persist; notes.onchange = persist;
    const phone = String(l.phone).replace(/\D/g, '');
    card.append(
      h('div', { class: 'lead__head' }, h('strong', {}, l.name), h('span', { class: 'row__meta' }, new Date(l.created_at).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }))),
      h('div', { class: 'row__meta' }, `${l.project_type || 'Sin tipo'} · ${l.email} · ${l.phone}${l.source ? ' · desde ' + l.source : ''}`),
      h('p', { class: 'lead__msg' }, l.message),
      h('div', { class: 'lead__tools' }, sel,
        h('a', { class: 'btn btn--ghost btn--sm', target: '_blank', rel: 'noopener', href: `https://wa.me/${phone.length === 9 ? '51' + phone : phone}` }, 'WhatsApp'),
        h('a', { class: 'btn btn--ghost btn--sm', href: `mailto:${l.email}` }, 'Correo'),
        h('button', { class: 'btn btn--danger btn--sm', onclick: async () => { if (!confirm('¿Eliminar esta consulta?')) return; const r = await sb.from('leads').delete().eq('id', l.id); if (r.error) return toast(errMsg(r.error), true); leadsView(); refreshBadge(); } }, 'Eliminar')),
      notes);
    list.append(card);
  }
  main().replaceChildren(h('div', { class: 'top' }, h('div', {}, h('h2', {}, 'Consultas'), h('p', { class: 'hint' }, 'Mensajes enviados desde el formulario de la web.'))), list);
}

const siteSlots: { key: string; title: string; help: string }[] = [
  { key: 'hero', title: 'Portada (inicio)', help: 'Foto grande de la portada. Mejor horizontal o cuadrada, de al menos 1200 px.' },
  { key: 'nosotros', title: 'Foto del equipo (Nosotros)', help: 'Retrato del equipo en la página Nosotros. Mejor vertical o cuadrada.' },
];
async function siteImagesView() {
  const { data, error } = await sb.from('site_images').select('*');
  if (error) return main().replaceChildren(h('p', { class: 'err' }, errMsg(error) + ' — ¿ejecutaste novedades.sql en Supabase?'));
  const cards = siteSlots.map((slot) => {
    const cur = (data ?? []).find((r: Row) => r.key === slot.key);
    let url: string = cur?.url ?? '';
    const preview = h('img', { alt: '', src: url || undefined }) as HTMLImageElement;
    if (!url) preview.style.display = 'none';
    const state = h('p', { class: 'help' }, url ? 'Usando una imagen que subiste tú.' : 'Usando la imagen original de la web.');
    const alt = h('input', { type: 'text', placeholder: 'Descripción de la foto (para Google y accesibilidad)', value: cur?.alt ?? '' }) as HTMLInputElement;
    const file = h('input', { type: 'file', accept: 'image/*', style: 'display:none' }) as HTMLInputElement;
    const upload = h('button', { type: 'button', class: 'btn btn--gold btn--sm' }, 'Subir nueva imagen') as HTMLButtonElement;
    upload.onclick = () => file.click();
    const save = async () => {
      const r = await sb.from('site_images').upsert({ key: slot.key, url, alt: alt.value.trim() });
      if (r.error) return toast(errMsg(r.error), true);
      state.textContent = 'Usando una imagen que subiste tú.'; toast('Guardado ✓ Pulsa «Publicar cambios» para verlo en la web.');
    };
    file.onchange = async () => {
      if (!file.files?.[0]) return;
      upload.disabled = true; upload.textContent = 'Subiendo…';
      try { url = await uploadImage(file.files[0], 'sitio'); preview.src = url; preview.style.display = ''; await save(); }
      catch (e) { toast(errMsg(e), true); }
      upload.disabled = false; upload.textContent = 'Subir nueva imagen'; file.value = '';
    };
    alt.onchange = () => { if (url) save(); };
    const reset = h('button', { type: 'button', class: 'btn btn--danger btn--sm', onclick: async () => {
      if (!url || !confirm('¿Volver a la imagen original de la web?')) return;
      const r = await sb.from('site_images').delete().eq('key', slot.key);
      if (r.error) return toast(errMsg(r.error), true);
      url = ''; preview.style.display = 'none'; alt.value = ''; state.textContent = 'Usando la imagen original de la web.'; toast('Restaurada ✓');
    } }, 'Volver a la original');
    return h('div', { class: 'card field' }, h('span', { class: 'lbl' }, slot.title), h('p', { class: 'help' }, slot.help),
      h('div', { class: 'imgfield' }, preview, h('div', { class: 'imgfield__ctl' }, state, h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, upload, reset), alt, file)));
  });
  main().replaceChildren(h('div', { class: 'top' }, h('div', {}, h('h2', {}, 'Imágenes del sitio'), h('p', { class: 'hint' }, 'Cambia las fotos principales de la web. El diseño no cambia, solo la foto.'))), h('div', { class: 'form' }, ...cards));
}

async function publishView() {
  const { data } = await sb.from('site_settings').select('value').eq('key', 'deploy_hook').maybeSingle();
  const input = h('input', { type: 'url', placeholder: 'https://api.netlify.com/build_hooks/…', value: data?.value ?? '' }) as HTMLInputElement;
  const saveHook = h('button', { class: 'btn btn--ghost', type: 'button', onclick: async () => {
    const r = await sb.from('site_settings').upsert({ key: 'deploy_hook', value: input.value.trim() });
    toast(r.error ? errMsg(r.error) : 'Enlace guardado ✓', !!r.error);
  } }, 'Guardar enlace');
  const go = h('button', { class: 'btn btn--gold', type: 'button' }, 'Publicar cambios ahora') as HTMLButtonElement;
  go.onclick = async () => {
    const url = input.value.trim();
    if (!url) return toast('Primero pega y guarda el enlace de publicación.', true);
    go.disabled = true; go.textContent = 'Enviando…';
    try { await fetch(url, { method: 'POST', mode: 'no-cors' }); toast('Listo: la web se está actualizando (1–2 minutos).'); }
    catch (e) { toast('No se pudo contactar el enlace de publicación.', true); }
    go.disabled = false; go.textContent = 'Publicar cambios ahora';
  };
  main().replaceChildren(
    h('div', { class: 'top' }, h('div', {}, h('h2', {}, 'Publicar cambios'), h('p', { class: 'hint' }, 'La web pública es estática: los cambios guardados aquí aparecen cuando la reconstruyes.'))),
    h('div', { class: 'card form' },
      h('p', {}, 'Después de editar proyectos, servicios, testimonios o datos del negocio, pulsa el botón. La web se actualiza en 1–2 minutos.'),
      go,
      h('div', { class: 'field' }, h('label', {}, 'Enlace de publicación (Deploy hook)'), input, h('p', { class: 'help' }, 'Se obtiene una sola vez en el hosting (Netlify → Site configuration → Build hooks). Ver README.')),
      saveHook));
}

/* ---------- shell ---------- */
const sections: [string, string][] = [['projects', 'Proyectos'], ['services', 'Servicios'], ['posts', 'Novedades y campañas'], ['testimonials', 'Testimonios'], ['siteimages', 'Imágenes del sitio'], ['business', 'Datos del negocio'], ['leads', 'Consultas'], ['publish', 'Publicar cambios']];
function show(key: string) {
  current = key;
  refreshBadge();
  document.querySelectorAll<HTMLElement>('button.nav').forEach((b) => b.setAttribute('aria-current', String(b.dataset.key === key)));
  if (entities[key]) listView(key);
  else if (key === 'business') businessView();
  else if (key === 'siteimages') siteImagesView();
  else if (key === 'leads') leadsView();
  else publishView();
}
async function refreshBadge() {
  const { count } = await sb.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'nuevo');
  const b = document.querySelector('[data-leads-badge]');
  if (b) { b.textContent = String(count ?? 0); (b as HTMLElement).style.display = count ? '' : 'none'; }
}
function shell(email: string) {
  app.replaceChildren(h('div', { class: 'shell' },
    h('aside', { class: 'side' },
      h('div', { class: 'side__brand' }, 'ACR', h('em', {}, 'OMA'), ' · Panel'),
      ...sections.map(([k, l]) => h('button', { class: 'nav', 'data-key': k, onclick: () => show(k) }, l, k === 'leads' ? h('span', { class: 'badge', 'data-leads-badge': '', style: 'display:none' }, '0') : null)),
      h('div', { class: 'side__foot' }, h('span', {}, email),
        h('a', { href: '/', target: '_blank', style: 'color:#e4c37d' }, 'Ver la web ↗'),
        h('button', { class: 'btn btn--ghost btn--sm', style: 'color:#fff;border-color:rgba(255,255,255,.3)', onclick: async () => { await sb.auth.signOut(); loginView(); } }, 'Cerrar sesión'))),
    h('main', { class: 'main', id: 'main' })));
  refreshBadge();
  show(current);
}

function loginView(message = '') {
  const email = h('input', { type: 'email', required: true, autocomplete: 'username', placeholder: 'tu@correo.com' }) as HTMLInputElement;
  const pass = h('input', { type: 'password', required: true, autocomplete: 'current-password', placeholder: 'Contraseña' }) as HTMLInputElement;
  const err = h('p', { class: 'err' }, message);
  const btn = h('button', { class: 'btn btn--gold', type: 'submit' }, 'Entrar') as HTMLButtonElement;
  const form = h('form', { class: 'login__card', onsubmit: async (e: Event) => {
    e.preventDefault(); err.textContent = ''; btn.disabled = true;
    const { error } = await sb.auth.signInWithPassword({ email: email.value.trim(), password: pass.value });
    btn.disabled = false;
    if (error) { err.textContent = 'Correo o contraseña incorrectos.'; return; }
    start();
  } },
    h('h1', {}, 'Panel ACROMA'), h('p', {}, 'Acceso solo para administradores.'),
    h('div', { class: 'field' }, h('label', {}, 'Correo'), email), h('div', { class: 'field' }, h('label', {}, 'Contraseña'), pass),
    err, btn,
    h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: async () => {
      if (!email.value.trim()) { err.textContent = 'Escribe tu correo arriba y vuelve a pulsar.'; return; }
      const { error } = await sb.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: location.origin + '/admin' });
      err.textContent = error ? errMsg(error) : 'Si el correo existe, te enviamos un enlace para cambiar la contraseña.';
    } }, 'Olvidé mi contraseña'));
  app.replaceChildren(h('div', { class: 'login' }, form));
}

function recoveryView() {
  const pass = h('input', { type: 'password', required: true, minlength: 8, autocomplete: 'new-password', placeholder: 'Nueva contraseña (mín. 8 caracteres)' }) as HTMLInputElement;
  const err = h('p', { class: 'err' });
  app.replaceChildren(h('div', { class: 'login' }, h('form', { class: 'login__card', onsubmit: async (e: Event) => {
    e.preventDefault();
    const { error } = await sb.auth.updateUser({ password: pass.value });
    if (error) { err.textContent = errMsg(error); return; }
    history.replaceState(null, '', '/admin'); start();
  } }, h('h1', {}, 'Nueva contraseña'), h('div', { class: 'field' }, pass), err, h('button', { class: 'btn btn--gold', type: 'submit' }, 'Guardar contraseña'))));
}

async function start() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return loginView();
  const { data: ok, error } = await sb.rpc('is_admin');
  if (error || ok !== true) {
    await sb.auth.signOut();
    return loginView('Esta cuenta no tiene permiso de administrador.');
  }
  shell(session.user.email ?? '');
}

sb.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') recoveryView(); });
if (!/type=recovery/.test(location.hash)) start();
