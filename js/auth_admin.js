(function () {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const userRole = sessionStorage.getItem("userRole");

  // Si no ha iniciado sesión O si no es admin
  if (isLoggedIn !== "true" || userRole !== "admin") {
    
    // Limpia cualquier basura
    sessionStorage.clear();
    
    // Lo saca de la página y lo manda al login (RUTA CORREGIDA)
    alert("Acceso denegado. Debes ser administrador.");
    window.location.href = "loginMod.html"; 
  }
})();