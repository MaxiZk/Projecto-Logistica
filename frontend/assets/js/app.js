/* ============================================
 *  SIGL – SPA Demo (Zuidwijk & Asoc. SRL)
 *  assets/js/app.js  (versión completa)
 * ============================================ */

/* ======== Datos “demo” ======== */
const DB = {
  cargas: [
    { id:'ORD-101', cliente:'ACME S.A.', origen:'Buenos Aires', destino:'Rosario', estado:'Entregado',
      terminal:'-', contenedor:'-', tipo:'-', taraKg:'', precinto:'', pesoBrutoKg:'', fecha:'2025-08-10',
      chofer:{nombre:'',dni:'',cel:'',usuario:'',password:''},
      tractor:{marca:'',modelo:'',anio:'',patente:'',sat:'-'},
      semi:{marca:'',modelo:'',anio:'',patente:''}
    },
    { id:'ORD-102', cliente:'Metalúrgica Norte', origen:'Zárate', destino:'Córdoba', estado:'En preparación',
      terminal:'-', contenedor:'-', tipo:'-', taraKg:'', precinto:'', pesoBrutoKg:'', fecha:'2025-08-12',
      chofer:{nombre:'',dni:'',cel:'',usuario:'',password:''},
      tractor:{marca:'',modelo:'',anio:'',patente:'',sat:'-'},
      semi:{marca:'',modelo:'',anio:'',patente:''}
    }
  ],
  legajos:[
    { id:'LEG-0240', cliente:'Metalúrgica Norte', tipo:'Importación', estado:'Documentación OK' },
    { id:'LEG-0241', cliente:'Agro Sur',           tipo:'Exportación',  estado:'Esperando verificación' }
  ],
  tickets:[
    { id:'TCK-0502', cliente:'ACME S.A.', asunto:'Demora entrega', estado:'Abierto' },
    { id:'TCK-0501', cliente:'Agro Sur',  asunto:'Cotización',     estado:'Cerrado' }
  ]
};

/* Persistencia simple */
function loadLS(){ const d = localStorage.getItem('sigl-demo'); if(d) { try { const o=JSON.parse(d); if(o?.cargas) DB.cargas=o.cargas; if(o?.legajos) DB.legajos=o.legajos; if(o?.tickets) DB.tickets=o.tickets; } catch{} } }
function saveLS(){ localStorage.setItem('sigl-demo', JSON.stringify(DB)); }
loadLS();

/* ======== Auth demo ======== */
const USERS = [
  { email:'admin@empresa.com',   password:'admin123',   role:'ADMIN' },
  { email:'cliente@empresa.com', password:'cliente123', role:'CLIENTE' }
];

function isLoggedIn(){ return !!localStorage.getItem('sessionRole'); }
function getRole(){ return localStorage.getItem('sessionRole') || 'GUEST'; }
function isAdmin(){ return getRole() === 'ADMIN'; }

function login(email, password){
  const u = USERS.find(x =>
    x.email.toLowerCase() === (email||'').trim().toLowerCase() &&
    x.password === (password||'').trim()
  );
  if(!u) return {ok:false,msg:'Usuario o contraseña incorrectos'};
  localStorage.setItem('sessionRole',u.role);
  localStorage.setItem('sessionUser',u.email);
  updateAuthUI();
  if(u.role==='ADMIN') { location.hash = '#cargas'; } else { location.hash = '#clientes'; }
  return {ok:true};
}

function logout(){
  localStorage.removeItem('sessionRole');
  localStorage.removeItem('sessionUser');
  updateAuthUI();
  location.hash = '#login';
}

/* ======== Rutas y permisos ======== */
const PUBLIC_ROUTES = ['home','login'];
const ROLE_ROUTES = {
  ADMIN:   ['cargas','aduana','almacen','clientes','admin'],
  CLIENTE: ['clientes','cargas','aduana','admin'],  // cliente puede ver cargas y tickets (solo lectura)
  GUEST:   PUBLIC_ROUTES
};
function canAccess(route){
  const r = getRole();
  return (ROLE_ROUTES[r] || []).includes(route);
}

