<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

try {
    $pdo = getConnection();
    // Seleccionamos solo productos activos y con stock
    $stmt = $pdo->prepare(
        "SELECT idInventario, nombre, precio, cantidadDisponible 
         FROM inventario 
         WHERE activo = 'activo' AND cantidadDisponible > 0"
    );
    $stmt->execute();
    
    $response['success'] = true;
    $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
?>