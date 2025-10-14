/*************************************************
 *  SPA Frontend - Zuidwijk & Asoc. SRL
 *  - Roles: ADMIN / CLIENTE
 *  - Backend Spring (MariaDB/MySQL)
 *************************************************/

/* ==================== CONFIG ==================== */
// 👉 Cambiá si tu backend corre en otra URL/puerto
const API_BASE = 'https://backend-outm.onrender.com';

/* ============== HELPERS API (GENÉRICOS) ============== */
// ¡Sin "export"! Y usar siempre API_BASE
async function apiFetch(path, options = {}) {
  const init = { ...options };
  // si NO usás cookies/sesiones, mejor no enviar credentials
  // init.credentials = 'include';  // <- comentado si no lo necesitás
  if (init.body && !init.headers?.['Content-Type']) {
    init.headers = { ...(init.headers || {}), 'Content-Type': 'application/json' };
  }
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const txt = await res.text().catch(() => '');
  return txt ? JSON.parse(txt) : null;
}
const apiGet  = (p)        => apiFetch(p, { method: 'GET' });
const apiPost = (p, body)  => apiFetch(p, { method: 'POST', body: JSON.stringify(body) });


/* ============== FACTURAS (API) ============== */
async function apiListarFacturas(cliente) {
  const path = cliente && cliente.trim()
    ? `/api/facturas?cliente=${encodeURIComponent(cliente.trim())}`
    : `/api/facturas`;
  return apiGet(path);
}
const apiCrearFactura   = (factura) => apiPost('/api/facturas', factura);
const apiAnularFacturaNC = (id)     => apiPut(`/api/facturas/${encodeURIComponent(id)}/anular?tipo=NC`, {});

/* ============== CARGAS (API) ============== */
const apiListarCargas      = () => apiGet('/api/cargas');
const apiObtenerCarga      = (id) => apiGet(`/api/cargas/${encodeURIComponent(id)}`);
const apiCrearCarga        = (payload) => apiPost('/api/cargas', payload);
const apiActualizarCarga   = (id, payload) => apiPut(`/api/cargas/${encodeURIComponent(id)}`, payload);
const apiEliminarCarga     = (id) => apiDelete(`/api/cargas/${encodeURIComponent(id)}`);

/* ============== LEGAJOS / TICKETS (API) ============== */
const apiListarLegajos = () => apiGet('/api/legajos');
const apiListarTickets = () => apiGet('/api/tickets');

/* ===== Auth demo ===== */
const USERS = [
    { email:'admin@empresa.com',   password:'admin123',   role:'ADMIN' },
    { email:'cliente@empresa.com', password:'cliente123', role:'CLIENTE' }
];
function isLoggedIn(){ return !!localStorage.getItem('sessionRole'); }
function getRole(){ return localStorage.getItem('sessionRole') || 'GUEST'; }
function login(email, password){
    const u = USERS.find(x => x.email.toLowerCase() === (email||'').trim().toLowerCase() &&
        x.password === (password||'').trim());
    if(!u) return {ok:false,msg:'Usuario o contraseña incorrectos'};
    localStorage.setItem('sessionRole',u.role);
    localStorage.setItem('sessionUser',u.email);
    updateAuthUI();
    location.hash = u.role==='ADMIN' ? '#cargas' : '#clientes';
    render();
    return {ok:true};
}
function logout(){
    localStorage.removeItem('sessionRole');
    localStorage.removeItem('sessionUser');
    updateAuthUI();
    location.hash = '#home';
    render();
}

/* ===== Rutas y permisos ===== */
const PUBLIC_ROUTES = ['home','login'];
const ROLE_ROUTES = {
    ADMIN:   ['cargas','aduana','almacen','clientes','admin','facturas'],
    CLIENTE: ['clientes','cargas','aduana','facturas'],
    GUEST:   PUBLIC_ROUTES
};
function canAccess(route){ return (ROLE_ROUTES[getRole()] || []).includes(route); }

