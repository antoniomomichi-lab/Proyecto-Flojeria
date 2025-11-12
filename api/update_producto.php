<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'));

if (empty($data->idInventario) || empty($data->nombre) || !isset($data->cantidadDisponible) || !isset($data->precio)) {
    $response['message'] = 'Faltan campos obligatorios.';
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
    $sql = "UPDATE inventario SET 
                nombre = ?, 
                descripcion = ?, 
                categoria = ?, 
                precio = ?,                 -- <-- CAMPO NUEVO
                activo = ?, 
                cantidadDisponible = ? 
            WHERE idInventario = ?";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data->nombre,
        $data->descripcion ?? null,
        $data->categoria ?? null,
        $data->precio, // <-- CAMPO NUEVO
        $data->activo,
        $data->cantidadDisponible,
        $data->idInventario
    ]);
    
    $response['success'] = true;
    $response['message'] = 'Producto actualizado.';
} catch (PDOException $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
?>