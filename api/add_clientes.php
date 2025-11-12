<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'));

// --- VALIDACIÓN ACTUALIZADA ---
if (empty($data->nombre) || empty($data->telefono)) {
    $response['message'] = 'El nombre y el teléfono del cliente son obligatorios.';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare("INSERT INTO clientes (nombre, telefono) VALUES (?, ?)");
    $stmt->execute([
        $data->nombre,
        $data->telefono
    ]);
    
    $response['success'] = true;
    $response['message'] = 'Cliente agregado.';

} catch (PDOException $e) {
    $response['message'] = 'Error al guardar: ' . $e->getMessage();
}

echo json_encode($response);
?>