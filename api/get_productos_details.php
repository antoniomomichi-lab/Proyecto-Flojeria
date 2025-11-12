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
    $stmt = $pdo->prepare("SELECT * FROM inventario WHERE idInventario = ?");
    $stmt->execute([$id]);
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($producto) {
        $response['success'] = true;
        $response['data'] = $producto;
    } else {
        $response['message'] = 'Producto no encontrado.';
    }
} catch (PDOException $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
?>