/* ===== Vistas ===== */
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

    cargas: () => `
       <div class="card p-3">
           <div class="d-flex justify-content-between align-items-center mb-2">
             <div>
               <h5 class="m-0">Gestión de Cargas</h5>
               <small class="text-muted">Registrar, ver y seguir órdenes de transporte.</small>
             </div>
             ${getRole()==='ADMIN' ? '<button type="button" class="btn btn-primary" id="btnNuevaCarga">+ Nueva Carga</button>' : ''}
           </div>

           <div class="table-responsive">
             <table class="table align-middle">
               <thead>
                 <tr>
                   <th>#</th>
                   <th>Cliente</th>
                   <th>Origen</th>
                   <th>Destino</th>
                   <th>Terminal</th>
                   <th>Contenedor</th>
                   <th>Tipo</th>
                   <th>Tara (Kg)</th>
                   <th>Precinto</th>
                   <th>Peso Bruto (Kg)</th>
                   <th>Chofer</th>
                   <th>DNI</th>
                   <th>Celular</th>
                   <th>Tractor</th>
                   <th>Semi</th>
                   <th>Estado</th>
                   <th>Acciones</th>
                 </tr>
               </thead>
               <tbody id="tablaCargas"></tbody>
             </table>
           </div>
         </div>`,

    aduana: () => `
    <div class="card p-3">
      <h5 class="mb-3">Gestión Aduanera</h5>
      <ul class="list-group" id="listLegajos"></ul>
    </div>`,

    almacen: () => `
    <div class="card p-4">
      <h5>Almacenamiento</h5>
      <p class="text-muted m-0">Módulo demostrativo.</p>
    </div>`,

    clientes: () => `
    <div class="card p-3">
      <h5 class="mb-3">Atención al Cliente</h5>
      <ul class="list-group" id="listTickets"></ul>
    </div>`,

    admin: () => `
    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="m-0">Administración</h5>
        <div>
          <button class="btn btn-outline-secondary btn-sm me-2" id="btnVerFacturas">Ver facturas</button>
          <button class="btn btn-primary btn-sm" id="btnEmitirFactura">Emitir factura</button>
        </div>
      </div>
      <div class="text-muted small">Emití nuevas facturas y consultá las emitidas.</div>
    </div>`,

    facturas: () => `
    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h5 class="m-0">Facturas emitidas</h5>
          <small class="text-muted">Listado de facturas guardadas en el sistema.</small>
        </div>
        ${getRole()==='ADMIN' ? '<button class="btn btn-primary btn-sm" id="btnEmitirFactura">+ Emitir factura</button>' : ''}
      </div>

      <div class="row g-2 mb-2">
        <div class="col-md-4">
          <input id="filterCliente" class="form-control" placeholder="Filtrar por cliente…">
        </div>
        <div class="col-md-2">
          <button id="btnBuscarFactura" class="btn btn-outline-secondary w-100">Buscar</button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>#</th><th>Cliente</th><th>CUIT</th><th>Fecha</th>
              <th>Detalle</th><th>Cant.</th><th>Precio (ARS)</th>
              <th>Importe (ARS)</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaFacturas"></tbody>
        </table>
      </div>
    </div>`,
    notfound: () => `<div class="card p-4">Ruta no encontrada.</div>`
};

/* ===== Router ===== */
function setActive(route){
    document.querySelectorAll('#menu a[data-route]').forEach(a=>{
        a.classList.toggle('active', a.dataset.route===route);
    });
    const mapTitle = {
        home:'Inicio', cargas:'Gestión de Cargas', aduana:'Gestión Aduanera',
        almacen:'Almacenamiento', clientes:'Atención al Cliente',
        admin:'Administración', facturas:'Facturas'
    };
    document.getElementById('page-title').textContent = mapTitle[route] || route;
    document.getElementById('page-subtitle').textContent = route==='home' ? 'Acerca de nosotros' : '';
}

function render(route){
    const target = (route || (location.hash||'#home').slice(1));
    const isAuth = isLoggedIn();

    let r = target;
    if(isAuth && (r==='home' || r==='login')){ r = getRole()==='ADMIN' ? 'cargas' : 'clientes'; location.hash = '#'+r; }
    if(!isAuth && !PUBLIC_ROUTES.includes(r)){ r='login'; location.hash='#login'; }
    if(isAuth && !canAccess(r)){ r = getRole()==='ADMIN' ? 'cargas' : 'clientes'; location.hash='#'+r; }

    const html = (Views[r]||Views.notfound)();
    document.getElementById('view').innerHTML = html;
    setActive(r);
    afterRender(r);
}

window.addEventListener('hashchange', ()=> render());
document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('#menu a[data-route]').forEach(a=>{
        a.addEventListener('click', (ev)=>{/* solo hashchange */});
    });
    document.getElementById('logout')?.addEventListener('click', (e)=>{ e.preventDefault(); logout(); });
    setupCargasDelegation(); // <-- importantísimo: delegación de eventos para Cargas
    updateAuthUI();
    render();
});

/* ===== UI de Auth ===== */
function updateAuthUI(){
    const isAuth = isLoggedIn();
    document.querySelectorAll('#menu a[data-route]').forEach(a=>{
        const route = a.dataset.route;
        let visible = (isAuth && canAccess(route)) || (!isAuth && PUBLIC_ROUTES.includes(route));
        if (isAuth && (route==='home' || route==='login')) visible = false;
        const li = a.closest('li'); if (li) li.style.display = visible ? '' : 'none';
    });

    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logout');
    if (loginLink) loginLink.style.display = isAuth ? 'none' : '';
    if (logoutBtn)  logoutBtn.style.display  = isAuth ? '' : 'none';

    const nameEl = document.getElementById('user-name');
    const mailEl = document.getElementById('user-email');
    if(nameEl && mailEl){
        if(isAuth){
            nameEl.textContent = getRole()==='ADMIN' ? 'Admin' : 'Cliente';
            mailEl.textContent = localStorage.getItem('sessionUser') || '-';
        } else { nameEl.textContent='Invitado'; mailEl.textContent='-'; }
    }
}

/* ===== Helpers ===== */
function chipEstado(e){
    const map = {'Entregado':'estado entregado','En tránsito':'estado transito',
        'En preparación':'estado transito','Demorado':'estado demorado'};
    return `<span class="${map[e]||'estado'}">${e}</span>`;
}

