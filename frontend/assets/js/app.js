/*************************************************
 *  SPA Frontend - Zuidwijk & Asoc. SRL
 *  - Roles: ADMIN / CLIENTE
 *  - Facturas: backend Spring (MariaDB/MySQL)
 *  - Cargas / Aduana / Tickets: demo local
 *************************************************/

/* ==================== CONFIG ==================== */
// 👉 Cambiá si tu backend corre en otra URL/puerto
const API_BASE = 'http://localhost:8080';

/* ============== HELPERS API (GENÉRICOS) ============== */
async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const txt = await res.text().catch(() => '');
    if (!res.ok) throw new Error(`API ${res.status}: ${txt || res.statusText}`);
    return txt ? JSON.parse(txt) : null; // soporta 204
}

/* ============== BACKEND FACTURAS ============== */
async function apiListarFacturas(cliente) {
    const path = cliente && cliente.trim()
        ? `/api/facturas?cliente=${encodeURIComponent(cliente.trim())}`
        : `/api/facturas`;
    return apiFetch(path, { method: 'GET' });
}

async function apiCrearFactura(factura) {
    return apiFetch('/api/facturas', {
        method: 'POST',
        body: JSON.stringify(factura),
    });
}

/* ===== Demo data (para módulos no conectados aún) ===== */
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
        { id:'LEG-0241', cliente:'Agro Sur', tipo:'Exportación', estado:'Esperando verificación' }
    ],
    tickets:[
        { id:'TCK-0502', cliente:'ACME S.A.', asunto:'Demora entrega', estado:'Abierto' },
        { id:'TCK-0501', cliente:'Agro Sur', asunto:'Cotización', estado:'Cerrado' }
    ]
};

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
function canAccess(route){
    const r = getRole();
    return (ROLE_ROUTES[r] || []).includes(route);
}

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
    <p class="text-muted m-0">Módulo demostrativo.</p>
  </div>`,

    clientes: () => `
  <div class="card p-3">
    <h5 class="mb-3">Atención al Cliente</h5>
    <ul class="list-group">
      ${DB.tickets.map(t => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div><strong>${t.id}</strong> • ${t.cliente} • ${t.asunto} • ${t.estado}</div>
          <button type="button" class="btn btn-outline-secondary btn-sm" data-action="ver-ticket" data-id="${t.id}">Ver</button>
        </li>`).join('')}
    </ul>
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
  </div>
`,

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
            <th>Detalle</th><th>Importe (ARS)</th><th>Estado</th>
            <th>Acciones</th>
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
    document.getElementById('page-subtitle').textContent =
        route==='home' ? 'Acerca de nosotros' : '';
}

function render(route){
    const target = (route || (location.hash||'#home').slice(1));
    const isAuth = isLoggedIn();

    // si está logueado, ocultar home/login
    let r = target;
    if(isAuth && (r==='home' || r==='login')){
        r = getRole()==='ADMIN' ? 'cargas' : 'clientes';
        location.hash = '#'+r;
    }
    // permisos
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
        APP_MODAL = bootstrap.Modal.getOrCreateInstance(APP_MODAL_EL, {
            backdrop: true, keyboard: true
        });
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

/* ===== Cargas (CRUD demo) ===== */
function bindCargasEvents(){
    document.getElementById('btnNuevaCarga')?.addEventListener('click', ()=> showCargaForm());
    document.querySelectorAll('[data-action="ver-carga"]').forEach(b=> b.onclick = ()=> showCargaView(b.dataset.id));
    if (getRole()==='ADMIN'){
        document.querySelectorAll('[data-action="edit-carga"]').forEach(b=> b.onclick = ()=> showCargaForm(b.dataset.id));
        document.querySelectorAll('[data-action="del-carga"]').forEach(b=> b.onclick = ()=> deleteCarga(b.dataset.id));
    }
}
function renderCargasTable(){
    const tbody = document.getElementById('tablaCargas'); if(!tbody) return;
    const isAdmin = getRole()==='ADMIN';
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
        ${isAdmin ? `
          <button type="button" class="btn btn-outline-primary btn-sm" data-action="edit-carga" data-id="${c.id}">Editar</button>
          <button type="button" class="btn btn-outline-danger btn-sm" data-action="del-carga" data-id="${c.id}">Eliminar</button>
        `:''}
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
            ${getRole()==='ADMIN'?'<button class="btn btn-primary" id="goEditCarga">Editar</button>':''}`
    });
    document.getElementById('goEditCarga')?.addEventListener('click', ()=>{ ensureModal().hide(); showCargaForm(id); });
}
function showCargaForm(id){
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
          <input class="form-control" name="id" value="${c.id}" ${isEdit?'readonly':''} required></div>
        <div class="col-md-5"><label class="form-label">Cliente</label>
          <input class="form-control" name="cliente" value="${c.cliente}" required></div>
        <div class="col-md-2"><label class="form-label">Fecha</label>
          <input type="date" class="form-control" name="fecha" value="${c.fecha||''}"></div>
        <div class="col-md-2"><label class="form-label">Estado</label>
          <select class="form-select" name="estado">
            ${['En preparación','En tránsito','Entregado','Demorado'].map(e=>`<option ${e===c.estado?'selected':''}>${e}</option>`).join('')}
          </select></div>

        <div class="col-md-3"><label class="form-label">Origen</label>
          <input class="form-control" name="origen" value="${c.origen}" required></div>
        <div class="col-md-3"><label class="form-label">Destino</label>
          <input class="form-control" name="destino" value="${c.destino}" required></div>
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
            DB.cargas[i] = {...DB.cargas[i], ...pack};
        } else {
            if(DB.cargas.some(x=>x.id===pack.id)){ alert('El ID ya existe'); return; }
            DB.cargas.unshift(pack);
        }
        ensureModal().hide();
        render('cargas');
    });
}
function deleteCarga(id){
    if(!confirm(`¿Eliminar la orden ${id}?`)) return;
    DB.cargas = DB.cargas.filter(x=>x.id!==id);
    renderCargasTable();
}

/* ===== Aduana / Tickets ===== */
function bindAduanaEvents(){
    document.querySelectorAll('[data-action="ver-legajo"]').forEach(b=>{
        b.onclick = ()=>{
            const lg = DB.legajos.find(x=>x.id===b.dataset.id);
            openModal({
                title:`Legajo ${lg.id}`,
                body:`<p><strong>Cliente:</strong> ${lg.cliente}</p>
              <p><strong>Tipo:</strong> ${lg.tipo}</p>
              <p><strong>Estado:</strong> ${lg.estado}</p>`
            });
        };
    });
}
function bindTicketsEvents(){
    document.querySelectorAll('[data-action="ver-ticket"]').forEach(b=>{
        b.onclick = ()=>{
            const t = DB.tickets.find(x=>x.id===b.dataset.id);
            openModal({
                title:`Ticket ${t.id}`,
                body:`<p><strong>Cliente:</strong> ${t.cliente}</p>
              <p><strong>Asunto:</strong> ${t.asunto}</p>
              <p><strong>Estado:</strong> ${t.estado}</p>`
            });
        };
    });
}

/* ===== Facturas (UI que usa backend) ===== */
async function cargarFacturas() {
    try {
        const filtro = document.getElementById('filterCliente')?.value || '';
        const data = await apiListarFacturas(filtro);

        // Si estoy en vista "Facturas", llená la tabla. Si no, mostramos modal.
        const tbody = document.getElementById('tablaFacturas');
        if (tbody) {
            tbody.innerHTML = data.map(f => `
        <tr>
          <td>${f.id ?? ''}</td>
          <td>${f.cliente ?? ''}</td>
          <td>${f.cuit ?? '-'}</td>
          <td>${f.fecha ?? '-'}</td>
          <td>${f.detalle ?? '-'}</td>
          <td>${(f.total ?? 0).toFixed ? f.total.toFixed(2) : f.total}</td>
          <td>${f.estado ?? '-'}</td>
          <td></td>
        </tr>`).join('');
        } else {
            openModal({
                title: 'Facturas',
                body: `
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr>
                <th>#</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th>Total</th>
              </tr></thead>
              <tbody>
                ${data.map(f => `
                  <tr>
                    <td>${f.id ?? ''}</td>
                    <td>${f.cliente ?? ''}</td>
                    <td>${f.fecha ?? ''}</td>
                    <td>${f.estado ?? ''}</td>
                    <td>${(f.total ?? 0).toFixed ? f.total.toFixed(2) : f.total}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`
            });
        }
        return data;
    } catch (e) {
        console.error(e);
        alert('No se pudo cargar el listado de facturas.');
        return [];
    }
}

