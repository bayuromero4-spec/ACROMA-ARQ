/**
 * Extensiones progresivas del panel ACROMA:
 * dashboard, vista previa/editor visual y gestión de colaboradores.
 * La autorización real se valida en Supabase (RLS + RPC + Edge Function).
 */
import { createClient } from '@supabase/supabase-js';

type Row = Record<string, any>;
const app = document.getElementById('app');
const SB_URL = document.body.dataset.sbUrl || '';
const SB_KEY = document.body.dataset.sbKey || '';
if (!app || !SB_URL || !SB_KEY) throw new Error('No se pudo iniciar las extensiones del panel.');

const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
const styles = document.createElement('style');
styles.textContent = `
  .x-view{display:grid;gap:22px}
  .x-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
  .x-card{background:#fff;border:1px solid #e5e8ef;border-radius:18px;padding:18px;min-width:0}
  .x-card small,.x-muted{color:#737b89}
  .x-stat{font-size:1.9rem;font-weight:800;color:#10294b;margin:8px 0 2px;font-variant-numeric:tabular-nums}
  .x-heading{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}
  .x-heading h2{margin:0;color:#10294b}
  .x-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .x-btn{border:1px solid #d7dce5;background:#fff;color:#10294b;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer}
  .x-btn--gold{background:#c99b3d;border-color:#c99b3d;color:#101d32}
  .x-btn:disabled{opacity:.55;cursor:wait}
  .x-table{width:100%;border-collapse:collapse}
  .x-table th,.x-table td{text-align:left;padding:12px 10px;border-bottom:1px solid #edf0f4;font-size:.9rem}
  .x-table th{color:#697386;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em}
  .x-form{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}
  .x-field{display:grid;gap:6px}
  .x-field label{font-weight:700;font-size:.85rem;color:#24344d}
  .x-field input,.x-field select{width:100%;padding:11px 12px;border:1px solid #d8deea;border-radius:10px;background:#fff;color:#142238}
  .x-preview{background:#e9edf3;border:1px solid #dce1e9;border-radius:18px;padding:12px;overflow:hidden}
  .x-preview__frame{margin:auto;background:#fff;max-width:100%;height:680px;transition:max-width .2s;width:100%;border:0;border-radius:10px;display:block}
  .x-shortcuts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .x-shortcut{display:flex;justify-content:space-between;align-items:center;gap:8px;text-align:left;background:#fff;border:1px solid #e5e8ef;border-radius:13px;padding:14px;color:#172b49;font-weight:700;cursor:pointer}
  .x-shortcut span{font-size:.78rem;color:#7a8391;font-weight:400}
  .x-status{display:inline-flex;border-radius:999px;padding:4px 9px;background:#edf5ef;color:#287442;font-size:.75rem;font-weight:700}
  .x-error{padding:12px;border-radius:12px;background:#fff1f0;color:#a52c24}
  @media(max-width:1000px){.x-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.x-shortcuts{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:650px){.x-grid{grid-template-columns:1fr 1fr}.x-form{grid-template-columns:1fr}.x-shortcuts{grid-template-columns:1fr}.x-preview__frame{height:560px}}
`;
document.head.append(styles);

const node = (tag: string, cls = '', text = '') => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text) el.textContent = text;
  return el;
};
const main = () => document.getElementById('main');
const toast = (message: string, bad = false) => {
  const target = document.getElementById('toast');
  if (target) { target.textContent = message; target.className = `on${bad ? ' bad' : ''}`; }
};
const button = (label: string, action: () => void | Promise<void>, gold = false) => {
  const b = node('button', `x-btn${gold ? ' x-btn--gold' : ''}`, label) as HTMLButtonElement;
  b.type = 'button'; b.addEventListener('click', () => void action()); return b;
};
const card = (label: string, value: string, detail: string) => {
  const c = node('article','x-card');
  c.append(node('small','',label),node('div','x-stat',value),node('small','',detail));
  return c;
};
const openLegacy = (key: string) => {
  const target = document.querySelector<HTMLButtonElement>(`button.nav[data-key="${key}"]`);
  if (target) target.click();
  else toast('Tu rol no tiene permiso para abrir este módulo.', true);
};

async function countRows(table: string, status?: string) {
  let q = sb.from(table).select('id',{count:'exact',head:true});
  if (status) q = q.eq('status',status);
  const { count, error } = await q;
  return error ? null : (count ?? 0);
}

