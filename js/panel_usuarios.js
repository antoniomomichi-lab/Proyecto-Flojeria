document.addEventListener("DOMContentLoaded", () => {
  
  // --- REFERENCIAS ---
  const tableBody = document.getElementById("userTableBody");
  const userForm = document.getElementById("userForm");
  const modalTitle = document.getElementById("modalTitle");
  const formError = document.getElementById("formError");
  const btnAbrirModalAgregar = document.getElementById("btnAbrirModalAgregar");
  const totalEmpleados = document.getElementById("totalEmpleados");
  const userModal = new bootstrap.Modal(document.getElementById("userModal"));
  
  // --- (NUEVO) Referencia a la barra de búsqueda ---
  const searchInput = document.getElementById("searchInput");

  // Referencias a campos del formulario
  const inputId = document.getElementById("userId");
  const inputNombre = document.getElementById("nombre");
  const inputEmail = document.getElementById("email");
  const inputPassword = document.getElementById("password");
  const inputRole = document.getElementById("role");
  const passwordHelp = document.getElementById("passwordHelp");

  // --- (NUEVO) Variable para guardar todos los usuarios ---
  let allUsers = [];

  // --- FUNCIÓN: CARGAR USUARIOS (Modificada) ---
  async function loadUsers() {
    try {
      const response = await fetch("api/get_users.php");
      if (!response.ok) throw new Error("Error en la respuesta de la red");
      
      const result = await response.json();

      if (result.success) {
        // 1. Guarda la lista completa
        allUsers = result.data; 
        
        // 2. Actualiza las tarjetas (con la lista completa)
        updateSummaryCards(allUsers);
        
        // 3. Llama a la función de filtro (que renderizará la tabla)
        filterAndRender(); 
      } else {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${result.message}</td></tr>`;
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar datos.</td></tr>`;
    }
  }

  // --- FUNCIÓN: RENDERIZAR TABLA (Sin cambios) ---
  function renderTable(users) {
    tableBody.innerHTML = ""; // Limpiar tabla
    
    if (users.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No se encontraron usuarios.</td></tr>`;
      return;
    }

    users.forEach(user => {
      let roleClass = 'bg-secondary'; // Default
      if (user.role === 'admin') roleClass = 'bg-danger';
      if (user.role === 'vendedor') roleClass = 'bg-primary';
      if (user.role === 'almacen') roleClass = 'bg-warning text-dark';

      const row = `
        <tr>
          <td>${user.id}</td>
          <td>${user.nombre}</td>
          <td>${user.email}</td>
          <td><span class="badge ${roleClass}">${user.role}</span></td>
          <td>
            <button class="btn btn-info btn-sm-custom me-2 btn-editar" data-id="${user.id}">
              <i class="bi bi-pencil-square"></i> EDITAR
            </button>
            <button class="btn btn-danger btn-sm-custom btn-eliminar" data-id="${user.id}">
              <i class="bi bi-trash"></i> BORRAR
            </button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  }
  
  // --- FUNCIÓN: ACTUALIZAR TARJETAS (Sin cambios) ---
  function updateSummaryCards(users) {
    totalEmpleados.textContent = users.length;
  }

  // --- (NUEVA) FUNCIÓN: Filtrar y Renderizar ---
  function filterAndRender() {
    // 1. Obtener el texto de búsqueda (en minúsculas)
    const searchTerm = searchInput.value.toLowerCase();

    // 2. Filtrar la lista 'allUsers'
    const filteredUsers = allUsers.filter(user => {
        // Asegurarse de que nombre y email no sean nulos (null)
        const nombre = user.nombre ? user.nombre.toLowerCase() : '';
        const email = user.email ? user.email.toLowerCase() : '';
        
        // 3. Devolver true si el nombre O el email incluyen el texto
        return nombre.includes(searchTerm) || email.includes(searchTerm);
    });

    // 4. Renderizar la tabla solo con los usuarios filtrados
    renderTable(filteredUsers);
  }

  // --- FUNCIÓN: MANEJAR ENVÍO DE FORMULARIO (Sin cambios) ---
  async function handleFormSubmit(event) {
    event.preventDefault();
    formError.classList.add("d-none");

    const formData = new FormData(userForm);
    const data = Object.fromEntries(formData.entries());
    
    const id = data.id; 
    let url = "";
    
    if (id) {
        url = "api/update_user.php";
        if (!data.password) {
            delete data.password;
        }
    } else {
        url = "api/add_user.php";
        if (!data.password) {
            formError.textContent = "La contraseña es obligatoria para usuarios nuevos.";
            formError.classList.remove("d-none");
            return;
        }
        delete data.id; 
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        userModal.hide(); 
        loadUsers(); // <-- Esto recarga los datos y re-aplica el filtro
      } else {
        formError.textContent = result.message || "Error desconocido.";
        formError.classList.remove("d-none");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      formError.textContent = "Error de conexión con el servidor.";
      formError.classList.remove("d-none");
    }
  }

  // --- FUNCIÓN: Click en "Editar" (Sin cambios) ---
  async function handleEditClick(id) {
    userForm.reset();
    formError.classList.add("d-none");
    modalTitle.textContent = "Cargando datos...";
    inputPassword.removeAttribute("required"); 
    passwordHelp.textContent = "Dejar vacío para no cambiar la contraseña.";
    userModal.show();

    try {
        const response = await fetch(`api/get_user_details.php?id=${id}`);
        const result = await response.json();
        
        if (result.success) {
            modalTitle.textContent = "Editar Usuario";
            inputId.value = result.data.id;
            inputNombre.value = result.data.nombre;
            inputEmail.value = result.data.email;
            inputRole.value = result.data.role;
        } else {
            formError.textContent = result.message;
            formError.classList.remove("d-none");
            setTimeout(() => userModal.hide(), 2000); 
        }
    } catch (error) {
        formError.textContent = "Error al cargar los datos del usuario.";
        formError.classList.remove("d-none");
    }
  }

  // --- FUNCIÓN: Click en "Eliminar" (Sin cambios) ---
  async function handleDeleteClick(id) {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${id}?`)) {
        return;
    }
    
    try {
        const response = await fetch("api/delete_users.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadUsers(); // <-- Esto recarga los datos y re-aplica el filtro
        } else {
            alert("Error al eliminar: " + result.message);
        }
    } catch (error) {
        alert("Error de conexión al eliminar.");
    }
  }
  
  // --- EVENT LISTENERS ---
  
  // 1. Click en "Agregar Usuario" (Sin cambios)
  btnAbrirModalAgregar.addEventListener("click", () => {
    userForm.reset();
    inputId.value = ""; 
    modalTitle.textContent = "Agregar Usuario";
    inputPassword.setAttribute("required", "true");
    passwordHelp.textContent = "Obligatorio al crear.";
    formError.classList.add("d-none");
  });

  // 2. Submit del Formulario (Sin cambios)
  userForm.addEventListener("submit", handleFormSubmit);
  
  // 3. Delegación de Clicks en la Tabla (Sin cambios)
  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    const btnEditar = target.closest(".btn-editar");
    const btnEliminar = target.closest(".btn-eliminar");
    
    if (btnEditar) {
        const id = btnEditar.dataset.id;
        handleEditClick(id);
    }
    
    if (btnEliminar) {
        const id = btnEliminar.dataset.id;
        handleDeleteClick(id);
    }
  });

  // --- (NUEVO) Event Listener para la barra de búsqueda ---
  searchInput.addEventListener("input", filterAndRender);

  // --- INICIAR ---
  loadUsers(); // Cargar la lista de usuarios al abrir la página

});