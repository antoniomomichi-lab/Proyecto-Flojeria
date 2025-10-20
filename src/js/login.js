(function () {
    'use strict'

    let forms = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', async function (event) {
                event.preventDefault();
                event.stopPropagation();

                if (!form.checkValidity()) {
                    form.classList.add('was-validated');
                    document.getElementById('txtEmail').focus();
                    return;
                } else {
                    const user = "admin@flores.com";
                    const pwd = "12345";

                    // recuperamos los datos del formulario
                    const email = document.getElementById('txtEmail').value;
                    const pwdForm = document.getElementById('idPassword').value;

                    if (email === user && pwd === pwdForm) {
                        event.preventDefault()
                        sessionStorage.setItem('isLoggedIn', 'true');
                        window.location.href = "Bienvenida.html";
                    }
                    else {
                        let divContend = document.getElementsByClassName('alert alert-danger')[0];
                        divContend.style.display = 'block';
                    }
                }
            }, false)
        })
})();



