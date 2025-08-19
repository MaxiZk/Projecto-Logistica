// assets/js/app.js

async function apiFetch(url, options = {}) {
    try {
        const res = await fetch(url, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("Error al llamar API:", err);
        return null;
    }
}

// Renderiza tabla de envíos
async function cargarEnvios() {
    const tbody = document.querySelector('#tabla-envios tbody');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">Cargando...</td></tr>`;

    const envios = await apiFetch('/api/envios');
    if (!envios || envios.error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red">
            Error cargando datos
        </td></tr>`;
        return;
    }

    if (envios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">No hay envíos registrados</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    envios.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.id}</td>
            <td>${e.cliente}</td>
            <td>${e.producto}</td>
            <td>${e.estado}</td>
            <td>${e.eta}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#tabla-envios')) {
        cargarEnvios();
    }
});


