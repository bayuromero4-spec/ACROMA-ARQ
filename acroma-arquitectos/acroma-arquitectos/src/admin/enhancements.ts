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
styles.textContent += "\n  .x-copy-fields{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:22px 0}\n  .x-copy-field{display:grid;gap:7px;align-content:start}\n  .x-copy-field label,.x-copy-label{font-size:.85rem;font-weight:750;color:#24344d}\n  .x-input{width:100%;min-width:0;padding:12px 13px;border:1px solid #dfe4eb;border-radius:10px;background:#fff;color:#17263d;font:inherit}\n  .x-input:focus{outline:2px solid rgba(197,161,94,.55);outline-offset:1px}\n  .x-copy-toolbar{display:grid;gap:8px;max-width:420px}\n  .x-copy-toolbar select{width:100%}\n  .x-copy-field textarea{min-height:100px;resize:vertical}\n  @media(max-width:650px){.x-copy-fields{grid-template-columns:1fr}}\n";
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
  const shortcuts: [string,string,string,string][] = [
    ['projects','Proyectos','Portafolio','projects.manage'],
    ['services','Servicios','Catálogo','services.manage'],
    ['siteimages','Imágenes','Recursos visuales','site_images.manage'],
    ['business','Datos del negocio','Contacto y marca','business.manage'],
    ['leads','Consultas','CRM','leads.read'],
    ['publish','Publicar cambios','Sitio público','cms.publish'],
  ];
  const {data: rootAdmin}=await sb.rpc('is_admin');
  for (const [key,label,sub,permission] of shortcuts) {
    if (rootAdmin!==true && !perms.has(permission)) continue;
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



type CopyField = { key:string; label:string; value:string; multiline?:boolean; help?:string };
const editablePages = [
  {slug:'inicio',title:'Inicio · Portada',section:'hero',fields:[
    {key:'tag',label:'Etiqueta superior',value:'Arquitectura · Construcción · Reformas'},
    {key:'title',label:'Título principal (línea superior)',value:'Arquitectura pensada para'},
    {key:'titleAccent',label:'Título destacado (dorado)',value:'vivir mejor.'},
    {key:'lead',label:'Descripción principal',value:'Estudio de arquitectura y construcción en Cajamarca. Del primer boceto a la entrega de llaves, con planos completos, presupuesto claro y supervisión directa del equipo.',multiline:true},
    {key:'primaryCta',label:'Botón principal',value:'Solicitar cotización'},
    {key:'secondaryCta',label:'Botón secundario',value:'Ver proyectos'},
    {key:'imageCaption',label:'Texto sobre la imagen',value:'Diseño · Planos · Obra'}
  ]},
  {slug:'servicios',title:'Servicios · Cabecera',section:'hero',fields:[
    {key:'eyebrow',label:'Etiqueta',value:'Servicios'},
    {key:'title',label:'Título',value:'Diseño, planos y obra en un solo equipo.'},
    {key:'lead',label:'Descripción',value:'Acompañamos tu proyecto desde la primera idea hasta la entrega: diseño arquitectónico, planos de todas las especialidades, reformas, construcción y terminaciones.',multiline:true}
  ]},
  {slug:'nosotros',title:'Nosotros · Cabecera',section:'hero',fields:[
    {key:'eyebrow',label:'Etiqueta',value:'Nosotros'},
    {key:'title',label:'Título',value:'Arquitectura clara para decisiones importantes.'},
    {key:'lead',label:'Descripción',value:'Somos un estudio de arquitectura y construcción con base en Cajamarca. Trabajamos de cerca con cada cliente para que entienda, decida y construya con confianza.',multiline:true}
  ]},
  {slug:'novedades',title:'Novedades · Cabecera',section:'hero',fields:[
    {key:'eyebrow',label:'Etiqueta',value:'Novedades'},
    {key:'title',label:'Título',value:'Campañas, avances y noticias del estudio.'},
    {key:'lead',label:'Descripción',value:'Aquí publicamos las promociones del momento, obras en marcha y novedades de ACROMA.',multiline:true}
  ]},
  {slug:'contacto',title:'Contacto · Cabecera',section:'hero',fields:[
    {key:'eyebrow',label:'Etiqueta',value:'Contacto'},
    {key:'title',label:'Título',value:'Cuéntanos qué quieres construir o mejorar.'},
    {key:'lead',label:'Descripción',value:'No necesitas tener todo resuelto. Escríbenos con lo que tengas y te orientamos con honestidad sobre el siguiente paso.',multiline:true}
  ]}
] as const;

async function pageCopyEditorView(initialSlug='inicio') {
  const host=main(); if(!host)return;
  host.replaceChildren(node('p','boot','Preparando editor de textos…'));
  const view=node('section','x-view');
  const heading=node('div','x-heading');
  const title=node('div');
  title.append(node('h2','','Editor de textos'),node('p','x-muted','Edita los textos existentes de la web sin tocar el diseño ni el código. Guarda un borrador o publica cuando esté listo.'));
  heading.append(title,button('Volver al editor visual',visualEditorView));
  const panel=node('div','x-card');
  const pageSelect=node('select','x-input') as HTMLSelectElement;
  for(const page of editablePages){const o=node('option','',page.title) as HTMLOptionElement;o.value=page.slug;pageSelect.append(o);}
  pageSelect.value=initialSlug;
  const state=node('p','x-muted','Los cambios guardados como borrador no se muestran en la web hasta publicarlos.');
  const fieldsWrap=node('div','x-copy-fields');
  const actions=node('div','x-actions');
  const save=button('Guardar borrador',()=>savePage('draft'),true) as HTMLButtonElement;
  const publish=button('Publicar textos',()=>savePage('published')) as HTMLButtonElement;
  actions.append(save,publish);
  let activePage=editablePages.find(p=>p.slug===initialSlug)??editablePages[0];
  let currentPageId='';
  let currentContent:Row={};
  let inputs:Record<string,HTMLInputElement|HTMLTextAreaElement>={};
  const seedAndLoad=async()=>{
    activePage=editablePages.find(p=>p.slug===pageSelect.value)??editablePages[0];
    state.textContent='Cargando textos…';fieldsWrap.replaceChildren();inputs={};
    let {data:page,error}=await sb.from('cms_pages').select('*').eq('slug',activePage.slug).maybeSingle();
    if(error){state.textContent='No se pudo consultar el CMS: '+error.message;return;}
    if(!page){
      const created=await sb.from('cms_pages').insert({slug:activePage.slug,title:activePage.title,status:'published'}).select().single();
      if(created.error){state.textContent='No se pudo inicializar esta página: '+created.error.message;return;}
      page=created.data;
    }
    currentPageId=page.id;
    let {data:section,error:sectionError}=await sb.from('cms_sections').select('*').eq('page_id',page.id).eq('section_key',activePage.section).maybeSingle();
    if(sectionError){state.textContent='No se pudo leer el contenido: '+sectionError.message;return;}
    if(!section){
      const defaults=Object.fromEntries(activePage.fields.map(f=>[f.key,f.value]));
      const created=await sb.from('cms_sections').insert({page_id:page.id,section_key:activePage.section,label:activePage.title,component:'page-hero',sort_order:0,is_visible:true,content:defaults}).select().single();
      if(created.error){state.textContent='No se pudo inicializar el bloque: '+created.error.message;return;}
      section=created.data;
    }
    currentContent=section.content??{};
    for(const f of activePage.fields){
      const wrap=node('div','x-copy-field');
      const label=node('label','',f.label);
      const control=(f.multiline?node('textarea','x-input'):node('input','x-input')) as HTMLInputElement|HTMLTextAreaElement;
      if(control instanceof HTMLTextAreaElement)control.rows=4;
      control.value=currentContent[f.key]??f.value;
      control.setAttribute('aria-label',f.label);
      inputs[f.key]=control;
      wrap.append(label,control);
      if(f.help)wrap.append(node('small','x-muted',f.help));
      fieldsWrap.append(wrap);
    }
    state.textContent=page.status==='published'?'Contenido publicado. Puedes editarlo y guardar un borrador.':'Hay cambios guardados como borrador, todavía no visibles en la web.';
    panel.dataset.pageStatus=page.status;
  };
  const savePage=async(status:'draft'|'published')=>{
    if(!currentPageId)return;
    save.disabled=true;publish.disabled=true;
    state.textContent=status==='published'?'Publicando textos…':'Guardando borrador…';
    const content:Row={};
    for(const [key,input] of Object.entries(inputs))content[key]=input.value.trim();
    const {data:{user}}=await sb.auth.getUser();
    const sectionResult=await sb.from('cms_sections').upsert({page_id:currentPageId,section_key:activePage.section,label:activePage.title,component:'page-hero',sort_order:0,is_visible:true,content,updated_by:user?.id??null},{onConflict:'page_id,section_key'}).select().single();
    if(sectionResult.error){state.textContent='No se pudo guardar: '+sectionResult.error.message;save.disabled=false;publish.disabled=false;return;}
    const {data:latest}=await sb.from('content_revisions').select('version').eq('page_id',currentPageId).order('version',{ascending:false}).limit(1).maybeSingle();
    const version=(latest?.version??0)+1;
    await sb.from('content_revisions').insert({page_id:currentPageId,version,snapshot:{[activePage.section]:content},note:status==='published'?'Publicación desde Editor visual':'Borrador desde Editor visual',created_by:user?.id??null,published_at:status==='published'?new Date().toISOString():null});
    const pageResult=await sb.from('cms_pages').update({status,updated_by:user?.id??null,published_at:status==='published'?new Date().toISOString():null}).eq('id',currentPageId);
    if(pageResult.error){state.textContent='El texto se guardó, pero no se pudo actualizar el estado: '+pageResult.error.message;save.disabled=false;publish.disabled=false;return;}
    if(status==='published'){
      const {data:hook}=await sb.from('site_settings').select('value').eq('key','deploy_hook').maybeSingle();
      if(hook?.value){
        try{const response=await fetch(hook.value,{method:'POST'});if(!response.ok)throw new Error('El servidor de publicación respondió '+response.status);state.textContent='Textos publicados. Se inició la actualización de la web.';}
        catch(e){state.textContent='Textos publicados en Supabase, pero no se pudo iniciar el despliegue. Revisa Publicar cambios.';}
      }else state.textContent='Textos publicados en Supabase. Configura el enlace de despliegue en «Publicar cambios» para actualizar la web automáticamente.';
      toast('Textos publicados. La web se actualizará al terminar el despliegue.');
    }else{state.textContent='Borrador guardado. La web pública conserva la versión publicada.';toast('Borrador guardado.');}
    save.disabled=false;publish.disabled=false;
    panel.dataset.pageStatus=status;
  };
  const pageBar=node('div','x-copy-toolbar');
  const pageLabel=node('label','x-copy-label','Página que deseas editar');
  pageBar.append(pageLabel,pageSelect);
  pageSelect.addEventListener('change',()=>void seedAndLoad());
  panel.append(pageBar,state,fieldsWrap,actions);
  view.append(heading,panel);
  host.replaceChildren(view);
  await seedAndLoad();
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
  const editCopy=button('Editar textos de la página',()=>void pageCopyEditorView(select.value==='/'?'inicio':select.value.slice(1)),true);
  const open=button('Abrir en otra pestaña',()=>window.open(select.value,'_blank','noopener'));
  controls.append(select,refresh,open,editCopy);
  const preview=node('div','x-preview');
  const frame=node('iframe','x-preview__frame') as HTMLIFrameElement;
  frame.title='Vista previa de la página pública ACROMA'; frame.src='/';
  const sizes:[string,string][]=[['Escritorio','100%'],['Tablet','768px'],['Móvil','390px']];
  const sizeControls=node('div','x-actions');
  for(const [label,width] of sizes) sizeControls.append(button(label,()=>{frame.style.maxWidth=width;}));
  select.addEventListener('change',()=>{frame.src=select.value;editCopy.textContent='Editar textos de la página';editCopy.onclick=()=>void pageCopyEditorView(select.value==='/'?'inicio':select.value.slice(1));});
  preview.append(sizeControls,document.createElement('br'),frame);
  const shortcuts=node('div','x-card');
  shortcuts.append(node('h3','','Editar contenido de esta página'),node('p','x-muted','Selecciona un módulo para abrir su editor. Los cambios guardados se reflejarán en la vista pública al publicar.'));
  const shortcutGrid=node('div','x-shortcuts');
  const modules:[string,string,string,string][]=[
    ['business','Datos generales','Nombre, textos de marca y contacto','business.manage'],
    ['siteimages','Imágenes del sitio','Portada y fotografía de equipo','site_images.manage'],
    ['services','Servicios','Textos, características e imágenes','services.manage'],
    ['projects','Proyectos','Fichas, categorías y galerías','projects.manage'],
    ['testimonials','Testimonios','Opiniones y valoraciones','testimonials.manage'],
    ['posts','Novedades','Noticias y campañas','posts.manage'],
  ];
  const {data: currentPermissions}=await sb.rpc('get_my_permissions');
  const permissionSet=new Set((currentPermissions??[]).map((p:Row)=>p.permission_code));
  const {data: rootAdmin}=await sb.rpc('is_admin');
  for(const [key,label,desc,permission] of modules){
    if(rootAdmin!==true && !permissionSet.has(permission)) continue;
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
let installing = false;
let installedSide: HTMLElement | null = null;
async function installExtensions() {
  const side=document.querySelector<HTMLElement>('.side');
  if(!side) { installed=false; installedSide=null; return; }
  if(side !== installedSide) { installed=false; installedSide=side; }
  if(installed || installing) return;
  installing = true;
  const {data:{session}}=await sb.auth.getSession();
  if(!session) { installing = false; return; }
  const {data:permissions}=await sb.rpc('get_my_permissions');
  const set=new Set((permissions??[]).map((p:Row)=>p.permission_code));
  const {data:isAdmin}=await sb.rpc('is_admin');
  const items:[string,string,boolean,()=>Promise<void>][]=[
    ['dashboard','Dashboard',isAdmin===true||set.has('dashboard.read'),dashboardView],
    ['visual-editor','Editor visual',isAdmin===true||set.has('cms.edit'),visualEditorView],
    ['team','Usuarios y permisos',isAdmin===true||set.has('users.manage'),teamView],
  ];
  // Un único grupo de navegación para extensiones; evita duplicados al reconstruir el panel.
  side.querySelectorAll('[data-ext-group="true"]').forEach((group,index)=>{if(index>0)group.remove();});
  let extensionGroup=side.querySelector<HTMLElement>('[data-ext-group="true"]');
  if(!extensionGroup){
    extensionGroup=node('div','side__group');
    extensionGroup.dataset.extGroup='true';
    extensionGroup.append(node('div','side__label','GESTIÓN'));
    const foot=side.querySelector('.side__foot');
    side.insertBefore(extensionGroup,foot);
  }
  for(const [key,label,allowed,handler] of items){
    if(!allowed || extensionGroup.querySelector(`button[data-ext-key="${key}"]`))continue;
    const b=node('button','nav',label) as HTMLButtonElement;
    b.dataset.extKey=key;
    b.addEventListener('click',()=>{
      document.querySelectorAll<HTMLButtonElement>('button.nav').forEach((item)=>item.setAttribute('aria-current',String(item===b)));
      void handler();
    });
    extensionGroup.append(b);
  }
  installed=true;
  installing=false;
  const dashboardButton=document.querySelector<HTMLButtonElement>('button.nav[data-ext-key="dashboard"]');
  if(dashboardButton){
    document.querySelectorAll<HTMLButtonElement>('button.nav').forEach((item)=>item.setAttribute('aria-current',String(item===dashboardButton)));
    void dashboardView();
  }
}
const observer=new MutationObserver(()=>{void installExtensions();});
observer.observe(document.body,{childList:true,subtree:true});
void installExtensions();
