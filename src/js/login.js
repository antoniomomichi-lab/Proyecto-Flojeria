(function () {
    'use strict';

    // Selecciona todos los formularios con la clase needs-validation
    let forms = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault(); // ❌ evita submit por defecto
            event.stopPropagation();

            // Limpiar errores previos
            removeError('txtEmail');
            removeError('idPassword');

            let email = document.getElementById('txtEmail').value.trim();
            let password = document.getElementById('idPassword').value.trim();

            let validCustom = true;

            // Validación personalizada de correo
            if (!validateEmail(email)) {
                showError('txtEmail', "Ingresa un correo válido (ej. ejemplo@gmail.com)");
                validCustom = false;
            }

            // Validación personalizada de contraseña
            if (!validatePassword(password)) {
                showError('idPassword', "La contraseña debe tener mínimo 6 caracteres, con letras y números");
                validCustom = false;
            }

            // Valida HTML5 + validaciones personalizadas
            if (!form.checkValidity() || !validCustom) {
                form.classList.add('was-validated');
                if (!validCustom) document.getElementById('txtEmail').focus();
                return;
            }

            try {
                const response = await fetch('src/db/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
                });

                let result;
                try {
                    result = await response.json();
                } catch (e) {
                    console.error("Error parseando JSON:", e);
                    alert("Respuesta inválida del servidor.");
                    return;
                }

                if (result.success) {                    // Guardar sesión
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userRole', result.role);
                    sessionStorage.setItem('userEmail', result.email);

                    // Redirigir según rol
                    if (result.role === 'admin') {
                        window.location.href = "panelAdmin.html";
                    } else if (result.role === 'vendedor') {
                        window.location.href = "panel_vendedor.html";
                    }
                } else {
                    alert(result.message || "Credenciales incorrectas");
                }

            } catch (error) {
                console.error("Error al conectar con el servidor:", error);
                alert("Error al conectar con el servidor.");
            }
        }, false);
    });

    // ----- Funciones auxiliares -----
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const error = document.createElement("div");
        error.className = "text-danger mt-1 small";
        error.innerText = message;
        input.classList.add("is-invalid");
        input.parentNode.appendChild(error);
    }

    function removeError(inputId) {
        const input = document.getElementById(inputId);
        input.classList.remove("is-invalid");
        const error = input.parentNode.querySelector(".text-danger");
        if (error) error.remove();
    }

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        return re.test(email);
    }

    function validatePassword(password) {
        // mínimo 6 caracteres, al menos una letra y un número
        const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        return re.test(password);
    }
})();

