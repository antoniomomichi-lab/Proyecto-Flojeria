<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'));

if (empty($data->nombre) || !isset($data->cantidadDisponible) || !isset($data->precio)) {
    $response['message'] = 'El nombre, la cantidad y el precio son obligatorios.';
    echo json_encode($response);
    exit;
}

// Validación de SQL (aunque ya la tenemos en la BD)
if ($data->precio < 0) {
    $response['message'] = 'El precio no puede ser negativo.';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    $sql = "INSERT INTO inventario (nombre, descripcion, categoria, precio, activo, cantidadDisponible) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data->nombre,
        $data->descripcion ?? null,
        $data->categoria ?? null,
        $data->precio, // <-- CAMPO NUEVO
        $data->activo ?? 'activo',
        $data->cantidadDisponible
    ]);
    
    $response['success'] = true;
    $response['message'] = 'Producto agregado.';
} catch (PDOException $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
?>