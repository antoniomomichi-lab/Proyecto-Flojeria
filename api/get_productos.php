<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare("SELECT * FROM inventario ORDER BY nombre ASC");
    $stmt->execute();
    
    $response['success'] = true;
    $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
?>