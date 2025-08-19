/* Router súper simple para el dashboard (SPA) */
document.addEventListener('DOMContentLoaded', () => {
    const view = document.getElementById('view');
    const pageTitle = document.getElementById('page-title');       // opcional si lo tenés
    const pageSubtitle = document.getElementById('page-subtitle'); // opcional si lo tenés
    const menu = document.querySelectorAll('#menu a[data-route]');
    const logoutBtn = document.getElementById('logout');

    // ----- Vistas -----
    const Views = {
        home: () => `
      <div class="card">
        <h5 class="mb-3">Panel general</h5>
        <p class="text-muted">Resumen operativo y accesos rápidos.</p>
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card p-3">
              <h6 class="mb-1">Órdenes activas</h6>
              <small class="text-muted">Últimas 24 hs</small>
              <ul class="mt-2 mb-0">
                <li>#ORD-10021 · En tránsito</li>
                <li>#ORD-10018 · En preparación</li>
                <li>#ORD-10012 · Entregada</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card p-3">
              <h6 class="mb-1">Atención al Cliente</h6>
              <small class="text-muted">Tickets abiertos</small>
              <ul class="mt-2 mb-0">
                <li>#TCK-502 · Consulta de demoras</li>
                <li>#TCK-498 · Cotización Rosario</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `,

        cargas: () => `
      <div class="card">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Gestión de Cargas</h5>
          <div>
            <button class="btn btn-primary btn-sm" id="btnNuevaCarga">+ Nueva Carga</button>
          </div>
        </div>
        <p class="text-muted mt-2">Registrar, asignar transporte y hacer seguimiento.</p>

        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>#</th><th>Cliente</th><th>Origen</th><th>Destino</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tablaCargas">
              ${[1,2,3].map(i => `
                <tr>
                  <td>ORD-10${i}</td>
                  <td>ACME S.A.</td>
                  <td>Bs As</td>
                  <td>Rosario</td>
                  <td><span class="estado transito">En tránsito</span></td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm">Ver</button>
                    <button class="btn btn-outline-primary btn-sm">Editar</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `,

        aduana: () => `
      <div class="card">
        <h5 class="mb-2">Gestión Aduanera</h5>
        <p class="text-muted">Documentación, legajos y estados de destinación.</p>

        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr><th>Legajo</th><th>Cliente</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>LEG-0240</td><td>Metalúrgica Norte</td><td>Importación</td>
                <td><span class="estado entregado">Documentación OK</span></td>
                <td><button class="btn btn-outline-secondary btn-sm">Ver</button></td>
              </tr>
              <tr>
                <td>LEG-0241</td><td>Agro Sur</td><td>Exportación</td>
                <td><span class="estado transito">Esperando verificación</span></td>
                <td><button class="btn btn-outline-secondary btn-sm">Ver</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,

        almacen: () => `
      <div class="card">
        <h5 class="mb-2">Almacenamiento & Consolidación</h5>
        <p class="text-muted">Stock, ubicaciones y preparación de despacho.</p>

        <div class="row g-3">
          <div class="col-md-6">
            <div class="card p-3">
              <h6>Inventario</h6>
              <ul class="mb-0">
                <li>Lote A-12 · 36 pallets</li>
                <li>Lote B-07 · 12 pallets (frágil)</li>
                <li>Lote C-02 · 5 pallets (inflamable)</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card p-3">
              <h6>Preparación de despacho</h6>
              <ul class="mb-0">
                <li>ORD-1012 · Checklist OK</li>
                <li>ORD-1013 · A la espera de transporte</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `,

        clientes: () => `
      <div class="card">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Atención al Cliente</h5>
          <button class="btn btn-primary btn-sm">+ Nuevo ticket</button>
        </div>
        <p class="text-muted mt-2">Cotizaciones, consultas, reclamos y reportes.</p>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr><th>#Ticket</th><th>Cliente</th><th>Asunto</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>TCK-0502</td><td>ACME S.A.</td><td>Demora entrega</td>
                <td><span class="estado demorado">Abierto</span></td>
                <td><button class="btn btn-outline-secondary btn-sm">Ver</button></td>
              </tr>
              <tr>
                <td>TCK-0501</td><td>Agro Sur</td><td>Cotización</td>
                <td><span class="estado entregado">Cerrado</span></td>
                <td><button class="btn btn-outline-secondary btn-sm">Ver</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,

        admin: () => `
      <div class="card">
        <h5 class="mb-2">Administración</h5>
        <p class="text-muted">Facturación, cobranzas, proveedores y usuarios.</p>

        <div class="row g-3">
          <div class="col-md-6">
            <div class="card p-3">
              <h6 class="mb-2">Facturación</h6>
              <button class="btn btn-primary btn-sm">Emitir factura</button>
              <button class="btn btn-outline-secondary btn-sm">Exportar</button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card p-3">
              <h6 class="mb-2">Proveedores</h6>
              <button class="btn btn-primary btn-sm">Nuevo proveedor</button>
              <button class="btn btn-outline-secondary btn-sm">Listado</button>
            </div>
          </div>
        </div>
      </div>
    `
    };

    // ----- Mapeo de rutas -----
    const routes = {
        home:      { view: Views.home,     title: 'Inicio',              subtitle: 'Resumen operativo' },
        cargas:    { view: Views.cargas,   title: 'Gestión de Cargas',   subtitle: 'Registro y seguimiento' },
        aduana:    { view: Views.aduana,   title: 'Gestión Aduanera',    subtitle: 'Documentación y legajos' },
        almacen:   { view: Views.almacen,  title: 'Almacenamiento',      subtitle: 'Inventario y consolidación' },
        clientes:  { view: Views.clientes, title: 'Atención al Cliente', subtitle: 'Tickets y reportes' },
        admin:     { view: Views.admin,    title: 'Administración',      subtitle: 'Facturación y proveedores' }
    };

    function setActive(route) {
        menu.forEach(a => a.classList.toggle('active', a.dataset.route === route));
    }

    function render(route) {
        const r = routes[route] || routes.home;
        view.innerHTML = r.view();
        if (pageTitle) pageTitle.textContent = r.title;
        if (pageSubtitle) pageSubtitle.textContent = r.subtitle;
        setActive(route);
    }

    // Click de menú (sin recargar)
    menu.forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const route = a.dataset.route;
            window.location.hash = route; // mantiene estado si refrescás
        });
    });

    // Router por hash
    window.addEventListener('hashchange', () => {
        const route = (location.hash || '#home').replace('#','');
        render(route);
    });

    // Logout (redirige al login)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }

    // Primera carga
    const firstRoute = (location.hash || '#home').replace('#','');
    render(firstRoute);
});

