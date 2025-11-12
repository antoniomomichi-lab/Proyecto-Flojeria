document.addEventListener("DOMContentLoaded", () => {
  
  const pedidosTableBody = document.getElementById("adminPedidosTableBody");

  // --- FUNCIÓN: Cargar Pedidos (Versión Admin) ---
  async function loadAdminPedidos() {
    try {
      // Reutilizamos la API de pedidos, pero necesitamos una versión
      // que también nos dé el ID del empleado.
      // Vamos a usar 'get_pedidos_admin.php' (lo crearemos a continuación)
      const response = await fetch("api/get_pedidos_admin.php");
      const result = await response.json();
      
      pedidosTableBody.innerHTML = ""; // Limpiar tabla

      if (result.success && result.data.length > 0) {
        result.data.forEach(pedido => {
          
          let estadoClass = '';
          switch (pedido.estado) {
            case 'pendiente': estadoClass = 'bg-warning text-dark'; break;
            case 'en_proceso': estadoClass = 'bg-info text-dark'; break;
            case 'entregado': estadoClass = 'bg-success'; break;
            case 'cancelado': estadoClass = 'bg-danger'; break;
          }

          pedidosTableBody.innerHTML += `
            <tr>
              <td>${pedido.idPedido}</td>
              <td>${pedido.nombreCliente}</td>
              <td>${pedido.fechaEntrega}</td>
              <td>$${parseFloat(pedido.total).toFixed(2)}</td>
              <td><span class="badge ${estadoClass}">${pedido.estado.replace('_', ' ')}</span></td>
              <td>${pedido.empleado_id} (ID)</td>
            </tr>`;
        });
      } else {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay pedidos registrados.</td></tr>';
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar datos.</td></tr>';
    }
  }
  
  loadAdminPedidos(); // Cargar al iniciar
});