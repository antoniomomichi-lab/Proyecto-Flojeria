<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'));

if (empty($data->idCliente) || empty($data->nombre) || empty($data->telefono)) {
    $response['message'] = 'Faltan campos obligatorios.';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare(
        "UPDATE clientes SET nombre = ?, telefono = ? WHERE idCliente = ?"
    );
    $stmt->execute([
        $data->nombre,
        $data->telefono,
        $data->idCliente
    ]);
    
    $response['success'] = true;
    $response['message'] = 'Cliente actualizado.';
} catch (PDOException $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
?>