/* =================== AUTH / ROLES =================== */
const PUBLIC_ROUTES = ['home'];
const ROUTE_ACCESS = {
    home:     ['PUBLIC','ADMIN','CLIENTE'],
    cargas:   ['ADMIN','CLIENTE'],
    aduana:   ['ADMIN'],
    almacen:  ['ADMIN'],
    clientes: ['ADMIN','CLIENTE'],
    admin:    ['ADMIN']
};

function isLoggedIn(){ return !!localStorage.getItem('sessionUser'); }
function getRole(){ return localStorage.getItem('sessionRole') || 'PUBLIC'; }
function clearSession(){ localStorage.removeItem('sessionUser'); localStorage.removeItem('sessionRole'); }

function canAccess(route){
    const allowed = ROUTE_ACCESS[route] || ['PUBLIC'];
    return allowed.includes(getRole());
}

function updateAuthUI(){
    const isAuth = isLoggedIn();
    const role = getRole();

    document.querySelectorAll('#menu a[data-route]').forEach(a=>{
        const route = a.dataset.route;
        const visible = (isAuth && canAccess(route)) || (!isAuth && PUBLIC_ROUTES.includes(route));
        const li = a.closest('li'); if (li) li.style.display = visible ? '' : 'none';
    });

    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logout');
    if (loginLink) loginLink.style.display = isAuth ? 'none' : '';
    if (logoutBtn)  logoutBtn.style.display  = isAuth ? '' : 'none';

    const nameEl = document.getElementById('user-name');
    const mailEl = document.getElementById('user-email');
    if (nameEl && mailEl){
        if (isAuth){ nameEl.textContent = role==='ADMIN' ? 'Admin' : 'Cliente'; mailEl.textContent = localStorage.getItem('sessionUser') || '-'; }
        else { nameEl.textContent='Invitado'; mailEl.textContent='-'; }
    }
}

function logoutDemo(){
    clearSession();
    updateAuthUI();
    window.location.href = 'index.html#home';
}

/* =================== VISTAS (SPA) =================== */
const view = document.getElementById('view');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

