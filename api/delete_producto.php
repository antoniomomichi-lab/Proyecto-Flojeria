<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'));

if (empty($data->idInventario)) {
    $response['message'] = 'No se proporcionó ID de producto.';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare("DELETE FROM inventario WHERE idInventario = ?");
    $stmt->execute([$data->idInventario]);
    
    $response['success'] = true;
    $response['message'] = 'Producto eliminado.';
} catch (PDOException $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
?>