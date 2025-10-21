(function () { 
    'use strict'

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('txtEmail');
    const pwdInput = document.getElementById('idPassword');

    // Usuario y contraseña de ejemplo
    const user = "admin@flores.com";
    const pwd = "12345";

    // Función para validar formato de email
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Crear alerta dinámica
    function mostrarAlerta(mensaje) {
        let alerta = document.getElementById('alertaLogin');
        if (!alerta) {
            alerta = document.createElement('div');
            alerta.id = 'alertaLogin';
            alerta.className = 'alert alert-danger mt-3';
            loginForm.prepend(alerta);
        }
        alerta.textContent = mensaje;
        alerta.style.display = 'block';
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Validaciones
        const email = emailInput.value.trim();
        const password = pwdInput.value.trim();

        if (!email || !password) {
            mostrarAlerta("Todos los campos son obligatorios.");
            return;
        }

        if (!validarEmail(email)) {
            mostrarAlerta("Por favor ingresa un correo válido.");
            return;
        }

        if (password.length < 5) {
            mostrarAlerta("La contraseña debe tener al menos 5 caracteres.");
            return;
        }

        // Verificación de usuario
        if (email === user && password === pwd) {
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = "PanelAdmin.html";
        } else {
            mostrarAlerta("Correo o contraseña incorrectos.");
        }
    });
})();