const Views = {
    home: () => `
    <div class="card p-4">
      <h3 class="mb-3">Zuidwijk & Asociados SRL</h3>
      <p>Zuidwijk & Asociados es una <strong>empresa joven</strong>, con personal de amplia y reconocida experiencia en el mercado.</p>
      <p>Somos <strong>Consultores en Comercio Exterior</strong>. Analizamos su negocio integralmente: sector, competidores, ubicación y cadena logística, para optimizar tiempos y rentabilidad.</p>
      <p>Nuestra <strong>misión</strong> es ofrecer servicios integrales en el manejo de mercaderías, agregando valor con la responsabilidad y experiencia de nuestra gente.</p>
      <h5 class="mt-3">Aliados habituales</h5>
      <ul class="mb-2">
        <li>Terminales portuarias</li>
        <li>Transportistas</li>
        <li>Despachantes</li>
        <li>Depósitos para des/consolidados</li>
        <li>Seguros</li>
      </ul>
      <h5 class="mt-3">¿Por qué elegirnos?</h5>
      <p>Vemos su negocio como propio y lo analizamos desde todas las perspectivas para hacerlo más productivo. Queremos ser su <strong>facilitador global</strong> en comercio y servicios logísticos.</p>
    </div>`,

    cargas: () => `
    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Gestión de Cargas</h5>
        ${getRole()==='ADMIN' ? '<button class="btn btn-primary btn-sm" id="btnNuevaCarga">+ Nueva Carga</button>' : ''}
      </div>
      <p class="text-muted mt-2">Registrar, ver y seguir órdenes de transporte.</p>
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>#</th><th>Cliente</th><th>Origen</th><th>Destino</th>
              <th>Terminal</th><th>Contenedor</th><th>Precinto</th><th>Peso Bruto</th>
              <th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaCargas"></tbody>
        </table>
      </div>
    </div>`,

    aduana: () => `
    <div class="card p-3">
      <h5 class="mb-2">Gestión Aduanera</h5>
      <p class="text-muted">Documentación, legajos y estados de destinación.</p>
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead><tr><th>Legajo</th><th>Cliente</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${DB.legajos.map(lg => `
              <tr>
                <td>${lg.id}</td><td>${lg.cliente}</td><td>${lg.tipo}</td><td>${lg.estado}</td>
                <td><button class="btn btn-outline-secondary btn-sm" data-action="ver-legajo" data-id="${lg.id}">Ver</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`,

    almacen: () => `
    <div class="card p-3">
      <h5 class="mb-2">Almacenamiento & Consolidación</h5>
      <p class="text-muted">Stock, ubicaciones y preparación de despacho.</p>
      <div class="row g-3">
        <div class="col-md-6"><div class="card p-3">
          <h6>Inventario</h6>
          <ul class="mb-0"><li>Lote A-12 · 36 pallets</li><li>Lote B-07 · 12 pallets (frágil)</li><li>Lote C-02 · 5 pallets (inflamable)</li></ul>
        </div></div>
        <div class="col-md-6"><div class="card p-3">
          <h6>Preparación de despacho</h6>
          <ul class="mb-0"><li>ORD-101 · Checklist OK</li><li>ORD-102 · A la espera de transporte</li></ul>
        </div></div>
      </div>
    </div>`,

    clientes: () => `
    <div class="card p-3">
      <div class="d-flex justify-content-between">
        <h5 class="mb-0">Atención al Cliente</h5>
        ${getRole()==='ADMIN' ? '<button class="btn btn-primary btn-sm">+ Nuevo ticket</button>' : ''}
      </div>
      <p class="text-muted mt-2">Cotizaciones, consultas, reclamos y reportes.</p>
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead><tr><th>#Ticket</th><th>Cliente</th><th>Asunto</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${visibleTickets().map(t => `
              <tr>
                <td>${t.id}</td><td>${t.cliente}</td><td>${t.asunto}</td><td>${t.estado}</td>
                <td><button class="btn btn-outline-secondary btn-sm" data-action="ver-ticket" data-id="${t.id}">Ver</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`,

    admin: () => `
    <div class="card p-3">
      <h5 class="mb-2">Administración</h5>
      <p class="text-muted">Facturación, cobranzas, proveedores y usuarios.</p>
      <div class="row g-3">
        <div class="col-md-6"><div class="card p-3">
          <h6>Facturación</h6>
          <button class="btn btn-primary btn-sm">Emitir factura</button>
          <button class="btn btn-outline-secondary btn-sm">Exportar</button>
        </div></div>
        <div class="col-md-6"><div class="card p-3">
          <h6>Proveedores</h6>
          <button class="btn btn-primary btn-sm">Nuevo proveedor</button>
          <button class="btn btn-outline-secondary btn-sm">Listado</button>
        </div></div>
      </div>
    </div>`
};

const routes = {
    home:     { view: Views.home,     title:'Inicio',             subtitle:'Información institucional' },
    cargas:   { view: Views.cargas,   title:'Gestión de Cargas',  subtitle:'Registro y seguimiento' },
    aduana:   { view: Views.aduana,   title:'Gestión Aduanera',   subtitle:'Documentación y legajos' },
    almacen:  { view: Views.almacen,  title:'Almacenamiento',     subtitle:'Inventario y consolidación' },
    clientes: { view: Views.clientes, title:'Atención al Cliente',subtitle:'Tickets y reportes' },
    admin:    { view: Views.admin,    title:'Administración',     subtitle:'Facturación y proveedores' }
};

function setActive(route){
    document.querySelectorAll('#menu a[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route===route));
}

function render(route){
    const r = routes[route] || routes.home;
    if (view) view.innerHTML = r.view();
    if (pageTitle) pageTitle.textContent = r.title;
    if (pageSubtitle) pageSubtitle.textContent = r.subtitle;
    setActive(route);
}

/* =================== MOCK DB con CAMPOS EXTRAS =================== */
const DB = {
    cargas: [
        {
            id: 'ORD-101',
            cliente: 'ACME S.A.',
            origen: 'Buenos Aires',
            destino: 'Rosario',
            terminal: 'Terminal 4 BA',
            contenedor: 'MSCU1234567',
            tipo: 'Dry 40',
            tara: 3800,
            precinto: 'ABC123456',
            pesoBruto: 25000,
            estado: 'En tránsito',
            fecha: '2025-08-10',
            chofer: 'Juan Gómez',
            dni: '23.456.789',
            celular: '+54 9 11 5555-5555',
            tractorMarca: 'Scania',
            tractorModelo: 'R410',
            tractorAnio: 2019,
            tractorPatente: 'AD123BC',
            semiMarca: 'Randon',
            semiModelo: 'SR',
            semiAnio: 2018,
            semiPatente: 'AA123BB',
            satelital: 'LoJack',
            usuario: 'acme_ops',
            contrasena: '******'
        },
        {
            id: 'ORD-102',
            cliente: 'Metalúrgica Norte',
            origen: 'Zárate',
            destino: 'Córdoba',
            terminal: 'T6',
            contenedor: 'MAEU7654321',
            tipo: 'HC 40',
            tara: 3900,
            precinto: 'XYZ987654',
            pesoBruto: 18000,
            estado: 'En preparación',
            fecha: '2025-08-12',
            chofer: 'Marcos Silva',
            dni: '28.765.432',
            celular: '+54 9 11 4000-2222',
            tractorMarca: 'Volvo',
            tractorModelo: 'FH440',
            tractorAnio: 2020,
            tractorPatente: 'AE456CD',
            semiMarca: 'Helvética',
            semiModelo: 'HM',
            semiAnio: 2017,
            semiPatente: 'AC987CD',
            satelital: 'SETracking',
            usuario: 'mn_log',
            contrasena: '******'
        },
        {
            id: 'ORD-103',
            cliente: 'Agro Sur',
            origen: 'Santa Fe',
            destino: 'Bahía Blanca',
            terminal: 'BB Port',
            contenedor: 'TLLU1112223',
            tipo: 'Reefer 20',
            tara: 3000,
            precinto: 'PQR112233',
            pesoBruto: 14000,
            estado: 'Entregado',
            fecha: '2025-08-01',
            chofer: 'Carlos Duarte',
            dni: '21.112.223',
            celular: '+54 9 291 555-0000',
            tractorMarca: 'Iveco',
            tractorModelo: 'Stralis',
            tractorAnio: 2018,
            tractorPatente: 'AB321EF',
            semiMarca: 'Montenegro',
            semiModelo: 'MB',
            semiAnio: 2016,
            semiPatente: 'AF654GH',
            satelital: 'Prosegur Sat',
            usuario: 'agro_ops',
            contrasena: '******'
        }
    ],
    legajos: [
        { id: 'LEG-0240', cliente: 'Metalúrgica Norte', tipo: 'Importación', estado: 'Documentación OK' },
        { id: 'LEG-0241', cliente: 'Agro Sur', tipo: 'Exportación', estado: 'Esperando verificación' },
    ],
    tickets: [
        { id: 'TCK-0502', cliente: 'ACME S.A.', asunto: 'Demora entrega', estado: 'Abierto' },
        { id: 'TCK-0501', cliente: 'Agro Sur',  asunto: 'Cotización',     estado: 'Cerrado' },
    ]
};

// LocalStorage (demo)
function loadLS(){ const d = localStorage.getItem('sigl-demo'); if (d) Object.assign(DB, JSON.parse(d)); }
function saveLS(){ localStorage.setItem('sigl-demo', JSON.stringify(DB)); }
loadLS();

/* =================== HELPERS UI =================== */
let modalEl, modal;
function ensureModal(){ modalEl = document.getElementById('appModal'); modal = new bootstrap.Modal(modalEl); }
function openModal({ title='', body='', footer='' }){
    ensureModal();
    document.getElementById('appModalLabel').textContent = title;
    document.getElementById('appModalBody').innerHTML = body;
    document.getElementById('appModalFooter').innerHTML = footer;
    modal.show();
}
function chipEstado(estado){
    const map = {'Entregado':'estado entregado','En tránsito':'estado transito','En preparación':'estado transito','Demorado':'estado demorado'};
    return `<span class="${map[estado]||'estado'}">${estado}</span>`;
}

/* =================== VISIBILIDAD CLIENTE =================== */
const CLIENT_EMAIL_TO_CLIENTE = {
    'cliente@empresa.com': 'ACME S.A.',
    'cliente2@empresa.com': 'Agro Sur'
};
function visibleCargas(){
    if (getRole()!=='CLIENTE') return DB.cargas;
    const email = localStorage.getItem('sessionUser')||'';
    const cliente = CLIENT_EMAIL_TO_CLIENTE[email];
    return cliente ? DB.cargas.filter(c=>c.cliente===cliente) : [];
}
function visibleTickets(){
    if (getRole()!=='CLIENTE') return DB.tickets;
    const email = localStorage.getItem('sessionUser')||'';
    const cliente = CLIENT_EMAIL_TO_CLIENTE[email];
    return cliente ? DB.tickets.filter(t=>t.cliente===cliente) : [];
}

/* =================== CARGAS (Tabla/CRUD) =================== */
function bindCargasEvents(){
    const btnNueva = document.getElementById('btnNuevaCarga');
    if (btnNueva && getRole()==='ADMIN') btnNueva.addEventListener('click', () => showCargaForm());

    document.querySelectorAll('[data-action="ver-carga"]').forEach(b => b.addEventListener('click', () => showCargaView(b.dataset.id)));
    if (getRole()==='ADMIN'){
        document.querySelectorAll('[data-action="edit-carga"]').forEach(b => b.addEventListener('click', () => showCargaForm(b.dataset.id)));
        document.querySelectorAll('[data-action="del-carga"]').forEach(b => b.addEventListener('click', () => deleteCarga(b.dataset.id)));
    }
}

function renderCargasTable(){
    const tbody = document.getElementById('tablaCargas');
    if (!tbody) return;
    const rows = visibleCargas().map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.cliente}</td>
      <td>${c.origen}</td>
      <td>${c.destino}</td>
      <td>${c.terminal || '-'}</td>
      <td>${c.contenedor || '-'}</td>
      <td>${c.precinto || '-'}</td>
      <td>${c.pesoBruto ? c.pesoBruto+' Kg' : '-'}</td>
      <td>${chipEstado(c.estado)}</td>
      <td class="text-nowrap">
        <button class="btn btn-outline-secondary btn-sm" data-action="ver-carga" data-id="${c.id}">Ver</button>
        ${getRole()==='ADMIN' ? `
          <button class="btn btn-outline-primary btn-sm" data-action="edit-carga" data-id="${c.id}">Editar</button>
          <button class="btn btn-outline-danger btn-sm" data-action="del-carga" data-id="${c.id}">Eliminar</button>` : ''}
      </td>
    </tr>`).join('');
    tbody.innerHTML = rows || `<tr><td colspan="10" class="text-muted">No hay cargas para mostrar.</td></tr>`;
    bindCargasEvents();
}

