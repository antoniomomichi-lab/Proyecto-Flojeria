document.addEventListener("DOMContentLoaded", () => {
  
  // --- REFERENCIAS ---
  const tableBody = document.getElementById("clienteTableBody");
  const clienteForm = document.getElementById("clienteForm");
  const modalTitle = document.getElementById("modalTitle");
  const formError = document.getElementById("formError");
  const btnAbrirModalAgregar = document.getElementById("btnAbrirModalAgregar");
  const totalClientes = document.getElementById("totalClientes");
  const searchInput = document.getElementById("searchInput");
  const clienteModal = new bootstrap.Modal(document.getElementById("clienteModal"));
  
  const inputId = document.getElementById("clienteId");
  const inputNombre = document.getElementById("nombre");
  const inputTelefono = document.getElementById("telefono");

  let allClientes = [];

  // --- FUNCIÓN: CARGAR CLIENTES ---
  async function loadClientes() {
    try {
      // Reutilizamos la API existente
      const response = await fetch("api/get_clientes.php"); 
      const result = await response.json();

      if (result.success) {
        allClientes = result.data; 
        totalClientes.textContent = allClientes.length;
        filterAndRender(); 
      } else {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">${result.message}</td></tr>`;
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error al cargar datos.</td></tr>`;
    }
  }

  // --- FUNCIÓN: RENDERIZAR TABLA ---
  function renderTable(clientes) {
    tableBody.innerHTML = ""; 
    
    if (clientes.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No se encontraron clientes.</td></tr>`;
      return;
    }

    clientes.forEach(cliente => {
      const row = `
        <tr>
          <td>${cliente.idCliente}</td>
          <td>${cliente.nombre}</td>
          <td>${cliente.telefono}</td>
          <td>
            <button class="btn btn-info btn-sm-custom me-2 btn-editar" data-id="${cliente.idCliente}">
              <i class="bi bi-pencil-square"></i> EDITAR
            </button>
            <button class="btn btn-danger btn-sm-custom btn-eliminar" data-id="${cliente.idCliente}">
              <i class="bi bi-trash"></i> BORRAR
            </button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  }

  // --- FUNCIÓN: Filtrar y Renderizar ---
  function filterAndRender() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = allClientes.filter(cliente => {
        const nombre = cliente.nombre ? cliente.nombre.toLowerCase() : '';
        const telefono = cliente.telefono ? cliente.telefono.toLowerCase() : '';
        return nombre.includes(searchTerm) || telefono.includes(searchTerm);
    });
    renderTable(filtered);
  }

  // --- FUNCIÓN: MANEJAR ENVÍO DE FORMULARIO (AGREGAR Y EDITAR) ---
  async function handleFormSubmit(event) {
    event.preventDefault();
    formError.classList.add("d-none");

    const formData = new FormData(clienteForm);
    const data = Object.fromEntries(formData.entries());
    
    // Renombrar 'id' para que coincida con la API
    data.idCliente = data.id;
    delete data.id;

    // Validación
    if (!data.nombre || !data.telefono) {
        formError.textContent = "El nombre y el teléfono son obligatorios.";
        formError.classList.remove("d-none");
        return;
    }
    
    const id = data.idCliente; 
    let url = "";
    
    if (id) {
        url = "api/udate_cliente.php";
    } else {
        url = "api/add_cliente.php"; // Reutilizamos esta API
        delete data.idCliente; 
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        clienteModal.hide(); 
        loadClientes(); 
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

  // --- FUNCIÓN: Click en "Editar" ---
  async function handleEditClick(id) {
    clienteForm.reset();
    formError.classList.add("d-none");
    modalTitle.textContent = "Cargando datos...";
    clienteModal.show();

    try {
        const response = await fetch(`api/get_clientes_details.php?id=${id}`);
        const result = await response.json();
        
        if (result.success) {
            modalTitle.textContent = "Editar Cliente";
            inputId.value = result.data.idCliente;
            inputNombre.value = result.data.nombre;
            inputTelefono.value = result.data.telefono;
        } else {
            formError.textContent = result.message;
            formError.classList.remove("d-none");
        }
    } catch (error) {
        formError.textContent = "Error al cargar los datos del cliente.";
        formError.classList.remove("d-none");
    }
  }

  // --- FUNCIÓN: Click en "Eliminar" ---
  async function handleDeleteClick(id) {
    if (!confirm(`¿Estás seguro de que quieres eliminar al cliente con ID ${id}?`)) {
        return;
    }
    
    try {
        const response = await fetch("api/delete_cliente.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idCliente: id }), // Enviar como idCliente
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadClientes(); 
        } else {
            alert("Error al eliminar: " + result.message);
        }
    } catch (error) {
        alert("Error de conexión al eliminar.");
    }
  }
  
  // --- EVENT LISTENERS ---
  btnAbrirModalAgregar.addEventListener("click", () => {
    clienteForm.reset();
    inputId.value = ""; 
    modalTitle.textContent = "Agregar Cliente";
    formError.classList.add("d-none");
  });

  clienteForm.addEventListener("submit", handleFormSubmit);
  
  tableBody.addEventListener("click", (event) => {
    const btnEditar = event.target.closest(".btn-editar");
    const btnEliminar = event.target.closest(".btn-eliminar");
    
    if (btnEditar) {
        handleEditClick(btnEditar.dataset.id);
    }
    if (btnEliminar) {
        handleDeleteClick(btnEliminar.dataset.id);
    }
  });

  searchInput.addEventListener("input", filterAndRender);
  loadClientes();
});