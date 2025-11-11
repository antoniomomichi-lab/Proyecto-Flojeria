(function () {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const userRole = sessionStorage.getItem("userRole");


  if (isLoggedIn !== "true" || (userRole !== "almacen" && userRole !== "admin")) {
    
    sessionStorage.clear();
    
    alert("Acceso denegado. Debes ser de almacén o administrador.");
    window.location.href = "../loginMod.html"; 
  }
})();