function showCargaView(id){
    const c = DB.cargas.find(x=>x.id===id);
    if (!c) return;

    if (getRole()==='CLIENTE'){
        const email = localStorage.getItem('sessionUser')||'';
        const cli = CLIENT_EMAIL_TO_CLIENTE[email];
        if (cli && c.cliente!==cli){ alert('No autorizado.'); return; }
    }

    openModal({
        title: `Orden ${c.id}`,
        body: `
      <div class="row g-3">
        <div class="col-12"><h6 class="mb-0">Datos Generales</h6><hr></div>
        <div class="col-md-4"><strong>Cliente:</strong> ${c.cliente}</div>
        <div class="col-md-4"><strong>Fecha:</strong> ${c.fecha||'-'}</div>
        <div class="col-md-4"><strong>Estado:</strong> ${chipEstado(c.estado)}</div>
        <div class="col-md-6"><strong>Origen:</strong> ${c.origen}</div>
        <div class="col-md-6"><strong>Destino:</strong> ${c.destino}</div>

        <div class="col-12 mt-2"><h6 class="mb-0">Contenedor & Terminal</h6><hr></div>
        <div class="col-md-4"><strong>Terminal:</strong> ${c.terminal||'-'}</div>
        <div class="col-md-4"><strong>Contenedor:</strong> ${c.contenedor||'-'}</div>
        <div class="col-md-4"><strong>Tipo:</strong> ${c.tipo||'-'}</div>
        <div class="col-md-4"><strong>Tara:</strong> ${c.tara?c.tara+' Kg':'-'}</div>
        <div class="col-md-4"><strong>Precinto:</strong> ${c.precinto||'-'}</div>
        <div class="col-md-4"><strong>Peso Bruto:</strong> ${c.pesoBruto?c.pesoBruto+' Kg':'-'}</div>

        <div class="col-12 mt-2"><h6 class="mb-0">Chofer</h6><hr></div>
        <div class="col-md-4"><strong>Nombre:</strong> ${c.chofer||'-'}</div>
        <div class="col-md-4"><strong>DNI:</strong> ${c.dni||'-'}</div>
        <div class="col-md-4"><strong>Celular:</strong> ${c.celular||'-'}</div>

        <div class="col-12 mt-2"><h6 class="mb-0">Tractor</h6><hr></div>
        <div class="col-md-3"><strong>Marca:</strong> ${c.tractorMarca||'-'}</div>
        <div class="col-md-3"><strong>Modelo:</strong> ${c.tractorModelo||'-'}</div>
        <div class="col-md-3"><strong>Año:</strong> ${c.tractorAnio||'-'}</div>
        <div class="col-md-3"><strong>Patente:</strong> ${c.tractorPatente||'-'}</div>

        <div class="col-12 mt-2"><h6 class="mb-0">Semi</h6><hr></div>
        <div class="col-md-3"><strong>Marca:</strong> ${c.semiMarca||'-'}</div>
        <div class="col-md-3"><strong>Modelo:</strong> ${c.semiModelo||'-'}</div>
        <div class="col-md-3"><strong>Año:</strong> ${c.semiAnio||'-'}</div>
        <div class="col-md-3"><strong>Patente:</strong> ${c.semiPatente||'-'}</div>

        <div class="col-12 mt-2"><h6 class="mb-0">Rastreo Satelital</h6><hr></div>
        <div class="col-md-4"><strong>Marca:</strong> ${c.satelital||'-'}</div>
        <div class="col-md-4"><strong>Usuario:</strong> ${c.usuario||'-'}</div>
        <div class="col-md-4"><strong>Contraseña:</strong> ${c.contrasena ? '••••••' : '-'}</div>
      </div>
    `,
        footer: `<button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
             ${getRole()==='ADMIN' ? `<button class="btn btn-primary" id="goEditCarga">Editar</button>` : ''}`
    });

    document.getElementById('goEditCarga')?.addEventListener('click', () => { modal.hide(); showCargaForm(id); });
}

