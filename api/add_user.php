<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

$data = json_decode(file_get_contents('php://input'));

// 1. Validar datos (simplificado)
if (empty($data->nombre) || empty($data->email) || empty($data->password) || empty($data->role)) {
    $response['message'] = 'Faltan campos obligatorios (Nombre, Email, Contraseña, Rol).';
    echo json_encode($response);
    exit;
}

// 2. Hashear la contraseña
$password_hash = password_hash($data->password, PASSWORD_DEFAULT);

try {
    $pdo = getConnection();
    
    // 3. SQL simplificado
    $stmt = $pdo->prepare(
        "INSERT INTO empleados (nombre, email, password_hash, role) 
         VALUES (?, ?, ?, ?)"
    );
    
    $stmt->execute([
        $data->nombre,
        $data->email,
        $password_hash,
        $data->role
    ]);
    
    if ($stmt->rowCount() > 0) {
        $response['success'] = true;
        $response['message'] = 'Usuario agregado correctamente.';
    } else {
        $response['message'] = 'Error al agregar el usuario.';
    }

} catch (PDOException $e) {
    if ($e->errorInfo[1] == 1062) {
        $response['message'] = 'El email ya está registrado.';
    } else {
        $response['message'] = 'Error de base de datos: ' . $e->getMessage();
    }
}

echo json_encode($response);
exit;
?>