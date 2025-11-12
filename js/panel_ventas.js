document.addEventListener("DOMContentLoaded", () => {
  
  // Referencias a elementos
  const pedidosTableBody = document.getElementById("pedidosTableBody");
  const clientesTableBody = document.getElementById("clientesTableBody");
  const selectClienteEnPedido = document.getElementById("pedidoCliente");

  // Modales
  const clienteModal = new bootstrap.Modal(document.getElementById("clienteModal"));
  const pedidoModal = new bootstrap.Modal(document.getElementById("pedidoModal"));
  const detalleModal = new bootstrap.Modal(document.getElementById("pedidoDetalleModal")); // <-- NUEVO MODAL

  // Formularios
  const clienteForm = document.getElementById("clienteForm");
  const pedidoForm = document.getElementById("pedidoForm");
  const clienteFormError = document.getElementById("clienteFormError");
  const pedidoFormError = document.getElementById("pedidoFormError");

  // Referencias al Modal de Detalles
  const detallePedidoID = document.getElementById("detallePedidoID");
  const detalleClienteNombre = document.getElementById("detalleClienteNombre");
  const detalleClienteTelefono = document.getElementById("detalleClienteTelefono");
  const detalleFechaPedido = document.getElementById("detalleFechaPedido");
  const detalleFechaEntrega = document.getElementById("detalleFechaEntrega");
  const detalleProductosLista = document.getElementById("detalleProductosLista");
  const detalleTotal = document.getElementById("detalleTotal");
  const detalleEstadoSelect = document.getElementById("detalleEstadoSelect");
  const estadoForm = document.getElementById("estadoForm");
  const estadoPedidoID_hidden = document.getElementById("estadoPedidoID_hidden");
  const estadoFormError = document.getElementById("estadoFormError");
  
  // --- Lógica del Carrito de Pedido ---
  const productoBusqueda = document.getElementById("productoBusqueda");
  const productoSugerencias = document.getElementById("productoSugerencias");
  const pedidoProductosLista = document.getElementById("pedidoProductosLista");
  const pedidoTotalEl = document.getElementById("pedidoTotal");
  let listaProductosInventario = [];
  let carrito = [];

  // --- FUNCIÓN: Cargar Clientes (Sin cambios) ---
  async function loadClientes() {
    try {
      const response = await fetch("api/get_clientes.php");
      const result = await response.json();
      clientesTableBody.innerHTML = ""; 
      selectClienteEnPedido.innerHTML = '<option value="">Selecciona un cliente...</option>'; 
      if (result.success && result.data.length > 0) {
        result.data.forEach(cliente => {
          clientesTableBody.innerHTML += `<tr>
              <td>${cliente.idCliente}</td>
              <td>${cliente.nombre}</td>
              <td>${cliente.telefono}</td>
              <td><button class="btn btn-info btn-sm">Editar</button></td>
            </tr>`;
          selectClienteEnPedido.innerHTML += `<option value="${cliente.idCliente}">${cliente.nombre}</option>`;
        });
      } else {
        clientesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay clientes registrados.</td></tr>';
      }
    } catch (error) { console.error("Error cargando clientes:", error); }
  }

  // --- FUNCIÓN: Cargar Pedidos (Botón actualizado) ---
  async function loadPedidos() {
    try {
      const response = await fetch("api/get_pedidos.php");
      const result = await response.json();
      pedidosTableBody.innerHTML = ""; 

      if (result.success && result.data.length > 0) {
        result.data.forEach(pedido => {
          let estadoClass = '';
          switch (pedido.estado) {
            case 'pendiente': estadoClass = 'bg-warning text-dark'; break;
            case 'en_proceso': estadoClass = 'bg-info text-dark'; break;
            case 'entregado': estadoClass = 'bg-success'; break;
            case 'cancelado': estadoClass = 'bg-danger'; break;
          }
          
          // --- BOTÓN ACTUALIZADO ---
          pedidosTableBody.innerHTML += `
            <tr>
              <td>${pedido.idPedido}</td>
              <td>${pedido.nombreCliente}</td>
              <td>${pedido.fechaEntrega}</td>
              <td>$${parseFloat(pedido.total).toFixed(2)}</td>
              <td><span class="badge ${estadoClass}">${pedido.estado.replace('_', ' ')}</span></td>
              <td>
                <button class="btn btn-primary btn-sm btn-ver-detalles" data-id="${pedido.idPedido}">
                  Ver Detalles
                </button>
              </td>
            </tr>`;
        });
      } else {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay pedidos registrados.</td></tr>';
      }
    } catch (error) { console.error("Error cargando pedidos:", error); }
  }
  
  // --- FUNCIÓN: Cargar productos del inventario (Sin cambios) ---
  async function loadProductosInventario() {
    try {
      const response = await fetch("api/get_productos_activos.php");
      const result = await response.json();
      if (result.success) {
        listaProductosInventario = result.data;
      }
    } catch (error) { console.error("Error cargando productos:", error); }
  }

  // --- LÓGICA DEL CARRITO (Sin cambios) ---
  productoBusqueda.addEventListener("input", () => {
    productoSugerencias.innerHTML = "";
    const texto = productoBusqueda.value.toLowerCase();
    if (texto.length < 2) return;
    const sugerencias = listaProductosInventario.filter(prod => prod.nombre.toLowerCase().includes(texto)).slice(0, 5);
    sugerencias.forEach(prod => {
      productoSugerencias.innerHTML += `<a href="#" class="list-group-item list-group-item-action" data-id="${prod.idInventario}">
          <strong>${prod.nombre}</strong> - $${prod.precio} (Stock: ${prod.cantidadDisponible})
        </a>`;
    });
  });
  productoSugerencias.addEventListener("click", (e) => {
    e.preventDefault();
    if (!e.target.closest(".list-group-item-action")) return;
    const target = e.target.closest(".list-group-item-action");
    const id = target.dataset.id;
    productoSugerencias.innerHTML = "";
    productoBusqueda.value = "";
    if (carrito.find(p => p.id === id)) { alert("Este producto ya está en el pedido."); return; }
    const producto = listaProductosInventario.find(p => p.idInventario == id);
    carrito.push({
      id: producto.idInventario, nombre: producto.nombre,
      precio: parseFloat(producto.precio), cantidad: 1,
      stockMax: parseInt(producto.cantidadDisponible)
    });
    renderCarrito();
  });
  function renderCarrito() {
    if (carrito.length === 0) {
      pedidoProductosLista.innerHTML = '<p class="text-muted text-center">Aún no hay productos...</p>';
      pedidoTotalEl.textContent = "$0.00";
      return;
    }
    pedidoProductosLista.innerHTML = "";
    let total = 0;
    carrito.forEach((prod, index) => {
      pedidoProductosLista.innerHTML += `<div class="d-flex justify-content-between align-items-center mb-2">
          <div><strong>${prod.nombre}</strong><br><small>$${prod.precio.toFixed(2)} c/u</small></div>
          <div class="d-flex align-items-center">
            <input type="number" value="${prod.cantidad}" min="1" max="${prod.stockMax}" class="form-control form-control-sm" style="width: 80px;" data-index="${index}" onchange="actualizarCantidad(this)">
            <button type="button" class="btn btn-danger btn-sm ms-2" data-index="${index}" onclick="removerDelCarrito(this)"><i class="bi bi-trash"></i></button>
          </div>
        </div>`;
      total += prod.cantidad * prod.precio;
    });
    pedidoTotalEl.textContent = `$${total.toFixed(2)}`;
  }
  window.actualizarCantidad = (input) => {
    const index = input.dataset.index;
    let cantidad = parseInt(input.value);
    const stockMax = carrito[index].stockMax;
    if (cantidad > stockMax) { alert(`Stock máximo es ${stockMax}`); cantidad = stockMax; input.value = stockMax; }
    if (cantidad < 1) { cantidad = 1; input.value = 1; }
    carrito[index].cantidad = cantidad;
    renderCarrito();
  }
  window.removerDelCarrito = (button) => {
    const index = button.dataset.index;
    carrito.splice(index, 1);
    renderCarrito();
  }
  
  // --- MANEJO DE FORMULARIOS (Sin cambios) ---
  document.getElementById("btnAbrirModalPedido").addEventListener("click", () => {
    pedidoForm.reset(); carrito = []; renderCarrito();
    productoSugerencias.innerHTML = ""; pedidoFormError.classList.add("d-none");
    loadProductosInventario();
  });
  clienteForm.addEventListener("submit", async (e) => {
    e.preventDefault(); clienteFormError.classList.add("d-none");
    const data = Object.fromEntries(new FormData(clienteForm).entries());
    if (!data.nombre || !data.telefono) {
      clienteFormError.textContent = "El nombre y el teléfono son obligatorios.";
      clienteFormError.classList.remove("d-none"); return;
    }
    try {
      const response = await fetch("api/add_clientes.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (result.success) { clienteModal.hide(); clienteForm.reset(); loadClientes(); } 
      else { clienteFormError.textContent = result.message; clienteFormError.classList.remove("d-none"); }
    } catch (error) { clienteFormError.textContent = "Error de conexión."; }
  });
  pedidoForm.addEventListener("submit", async (e) => {
    e.preventDefault(); pedidoFormError.classList.add("d-none");
    const formData = new FormData(pedidoForm);
    const data = Object.fromEntries(formData.entries());
    if (!data.idCliente || !data.fechaEntrega || carrito.length === 0) {
      pedidoFormError.textContent = "Debes seleccionar un cliente, fecha y agregar al menos un producto.";
      pedidoFormError.classList.remove("d-none"); return;
    }
    const dataParaAPI = {
      idCliente: data.idCliente, fechaEntrega: data.fechaEntrega, metodoPago: data.metodoPago,
      productos: carrito.map(p => ({ id: p.id, cantidad: p.cantidad, precio: p.precio }))
    };
    try {
      const response = await fetch("api/add_pedido_ventas.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dataParaAPI) });
      const result = await response.json();
      if (result.success) { pedidoModal.hide(); loadPedidos(); } 
      else { pedidoFormError.textContent = result.message; pedidoFormError.classList.remove("d-none"); }
    } catch (error) { pedidoFormError.textContent = "Error de conexión."; }
  });

  // --- (NUEVO) LÓGICA PARA VER DETALLES Y ACTUALIZAR ESTADO ---

  // 1. Escuchar clics en la tabla de pedidos
  pedidosTableBody.addEventListener("click", (e) => {
    const target = e.target.closest(".btn-ver-detalles");
    if (target) {
      const id = target.dataset.id;
      handleViewDetailsClick(id);
    }
  });

  // 2. Función para buscar y mostrar detalles
  async function handleViewDetailsClick(idPedido) {
    try {
      const response = await fetch(`api/get_pedidos_details.php?id=${idPedido}`);
      const result = await response.json();
      
      if (!result.success) throw new Error(result.message);
      
      const { pedido, productos } = result.data;
      
      // Llenar el modal
      detallePedidoID.textContent = `ID: ${pedido.idPedido}`;
      detalleClienteNombre.textContent = pedido.nombreCliente;
      detalleClienteTelefono.textContent = pedido.telefonoCliente;
      detalleFechaPedido.textContent = new Date(pedido.fechaPedido).toLocaleString();
      detalleFechaEntrega.textContent = new Date(pedido.fechaEntrega).toLocaleDateString();
      detalleTotal.textContent = `$${parseFloat(pedido.total).toFixed(2)}`;
      
      // Poner el estado actual en el select
      detalleEstadoSelect.value = pedido.estado;
      // Guardar el ID para el formulario de estado
      estadoPedidoID_hidden.value = pedido.idPedido;

      // Llenar la tabla de productos
      detalleProductosLista.innerHTML = "";
      productos.forEach(prod => {
        const subtotal = (prod.cantidad * prod.precioVenta).toFixed(2);
        detalleProductosLista.innerHTML += `
          <tr>
            <td>${prod.nombre}</td>
            <td>${prod.cantidad}</td>
            <td>$${parseFloat(prod.precioVenta).toFixed(2)}</td>
            <td>$${subtotal}</td>
          </tr>`;
      });
      
      estadoFormError.classList.add('d-none'); // Ocultar errores previos
      detalleModal.show(); // Mostrar el modal

    } catch (error) {
      console.error("Error al ver detalles:", error);
      alert("No se pudieron cargar los detalles del pedido.");
    }
  }

  // 3. Manejar el formulario de actualizar estado
  estadoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    estadoFormError.classList.add("d-none");

    const idPedido = estadoPedidoID_hidden.value;
    const nuevoEstado = detalleEstadoSelect.value;
    
    try {
      const response = await fetch("api/update_pedido_estado.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idPedido: idPedido, nuevoEstado: nuevoEstado })
      });
      const result = await response.json();
      
      if (result.success) {
        detalleModal.hide(); // Ocultar modal
        loadPedidos();       // Recargar la tabla principal
      } else {
        estadoFormError.textContent = result.message || "Error al actualizar.";
        estadoFormError.classList.remove("d-none");
      }
    } catch (error) {
      estadoFormError.textContent = "Error de conexión.";
      estadoFormError.classList.remove("d-none");
    }
  });

  // --- Carga Inicial ---
  loadClientes();
  loadPedidos();
});