function showCargaForm(id){
    if (getRole()!=='ADMIN'){ alert('Solo ADMIN puede editar/crear.'); return; }
    const isEdit = !!id;
    const c = isEdit ? DB.cargas.find(x=>x.id===id) : {
        id:'', cliente:'', origen:'', destino:'', terminal:'', contenedor:'', tipo:'',
        tara:'', precinto:'', pesoBruto:'', estado:'En preparación', fecha:'',
        chofer:'', dni:'', celular:'',
        tractorMarca:'', tractorModelo:'', tractorAnio:'', tractorPatente:'',
        semiMarca:'', semiModelo:'', semiAnio:'', semiPatente:'',
        satelital:'', usuario:'', contrasena:''
    };

    openModal({
        title: isEdit ? `Editar carga ${c.id}` : 'Nueva carga',
        body: `
      <form id="formCarga" class="row g-3">
        <div class="col-12"><h6 class="mb-0">Datos generales</h6><hr></div>
        <div class="col-md-3"><label class="form-label">ID Orden</label><input class="form-control" name="id" value="${c.id}" ${isEdit ? 'readonly' : ''} required></div>
        <div class="col-md-5"><label class="form-label">Cliente</label><input class="form-control" name="cliente" value="${c.cliente}" required></div>
        <div class="col-md-2"><label class="form-label">Estado</label>
          <select class="form-select" name="estado">
            ${['En preparación','En tránsito','Entregado','Demorado'].map(e => `<option ${e===c.estado?'selected':''}>${e}</option>`).join('')}
          </select></div>
        <div class="col-md-2"><label class="form-label">Fecha</label><input type="date" class="form-control" name="fecha" value="${c.fecha||''}"></div>

        <div class="col-md-6"><label class="form-label">Origen</label><input class="form-control" name="origen" value="${c.origen}" required></div>
        <div class="col-md-6"><label class="form-label">Destino</label><input class="form-control" name="destino" value="${c.destino}" required></div>

        <div class="col-12 mt-2"><h6 class="mb-0">Contenedor & Terminal</h6><hr></div>
        <div class="col-md-4"><label class="form-label">Terminal portuaria</label><input class="form-control" name="terminal" value="${c.terminal||''}"></div>
        <div class="col-md-4"><label class="form-label">Contenedor</label><input class="form-control" name="contenedor" value="${c.contenedor||''}"></div>
        <div class="col-md-4"><label class="form-label">Tipo</label><input class="form-control" name="tipo" value="${c.tipo||''}" placeholder="Dry 40 / HC 40 / Reefer 20"></div>

        <div class="col-md-4"><label class="form-label">Tara (Kg)</label><input type="number" class="form-control" name="tara" value="${c.tara||''}"></div>
        <div class="col-md-4"><label class="form-label">Precinto</label><input class="form-control" name="precinto" value="${c.precinto||''}"></div>
        <div class="col-md-4"><label class="form-label">Peso bruto (Kg)</label><input type="number" class="form-control" name="pesoBruto" value="${c.pesoBruto||''}"></div>

        <div class="col-12 mt-2"><h6 class="mb-0">Chofer</h6><hr></div>
        <div class="col-md-4"><label class="form-label">Nombre</label><input class="form-control" name="chofer" value="${c.chofer||''}"></div>
        <div class="col-md-4"><label class="form-label">DNI</label><input class="form-control" name="dni" value="${c.dni||''}"></div>
        <div class="col-md-4"><label class="form-label">Celular</label><input class="form-control" name="celular" value="${c.celular||''}"></div>

        <div class="col-12 mt-2"><h6 class="mb-0">Tractor</h6><hr></div>
        <div class="col-md-3"><label class="form-label">Marca</label><input class="form-control" name="tractorMarca" value="${c.tractorMarca||''}"></div>
        <div class="col-md-3"><label class="form-label">Modelo</label><input class="form-control" name="tractorModelo" value="${c.tractorModelo||''}"></div>
        <div class="col-md-3"><label class="form-label">Año</label><input type="number" class="form-control" name="tractorAnio" value="${c.tractorAnio||''}"></div>
        <div class="col-md-3"><label class="form-label">Patente</label><input class="form-control" name="tractorPatente" value="${c.tractorPatente||''}"></div>

        <div class="col-12 mt-2"><h6 class="mb-0">Semi</h6><hr></div>
        <div class="col-md-3"><label class="form-label">Marca</label><input class="form-control" name="semiMarca" value="${c.semiMarca||''}"></div>
        <div class="col-md-3"><label class="form-label">Modelo</label><input class="form-control" name="semiModelo" value="${c.semiModelo||''}"></div>
        <div class="col-md-3"><label class="form-label">Año</label><input type="number" class="form-control" name="semiAnio" value="${c.semiAnio||''}"></div>
        <div class="col-md-3"><label class="form-label">Patente</label><input class="form-control" name="semiPatente" value="${c.semiPatente||''}"></div>

        <div class="col-12 mt-2"><h6 class="mb-0">Rastreo Satelital</h6><hr></div>
        <div class="col-md-4"><label class="form-label">Marca satelital</label><input class="form-control" name="satelital" value="${c.satelital||''}"></div>
        <div class="col-md-4"><label class="form-label">Usuario</label><input class="form-control" name="usuario" value="${c.usuario||''}"></div>
        <div class="col-md-4"><label class="form-label">Contraseña</label><input class="form-control" name="contrasena" value="${c.contrasena||''}"></div>
      </form>
    `,
        footer: `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
             <button class="btn btn-primary" id="saveCarga">Guardar</button>`
    });

    document.getElementById('saveCarga').addEventListener('click', () => {
        const form = document.getElementById('formCarga');
        const data = Object.fromEntries(new FormData(form));

        // Normalizar numéricos
        ['tara','pesoBruto','tractorAnio','semiAnio'].forEach(k=>{
            if (data[k]!=='' && !isNaN(data[k])) data[k] = Number(data[k]);
            else if (data[k]==='') data[k] = null;
        });

        if (isEdit){
            const idx = DB.cargas.findIndex(x=>x.id===c.id);
            DB.cargas[idx] = { ...DB.cargas[idx], ...data };
        } else {
            if (!data.id) { alert('El ID es obligatorio'); return; }
            if (DB.cargas.some(x=>x.id===data.id)) { alert('El ID ya existe'); return; }
            DB.cargas.unshift(data);
        }
        saveLS();
        modal.hide();
        navigate('cargas');
    });
}

