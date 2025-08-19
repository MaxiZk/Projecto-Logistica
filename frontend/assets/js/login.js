document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar rol en localStorage
            localStorage.setItem("rol", data.rol);

            // Redirigir según el rol
            if (data.rol === "admin") {
                window.location.href = "dashboard_admin.html";
            } else if (data.rol === "cliente") {
                window.location.href = "dashboard_cliente.html";
            }
        } else {
            document.getElementById("mensaje").textContent = "Usuario o contraseña incorrectos.";
        }
    } catch (error) {
        document.getElementById("mensaje").textContent = "Error de conexión con el servidor.";
    }
});
