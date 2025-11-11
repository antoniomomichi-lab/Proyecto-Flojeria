// 1. Busca el botón con id="btnLogout" en cualquier página que cargue este script
const btnLogout = document.getElementById("btnLogout");

// 2. Comprueba que el botón exista en esta página
//    (Si no existe, no hace nada y no da error)
if (btnLogout) {
    
    // 3. Añade el evento de "click"
    btnLogout.addEventListener("click", function (e) {
        
        // Evita que el enlace href="#" haga saltar la página
        e.preventDefault(); 

        // 4. Limpia la sesión del navegador
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userRole");
        // (O puedes usar sessionStorage.clear(); para borrar todo)

        // 5. Redirige a la página de login
        // Esta ruta es correcta porque tu login.html está en la raíz
        window.location.href = "loginMod.html"; 
    });
}