function deleteCarga(id){
    if (getRole()!=='ADMIN'){ alert('Solo ADMIN puede eliminar.'); return; }
    if (!confirm(`¿Eliminar la orden ${id}?`)) return;
    DB.cargas = DB.cargas.filter(x=>x.id!==id);
    saveLS();
    renderCargasTable();
}

/* =================== Aduana / Tickets =================== */
function bindAduanaEvents(){
    document.querySelectorAll('[data-action="ver-legajo"]').forEach(b=>{
        const lg = DB.legajos.find(x=>x.id===b.dataset.id);
        b.addEventListener('click', ()=> openModal({
            title:`Legajo ${lg.id}`,
            body:`<p><strong>Cliente:</strong> ${lg.cliente}</p><p><strong>Tipo:</strong> ${lg.tipo}</p><p><strong>Estado:</strong> ${lg.estado}</p>`,
            footer:`<button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>`
        }));
    });
}
function bindTicketsEvents(){
    document.querySelectorAll('[data-action="ver-ticket"]').forEach(b=>{
        const t = DB.tickets.find(x=>x.id===b.dataset.id);
        b.addEventListener('click', ()=> openModal({
            title:`Ticket ${t.id}`,
            body:`<p><strong>Cliente:</strong> ${t.cliente}</p><p><strong>Asunto:</strong> ${t.asunto}</p><p><strong>Estado:</strong> ${t.estado}</p>`,
            footer:`<button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>`
        }));
    });
}

