// main.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const messageDiv = document.getElementById('form-message');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar el envío del formulario
        // Obtener los valores del formulario
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const message = form.querySelector('textarea').value;
        // Validar los campos (puedes agregar más validaciones si lo deseas)
        if (name && email && message) {
            // Simular el envío del formulario
            messageDiv.innerHTML = `<div class="alert alert-success">Gracias, ${name}. Tu mensaje ha sido enviado.</div>`;
            form.reset(); // Limpiar el formulario
        } else {
            messageDiv.innerHTML = `<div class="alert alert-danger">Por favor, completa todos los campos.</div>`;
        }
    });
});