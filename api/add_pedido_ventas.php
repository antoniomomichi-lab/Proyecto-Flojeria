<?php
session_start(); 
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'));

// --- 1. Obtener ID del empleado de la sesión ---
if (empty($_SESSION['user_id'])) {
    $response['message'] = 'Error de sesión. Vuelve a iniciar sesión.';
    echo json_encode($response);
    exit;
}
$empleado_id = $_SESSION['user_id'];

// --- 2. Validar datos ---
if (empty($data->idCliente) || empty($data->fechaEntrega) || empty($data->metodoPago) || empty($data->productos) || !is_array($data->productos)) {
    $response['message'] = 'Faltan campos obligatorios o no hay productos en el pedido.';
    echo json_encode($response);
    exit;
}

$pdo = getConnection();
try {
    $pdo->beginTransaction();

    // --- 3. Verificar Stock ANTES de hacer nada ---
    $totalCalculado = 0;
    foreach ($data->productos as $prod) {
        $stmtCheck = $pdo->prepare("SELECT cantidadDisponible, precio FROM inventario WHERE idInventario = ? FOR UPDATE");
        $stmtCheck->execute([$prod->id]);
        $inventario = $stmtCheck->fetch();

        if (!$inventario) {
            throw new Exception("El producto ID $prod->id no existe.");
        }
        if ($inventario['cantidadDisponible'] < $prod->cantidad) {
            throw new Exception("Stock insuficiente para el producto ID $prod->id. Solo quedan " . $inventario['cantidadDisponible']);
        }
        // Acumulamos el total
        $totalCalculado += $inventario['precio'] * $prod->cantidad;
    }

    // --- 4. Crear el Pedido ---
    $stmtPedido = $pdo->prepare(
        "INSERT INTO pedidos (idCliente, fechaEntrega, estado) 
         VALUES (?, ?, 'pendiente')"
    );
    $stmtPedido->execute([$data->idCliente, $data->fechaEntrega]);
    $idPedido = $pdo->lastInsertId();

    // --- 5. Crear la Venta (con el total calculado) ---
    $stmtVenta = $pdo->prepare(
        "INSERT INTO ventas (idPedido, empleado_id, total, metodoPago) 
         VALUES (?, ?, ?, ?)"
    );
    $stmtVenta->execute([$idPedido, $empleado_id, $totalCalculado, $data->metodoPago]);

    // --- 6. Registrar Detalle y DESCONTAR STOCK (HU-05-T1 y T2) ---
    $stmtDetalle = $pdo->prepare(
        "INSERT INTO detalle_pedidos (idPedido, idInventario, cantidad, precioVenta) 
         VALUES (?, ?, ?, ?)"
    );
    $stmtUpdateStock = $pdo->prepare(
        "UPDATE inventario SET cantidadDisponible = cantidadDisponible - ? 
         WHERE idInventario = ?"
    );

    foreach ($data->productos as $prod) {
        // Registrar detalle
        $stmtDetalle->execute([$idPedido, $prod->id, $prod->cantidad, $prod->precio]);
        
        // Descontar stock
        $stmtUpdateStock->execute([$prod->cantidad, $prod->id]);
    }

    // --- 7. Finalizar ---
    $pdo->commit();
    $response['success'] = true;
    $response['message'] = 'Pedido y venta registrados. Stock actualizado.';

} catch (Exception $e) {
    $pdo->rollBack();
    $response['message'] = 'Error: ' . $e->getMessage();
}

echo json_encode($response);
?>