async function dashboardView() {
  const host = main(); if (!host) return;
  host.replaceChildren(node('p','boot','Cargando indicadores…'));
  const { data: permissions } = await sb.rpc('get_my_permissions');
  const perms = new Set((permissions ?? []).map((p: Row) => p.permission_code));
  const [projects, services, published, drafts, newLeads, posts] = await Promise.all([
    countRows('projects'), countRows('services'), countRows('projects','published'),
    countRows('projects','draft'), perms.has('leads.read') ? countRows('leads','nuevo') : Promise.resolve(null),
    countRows('posts','published'),
  ]);
  const view = node('section','x-view');
  const heading = node('div','x-heading');
  const title = node('div');
  title.append(node('h2','','Dashboard'),node('p','x-muted','Resumen de actividad de ACROMA ARQUITECTOS.'));
  heading.append(title,button('Actualizar',dashboardView));
  const grid = node('div','x-grid');
  grid.append(
    card('Proyectos',projects===null?'—':String(projects),'Registros en el portafolio'),
    card('Servicios',services===null?'—':String(services),'Servicios registrados'),
    card('Proyectos publicados',published===null?'—':String(published),'Visibles en la web'),
    card('Borradores',drafts===null?'—':String(drafts),'Pendientes de publicación'),
  );
  if (perms.has('leads.read')) grid.append(card('Consultas nuevas',newLeads===null?'—':String(newLeads),'Requieren seguimiento'));
  if (perms.has('posts.manage')) grid.append(card('Publicaciones activas',posts===null?'—':String(posts),'Novedades publicadas'));
  const quick = node('div','x-card');
  quick.append(node('h3','','Accesos rápidos'),node('p','x-muted','Continúa trabajando en el contenido del sitio.'));
  const actions = node('div','x-shortcuts');
  const shortcuts: [string,string,string][] = [
    ['projects','Proyectos','Portafolio'],
    ['services','Servicios','Catálogo'],
    ['siteimages','Imágenes','Recursos visuales'],
    ['business','Datos del negocio','Contacto y marca'],
    ['leads','Consultas','CRM'],
    ['publish','Publicar cambios','Sitio público'],
  ];
  for (const [key,label,sub] of shortcuts) {
    if (key==='leads' && !perms.has('leads.read')) continue;
    if (key==='publish' && !perms.has('cms.publish')) continue;
    const b=node('button','x-shortcut'); b.type='button';
    const text=node('div'); text.append(node('div','',label),node('span','',sub));
    b.append(text,node('strong','','→')); b.addEventListener('click',()=>openLegacy(key)); actions.append(b);
  }
  quick.append(actions);
  const note=node('div','x-card');
  note.append(node('strong','','Estado del sistema'),node('p','x-muted','Los indicadores se consultan desde Supabase y respetan los permisos asignados a tu usuario.'));
  view.append(heading,grid,quick,note);
  host.replaceChildren(view);
}

async function visualEditorView() {
  const host=main(); if(!host) return;
  const view=node('section','x-view');
  const heading=node('div','x-heading');
  const title=node('div'); title.append(node('h2','','Editor visual'),node('p','x-muted','Vista previa del sitio y accesos directos para editar su contenido.'));
  heading.append(title);
  const controls=node('div','x-actions');
  const select=node('select','x-btn') as HTMLSelectElement;
  const pages:[string,string][]=[['/','Inicio'],['/servicios','Servicios'],['/proyectos','Proyectos'],['/nosotros','Nosotros'],['/novedades','Novedades'],['/contacto','Contacto']];
  for(const [url,label] of pages){const o=node('option','',label) as HTMLOptionElement;o.value=url;select.append(o);}
  const refresh=button('Actualizar vista',()=>{frame.src=select.value;});
  const open=button('Abrir en otra pestaña',()=>window.open(select.value,'_blank','noopener'));
  controls.append(select,refresh,open);
  const preview=node('div','x-preview');
  const frame=node('iframe','x-preview__frame') as HTMLIFrameElement;
  frame.title='Vista previa de la página pública ACROMA'; frame.src='/';
  const sizes:[string,string][]=[['Escritorio','100%'],['Tablet','768px'],['Móvil','390px']];
  const sizeControls=node('div','x-actions');
  for(const [label,width] of sizes) sizeControls.append(button(label,()=>{frame.style.maxWidth=width;}));
  select.addEventListener('change',()=>{frame.src=select.value;});
  preview.append(sizeControls,document.createElement('br'),frame);
  const shortcuts=node('div','x-card');
  shortcuts.append(node('h3','','Editar contenido de esta página'),node('p','x-muted','Selecciona un módulo para abrir su editor. Los cambios guardados se reflejarán en la vista pública al publicar.'));
  const shortcutGrid=node('div','x-shortcuts');
  const modules:[string,string,string][]=[
    ['business','Datos generales','Nombre, textos de marca y contacto'],
    ['siteimages','Imágenes del sitio','Portada y fotografía de equipo'],
    ['services','Servicios','Textos, características e imágenes'],
    ['projects','Proyectos','Fichas, categorías y galerías'],
    ['testimonials','Testimonios','Opiniones y valoraciones'],
    ['posts','Novedades','Noticias y campañas'],
  ];
  for(const [key,label,desc] of modules){
    const b=node('button','x-shortcut');b.type='button';
    const t=node('div');t.append(node('div','',label),node('span','',desc));
    b.append(t,node('strong','','↗'));b.addEventListener('click',()=>openLegacy(key));shortcutGrid.append(b);
  }
  shortcuts.append(shortcutGrid);
  view.append(heading,controls,preview,shortcuts);
  host.replaceChildren(view);
}