/* ======== Vistas ======== */
const Views = {
  home: () => `
  <div class="card p-4">
    <h4 class="mb-3">Zuidwijk & Asociados SRL</h4>
    <p>Zuidwijk & Asociados es una <strong>empresa joven</strong>, con personal de amplia y reconocida experiencia en el mercado.</p>
    <p>Somos <strong>Consultores en Comercio Exterior</strong>. Analizamos su negocio integralmente, optimizamos su cadena logística y mejoramos tiempos y rentabilidad.</p>
    <p>Nuestra <strong>misión</strong> es ofrecer servicios integrales en el manejo de mercaderías con <em>responsabilidad</em> y <em>experiencia</em>.</p>
    <h6 class="mt-3">Aliados estratégicos:</h6>
    <ul class="mb-2">
      <li>Terminales portuarias</li><li>Transportistas</li><li>Despachantes</li><li>Depósitos para des/consolidados</li><li>Seguros</li>
    </ul>
    <p><strong>¿Por qué elegirnos?</strong> Vemos su negocio como propio y lo analizamos desde todas las perspectivas para encontrar juntos la forma de hacerlo más productivo.</p>
  </div>`,

  login: () => `
  <div class="row justify-content-center">
    <div class="col-md-5">
      <div class="card p-4">
        <h5 class="mb-3">Iniciar sesión</h5>
        <form id="formLogin" class="row g-3">
          <div class="col-12">
            <label class="form-label">Email</label>
            <input type="email" name="email" class="form-control" placeholder="admin@empresa.com" required>
          </div>
          <div class="col-12">
            <label class="form-label">Contraseña</label>
            <input type="password" name="password" class="form-control" placeholder="admin123" required>
          </div>
          <div class="col-12">
            <button class="btn btn-primary w-100" type="submit">Ingresar</button>
          </div>
          <div class="col-12 text-danger small" id="loginError"></div>
        </form>
        <div class="mt-3 small text-muted">
          <div>Admin: admin@empresa.com / admin123</div>
          <div>Cliente: cliente@empresa.com / cliente123</div>
        </div>
      </div>
    </div>
  </div>`,

  cargas: () => `
  <div class="card p-3">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div>
        <h5 class="m-0">Gestión de Cargas</h5>
        <small class="text-muted">Registrar, ver y seguir órdenes de transporte.</small>
      </div>
      ${isAdmin() ? `<button type="button" class="btn btn-primary" id="btnNuevaCarga">+ Nueva Carga</button>` : ``}
    </div>
    <div class="table-responsive">
      <table class="table align-middle">
        <thead><tr>
          <th>#</th><th>Cliente</th><th>Origen</th><th>Destino</th>
          <th>Terminal</th><th>Contenedor</th><th>Precinto</th><th>Peso Bruto</th>
          <th>Estado</th><th>Acciones</th>
        </tr></thead>
        <tbody id="tablaCargas"></tbody>
      </table>
    </div>
  </div>`,

  aduana: () => `
  <div class="card p-3">
    <h5 class="mb-3">Gestión Aduanera</h5>
    <ul class="list-group">
      ${DB.legajos.map(l => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div><strong>${l.id}</strong> • ${l.cliente} • ${l.tipo} • ${l.estado}</div>
          <button type="button" class="btn btn-outline-secondary btn-sm" data-action="ver-legajo" data-id="${l.id}">Ver</button>
        </li>`).join('')}
    </ul>
  </div>`,

  almacen: () => `
  <div class="card p-4">
    <h5>Almacenamiento</h5>
    <p class="text-muted">Módulo demostrativo.</p>
  </div>`,

  clientes: () => `
  <div class="card p-3">
    <h5 class="mb-3">Atención al Cliente</h5>
    <div class="table-responsive">
      <table class="table align-middle">
        <thead><tr>
          <th>#</th><th>Cliente</th><th>Asunto</th><th>Estado</th><th>Acciones</th>
        </tr></thead>
        <tbody id="tablaTickets">
          ${DB.tickets.map(t => `
            <tr>
              <td>${t.id}</td>
              <td>${t.cliente}</td>
              <td>${t.asunto}</td>
              <td>${chipEstado(t.estado)}</td>
              <td class="text-nowrap">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-action="ver-ticket" data-id="${t.id}">Ver</button>
                ${isAdmin() ? `
                  <button type="button" class="btn btn-outline-primary btn-sm" data-action="edit-ticket" data-id="${t.id}">Editar</button>
                  <button type="button" class="btn btn-outline-danger btn-sm"  data-action="del-ticket"  data-id="${t.id}">Eliminar</button>
                ` : ``}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>`,

  admin: () => `
  <div class="card p-3">
    <h5 class="mb-2">Administración</h5>
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card p-3">
          <h6>Facturación</h6>
          <button class="btn btn-primary btn-sm" id="btnEmitirFactura">Emitir factura</button>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card p-3">
          <h6>Proveedores</h6>
          <button class="btn btn-outline-secondary btn-sm" id="btnListaProv">Listado</button>
        </div>
      </div>
    </div>
  </div>`,

  notfound: () => `<div class="card p-4">Ruta no encontrada.</div>`
};

/* ======== Router SPA ======== */
function setActive(route){
  document.querySelectorAll('#menu a[data-route]').forEach(a=>{
    a.classList.toggle('active', a.dataset.route===route);
  });
  const mapTitle = {
    home:'Inicio', login:'Login', cargas:'Gestión de Cargas', aduana:'Gestión Aduanera',
    almacen:'Almacenamiento', clientes:'Atención al Cliente', admin:'Administración'
  };
  const t = document.getElementById('page-title');
  const s = document.getElementById('page-subtitle');
  if(t) t.textContent = mapTitle[route] || route;
  if(s) s.textContent = (route==='home'?'Resumen':'');
}

function render(route){
  const target = (route || (location.hash||'#home').slice(1));
  const isAuth = isLoggedIn();

  // Si está logueado, ocultamos home/login
  let r = target;
  if(isAuth && (r==='home' || r==='login')){
    r = getRole()==='ADMIN' ? 'cargas' : 'clientes';
    location.hash = '#'+r;
  }
  // Si no tiene permiso, lo mandamos a login o home
  if(!isAuth && !PUBLIC_ROUTES.includes(r)){ r='login'; location.hash='#login'; }
  if(isAuth && !canAccess(r)){ r = getRole()==='ADMIN' ? 'cargas' : 'clientes'; location.hash='#'+r; }

  const html = (Views[r]||Views.notfound)();
  const container = document.getElementById('view');
  if(container) container.innerHTML = html;
  setActive(r);
  afterRender(r);
}

function guardRoute(route){
  // Solo invitados no pueden entrar a rutas privadas
  if (getRole()==='GUEST' && !PUBLIC_ROUTES.includes(route)) {
    location.hash = '#login';
    return false;
  }
  // CLIENTE y ADMIN pueden entrar siempre a lo que permita ROLE_ROUTES
  return true;
}

function handleRoute(){
  const route = (location.hash || '#home').slice(1);
  if(!guardRoute(route)) return;
  render(route);
}

window.addEventListener('hashchange', handleRoute);
document.addEventListener('DOMContentLoaded', ()=>{
  // Delegación de clicks en el menú
  const menu = document.getElementById('menu');
  if(menu){
    menu.addEventListener('click', (e)=>{
      const a = e.target.closest('a[data-route]');
      if(!a) return;
      // SPA: solo ajustar hash
      const href = a.getAttribute('href') || ('#' + a.dataset.route);
      if(href) {
        e.preventDefault();
        location.hash = href;
      }
    });
  }
  document.getElementById('logout')?.addEventListener('click', (e)=>{ e.preventDefault(); logout(); });
  updateAuthUI();
  handleRoute();
});

/* ======== UI Auth ======== */
function updateAuthUI(){
  const isAuth = isLoggedIn();
  // Visibilidad de ítems de menú por permisos
  document.querySelectorAll('#menu a[data-route]').forEach(a=>{
    const route = a.dataset.route;
    let visible = (isAuth && canAccess(route)) || (!isAuth && PUBLIC_ROUTES.includes(route));
    if (isAuth && route==='home')  visible = false; // ocultar Inicio estando logueado
    if (isAuth && route==='login') visible = false; // ocultar Login estando logueado
    const li = a.closest('li'); if (li) li.style.display = visible ? '' : 'none';
  });

  // Encabezado usuario
  const nameEl = document.getElementById('user-name');
  const mailEl = document.getElementById('user-email') || document.querySelector('#page-subtitle + small, .header-right small'); // fallback
  if(nameEl){
    if(isAuth) { nameEl.textContent = isAdmin()?'Admin':'Cliente'; }
    else       { nameEl.textContent = 'Invitado'; }
  }
  if(mailEl){
    if(isAuth) { mailEl.textContent = localStorage.getItem('sessionUser') || '-'; }
    else       { mailEl.textContent = '-'; }
  }

  const loginLink = document.getElementById('loginLink');
  const logoutBtn = document.getElementById('logout');
  if (loginLink) loginLink.style.display = isAuth ? 'none' : '';
  if (logoutBtn)  logoutBtn.style.display  = isAuth ? '' : 'none';
}

/* ======== Helpers de estado / UI ======== */
function chipEstado(e){
  const map = {
    'Entregado':'estado entregado',
    'En tránsito':'estado transito',
    'En preparación':'estado transito',
    'Demorado':'estado demorado',
    'Abierto':'estado demorado',
    'Cerrado':'estado entregado'
  };
  return `<span class="${map[e]||'estado'}">${e}</span>`;
}

/* ======== Modal seguro (instancia única) ======== */
let APP_MODAL = null;
let APP_MODAL_EL = null;

function ensureModal() {
  if (!APP_MODAL_EL) APP_MODAL_EL = document.getElementById('appModal');
  if (!APP_MODAL) APP_MODAL = bootstrap.Modal.getOrCreateInstance(APP_MODAL_EL, {
    backdrop: true,
    keyboard: true
  });
  return APP_MODAL;
}

function openModal({ title = '', body = '', footer = '' }) {
  ensureModal();
  document.getElementById('appModalLabel').textContent = title || 'Detalle';
  document.getElementById('appModalBody').innerHTML = body || '';
  document.getElementById('appModalFooter').innerHTML = footer || `
    <button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>`;
  APP_MODAL.show();
}

/* ======== Cargas (CRUD con permisos) ======== */
function bindCargasEvents(){
  // “Nueva” solo si existe el botón (admin)
  document.getElementById('btnNuevaCarga')?.addEventListener('click', ()=> showCargaForm());

  // Acciones en tabla
  document.querySelectorAll('[data-action="ver-carga"]').forEach(b=> b.onclick = ()=> showCargaView(b.dataset.id));
  if(isAdmin()){
    document.querySelectorAll('[data-action="edit-carga"]').forEach(b=> b.onclick = ()=> showCargaForm(b.dataset.id));
    document.querySelectorAll('[data-action="del-carga"]').forEach(b=> b.onclick = ()=> deleteCarga(b.dataset.id));
  }
}

function renderCargasTable(){
    const tbody = document.getElementById('tablaCargas'); if(!tbody) return;
    const role = getRole();
    tbody.innerHTML = DB.cargas.map(c=>`
    <tr>
      <td>${c.id}</td>
      <td>${c.cliente}</td>
      <td>${c.origen}</td>
      <td>${c.destino}</td>
      <td>${c.terminal||'-'}</td>
      <td>${c.contenedor||'-'}</td>
      <td>${c.precinto||'-'}</td>
      <td>${c.pesoBrutoKg||'-'}</td>
      <td>${chipEstado(c.estado)}</td>
      <td class="text-nowrap">
        <button type="button" class="btn btn-outline-secondary btn-sm" data-action="ver-carga" data-id="${c.id}">Ver</button>
        ${role==='ADMIN' ? `
          <button type="button" class="btn btn-outline-primary btn-sm" data-action="edit-carga" data-id="${c.id}">Editar</button>
          <button type="button" class="btn btn-outline-danger btn-sm" data-action="del-carga" data-id="${c.id}">Eliminar</button>
        ` : ``}
      </td>
    </tr>`).join('');
    bindCargasEvents();
}


function showCargaView(id){
  const c = DB.cargas.find(x=>x.id===id); if(!c) return;
  openModal({
    title:`Orden ${c.id}`,
    body: `
      <div class="row g-2">
        <div class="col-md-4"><strong>Cliente:</strong> ${c.cliente}</div>
        <div class="col-md-4"><strong>Fecha:</strong> ${c.fecha||'-'}</div>
        <div class="col-md-4"><strong>Estado:</strong> ${c.estado}</div>
        <div class="col-md-3"><strong>Origen:</strong> ${c.origen}</div>
        <div class="col-md-3"><strong>Destino:</strong> ${c.destino}</div>
        <div class="col-md-3"><strong>Terminal:</strong> ${c.terminal||'-'}</div>
        <div class="col-md-3"><strong>Contenedor:</strong> ${c.contenedor||'-'}</div>
        <div class="col-md-3"><strong>Tipo:</strong> ${c.tipo||'-'}</div>
        <div class="col-md-3"><strong>Tara (Kg):</strong> ${c.taraKg||'-'}</div>
        <div class="col-md-3"><strong>Precinto:</strong> ${c.precinto||'-'}</div>
        <div class="col-md-3"><strong>Peso bruto (Kg):</strong> ${c.pesoBrutoKg||'-'}</div>
        <div class="col-12"><hr></div>
        <div class="col-md-4"><strong>Chofer:</strong> ${c.chofer?.nombre||'-'}</div>
        <div class="col-md-4"><strong>DNI:</strong> ${c.chofer?.dni||'-'}</div>
        <div class="col-md-4"><strong>Cel:</strong> ${c.chofer?.cel||'-'}</div>
        <div class="col-md-3"><strong>Tractor:</strong> ${c.tractor?.marca||'-'} ${c.tractor?.modelo||''}</div>
        <div class="col-md-3"><strong>Patente:</strong> ${c.tractor?.patente||'-'}</div>
        <div class="col-md-3"><strong>Sat:</strong> ${c.tractor?.sat||'-'}</div>
        <div class="col-md-3"><strong>Semi:</strong> ${c.semi?.marca||'-'} ${c.semi?.modelo||''} (${c.semi?.patente||'-'})</div>
      </div>`,
    footer:`<button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            ${isAdmin()? `<button class="btn btn-primary" id="goEditCarga">Editar</button>`:``}`
  });
  document.getElementById('goEditCarga')?.addEventListener('click', ()=>{
    if(!isAdmin()){ alert('Solo ADMIN puede editar cargas.'); return; }
    ensureModal().hide(); showCargaForm(id);
  });
}

function showCargaForm(id){
  if(!isAdmin()){ alert('Solo ADMIN puede crear/editar cargas.'); return; }

  const isEdit = !!id;
  const c = isEdit ? DB.cargas.find(x=>x.id===id) : {
    id:'', cliente:'', origen:'', destino:'', estado:'En preparación',
    terminal:'', contenedor:'', tipo:'', taraKg:'', precinto:'', pesoBrutoKg:'', fecha:'',
    chofer:{nombre:'',dni:'',cel:'',usuario:'',password:''},
    tractor:{marca:'',modelo:'',anio:'',patente:'',sat:''},
    semi:{marca:'',modelo:'',anio:'',patente:''}
  };

  openModal({
    title: isEdit ? `Editar carga ${c.id}`:'Nueva Carga',
    body: `
      <form id="formCarga" class="row g-3">
        <div class="col-md-3"><label class="form-label">ID Orden</label>
          <input class="form-control" name="id" value="${c.id||''}" ${isEdit?'readonly':''} required></div>
        <div class="col-md-5"><label class="form-label">Cliente</label>
          <input class="form-control" name="cliente" value="${c.cliente||''}" required></div>
        <div class="col-md-2"><label class="form-label">Fecha</label>
          <input type="date" class="form-control" name="fecha" value="${c.fecha||''}"></div>
        <div class="col-md-2"><label class="form-label">Estado</label>
          <select class="form-select" name="estado">
            ${['En preparación','En tránsito','Entregado','Demorado'].map(e=>`<option ${e===(c.estado||'En preparación')?'selected':''}>${e}</option>`).join('')}
          </select></div>

        <div class="col-md-3"><label class="form-label">Origen</label>
          <input class="form-control" name="origen" value="${c.origen||''}" required></div>
        <div class="col-md-3"><label class="form-label">Destino</label>
          <input class="form-control" name="destino" value="${c.destino||''}" required></div>
        <div class="col-md-3"><label class="form-label">Terminal portuaria</label>
          <input class="form-control" name="terminal" value="${c.terminal||''}"></div>
        <div class="col-md-3"><label class="form-label">Contenedor</label>
          <input class="form-control" name="contenedor" value="${c.contenedor||''}"></div>

        <div class="col-md-3"><label class="form-label">Tipo</label>
          <input class="form-control" name="tipo" value="${c.tipo||''}"></div>
        <div class="col-md-3"><label class="form-label">Tara (Kg)</label>
          <input type="number" class="form-control" name="taraKg" value="${c.taraKg||''}"></div>
        <div class="col-md-3"><label class="form-label">Precinto</label>
          <input class="form-control" name="precinto" value="${c.precinto||''}"></div>
        <div class="col-md-3"><label class="form-label">Peso bruto (Kg)</label>
          <input type="number" class="form-control" name="pesoBrutoKg" value="${c.pesoBrutoKg||''}"></div>

        <div class="col-12"><h6 class="mt-2">Datos de Chofer</h6><hr></div>
        <div class="col-md-4"><label class="form-label">Nombre</label>
          <input class="form-control" name="ch_nombre" value="${c.chofer?.nombre||''}"></div>
        <div class="col-md-4"><label class="form-label">DNI</label>
          <input class="form-control" name="ch_dni" value="${c.chofer?.dni||''}"></div>
        <div class="col-md-4"><label class="form-label">Celular</label>
          <input class="form-control" name="ch_cel" value="${c.chofer?.cel||''}"></div>
        <div class="col-md-4"><label class="form-label">Usuario</label>
          <input class="form-control" name="ch_user" value="${c.chofer?.usuario||''}"></div>
        <div class="col-md-4"><label class="form-label">Contraseña</label>
          <input class="form-control" name="ch_pass" value="${c.chofer?.password||''}"></div>

        <div class="col-12"><h6 class="mt-2">Tractor</h6><hr></div>
        <div class="col-md-3"><label class="form-label">Marca</label>
          <input class="form-control" name="tr_marca" value="${c.tractor?.marca||''}"></div>
        <div class="col-md-3"><label class="form-label">Modelo</label>
          <input class="form-control" name="tr_modelo" value="${c.tractor?.modelo||''}"></div>
        <div class="col-md-2"><label class="form-label">Año</label>
          <input class="form-control" name="tr_anio" value="${c.tractor?.anio||''}"></div>
        <div class="col-md-2"><label class="form-label">Patente</label>
          <input class="form-control" name="tr_patente" value="${c.tractor?.patente||''}"></div>
        <div class="col-md-2"><label class="form-label">Marca satelital</label>
          <input class="form-control" name="tr_sat" value="${c.tractor?.sat||''}"></div>

        <div class="col-12"><h6 class="mt-2">Semi</h6><hr></div>
        <div class="col-md-3"><label class="form-label">Marca</label>
          <input class="form-control" name="se_marca" value="${c.semi?.marca||''}"></div>
        <div class="col-md-3"><label class="form-label">Modelo</label>
          <input class="form-control" name="se_modelo" value="${c.semi?.modelo||''}"></div>
        <div class="col-md-3"><label class="form-label">Año</label>
          <input class="form-control" name="se_anio" value="${c.semi?.anio||''}"></div>
        <div class="col-md-3"><label class="form-label">Patente</label>
          <input class="form-control" name="se_patente" value="${c.semi?.patente||''}"></div>
      </form>
    `,
    footer: `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
             <button class="btn btn-primary" id="saveCarga">Guardar</button>`
  });

  document.getElementById('saveCarga').addEventListener('click', ()=>{
    const f = document.getElementById('formCarga');
    const fd = Object.fromEntries(new FormData(f));
    const pack = {
      id: fd.id, cliente: fd.cliente, origen: fd.origen, destino: fd.destino, estado: fd.estado,
      terminal: fd.terminal, contenedor: fd.contenedor, tipo: fd.tipo, taraKg: fd.taraKg,
      precinto: fd.precinto, pesoBrutoKg: fd.pesoBrutoKg, fecha: fd.fecha,
      chofer:{ nombre:fd.ch_nombre, dni:fd.ch_dni, cel:fd.ch_cel, usuario:fd.ch_user, password:fd.ch_pass },
      tractor:{ marca:fd.tr_marca, modelo:fd.tr_modelo, anio:fd.tr_anio, patente:fd.tr_patente, sat:fd.tr_sat },
      semi:{ marca:fd.se_marca, modelo:fd.se_modelo, anio:fd.se_anio, patente:fd.se_patente }
    };
    if(!pack.id){ alert('ID obligatorio'); return; }
    if(isEdit){
      const i = DB.cargas.findIndex(x=>x.id===id);
      if(i>=0) DB.cargas[i] = {...DB.cargas[i], ...pack};
    } else {
      if(DB.cargas.some(x=>x.id===pack.id)){ alert('El ID ya existe'); return; }
      DB.cargas.unshift(pack);
    }
    saveLS();
    ensureModal().hide();
    render('cargas'); // re-pinta la tabla y rebindea
  });
}

function deleteCarga(id){
  if(!isAdmin()){ alert('Solo ADMIN puede eliminar cargas.'); return; }
  if(!confirm(`¿Eliminar la orden ${id}?`)) return;
  DB.cargas = DB.cargas.filter(x=>x.id!==id);
  saveLS(); renderCargasTable();
}

/* ======== Aduana ======== */
function bindAduanaEvents(){
  document.querySelectorAll('[data-action="ver-legajo"]').forEach(b=>{
    b.onclick = ()=>{
      const lg = DB.legajos.find(x=>x.id===b.dataset.id);
      if(!lg) return;
      openModal({
        title:`Legajo ${lg.id}`,
        body:`<p><strong>Cliente:</strong> ${lg.cliente}</p>
              <p><strong>Tipo:</strong> ${lg.tipo}</p>
              <p><strong>Estado:</strong> ${lg.estado}</p>`
      });
    };
  });
}

/* ======== Tickets (Clientes) – lectura para cliente, CRUD para admin ======== */
function bindTicketsEvents(){
  document.querySelectorAll('[data-action="ver-ticket"]').forEach(b=>{
    b.onclick = ()=> showTicketView(b.dataset.id);
  });
  if(isAdmin()){
    document.querySelectorAll('[data-action="edit-ticket"]').forEach(b=>{
      b.onclick = ()=> showTicketForm(b.dataset.id);
    });
    document.querySelectorAll('[data-action="del-ticket"]').forEach(b=>{
      b.onclick = ()=> deleteTicket(b.dataset.id);
    });
  }
}

function showTicketView(id){
  const t = DB.tickets.find(x=>x.id===id); if(!t) return;
  openModal({
    title:`Ticket ${t.id}`,
    body:`<p><strong>Cliente:</strong> ${t.cliente}</p>
          <p><strong>Asunto:</strong> ${t.asunto}</p>
          <p><strong>Estado:</strong> ${t.estado}</p>`,
    footer:`<button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            ${isAdmin()? `<button class="btn btn-primary" id="goEditTicket">Editar</button>`:''}`
  });
  document.getElementById('goEditTicket')?.addEventListener('click', ()=>{
    if(!isAdmin()){ alert('Solo ADMIN puede editar tickets.'); return; }
    ensureModal().hide(); showTicketForm(id);
  });
}

function showTicketForm(id){
  if(!isAdmin()){ alert('Solo ADMIN puede editar tickets.'); return; }
  const isEdit = !!id;
  const t = isEdit ? DB.tickets.find(x=>x.id===id) : { id:'', cliente:'', asunto:'', estado:'Abierto' };
  openModal({
    title: isEdit ? `Editar ticket ${t.id}` : 'Nuevo ticket',
    body:`<form id="formTicket" class="row g-3">
      <div class="col-md-4"><label class="form-label">ID</label><input class="form-control" name="id" value="${t.id||''}" ${isEdit?'readonly':''} required></div>
      <div class="col-md-8"><label class="form-label">Cliente</label><input class="form-control" name="cliente" value="${t.cliente||''}" required></div>
      <div class="col-12"><label class="form-label">Asunto</label><input class="form-control" name="asunto" value="${t.asunto||''}" required></div>
      <div class="col-md-6"><label class="form-label">Estado</label>
        <select class="form-select" name="estado">
          ${['Abierto','En gestión','Cerrado'].map(e=>`<option ${e===(t.estado||'Abierto')?'selected':''}>${e}</option>`).join('')}
        </select>
      </div>
    </form>`,
    footer:`<button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" id="saveTicket">Guardar</button>`
  });
  document.getElementById('saveTicket').onclick = ()=>{
    const data = Object.fromEntries(new FormData(document.getElementById('formTicket')));
    if(!data.id || !data.cliente || !data.asunto){ alert('Completá ID, Cliente y Asunto'); return; }
    if(isEdit){
      const i = DB.tickets.findIndex(x=>x.id===id); if(i>=0) DB.tickets[i] = {...DB.tickets[i], ...data};
    }else{
      if(DB.tickets.some(x=>x.id===data.id)){ alert('El ID ya existe'); return; }
      DB.tickets.unshift(data);
    }
    saveLS(); ensureModal().hide();
    // refresco rápido la vista de clientes:
    const v = document.getElementById('view');
    if(v){ v.innerHTML = Views.clientes(); bindTicketsEvents(); }
  };
}

function deleteTicket(id){
  if(!isAdmin()){ alert('Solo ADMIN puede eliminar tickets.'); return; }
  if(!confirm(`¿Eliminar el ticket ${id}?`)) return;
  DB.tickets = DB.tickets.filter(x=>x.id!==id);
  saveLS();
  const v = document.getElementById('view');
  if(v){ v.innerHTML = Views.clientes(); bindTicketsEvents(); }
}

/* ======== Admin ======== */
function bindAdminEvents(){
  const btn = document.getElementById('btnEmitirFactura');
  if (btn){
    btn.onclick = ()=>{
      openModal({
        title:'Emisión de Factura',
        body:`<form id="formFactura" class="row g-3">
          <div class="col-md-6"><label class="form-label">Cliente</label><input name="cliente" class="form-control" required></div>
          <div class="col-md-3"><label class="form-label">CUIT</label><input name="cuit" class="form-control"></div>
          <div class="col-md-3"><label class="form-label">Fecha</label><input type="date" name="fecha" value="${new Date().toISOString().slice(0,10)}" class="form-control"></div>
          <div class="col-md-8"><label class="form-label">Detalle</label><input name="detalle" class="form-control" required></div>
          <div class="col-md-4"><label class="form-label">Importe (ARS)</label><input type="number" step="0.01" name="importe" class="form-control" required></div>
        </form>`,
        footer:`<button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button class="btn btn-primary" id="saveFactura">Emitir</button>`
      });
      document.getElementById('saveFactura')?.addEventListener('click', ()=>{
        const fd = Object.fromEntries(new FormData(document.getElementById('formFactura')));
        if(!fd.cliente || !fd.detalle || !fd.importe){ alert('Completá los obligatorios'); return; }
        ensureModal().hide();
        alert(`Factura emitida para ${fd.cliente} por ARS ${Number(fd.importe).toFixed(2)} (demo).`);
      });
    };
  }
}



/* ======== Hook post-render ======== */
function afterRender(route) {
  switch (route) {
    case 'login':
      bindLoginForm();
      break;
    case 'cargas':
      renderCargasTable();     // dentro llama a bindCargasEvents()
      break;
    case 'aduana':
      bindAduanaEvents();
      break;
    case 'clientes':
      bindTicketsEvents();
      break;
    case 'admin':
      //if(!isAdmin()) return;
      bindAdminEvents();
      wireFacturaButton();
      break;
    default:
      // home / inicio / etc.
      break;
  }
}

/* ======== Login form binding ======== */
function bindLoginForm(){
  const f = document.getElementById('formLogin'); if(!f) return;
  f.addEventListener('submit',(e)=>{
    e.preventDefault();
    const email = f.querySelector('[name="email"]').value;
    const pass  = f.querySelector('[name="password"]').value;
    const res = login(email,pass);
    const err = document.getElementById('loginError');
    if(err) err.textContent = res.ok ? '' : res.msg;
  });
}
