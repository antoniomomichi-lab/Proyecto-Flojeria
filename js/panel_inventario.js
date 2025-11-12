document.addEventListener("DOMContentLoaded", () => {
  
  // --- REFERENCIAS ---
  const tableBody = document.getElementById("productoTableBody");
  const productoForm = document.getElementById("productoForm");
  const modalTitle = document.getElementById("modalTitle");
  const formError = document.getElementById("formError");
  const btnAbrirModalAgregar = document.getElementById("btnAbrirModalAgregar");
  const totalProductos = document.getElementById("totalProductos");
  const searchInput = document.getElementById("searchInput");
  const productoModal = new bootstrap.Modal(document.getElementById("productoModal"));
  
  // Referencias a campos del formulario (con 'precio' nuevo)
  const inputId = document.getElementById("idInventario");
  const inputNombre = document.getElementById("nombre");
  const inputDescripcion = document.getElementById("descripcion");
  const inputCategoria = document.getElementById("categoria");
  const inputPrecio = document.getElementById("precio"); // <-- CAMPO NUEVO
  const inputCantidad = document.getElementById("cantidadDisponible");
  const inputActivo = document.getElementById("activo");

  let allProductos = [];

  // --- FUNCIÓN: CARGAR PRODUCTOS ---
  async function loadProductos() {
    try {
      const response = await fetch("api/get_productos.php"); 
      const result = await response.json();

      if (result.success) {
        allProductos = result.data; 
        totalProductos.textContent = allProductos.length;
        filterAndRender(); 
      } else {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${result.message || 'Error'}</td></tr>`;
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error al cargar datos.</td></tr>`;
    }
  }

  // --- FUNCIÓN: RENDERIZAR TABLA (Actualizada) ---
  function renderTable(productos) {
    tableBody.innerHTML = ""; 
    
    if (productos.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No se encontraron productos.</td></tr>`;
      return;
    }

    productos.forEach(prod => {
      const estadoClass = prod.activo === 'activo' ? 'bg-success' : 'bg-secondary';
      // Formatear precio
      const precioFormateado = `$${parseFloat(prod.precio).toFixed(2)}`;
      
      const row = `
        <tr>
          <td>${prod.idInventario}</td>
          <td>${prod.nombre}</td>
          <td>${prod.categoria || 'N/A'}</td>
          <td>${precioFormateado}</td> <td>${prod.cantidadDisponible}</td>
          <td><span class="badge ${estadoClass}">${prod.activo}</span></td>
          <td>
            <button class="btn btn-info btn-sm-custom me-2 btn-editar" data-id="${prod.idInventario}">
              <i class="bi bi-pencil-square"></i> EDITAR
            </button>
            <button class="btn btn-danger btn-sm-custom btn-eliminar" data-id="${prod.idInventario}">
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
    const filtered = allProductos.filter(prod => {
        const nombre = prod.nombre ? prod.nombre.toLowerCase() : '';
        const categoria = prod.categoria ? prod.categoria.toLowerCase() : '';
        return nombre.includes(searchTerm) || categoria.includes(searchTerm);
    });
    renderTable(filtered);
  }

  // --- FUNCIÓN: MANEJAR ENVÍO DE FORMULARIO (Actualizada) ---
  async function handleFormSubmit(event) {
    event.preventDefault();
    formError.classList.add("d-none");

    const formData = new FormData(productoForm);
    const data = Object.fromEntries(formData.entries());
    
    // Validación de JS
    if (!data.nombre || data.cantidadDisponible === '' || data.precio === '') {
        formError.textContent = "El nombre, la cantidad y el precio son obligatorios.";
        formError.classList.remove("d-none");
        return;
    }
    if (parseFloat(data.precio) < 0) {
        formError.textContent = "El precio no puede ser negativo.";
        formError.classList.remove("d-none");
        return;
    }
    
    const id = data.idInventario; 
    let url = "";
    
    if (id) {
        url = "api/update_producto.php";
    } else {
        url = "api/add_producto.php"; 
        delete data.idInventario; 
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        productoModal.hide(); 
        loadProductos(); 
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

  // --- FUNCIÓN: Click en "Editar" (Actualizada) ---
  async function handleEditClick(id) {
    productoForm.reset();
    formError.classList.add("d-none");
    modalTitle.textContent = "Cargando datos...";
    productoModal.show();

    try {
        // La API get_producto_details.php usa SELECT *
        // así que ya debería incluir el precio.
        const response = await fetch(`api/get_productos_details.php?id=${id}`);
        const result = await response.json();
        
        if (result.success) {
            modalTitle.textContent = "Editar Producto";
            // Llenar el formulario
            inputId.value = result.data.idInventario;
            inputNombre.value = result.data.nombre;
            inputDescripcion.value = result.data.descripcion;
            inputCategoria.value = result.data.categoria;
            inputPrecio.value = result.data.precio; // <-- CAMPO NUEVO
            inputCantidad.value = result.data.cantidadDisponible;
            inputActivo.value = result.data.activo;
        } else {
            formError.textContent = result.message;
            formError.classList.remove("d-none");
        }
    } catch (error) {
        formError.textContent = "Error al cargar los datos del producto.";
        formError.classList.remove("d-none");
    }
  }

  // --- FUNCIÓN: Click en "Eliminar" (Sin cambios) ---
  async function handleDeleteClick(id) {
    if (!confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${id}?`)) {
        return;
    }
    
    try {
        const response = await fetch("api/delete_producto.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idInventario: id }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadProductos(); 
        } else {
            alert("Error al eliminar: " + result.message);
        }
    } catch (error) {
        alert("Error de conexión al eliminar.");
    }
  }
  
  // --- EVENT LISTENERS (Sin cambios) ---
  btnAbrirModalAgregar.addEventListener("click", () => {
    productoForm.reset();
    inputId.value = ""; 
    modalTitle.textContent = "Agregar Producto";
    formError.classList.add("d-none");
  });

  productoForm.addEventListener("submit", handleFormSubmit);
  
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
  loadProductos(); // Carga inicial
});