async function teamView() {
  const host=main(); if(!host) return;
  host.replaceChildren(node('p','boot','Cargando equipo…'));
  const {data:{session}}=await sb.auth.getSession();
  if(!session){toast('Tu sesión expiró. Inicia sesión nuevamente.',true);return;}
  const response=await fetch(`${SB_URL}/functions/v1/team-admin`,{
    headers:{apikey:SB_KEY,Authorization:`Bearer ${session.access_token}`},
  });
  const payload=await response.json().catch(()=>({error:'Respuesta no válida del servidor.'}));
  if(!response.ok){host.replaceChildren(node('div','x-error',payload.error??'No se pudo cargar el equipo.'));return;}
  const view=node('section','x-view');
  const heading=node('div','x-heading');
  const title=node('div');title.append(node('h2','','Usuarios y permisos'),node('p','x-muted','Invita colaboradores y asigna roles sin compartir la cuenta administradora.'));
  heading.append(title,node('span','x-status','Acceso protegido'));
  const formCard=node('div','x-card');
  formCard.append(node('h3','','Invitar colaborador'),node('p','x-muted','El colaborador recibirá un correo para activar su acceso.'));
  const form=node('form','x-form');
  const emailWrap=node('div','x-field');emailWrap.append(node('label','','Correo electrónico'));
  const email=node('input') as HTMLInputElement;email.type='email';email.required=true;email.placeholder='colaborador@correo.com';emailWrap.append(email);
  const roleWrap=node('div','x-field');roleWrap.append(node('label','','Rol'));
  const role=node('select') as HTMLSelectElement;
  for(const item of payload.roles??[]){const opt=node('option','',item.name) as HTMLOptionElement;opt.value=item.code;role.append(opt);}
  roleWrap.append(role);
  const submit=node('button','x-btn x-btn--gold','Enviar invitación') as HTMLButtonElement;submit.type='submit';
  form.append(emailWrap,roleWrap,submit);
  const result=node('p','x-muted');
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();submit.disabled=true;submit.textContent='Procesando…';result.textContent='';
    const {data:{session:active}}=await sb.auth.getSession();
    const r=await fetch(`${SB_URL}/functions/v1/team-admin`,{
      method:'POST',
      headers:{apikey:SB_KEY,Authorization:`Bearer ${active?.access_token??''}`,'Content-Type':'application/json'},
      body:JSON.stringify({email:email.value,role_code:role.value}),
    });
    const data=await r.json().catch(()=>({error:'Respuesta no válida.'}));
    submit.disabled=false;submit.textContent='Enviar invitación';
    if(!r.ok){result.textContent=data.error??'No se pudo invitar al colaborador.';result.className='x-error';return;}
    result.textContent=data.message??'Invitación procesada.';result.className='x-status';email.value='';
    await teamView();
  });
  formCard.append(form,result);
  const listCard=node('div','x-card');
  listCard.append(node('h3','','Equipo con acceso'));
  const table=node('table','x-table');
  const head=node('thead');const tr=node('tr');
  for(const label of ['Correo','Rol','Estado'])tr.append(node('th','',label));
  head.append(tr);table.append(head);
  const body=node('tbody');
  for(const user of payload.users??[]){
    const row=node('tr');
    row.append(node('td','',user.email),node('td','',user.role_name),node('td','',user.confirmed?'Activo':'Invitación pendiente'));
    body.append(row);
  }
  if(!(payload.users??[]).length){const row=node('tr');row.append(node('td','','Todavía no hay colaboradores asignados.'));body.append(row);}
  table.append(body);listCard.append(table);
  view.append(heading,formCard,listCard);
  host.replaceChildren(view);
}

let installed = false;
async function installExtensions() {
  const side=document.querySelector('.side');
  if(!side || installed) return;
  const {data:{session}}=await sb.auth.getSession();
  if(!session) return;
  const {data:permissions}=await sb.rpc('get_my_permissions');
  const set=new Set((permissions??[]).map((p:Row)=>p.permission_code));
  const {data:isAdmin}=await sb.rpc('is_admin');
  const items:[string,string,boolean,()=>Promise<void>][]=[
    ['dashboard','Dashboard',isAdmin===true||set.has('dashboard.read'),dashboardView],
    ['visual-editor','Editor visual',isAdmin===true||set.has('cms.edit'),visualEditorView],
    ['team','Usuarios y permisos',isAdmin===true||set.has('users.manage'),teamView],
  ];
  for(const [key,label,allowed,handler] of items){
    if(!allowed)continue;
    const b=node('button','nav',label) as HTMLButtonElement;
    b.dataset.extKey=key;
    b.addEventListener('click',()=>{
      document.querySelectorAll<HTMLButtonElement>('button.nav').forEach((item)=>item.setAttribute('aria-current',String(item===b)));
      void handler();
    });
    const foot=side.querySelector('.side__foot');
    side.insertBefore(b,foot);
  }
  installed=true;
}
const observer=new MutationObserver(()=>{void installExtensions();});
observer.observe(document.body,{childList:true,subtree:true});
void installExtensions();