/* =================== Router/Guards =================== */
function setActive(route){
    document.querySelectorAll('#menu a[data-route]').forEach(a=>{
        a.classList.toggle('active', a.dataset.route===route);
    });
}
function navigate(route){
    const isAuth = isLoggedIn();
    if (!isAuth && !PUBLIC_ROUTES.includes(route)){
        render('home'); afterRender('home'); updateAuthUI();
        const v = document.getElementById('view');
        if (v){
            const msg = document.createElement('div');
            msg.className='alert alert-info mt-3';
            msg.innerHTML = 'Para acceder a esta sección, por favor <a href="login.html">iniciá sesión</a>.';
            v.appendChild(msg);
        }
        window.location.hash = 'home';
        return;
    }
    if (isAuth && !canAccess(route)){
        render('home'); afterRender('home'); updateAuthUI();
        const v = document.getElementById('view');
        if (v){
            const msg = document.createElement('div');
            msg.className='alert alert-warning mt-3';
            msg.textContent='No tenés permisos para acceder a esta sección.';
            v.appendChild(msg);
        }
        window.location.hash = 'home';
        return;
    }
    render(route); afterRender(route); updateAuthUI(); window.location.hash = route;
}

function afterRender(route){
    if (route==='cargas'){ renderCargasTable(); bindCargasEvents(); }
    if (route==='aduana') bindAduanaEvents();
    if (route==='clientes') bindTicketsEvents();
}

/* =================== INIT =================== */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#menu a[data-route]').forEach(a=>{
        a.addEventListener('click', (e)=>{ e.preventDefault(); navigate(a.dataset.route); });
    });
    document.getElementById('logout')?.addEventListener('click', (e)=>{ e.preventDefault(); logoutDemo(); });

    const first = (location.hash || '#home').replace('#','');
    navigate(first);
});
window.addEventListener('hashchange', () => {
    const route = (location.hash || '#home').replace('#','');
    navigate(route);
});
