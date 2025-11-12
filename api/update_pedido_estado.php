<?php
// Inicia la sesión para obtener el ID del empleado
session_start(); 
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'));

// --- 1. Obtener ID del empleado de la sesión ---
// (Asumo que guardaste 'user_id' en la sesión durante el login)
if (empty($_SESSION['user_id'])) {
    $response['message'] = 'Error de sesión. Vuelve a iniciar sesión.';
    echo json_encode($response);
    exit;
}
$empleado_id = $_SESSION['user_id'];

// --- 2. Validar datos ---
if (empty($data->idCliente) || empty($data->fechaEntrega) || empty($data->total) || empty($data->metodoPago)) {
    $response['message'] = 'Faltan campos obligatorios.';
    echo json_encode($response);
    exit;
}

// --- 3. Iniciar Transacción (para seguridad) ---
$pdo = getConnection();
try {
    $pdo->beginTransaction();

    // --- Paso A: Crear el Pedido ---
    $stmtPedido = $pdo->prepare(
        "INSERT INTO pedidos (idCliente, fechaEntrega, estado) 
         VALUES (?, ?, 'pendiente')"
    );
    $stmtPedido->execute([
        $data->idCliente,
        $data->fechaEntrega
    ]);
    
    // Obtener el ID del pedido que acabamos de crear
    $idPedido = $pdo->lastInsertId();

    // --- Paso B: Crear la Venta (ligada al pedido) ---
    // (Asumo que tu tabla 'usuarios' es la que contiene a los empleados)
    $stmtVenta = $pdo->prepare(
        "INSERT INTO ventas (idPedido, empleado_id, total, metodoPago) 
         VALUES (?, ?, ?, ?)"
    );
    $stmtVenta->execute([
        $idPedido,
        $empleado_id,
        $data->total,
        $data->metodoPago
    ]);

    // --- 4. Finalizar Transacción ---
    $pdo->commit();
    $response['success'] = true;
    $response['message'] = 'Pedido y venta registrados correctamente.';

} catch (PDOException $e) {
    // Si algo falla, deshacer todo
    $pdo->rollBack();
    $response['message'] = 'Error al guardar en la BD: ' . $e->getMessage();
}

echo json_encode($response);
?>