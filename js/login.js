// Espera a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  // 1. Escucha el evento 'submit' del formulario
  loginForm.addEventListener("submit", async function (event) {
    // Evita que el formulario se envíe de la forma tradicional
    event.preventDefault();
    event.stopPropagation();

    // Oculta mensajes de error previos
    loginMessage.classList.add("d-none");

    // Valida el formulario con Bootstrap 5
    if (!loginForm.checkValidity()) {
      loginForm.classList.add("was-validated");
      return;
    }

    // 2. Obtiene los valores
    const email = document.getElementById("txtEmail").value;
    const password = document.getElementById("idPassword").value;

    try {

      const response = await fetch("api/login_action.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      // 4. Convierte la respuesta del servidor a un objeto JSON
      const result = await response.json();

      // 5. Procesa la respuesta
      if (result.success) {

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userRole", result.role);

        if (result.role === "admin") {
          window.location.href = "dashboard_admin.html";

        } else if (result.role === "vendedor") {
          window.location.href = "dashboard_vendedor.html";

        } else if (result.role === "almacen") {
          window.location.href = "dashboard_almacen.html";

        } else {
          alert("Rol no reconocido, contacte al administrador.");
          window.location.href = "../loginMod.html";
        }

      } else {
        loginMessage.textContent = result.message;
        loginMessage.classList.remove("d-none");
      }

    } catch (error) {
      console.error("Error en fetch:", error);
      loginMessage.textContent = "Error al conectar con el servidor.";
      loginMessage.classList.remove("d-none");
    }
  });
});