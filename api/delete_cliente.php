<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'));

if (empty($data->idCliente)) {
    $response['message'] = 'No se proporcionó ID de cliente.';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare("DELETE FROM clientes WHERE idCliente = ?");
    $stmt->execute([$data->idCliente]);
    
    $response['success'] = true;
    $response['message'] = 'Cliente eliminado.';
} catch (PDOException $e) {
    // Manejar error si el cliente tiene pedidos asociados
    if ($e->errorInfo[1] == 1451) { 
        $response['message'] = 'No se puede eliminar el cliente porque tiene pedidos asociados.';
    } else {
        $response['message'] = $e->getMessage();
    }
}
echo json_encode($response);
?>