/* ============= EMITIR FACTURA (usa API_BASE) ============= */
function wireFacturaButton() {
    const btn = document.getElementById('btnEmitirFactura');
    if (!btn) return;

    btn.onclick = () => {
        openModal({
            title: 'Emitir Factura',
            body: `
        <form id="formFactura" class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Cliente</label>
            <input name="cliente" class="form-control" required>
          </div>
          <div class="col-md-3">
            <label class="form-label">CUIT</label>
            <input name="cuit" class="form-control">
          </div>
          <div class="col-md-3">
            <label class="form-label">Fecha</label>
            <input type="date" name="fecha" value="${new Date().toISOString().slice(0,10)}" class="form-control">
          </div>
          <div class="col-md-8">
            <label class="form-label">Detalle</label>
            <input name="detalle" class="form-control" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Importe (ARS)</label>
            <input type="number" step="0.01" name="importe" class="form-control" required>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button class="btn btn-primary" id="saveFactura">Emitir</button>
      `
        });

        document.getElementById('saveFactura')?.addEventListener('click', async () => {
            const fd = Object.fromEntries(new FormData(document.getElementById('formFactura')));
            if (!fd.cliente || !fd.detalle || !fd.importe) {
                alert('Completá los campos obligatorios.');
                return;
            }

            const payload = {
                cliente: fd.cliente,
                cuit: fd.cuit || null,
                fecha: fd.fecha,                       // yyyy-MM-dd
                total: Number(fd.importe),             // el backend espera total (número)
                estado: "EMITIDA",
                detalle: fd.detalle
                // numero: 'opcional-único' // si lo usás, debe ser único
            };

            try {
                const data = await apiCrearFactura(payload);
                ensureModal().hide();
                alert(`Factura emitida Nº ${data.id} para ${data.cliente} por ARS ${data.total}.`);
                // si estoy en vista facturas, refresco
                if ((location.hash||'').includes('facturas')) {
                    await cargarFacturas();
                }
            } catch (e) {
                console.error('POST /api/facturas error:', e);
                alert('No se pudo emitir la factura. Revisá consola/Network.');
            }
        });
    };
}

/* ============= VER FACTURAS EMITIDAS ============= */
function wireListarFacturasButton() {
    const btn = document.getElementById('btnVerFacturas');
    const btnBuscar = document.getElementById('btnBuscarFactura');
    if (btn) {
        btn.onclick = async () => { await cargarFacturas(); };
    }
    if (btnBuscar) {
        btnBuscar.onclick = async () => { await cargarFacturas(); };
    }
}

/* ===== Después de renderizar cada ruta ===== */
function afterRender(route) {
    switch (route) {
        case 'cargas':
            renderCargasTable();
            break;
        case 'aduana':
            bindAduanaEvents();
            break;
        case 'clientes':
            bindTicketsEvents();
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
