<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null];
$id = $_GET['id'] ?? 0;

if (empty($id)) {
    $response['message'] = 'No se proporcionó ID.';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare("SELECT idCliente, nombre, telefono FROM clientes WHERE idCliente = ?");
    $stmt->execute([$id]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($cliente) {
        $response['success'] = true;
        $response['data'] = $cliente;
    } else {
        $response['message'] = 'Cliente no encontrado.';
    }
} catch (PDOException $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
?>