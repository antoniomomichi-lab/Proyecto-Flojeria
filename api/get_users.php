<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

try {
    $pdo = getConnection();
    
    // SQL simplificado: Solo pedimos lo que existe
    $stmt = $pdo->prepare("SELECT id, nombre, email, role FROM empleados");
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['success'] = true;
    $response['data'] = $users;

} catch (PDOException $e) {
    $response['message'] = 'Error de base de datos: ' . $e->getMessage();
}

echo json_encode($response);
exit;
?>