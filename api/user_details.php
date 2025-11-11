<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'message' => ''];

$id = $_GET['id'] ?? 0; // Recibimos el ID por la URL (ej: ?id=5)

if (empty($id)) {
    $response['message'] = 'No se proporcionó ID.';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    // No seleccionamos el password_hash por seguridad
    $stmt = $pdo->prepare("SELECT id, nombre, email, role FROM empleados WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $response['success'] = true;
        $response['data'] = $user;
    } else {
        $response['message'] = 'Usuario no encontrado.';
    }

} catch (PDOException $e) {
    $response['message'] = 'Error de base de datos: ' . $e->getMessage();
}

echo json_encode($response);
exit;
?>