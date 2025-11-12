<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = [
    'success' => false, 
    'data' => [
        'pedido' => null,
        'productos' => []
    ],
    'message' => ''
];
$idPedido = $_GET['id'] ?? 0;

if (empty($idPedido)) {
    $response['message'] = 'No se proporcionó ID de pedido.';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    
    // 1. Obtener la información principal del pedido
    $sqlPedido = "SELECT 
                    p.idPedido, p.fechaPedido, p.fechaEntrega, p.estado,
                    c.nombre AS nombreCliente, c.telefono AS telefonoCliente,
                    v.total, v.metodoPago, v.empleado_id
                  FROM pedidos p
                  JOIN clientes c ON p.idCliente = c.idCliente
                  LEFT JOIN ventas v ON p.idPedido = v.idPedido
                  WHERE p.idPedido = ?";
    
    $stmtPedido = $pdo->prepare($sqlPedido);
    $stmtPedido->execute([$idPedido]);
    $response['data']['pedido'] = $stmtPedido->fetch(PDO::FETCH_ASSOC);

    if (!$response['data']['pedido']) {
        throw new Exception("Pedido no encontrado.");
    }
    
    // 2. Obtener la lista de productos (el detalle)
    $sqlProductos = "SELECT 
                        i.nombre,
                        dp.cantidad,
                        dp.precioVenta
                     FROM detalle_pedidos dp
                     JOIN inventario i ON dp.idInventario = i.idInventario
                     WHERE dp.idPedido = ?";
    
    $stmtProductos = $pdo->prepare($sqlProductos);
    $stmtProductos->execute([$idPedido]);
    $response['data']['productos'] = $stmtProductos->fetchAll(PDO::FETCH_ASSOC);
    
    $response['success'] = true;

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>