/* ============= MODAL (instancia única) ============= */
let APP_MODAL = null, APP_MODAL_EL = null;
function ensureModal() {
    if (!APP_MODAL_EL) APP_MODAL_EL = document.getElementById('appModal');
    if (!APP_MODAL) {
        APP_MODAL = bootstrap.Modal.getOrCreateInstance(APP_MODAL_EL, { backdrop: true, keyboard: true });
    }
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

/* ============= CARGAS (UI con delegación) ============= */
async function renderCargasTable(){
  const tbody = document.getElementById('tablaCargas');
  if (!tbody) return;

  let cargas = [];
  try { cargas = await apiListarCargas(); }
  catch(e){
    console.error('No se pudieron listar cargas:', e);
    alert('No se pudieron cargar las cargas.');
    return;
  }

  const isAdmin = getRole()==='ADMIN';
  const safe = (v)=> v ?? '';

  tbody.innerHTML = (cargas||[]).map(c=>`
    <tr>
      <td>${safe(c.id)}</td>
      <td>${safe(c.cliente)}</td>
      <td>${safe(c.origen)}</td>
      <td>${safe(c.destino)}</td>
      <td>${safe(c.terminalPortuaria)}</td>
      <td>${safe(c.contenedor)}</td>
      <td>${safe(c.tipo)}</td>
      <td>${safe(c.tara)}</td>
      <td>${safe(c.precinto)}</td>
      <td>${safe(c.pesoBruto)}</td>
      <td>${safe(c.chofer)}</td>
      <td>${safe(c.dniChofer)}</td>
      <td>${safe(c.celularChofer)}</td>
      <td>${safe(c.patenteTractor)}</td>
      <td>${safe(c.patenteSemi)}</td>
      <td>${chipEstado(c.estado||'En preparación')}</td>
      <td class="text-nowrap">
        <button type="button" class="btn btn-outline-secondary btn-sm" data-action="ver-carga" data-id="${c.id}">Ver</button>
        ${isAdmin ? `
          <button type="button" class="btn btn-outline-primary btn-sm" data-action="edit-carga" data-id="${c.id}">Editar</button>
          <button type="button" class="btn btn-outline-danger btn-sm" data-action="del-carga" data-id="${c.id}">Eliminar</button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

// Delegación (una sola vez)
let CARGAS_EVENTS_WIRED = false;
function setupCargasDelegation(){
    if (CARGAS_EVENTS_WIRED) return;
    CARGAS_EVENTS_WIRED = true;

    document.getElementById('view').addEventListener('click', async (ev) => {
        const btn = ev.target.closest('button');
        if (!btn) return;

        // + Nueva Carga
        if (btn.id === 'btnNuevaCarga') {
            showCargaFormAPI(null);
            return;
        }

        // Acciones de tabla
        const action = btn.dataset.action;
        if (!action) return;

        const id = btn.dataset.id; // conservar como string
        try {
            if (action === 'ver-carga') {
                const c = await apiObtenerCarga(id);
                if (!c) throw new Error('no encontrada');
                showCargaViewFromObj(c);
            }
            else if (action === 'edit-carga') {
                if (getRole() !== 'ADMIN') { alert('Solo ADMIN.'); return; }
                const c = await apiObtenerCarga(id);
                if (!c) throw new Error('no encontrada');
                showCargaFormAPI(c);
            }
            else if (action === 'del-carga') {
                if (getRole() !== 'ADMIN') { alert('Solo ADMIN.'); return; }
                if (!confirm(`¿Eliminar la orden ${id}?`)) return;
                await apiEliminarCarga(id);
                await renderCargasTable();
            }
        } catch (e) {
            console.error('Acción Cargas error:', e);
            alert('Operación de carga falló: ' + (e?.message || 'ver consola'));
        }
    });
}

function showCargaViewFromObj(c){
  const safe = (v)=> v ?? '-';
  openModal({
    title:`Orden ${safe(c.id)}`,
    body: `
      <div class="row g-2">
        <div class="col-md-3"><strong>Cliente:</strong> ${safe(c.cliente)}</div>
        <div class="col-md-3"><strong>Fecha:</strong> ${safe(c.fecha)}</div>
        <div class="col-md-3"><strong>Estado:</strong> ${safe(c.estado)}</div>
        <div class="col-md-3"><strong>Tipo:</strong> ${safe(c.tipo)}</div>

        <div class="col-md-3"><strong>Origen:</strong> ${safe(c.origen)}</div>
        <div class="col-md-3"><strong>Destino:</strong> ${safe(c.destino)}</div>
        <div class="col-md-3"><strong>Terminal:</strong> ${safe(c.terminalPortuaria)}</div>
        <div class="col-md-3"><strong>Contenedor:</strong> ${safe(c.contenedor)}</div>

        <div class="col-md-3"><strong>Tara (Kg):</strong> ${safe(c.tara)}</div>
        <div class="col-md-3"><strong>Precinto:</strong> ${safe(c.precinto)}</div>
        <div class="col-md-3"><strong>Peso bruto (Kg):</strong> ${safe(c.pesoBruto)}</div>
        <div class="col-md-3"><strong>—</strong></div>

        <div class="col-md-3"><strong>Chofer:</strong> ${safe(c.chofer)}</div>
        <div class="col-md-3"><strong>DNI Chofer:</strong> ${safe(c.dniChofer)}</div>
        <div class="col-md-3"><strong>Celular Chofer:</strong> ${safe(c.celularChofer)}</div>
        <div class="col-md-3"><strong>Patente Tractor:</strong> ${safe(c.patenteTractor)}</div>

        <div class="col-md-3"><strong>Patente Semi:</strong> ${safe(c.patenteSemi)}</div>
      </div>`
  });
}

function showCargaFormAPI(c){
  const isEdit = !!c;
  const init = c || {
    id:'', cliente:'', origen:'', destino:'', estado:'En preparación',
    fecha:'',
    terminalPortuaria:'', contenedor:'', tipo:'',
    tara:'', precinto:'', pesoBruto:'',
    chofer:'', dniChofer:'', celularChofer:'',
    patenteTractor:'', patenteSemi:''
  };

  openModal({
    title: isEdit? `Editar carga ${init.id}` : 'Nueva Carga',
    body: `
      <form id="formCarga" class="row g-3">
        <div class="col-md-2">
          <label class="form-label">ID Orden</label>
          <input class="form-control" name="id" value="${init.id||''}" ${isEdit?'readonly':''} required>
        </div>
        <div class="col-md-5">
          <label class="form-label">Cliente</label>
          <input class="form-control" name="cliente" value="${init.cliente||''}" required>
        </div>
        <div class="col-md-2">
          <label class="form-label">Fecha</label>
          <input type="date" class="form-control" name="fecha" value="${init.fecha||''}">
        </div>
        <div class="col-md-3">
          <label class="form-label">Estado</label>
          <select class="form-select" name="estado">
            ${['En preparación','En tránsito','Entregado','Demorado'].map(e=>`<option ${e===init.estado?'selected':''}>${e}</option>`).join('')}
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Origen</label>
          <input class="form-control" name="origen" value="${init.origen||''}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label">Destino</label>
          <input class="form-control" name="destino" value="${init.destino||''}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label">Terminal Portuaria</label>
          <input class="form-control" name="terminalPortuaria" value="${init.terminalPortuaria||''}">
        </div>

        <div class="col-md-4">
          <label class="form-label">Contenedor</label>
          <input class="form-control" name="contenedor" value="${init.contenedor||''}">
        </div>
        <div class="col-md-4">
          <label class="form-label">Tipo</label>
          <input class="form-control" name="tipo" value="${init.tipo||''}" placeholder="20DV, 40HC, etc.">
        </div>
        <div class="col-md-4">
          <label class="form-label">Precinto</label>
          <input class="form-control" name="precinto" value="${init.precinto||''}">
        </div>

        <div class="col-md-4">
          <label class="form-label">Tara (Kg)</label>
          <input type="number" step="0.01" class="form-control" name="tara" value="${init.tara||''}">
        </div>
        <div class="col-md-4">
          <label class="form-label">Peso bruto (Kg)</label>
          <input type="number" step="0.01" class="form-control" name="pesoBruto" value="${init.pesoBruto||''}">
        </div>

        <div class="col-md-4">
          <label class="form-label">Chofer</label>
          <input class="form-control" name="chofer" value="${init.chofer||''}">
        </div>
        <div class="col-md-4">
          <label class="form-label">DNI Chofer</label>
          <input class="form-control" name="dniChofer" value="${init.dniChofer||''}">
        </div>
        <div class="col-md-4">
          <label class="form-label">Celular Chofer</label>
          <input class="form-control" name="celularChofer" value="${init.celularChofer||''}">
        </div>

        <div class="col-md-4">
          <label class="form-label">Patente Tractor</label>
          <input class="form-control" name="patenteTractor" value="${init.patenteTractor||''}">
        </div>
        <div class="col-md-4">
          <label class="form-label">Patente Semi</label>
          <input class="form-control" name="patenteSemi" value="${init.patenteSemi||''}">
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
      <button class="btn btn-primary" id="saveCarga">${isEdit?'Guardar':'Crear'}</button>
    `
  });

  document.getElementById('saveCarga').onclick = async ()=>{
    const fd = Object.fromEntries(new FormData(document.getElementById('formCarga')));

    const payload = {
      id: fd.id,
      cliente: fd.cliente,
      origen: fd.origen,
      destino: fd.destino,
      estado: fd.estado,
      fecha: fd.fecha || null,

      terminalPortuaria: fd.terminalPortuaria || null,
      contenedor: fd.contenedor || null,
      tipo: fd.tipo || null,
      tara: fd.tara ? Number(fd.tara) : null,
      precinto: fd.precinto || null,
      pesoBruto: fd.pesoBruto ? Number(fd.pesoBruto) : null,

      chofer: fd.chofer || null,
      dniChofer: fd.dniChofer || null,
      celularChofer: fd.celularChofer || null,
      patenteTractor: fd.patenteTractor || null,
      patenteSemi: fd.patenteSemi || null
    };

    try{
      if(isEdit) await apiActualizarCarga(fd.id, payload);
      else       await apiCrearCarga(payload);
      ensureModal().hide();
      await renderCargasTable();
    }catch(e){
      console.error(e);
      alert('No se pudo guardar la carga.');
    }
  };
}


/* ============= LEGAJOS / TICKETS (UI) ============= */
async function renderLegajos(){
    const ul = document.getElementById('listLegajos');
    if (!ul) return;
    try {
        const list = await apiListarLegajos();
        ul.innerHTML = list.map(l => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div><strong>${l.codigo||('LEG-'+l.id)}</strong> • ${l.cliente} • ${l.tipo} • ${l.estado}</div>
        <button type="button" class="btn btn-outline-secondary btn-sm" data-action="ver-legajo" data-id="${l.id}">Ver</button>
      </li>`).join('');
        document.querySelectorAll('[data-action="ver-legajo"]').forEach(b=>{
            b.onclick = ()=>{
                const id = Number(b.dataset.id);
                const lg = list.find(x=>x.id===id);
                openModal({ title:`Legajo ${lg.codigo||lg.id}`,
                    body:`<p><strong>Cliente:</strong> ${lg.cliente}</p>
                <p><strong>Tipo:</strong> ${lg.tipo}</p>
                <p><strong>Estado:</strong> ${lg.estado}</p>` });
            };
        });
    } catch(e){ console.error(e); ul.innerHTML = '<li class="list-group-item text-muted">No se pudieron cargar los legajos.</li>'; }
}

async function renderTickets(){
    const ul = document.getElementById('listTickets');
    if (!ul) return;
    try {
        const list = await apiListarTickets();
        ul.innerHTML = list.map(t => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div><strong>${t.codigo||('TCK-'+t.id)}</strong> • ${t.cliente} • ${t.asunto} • ${t.estado}</div>
        <button type="button" class="btn btn-outline-secondary btn-sm" data-action="ver-ticket" data-id="${t.id}">Ver</button>
      </li>`).join('');
        document.querySelectorAll('[data-action="ver-ticket"]').forEach(b=>{
            b.onclick = ()=>{
                const id = Number(b.dataset.id);
                const t = list.find(x=>x.id===id);
                openModal({ title:`Ticket ${t.codigo||t.id}`,
                    body:`<p><strong>Cliente:</strong> ${t.cliente}</p>
                <p><strong>Asunto:</strong> ${t.asunto}</p>
                <p><strong>Estado:</strong> ${t.estado}</p>` });
            };
        });
    } catch(e){ console.error(e); ul.innerHTML = '<li class="list-group-item text-muted">No se pudieron cargar los tickets.</li>'; }
}

/* ============= FACTURAS (UI) ============= */
// --- helpers seguros ---
const num = v => (v == null || v === '' || isNaN(v)) ? 0 : Number(v);
const money = v => (v == null || v === '' || isNaN(v)) ? '' : Number(v).toFixed(2);
const safe = v => (v == null ? '' : v);

// total calculado por si no viene del backend
const facturaTotal = (f) => {
  if (Array.isArray(f.detalles) && f.detalles.length) {
    return f.detalles.reduce((s, d) => s + num(d.cantidad) * num(d.precioUnitario), 0);
  }
  // compatibilidad con tus campos previos
  if (f.importeTotal != null) return num(f.importeTotal);
  if (f.total != null)       return num(f.total);
  // por si tenés neto + iva
  return num(f.importeNetoGravado) + num(f.importeIva);
};

async function cargarFacturas() {
  try {
    const filtro = document.getElementById('filterCliente')?.value || '';
    const data = await apiListarFacturas(filtro);
    const tbody = document.getElementById('tablaFacturas');
    if (!tbody) return data;

    const fmt = v => Number(v ?? 0).toFixed(2);
    const safe = s => (s ?? '');

    tbody.innerHTML = (data || []).map(f => {
      const pv  = f?.puntoVenta != null ? String(f.puntoVenta).padStart(5,'0') : '--';
      const nro = f?.numero     != null ? String(f.numero).padStart(8,'0')
                                        : (f?.id != null ? String(f.id).padStart(8,'0') : '--------');
      const comp = `${pv}-${nro}`;
      const acc = `
        <button class="btn btn-outline-secondary btn-sm" data-action="ver" data-id="${f?.id}">Ver</button>
        ${
          f?.estado !== 'ANULADA'
            ? `
               <button class="btn btn-outline-danger btn-sm ms-1" data-action="anular-nc" data-id="${f?.id}">Anular (NC)</button>
               <button class="btn btn-outline-primary btn-sm ms-1" data-action="nota-debito" data-id="${f?.id}">Nota de Débito</button>
              `
            : `<span class="badge text-bg-secondary ms-1">Anulada (NC)</span>`
        }
      `;

      // Campo “detalle” visible: si hay items, muestro la 1ª línea; si no, uso f.detalle.
      let detalleVis = safe(f?.detalle);
      if (!detalleVis && Array.isArray(f?.detalles) && f.detalles.length > 0) {
        const it0 = f.detalles[0];
        detalleVis = safe(it0?.descripcion);
      }

      // Totales: si vienen en el objeto, OK; si no, calculo desde items
      let neto   = f?.importeNetoGravado;
      let iva    = f?.importeIva;
      let total  = f?.importeTotal;

      if ((neto == null || total == null) && Array.isArray(f?.detalles)) {
        const sum = f.detalles.reduce((acc, it) => acc + Number(it?.cantidad ?? 0) * Number(it?.precioUnitario ?? 0), 0);
        if (neto == null)  neto = sum;
        if (iva  == null)  iva  = 0;
        if (total == null) total = neto + iva;
      }

      return `
        <tr>
          <td>${safe(f?.id)}</td>
          <td>
            <div>${safe(f?.tipo)} ${f?.codigoComprobante ? '(Cód. '+f.codigoComprobante+')' : ''}</div>
            <small class="text-muted">${comp}</small>
          </td>
          <td>${safe(f?.cliente)}<br><small class="text-muted">${safe(f?.cuit) || '-'}</small></td>
          <td>${safe(f?.fechaEmision) || safe(f?.fecha) || '-'}</td>
          <td>${detalleVis || '-'}</td>
          <td class="text-end">${fmt(neto)}</td>
          <td class="text-end">${fmt(iva)}</td>
          <td class="text-end fw-semibold">${fmt(total)}</td>
          <td>${safe(f?.estado) || '-'}</td>
          <td class="text-nowrap">${acc}</td>
        </tr>`;
    }).join('');

   // Ver detalle
   tbody.querySelectorAll('[data-action="ver"]').forEach(b => {
     b.onclick = async () => {
       const id = b.dataset.id;
       try {
         const f = await apiObtenerFactura(id);  // GET /api/facturas/{id}
         renderFacturaDetalleModal(f);
       } catch (e) {
         console.error(e);
         alert('No se pudo obtener la factura.');
       }
     };
   });


    // Nota de Débito
    tbody.querySelectorAll('[data-action="nota-debito"]').forEach(b=>{
      b.onclick = ()=> abrirModalNotaDebito(b.dataset.id);
    });

    return data;
  } catch (e) {
    console.error('GET /api/facturas fallo:', e);
    alert('No se pudo cargar el listado de facturas.');
    return [];
  }
}

function renderFacturaDetalleModal(f){
  const fmt = (v) => (v==null || v==='') ? '-' : v;
  const fmtn = (v) => Number(v ?? 0).toFixed(2);

  // Items (si hay)
  let itemsHtml = '<div class="text-muted">Sin ítems</div>';
  if (Array.isArray(f.detalles) && f.detalles.length){
    const filas = f.detalles.map((it, i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${fmt(it.descripcion)}</td>
        <td class="text-end">${fmt(it.unidadMedida || 'u')}</td>
        <td class="text-end">${Number(it.cantidad ?? 0)}</td>
        <td class="text-end">${fmtn(it.precioUnitario)}</td>
        <td class="text-end">${fmtn((it.cantidad??0) * (it.precioUnitario??0))}</td>
      </tr>
    `).join('');
    itemsHtml = `
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>#</th><th>Descripción</th><th class="text-end">U.M.</th>
              <th class="text-end">Cant.</th><th class="text-end">Precio</th><th class="text-end">Importe</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  // Totales (si no vienen, los calculo)
  let neto   = f.importeNetoGravado;
  let iva    = f.importeIva;
  let otros  = f.importeOtrosTributos;
  let total  = f.importeTotal;

  if ((neto==null || total==null) && Array.isArray(f.detalles)) {
    const sum = f.detalles.reduce((acc, it)=> acc + Number(it.cantidad ?? 0)*Number(it.precioUnitario ?? 0), 0);
    if (neto == null)  neto = sum;
    if (iva  == null)  iva  = 0;
    if (otros== null)  otros= 0;
    if (total== null)  total= neto + iva + otros;
  }

  const comp = `${String(f.puntoVenta ?? '--').toString().padStart(5,'0')}-${String(f.numero ?? f.id ?? 0).toString().padStart(8,'0')}`;

  openModal({
    title: `Factura ${fmt(f.tipo)} • ${comp}`,
    body: `
      <div class="row g-2 mb-2">
        <div class="col-md-4"><strong>Cliente:</strong> ${fmt(f.cliente)}</div>
        <div class="col-md-3"><strong>CUIT:</strong> ${fmt(f.cuit)}</div>
        <div class="col-md-3"><strong>Fecha emisión:</strong> ${fmt(f.fechaEmision) || fmt(f.fecha)}</div>
        <div class="col-md-2"><strong>Estado:</strong> ${fmt(f.estado)}</div>

        <div class="col-md-6"><strong>Domicilio:</strong> ${fmt(f.domicilio)}</div>
        <div class="col-md-3"><strong>Cond. IVA:</strong> ${fmt(f.condicionIVACliente)}</div>
        <div class="col-md-3"><strong>Cond. Venta:</strong> ${fmt(f.condicionVenta)}</div>

        <div class="col-md-3"><strong>Vto. Pago:</strong> ${fmt(f.fechaVencimientoPago)}</div>
        <div class="col-md-3"><strong>Período desde:</strong> ${fmt(f.periodoDesde)}</div>
        <div class="col-md-3"><strong>Período hasta:</strong> ${fmt(f.periodoHasta)}</div>

        <div class="col-md-12"><strong>Detalle (cabecera):</strong><br>${fmt(f.detalle)}</div>
      </div>

      <h6 class="mt-3">Ítems</h6>
      ${itemsHtml}

      <div class="row g-2 mt-2">
        <div class="col-md-3"><strong>Neto gravado:</strong> ${fmtn(neto)}</div>
        <div class="col-md-3"><strong>IVA:</strong> ${fmtn(iva)}</div>
        <div class="col-md-3"><strong>Otros tributos:</strong> ${fmtn(otros)}</div>
        <div class="col-md-3"><strong>Total:</strong> <span class="fw-semibold">${fmtn(total)}</span></div>
      </div>

      <hr class="my-2">

      <div class="row g-2">
        <div class="col-md-3"><strong>CAE:</strong> ${fmt(f.cae)}</div>
        <div class="col-md-3"><strong>Vto. CAE:</strong> ${fmt(f.caeVencimiento)}</div>
        <div class="col-md-3"><strong>CBU:</strong> ${fmt(f.cbuEmisor)}</div>
        <div class="col-md-3"><strong>Alias:</strong> ${fmt(f.aliasCbu)}</div>
        <div class="col-md-12"><strong>Opción de circulación:</strong> ${fmt(f.opcionCirculacion)}</div>
      </div>

      ${f.estado==='ANULADA' ? `
        <div class="alert alert-warning mt-3 mb-0">
          <strong>Factura ANULADA</strong> ${f.anulacionTipo ? 'por '+f.anulacionTipo : ''} ${f.fechaAnulacion ? 'el '+f.fechaAnulacion : ''}.
        </div>` : ''}
    `,
    footer: `
      <button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
    `
  });
}


async function apiObtenerFactura(id){
    return apiGet(`/api/facturas/${encodeURIComponent(id)}`);
}


async function anularFactura(id) {
  // pedir NC o ND
  const input = prompt('¿Nota de Crédito (NC) o Nota de Débito (ND)?', 'NC');
  if (!input) return;

  const tipo = String(input).trim().toUpperCase();
  if (tipo !== 'NC' && tipo !== 'ND') {
    alert('Ingresá "NC" o "ND".');
    return;
  }

  try {
    await apiPut(`/api/facturas/${id}/anular?tipo=${encodeURIComponent(tipo)}`, {});
    await cargarFacturas(); // refrescar tabla
  } catch (e) {
    console.error('PUT /api/facturas/{id}/anular falló:', e);
    alert('Error al anular la factura.');
  }
}

function abrirModalNotaDebito(id) {
  openModal({
    title: `Emitir Nota de Débito (Factura ${id})`,
    body: `
      <form id="formND" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Importe Neto</label>
          <input type="number" step="0.01" name="importeNeto" class="form-control" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Alícuota IVA (%)</label>
          <select name="alicuotaIvaPct" class="form-select">
            <option value="21">21</option>
            <option value="10.5">10.5</option>
            <option value="27">27</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Otros Tributos</label>
          <input type="number" step="0.01" name="otrosTributos" value="0" class="form-control">
        </div>
        <div class="col-md-12">
          <label class="form-label">Motivo</label>
          <input name="motivo" class="form-control" placeholder="Ajuste por ...">
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
      <button class="btn btn-primary" id="btnEmitirND">Emitir ND</button>
    `
  });

  document.getElementById('btnEmitirND').onclick = async () => {
    const fd = Object.fromEntries(new FormData(document.getElementById('formND')));
    const payload = {
      importeNeto: Number(fd.importeNeto || 0),
      alicuotaIvaPct: Number(fd.alicuotaIvaPct || 21),
      otrosTributos: Number(fd.otrosTributos || 0),
      motivo: (fd.motivo || '').trim()
    };
    try {
      await apiPost(`/api/facturas/${encodeURIComponent(id)}/nota-debito`, payload);
      ensureModal().hide();
      await cargarFacturas();
    } catch (e) {
      console.error(e);
      alert('No se pudo emitir la Nota de Débito.');
    }
  };
}


function bindFacturaEvents() {
    document.querySelectorAll('[data-action="anular-factura"]').forEach(b => {
        b.onclick = async () => {
            const id = b.dataset.id;
            const tipo = prompt("¿Nota de Crédito (NC) o Nota de Débito (ND)?", "NC");
            if (!tipo) return;

            try {
                const res = await apiPost(`/api/facturas/${id}/anular?tipo=${tipo}`, {});
                alert(`Se generó ${res.tipo} Nº ${res.id} vinculada a la factura ${id}`);
                await cargarFacturas();
            } catch (e) {
                console.error(e);
                alert("Error al anular la factura.");
            }
        };
    });
}


function wireFacturaButton() {
  const btn = document.getElementById('btnEmitirFactura');
  if (!btn) return;

  btn.onclick = () => {
    openModal({
      title: 'Emitir Factura',
      body: `
      <form id="formFactura" class="row g-3">
        <div class="col-md-2">
          <label class="form-label">Tipo</label>
          <select name="tipo" class="form-select">
            <option value="A">A (Cód.01)</option>
            <option value="FCE A">FCE A (Cód.201)</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Cód.</label>
          <select name="codigoComprobante" class="form-select">
            <option value="01">01</option>
            <option value="201">201</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Pto. Venta</label>
          <input type="number" name="puntoVenta" value="2" class="form-control">
        </div>
        <div class="col-md-3">
          <label class="form-label">Número</label>
          <input type="number" name="numero" class="form-control">
        </div>
        <div class="col-md-3">
          <label class="form-label">Fecha Emisión</label>
          <input type="date" name="fechaEmision" value="${new Date().toISOString().slice(0,10)}" class="form-control">
        </div>

        <div class="col-md-6">
          <label class="form-label">Cliente</label>
          <input name="cliente" class="form-control" required>
        </div>
        <div class="col-md-3">
          <label class="form-label">CUIT</label>
          <input name="cuit" class="form-control">
        </div>
        <div class="col-md-3">
          <label class="form-label">Cond. IVA</label>
          <input name="condicionIVACliente" value="IVA Responsable Inscripto" class="form-control">
        </div>
        <div class="col-md-12">
          <label class="form-label">Domicilio</label>
          <input name="domicilio" class="form-control">
        </div>

        <div class="col-md-4">
          <label class="form-label">Condición de venta</label>
          <input name="condicionVenta" value="Cuenta Corriente" class="form-control">
        </div>
        <div class="col-md-4">
          <label class="form-label">Vto. de pago</label>
          <input type="date" name="fechaVencimientoPago" class="form-control">
        </div>
        <div class="col-md-2">
          <label class="form-label">Período desde</label>
          <input type="date" name="periodoDesde" class="form-control">
        </div>
        <div class="col-md-2">
          <label class="form-label">Período hasta</label>
          <input type="date" name="periodoHasta" class="form-control">
        </div>

        <div class="col-md-12">
          <label class="form-label">Detalle</label>
          <textarea name="detalle" class="form-control" rows="3"
            placeholder="Transporte... EBKG..., B/L..., contenedores..."></textarea>
        </div>

        <div class="col-md-3">
          <label class="form-label">Cantidad</label>
          <input type="number" step="0.01" name="cantidad" class="form-control" required>
        </div>
        <div class="col-md-3">
          <label class="form-label">U. Medida</label>
          <input name="unidadMedida" value="unidades" class="form-control">
        </div>
        <div class="col-md-3">
          <label class="form-label">Precio Unit.</label>
          <input type="number" step="0.01" name="precioUnitario" class="form-control" required>
        </div>
        <div class="col-md-3">
          <label class="form-label">% Bonif.</label>
          <input type="number" step="0.01" name="bonificacionPct" value="0" class="form-control">
        </div>

        <div class="col-md-3">
          <label class="form-label">Alícuota IVA</label>
          <select name="alicuotaIvaPct" class="form-select">
            <option value="21">21%</option>
            <option value="10.5">10.5%</option>
            <option value="27">27%</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Otros Tributos</label>
          <input type="number" step="0.01" name="importeOtrosTributos" value="0" class="form-control">
        </div>

        <div class="col-md-6">
          <div class="form-check mt-4">
            <input class="form-check-input" type="checkbox" id="esFCE" checked>
            <label class="form-check-label" for="esFCE">FCE (mostrar CBU / Alias / Opc. Circulación)</label>
          </div>
        </div>

        <div class="col-md-4">
          <label class="form-label">CBU Emisor</label>
          <input name="cbuEmisor" class="form-control" placeholder="0070...">
        </div>
        <div class="col-md-4">
          <label class="form-label">Alias CBU</label>
          <input name="aliasCbu" class="form-control" placeholder="ZUIDNETHSBC">
        </div>
        <div class="col-md-4">
          <label class="form-label">Opción Circulación</label>
          <input name="opcionCirculacion" class="form-control" value="Sistema de Circulación Abierta">
        </div>

        <div class="col-md-4">
          <label class="form-label">CAE</label>
          <input name="cae" class="form-control">
        </div>
        <div class="col-md-4">
          <label class="form-label">Vto. CAE</label>
          <input type="date" name="caeVencimiento" class="form-control">
        </div>
      </form>
      `,
      footer: `
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary" form="formFactura">Emitir</button>
      `
    });

    // ▶ manejar el SUBMIT del formulario (no el click del botón)
    const form = document.getElementById('formFactura');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fd = Object.fromEntries(new FormData(form));
      if (!fd.cliente || !fd.cantidad || !fd.precioUnitario) {
        alert('Completá cliente, cantidad y precio unitario.');
        return;
      }

      const payload = {
        tipo: fd.tipo || "A",
        codigoComprobante: fd.codigoComprobante || "01",
        puntoVenta: fd.puntoVenta ? Number(fd.puntoVenta) : 2,
        numero: fd.numero ? Number(fd.numero) : null,

        fechaEmision: fd.fechaEmision || null,
        fechaVencimientoPago: fd.fechaVencimientoPago || null,
        periodoDesde: fd.periodoDesde || null,
        periodoHasta: fd.periodoHasta || null,

        cliente: fd.cliente,
        cuit: fd.cuit || null,
        domicilio: fd.domicilio || null,
        condicionIVACliente: fd.condicionIVACliente || null,
        condicionVenta: fd.condicionVenta || null,

        detalle: fd.detalle || '',
        cantidad: Number(fd.cantidad),
        unidadMedida: fd.unidadMedida || 'unidades',
        precioUnitario: Number(fd.precioUnitario),
        bonificacionPct: fd.bonificacionPct ? Number(fd.bonificacionPct) : 0,
        alicuotaIvaPct: fd.alicuotaIvaPct ? Number(fd.alicuotaIvaPct) : 21,
        importeOtrosTributos: fd.importeOtrosTributos ? Number(fd.importeOtrosTributos) : 0,

        cbuEmisor: fd.cbuEmisor || null,
        aliasCbu: fd.aliasCbu || null,
        opcionCirculacion: fd.opcionCirculacion || null,

        cae: fd.cae || null,
        caeVencimiento: fd.caeVencimiento || null,

        estado: "EMITIDA"
      };

      try {
        console.log('[POST] /api/facturas', payload);
        const data = await apiCrearFactura(payload);
        ensureModal().hide();
        alert(`Factura emitida Nº ${data.id} (${data.tipo}) a ${data.cliente}.`);
        if ((location.hash || '').includes('facturas')) await cargarFacturas();
      } catch (err) {
        console.error('POST /api/facturas error:', err);
        alert('No se pudo emitir la factura. Revisá consola/Network.');
      }
    });
  };
}


function wireListarFacturasButton() {
  const btnAdmin  = document.getElementById('btnVerFacturas');
  if (btnAdmin) btnAdmin.onclick = () => { location.hash = '#facturas'; };

  const btnBuscar = document.getElementById('btnBuscarFactura'); // este vive en la ruta facturas
  if (btnBuscar) btnBuscar.onclick = cargarFacturas;
}


/* ===== Después de renderizar cada ruta ===== */
function afterRender(route) {
  switch (route) {
    case 'cargas':
      renderCargasTable();
      break;

    case 'aduana':
      renderLegajos();
      break;

    case 'clientes':
      renderTickets();
      break;

    case 'admin':
      document.getElementById('btnIrFacturas')?.addEventListener('click', ()=>{ location.hash='#facturas'; });
      wireListarFacturasButton();
      wireFacturaButton();
      break;

    case 'facturas':
      wireListarFacturasButton();
      wireFacturaButton();
      cargarFacturas();
      break;

    default:
      break;
  }
}
