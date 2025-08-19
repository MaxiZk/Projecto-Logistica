async function cargarTablas() {
    // Cargar envíos
    const resEnvios = await fetch("http://localhost:4000/api/envios");
    const envios = await resEnvios.json();

    let tablaEnvios = document.getElementById("tablaEnvios");
    envios.forEach(envio => {
        tablaEnvios.innerHTML += `
      <tr>
        <td>${envio.id}</td>
        <td>${envio.cliente}</td>
        <td>${envio.destino}</td>
        <td>${envio.estado}</td>
        <td><button>Ver</button> <button>Editar</button></td>
      </tr>`;
    });

    // Cargar proveedores
    const resProveedores = await fetch("http://localhost:4000/api/proveedores");
    const proveedores = await resProveedores.json();

    let tablaProveedores = document.getElementById("tablaProveedores");
    proveedores.forEach(prov => {
        tablaProveedores.innerHTML += `
      <tr>
        <td>${prov.id}</td>
        <td>${prov.nombre}</td>
        <td>${prov.servicio}</td>
        <td><button>Contactar</button></td>
      </tr>`;
    });
}
cargarTablas();
