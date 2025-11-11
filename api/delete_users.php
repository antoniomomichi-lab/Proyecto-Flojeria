<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

// Leer el ID desde el body (enviado como JSON)
$data = json_decode(file_get_contents('php://input'));

if (empty($data->id)) {
    $response['message'] = 'No se proporcionó ID de usuario.';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare("DELETE FROM empleados WHERE id = ?");
    $stmt->execute([$data->id]);
    
    if ($stmt->rowCount() > 0) {
        $response['success'] = true;
        $response['message'] = 'Usuario eliminado correctamente.';
    } else {
        $response['message'] = 'No se encontró el usuario o no se pudo eliminar.';
    }

} catch (PDOException $e) {
    $response['message'] = 'Error de base de datos: ' . $e->getMessage();
}

echo json_encode($response);
exit;
?>