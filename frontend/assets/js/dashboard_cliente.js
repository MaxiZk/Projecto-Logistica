async function cargarEnviosCliente() {
    const res = await fetch("http://localhost:4000/api/envios");
    const envios = await res.json();

    let tabla = document.getElementById("tablaEnviosCliente");

    envios.forEach(envio => {
        tabla.innerHTML += `
      <tr>
        <td>${envio.id}</td>
        <td>${envio.origen}</td>
        <td>${envio.destino}</td>
        <td><span class="estado ${envio.estado === "En tránsito" ? "transito" : envio.estado === "Entregado" ? "entregado" : "demorado"}">${envio.estado}</span></td>
        <td>${envio.actualizacion}</td>
      </tr>
    `;
    });
}
cargarEnviosCliente();
