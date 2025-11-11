(function () {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const userRole = sessionStorage.getItem("userRole");


  if (isLoggedIn !== "true" || (userRole !== "vendedor" && userRole !== "admin")) {
    
    sessionStorage.clear();
    
    alert("Acceso denegado. Debes ser vendedor o administrador.");
    window.location.href = "../loginMod.html"; 
  }
})();